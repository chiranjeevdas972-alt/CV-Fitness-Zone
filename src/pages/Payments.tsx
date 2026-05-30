import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Payments() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      
      toast.success('Payment recorded successfully');
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="text-zinc-800 dark:text-zinc-700">/</span>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-zinc-500 mt-1">Track revenue and membership dues.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Member</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Method</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-600/10 flex items-center justify-center text-red-600">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-bold">{payment.memberName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-600">₹{payment.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-xs font-bold text-green-500">
                      <ArrowUpRight className="w-3 h-3" />
                      Success
                    </div>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    No payment records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
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
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
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
