import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  CalendarCheck, 
  Search, 
  User, 
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  ArrowLeft
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Attendance() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'attendance'), 
      where('gymId', '==', profile.gymId),
      where('date', '==', selectedDate)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const mq = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
    getDocs(mq).then(snapshot => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [profile, selectedDate]);

  const handleMarkAttendance = async (memberId: string, memberName: string) => {
    if (!profile) return;

    // Check if already marked
    const alreadyMarked = attendance.find(a => a.memberId === memberId);
    if (alreadyMarked) {
      toast.error('Attendance already marked for today');
      return;
    }

    try {
      await addDoc(collection(db, 'attendance'), {
        memberId,
        memberName,
        date: selectedDate,
        time: new Date().toLocaleTimeString(),
        gymId: profile.gymId,
        createdAt: serverTimestamp(),
      });
      toast.success(`Attendance marked for ${memberName}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRemoveAttendance = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'attendance', id));
      toast.success('Attendance record removed');
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
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-zinc-500 mt-1">Daily check-in logs for members.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Mark New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance List */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold">Attendance for {selectedDate}</h3>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">{record.memberName}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {record.time}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveAttendance(record.id)}
                  className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ))}
            {attendance.length === 0 && (
              <div className="p-12 text-center text-zinc-500">
                <CalendarCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                No attendance marked for this date
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-red-600 p-6 rounded-3xl text-white shadow-xl shadow-red-600/20">
            <h3 className="text-lg font-bold mb-1">Daily Summary</h3>
            <p className="text-red-100 text-sm mb-6">Overview for {selectedDate}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-red-200">Present</p>
                <p className="text-2xl font-black">{attendance.length}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-red-200">Absent</p>
                <p className="text-2xl font-black">{Math.max(0, members.length - attendance.length)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Mark Attendance</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {members.map(member => {
                const isPresent = attendance.some(a => a.memberId === member.id);
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-[10px] text-zinc-500">{member.phone}</p>
                      </div>
                    </div>
                    {isPresent ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        Present
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAttendance(member.id, member.name)}
                      >
                        Mark
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
