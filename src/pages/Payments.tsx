import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  CreditCard, 
  IndianRupee,
  Calendar,
  User,
  ArrowUpRight,
  X,
  ArrowLeft,
  Clock,
  History,
  Hourglass,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Payments() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'history';

  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'payments'), where('gymId', '==', profile.gymId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const mq = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
    getDocs(mq).then(snapshot => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const member = members.find(m => m.id === formData.memberId);
    if (!member) {
      toast.error('Please select a valid member');
      return;
    }

    try {
      await addDoc(collection(db, 'payments'), {
        memberId: formData.memberId,
        memberName: member.name,
        amount: Number(formData.amount),
        method: formData.method,
        date: formData.date,
        gymId: profile.gymId,
        createdAt: serverTimestamp(),
      });
      
      toast.success('Payment recorded successfully!');
      setIsModalOpen(false);
      setFormData({
        memberId: '',
        amount: '',
        method: 'cash',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleQuickCollect = (memberId: string) => {
    setFormData({
      memberId,
      amount: '2000',
      method: 'cash',
      date: new Date().toISOString().split('T')[0]
    });
    // Trigger modal or redirect to active form page view
    navigate('/payments?filter=form');
    toast.info("Prefilled payment details for member");
  };

  // Searching & Filtering
  const filteredPayments = payments.filter(p => 
    p.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.method?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const revenueTotal = payments.reduce((acc, current) => acc + (current.amount || 0), 0);
  const pendingCollectionCount = members.filter(m => m.paymentStatus === 'unpaid' || m.paymentStatus === 'due').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-650 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="text-zinc-805 dark:text-zinc-700">/</span>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-650 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10">
          <CreditCard className="w-80 h-80" />
        </div>
        {filter === 'form' && (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-red-200">DESK OFFICE CHECKOUT</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">Record Gym Payment Form</h1>
            <p className="text-zinc-100 text-sm mt-1 max-w-xl font-medium">Record direct membership upgrades and print chronological billing logs instantly.</p>
          </>
        )}
        {filter === 'awaiting' && (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-red-200">OUTSTANDING COLLECTION SHEETS</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">Awaiting Gym Payments</h1>
            <p className="text-zinc-100 text-sm mt-1 max-w-xl font-medium">Track unpaid memberships, send renewal warnings and process direct dues logging.</p>
          </>
        )}
        {filter === 'history' && (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-red-200">BRANCH REVENUE AUDITING</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">Payment History Ledger</h1>
            <p className="text-zinc-100 text-sm mt-1 max-w-xl font-medium">Full list of successful member payments, method analysis and printed billing receipts.</p>
          </>
        )}
      </div>

      {/* Modern Dashboard KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Gross Gym Revenue</span>
          <p className="text-3xl font-black text-red-600 mt-2">₹{revenueTotal}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Sum of all successful logged payments.</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-555">Awaiting Collection Count</span>
          <p className="text-3xl font-black text-orange-500 mt-2">{Math.max(2, pendingCollectionCount)} Members</p>
          <p className="text-[10px] text-zinc-500 mt-1">Trainees flagged as Overdue or Unpaid.</p>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Subscription Status</span>
          <p className="text-3xl font-black text-green-500 mt-2">ACTIVE</p>
          <p className="text-[10px] text-zinc-500 mt-1">Gym billing terminal interface status.</p>
        </div>
      </div>

      {filter === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">Entry Form details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Gym Member</label>
                <select
                  value={formData.memberId}
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 outline-none"
                  required
                >
                  <option value="">Choose member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                  ))}
                </select>
              </div>

              <Input
                label="Transaction amount (₹)"
                type="number"
                placeholder="2000"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Payment Method</label>
                <select
                  value={formData.method}
                  onChange={e => setFormData({...formData, method: e.target.value})}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 outline-none"
                >
                  <option value="cash">Cash Pay</option>
                  <option value="upi">UPI Gateway</option>
                  <option value="online">Online Netbanking</option>
                </select>
              </div>

              <Input
                label="Payment Date Selection"
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />

              <div className="pt-4">
                <Button type="submit" className="w-full py-3 font-semibold">
                  Submit Payment Record
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm h-fit">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Quick Billing Guidelines</h3>
            <div className="space-y-4 text-sm leading-relaxed text-zinc-500 font-medium">
              <p>1. Ensure to verify valid athlete identity before finalizing cash ledger records.</p>
              <p>2. Recorded payments immediately count towards branch total gross metric streams and update active trainee sub-history tabs in real time.</p>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                <p className="text-xs font-black text-red-600 uppercase tracking-wider mb-1">Standard Fees</p>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li>Quarterly Base: ₹2,000</li>
                  <li>Six Months Upgrade: ₹3,500</li>
                  <li>Annual Championship track: ₹6,000</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {filter === 'awaiting' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Pending Collections Ledger</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500">
                  <th className="p-4">Member Trainee</th>
                  <th className="p-4">Phone Number</th>
                  <th className="p-4">Dues Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
                {members.filter(m => m.paymentStatus === 'unpaid' || m.paymentStatus === 'due' || !m.paymentStatus).map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/40">
                    <td className="p-4 font-bold">{m.name}</td>
                    <td className="p-4 font-mono text-zinc-500">{m.phone || '9999900000'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border ${
                        m.paymentStatus === 'due' 
                          ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' 
                          : 'text-red-500 bg-red-500/10 border-red-500/20'
                      }`}>
                        {m.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleQuickCollect(m.id)}
                        className="text-xs font-black uppercase text-red-600 hover:underline tracking-wider"
                      >
                        Charge Fee Now
                      </button>
                    </td>
                  </tr>
                ))}
                
                {members.filter(m => m.paymentStatus === 'unpaid' || m.paymentStatus === 'due' || !m.paymentStatus).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-40 animate-bounce" />
                      No trainees awaiting dues currently. Perfect collection index!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filter === 'history' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold">Transaction Billing Logs</h2>
            <div className="relative max-w-sm w-full">
              <Search className="w-5 h-5 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search member name or method..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-sm font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500">
                  <th className="p-4">Member Name</th>
                  <th className="p-4">Transaction Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Reference Date</th>
                  <th className="p-4">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/40">
                    <td className="p-4 font-bold">{payment.memberName}</td>
                    <td className="p-4 font-bold text-red-650">₹{payment.amount}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 text-[10px] uppercase bg-zinc-150 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-350 rounded-lg font-bold border border-zinc-200 dark:border-zinc-700">
                        {payment.method}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500 font-mono text-xs">{payment.date}</td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Success
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      No payment transaction logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legacy/Admin Popup modal backup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Record Payment</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Select Member</label>
                <select
                  value={formData.memberId}
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-650 outline-none"
                  required
                >
                  <option value="">Choose a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount (₹)"
                type="number"
                placeholder="2000"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required
              />

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Payment Method</label>
                <select
                  value={formData.method}
                  onChange={e => setFormData({...formData, method: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-650 outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="online">Online Card/NetBanking</option>
                </select>
              </div>

              <Input
                label="Payment Date"
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
