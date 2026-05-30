import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Weight, 
  Ruler, 
  ArrowLeft,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/Form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMember = async () => {
      const docSnap = await getDoc(doc(db, 'members', id));
      if (docSnap.exists()) {
        setMember({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };

    const pq = query(
      collection(db, 'payments'), 
      where('memberId', '==', id),
      orderBy('date', 'desc')
    );
    const unsubscribePayments = onSnapshot(pq, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const aq = query(
      collection(db, 'attendance'), 
      where('memberId', '==', id),
      orderBy('date', 'desc'),
      limit(10)
    );
    const unsubscribeAttendance = onSnapshot(aq, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    fetchMember();
    return () => {
      unsubscribePayments();
      unsubscribeAttendance();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600 opacity-20" />
        <h2 className="text-2xl font-bold">Member not found</h2>
        <Button onClick={() => navigate('/members')} className="mt-4">Back to Members</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <span className="text-zinc-800 dark:text-zinc-700">/</span>
        <button 
          onClick={() => navigate('/members')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          Back to Members
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-32 h-32 rounded-3xl bg-red-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-red-600/20">
                {member.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight">{member.name}</h2>
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-2",
                  member.paymentStatus === 'paid' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  {member.paymentStatus}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <Phone className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Phone</p>
                  <p className="font-bold text-sm">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                <Mail className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Email</p>
                  <p className="font-bold text-sm truncate">{member.email || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Age</p>
                  <p className="font-bold text-sm">{member.age} years</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Plan</p>
                  <p className="font-bold text-sm text-red-600">{member.planName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Weight</p>
                  <p className="font-bold text-sm">{member.weight} kg</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Height</p>
                  <p className="font-bold text-sm">{member.height} cm</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 rounded-3xl p-8 border border-zinc-800 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase italic mb-2">Fitness Goal</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Maintain consistent training and follow the diet plan to achieve peak performance.
              </p>
            </div>
          </div>
        </div>

        {/* Activity & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Payment History */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase italic">Payment History</h3>
              <CreditCard className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Date</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Amount</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Method</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-8 py-4 text-sm font-bold">{p.date}</td>
                      <td className="px-8 py-4 text-sm font-black text-red-600">₹{p.amount}</td>
                      <td className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">{p.method}</td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-500">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-zinc-500">No payment records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase italic">Recent Attendance</h3>
              <Clock className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attendance.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">{a.date}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{a.time}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-green-500">Present</div>
                </div>
              ))}
              {attendance.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500">No attendance records found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
