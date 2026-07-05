import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  Dumbbell, 
  Apple, 
  TrendingUp, 
  ArrowLeft, 
  Brain, 
  Cpu, 
  AlertCircle,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  Coins,
  History,
  Lock,
  CheckCircle2,
  Smile,
  Bike,
  Tag,
  UserCheck,
  Receipt,
  CalendarCheck,
  Clock,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  UserSquare2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export function AiZone() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const [activeTab, setActiveTab] = useState<'workout' | 'diet' | 'business'>('workout');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Form States - Workout
  const [workoutForm, setWorkoutForm] = useState({
    memberName: profile?.displayName || '',
    goal: 'Muscle Hypertrophy & Bulk',
    focusArea: 'Full Body & Core strength',
    level: 'Intermediate',
    durationWeeks: '4'
  });

  // Form States - Diet
  const [dietForm, setDietForm] = useState({
    memberName: profile?.displayName || '',
    weight: '72',
    height: '175',
    goal: 'Lean Muscle Definition',
    dietType: 'High-Protein Vegetarian',
    caloriesLimit: '2400'
  });

  // Firestore Live Statistics for Business Analytics
  const [stats, setStats] = useState({
    membersCount: 0,
    paymentsSum: 0,
    activeCheckins: 0
  });

  // Today Workouts Interactive Data State
  const [todayExercises, setTodayExercises] = useState<{ id: string; name: string; sets: string; reps: string; done: boolean }[]>([]);
  const [newExercise, setNewExercise] = useState({ name: '', sets: '4', reps: '12' });

  // Profile physical characteristics State
  const [bioForm, setBioForm] = useState({
    weight: '74',
    height: '178',
    targetCalories: '2500',
    waterTarget: '3.5',
    sleepTarget: '8'
  });

  // Classes Schedule & Booking state
  const [classesList, setClassesList] = useState([
    { id: 'c1', name: 'Zumba Aerobics Burn', time: '07:00 AM', days: 'Mon, Wed, Fri', trainer: 'Priya Sharma', room: 'Arena A', booked: false, remaining: 8 },
    { id: 'c2', name: 'Power Weightlifting Club', time: '06:00 PM', days: 'Tue, Thu', trainer: 'Rohan Malhotra', room: 'Heavy Zone', booked: false, remaining: 5 },
    { id: 'c3', name: 'Yoga & Meditation Flow', time: '08:00 AM', days: 'Sat, Sun', trainer: 'Ananya Sen', room: 'Zen Pavilion', booked: false, remaining: 12 },
    { id: 'c4', name: 'Combat MMA Core Sparring', time: '05:00 PM', days: 'Friday', trainer: 'Vikram Dev', room: 'Cage Studio', booked: false, remaining: 4 }
  ]);

  // Current Program Progression State
  const [programSplit, setProgramSplit] = useState('Hypertrophy Push-Pull-Legs');
  const [weeklyProgress, setWeeklyProgress] = useState(65);
  // 1RM calculator state
  const [oneRmCalc, setOneRmCalc] = useState({ weight: '80', reps: '5', result: '93' });

  // Attendance reports log lists
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [attendancePercentage, setAttendancePercentage] = useState(85);
  const [punchingIn, setPunchingIn] = useState(false);

  // Private payments history logs list
  const [receiptsList, setReceiptsList] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // ----------------- SIDE EFFECTS & FETCHING -----------------
  useEffect(() => {
    if (!profile) return;
    const fetchStats = async () => {
      try {
        const mq = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
        const mSnap = await getDocs(mq);
        const pq = query(collection(db, 'payments'), where('gymId', '==', profile.gymId));
        const pSnap = await getDocs(pq);
        const totalPayments = pSnap.docs.reduce((acc, current) => acc + (current.data().amount || 0), 0);
        
        setStats({
          membersCount: mSnap.size,
          paymentsSum: totalPayments,
          activeCheckins: Math.max(5, Math.floor(mSnap.size * 0.45))
        });
      } catch (err) {
        console.error("Error loading analytics context parameters", err);
      }
    };
    fetchStats();
  }, [profile]);

  // Load today work lists
  useEffect(() => {
    const saved = localStorage.getItem(`workouts_${profile?.uid || 'guest'}`);
    if (saved) {
      setTodayExercises(JSON.parse(saved));
    } else {
      const defaultEx = [
        { id: 'e1', name: 'Incline Dumbbell Chest Press', sets: '4', reps: '10', done: true },
        { id: 'e2', name: 'Overhead Standing Military Press', sets: '3', reps: '12', done: false },
        { id: 'e3', name: 'Cable Triceps Rope Pushdown', sets: '4', reps: '15', done: false },
        { id: 'e4', name: 'Seated Dumbbell Lateral Raises', sets: '4', reps: '15', done: false },
        { id: 'e5', name: 'Hanging Leg Raises (Core Core Core)', sets: '3', reps: '20', done: false }
      ];
      setTodayExercises(defaultEx);
      localStorage.setItem(`workouts_${profile?.uid || 'guest'}`, JSON.stringify(defaultEx));
    }

    const savedBio = localStorage.getItem(`bio_${profile?.uid || 'guest'}`);
    if (savedBio) {
      setBioForm(JSON.parse(savedBio));
    }

    const savedClasses = localStorage.getItem(`classes_${profile?.uid || 'guest'}`);
    if (savedClasses) {
      setClassesList(JSON.parse(savedClasses));
    }
  }, [profile]);

  // Fetch Attendance Log history from Firestore for current trainee
  const fetchTraineeAttendance = async () => {
    if (!profile) return;
    try {
      const qSync = query(
        collection(db, 'attendance'), 
        where('gymId', '==', profile.gymId)
      );
      const snapshot = await getDocs(qSync);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      // Filter list representing current trainee (by matching display name or generic member)
      const filtered = list.filter((item: any) => 
        item.memberName?.toLowerCase() === profile.displayName?.toLowerCase() ||
        item.memberId === profile.uid
      );
      setAttendanceLogs(filtered);
      
      const totalPossible = 15;
      const count = filtered.length;
      setAttendancePercentage(Math.min(100, Math.floor((Math.max(10, count) / totalPossible) * 100)));
    } catch (e) {
      console.warn("Failed fetching attendee data", e);
    }
  };

  // Fetch Payment Billing Logs
  const fetchTraineePayments = async () => {
    if (!profile) return;
    try {
      const qPays = query(collection(db, 'payments'), where('gymId', '==', profile.gymId));
      const paySnap = await getDocs(qPays);
      const list = paySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      // Filter the payments of current authenticated user
      const filtered = list.filter((item: any) =>
        item.memberName?.toLowerCase() === profile.displayName?.toLowerCase() ||
        item.memberId === profile.uid
      );
      setReceiptsList(filtered);
    } catch (e) {
      console.warn("Failed fetching payments history", e);
    }
  };

  useEffect(() => {
    if (profile && filter === 'my-attendance-report') {
      fetchTraineeAttendance();
    }
    if (profile && filter === 'my-payment-history') {
      fetchTraineePayments();
    }
  }, [profile, filter]);

  // ----------------- SUBMIT HANDLERS -----------------
  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutForm)
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
        toast.success("AI Workout routine computed!");
      } else {
        toast.error(data.error || "Execution failed.");
      }
    } catch (err: any) {
      toast.error("Endpoint timeout or connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDietSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dietForm)
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
        toast.success("AI elite diet menu computed!");
      } else {
        toast.error(data.error || "Execution failed.");
      }
    } catch (err: any) {
      toast.error("Endpoint error.");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSubmit = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membersCount: stats.membersCount,
          paymentsSum: stats.paymentsSum,
          stats: {
            activeMembers: stats.activeCheckins,
            dailyCheckins: Math.floor(stats.activeCheckins * 0.8)
          }
        })
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
        toast.success("AI Executive Gym SWOT business audit generated!");
      } else {
        toast.error(data.error || "Execution failed.");
      }
    } catch (err: any) {
      toast.error("SWOT generator error.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- SUB-FEATURES ACTIONS -----------------

  // Exercise checkbox toggle
  const toggleExerciseDone = (id: string) => {
    const updated = todayExercises.map(ex => ex.id === id ? { ...ex, done: !ex.done } : ex);
    setTodayExercises(updated);
    localStorage.setItem(`workouts_${profile?.uid || 'guest'}`, JSON.stringify(updated));
    toast.success("Exercise state progress logged!");
  };

  // Add exercise to list
  const addCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExercise.name.trim()) return;
    const added = [
      ...todayExercises,
      {
        id: 'user_' + Date.now(),
        name: newExercise.name,
        sets: newExercise.sets,
        reps: newExercise.reps,
         done: false
      }
    ];
    setTodayExercises(added);
    localStorage.setItem(`workouts_${profile?.uid || 'guest'}`, JSON.stringify(added));
    setNewExercise({ name: '', sets: '4', reps: '12' });
    toast.success("New custom gym exercise added!");
  };

  // Delete exercise
  const deleteExercise = (id: string) => {
    const updated = todayExercises.filter(ex => ex.id !== id);
    setTodayExercises(updated);
    localStorage.setItem(`workouts_${profile?.uid || 'guest'}`, JSON.stringify(updated));
    toast.info("Exercise deleted from plan.");
  };

  // Update physical stats bio
  const saveBioCharacteristics = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`bio_${profile?.uid || 'guest'}`, JSON.stringify(bioForm));
    toast.success("Biometric information saved!");
  };

  // Booking toggle
  const toggleBookClass = (id: string) => {
    const updated = classesList.map(c => {
      if (c.id === id) {
        const booked = !c.booked;
        const remaining = booked ? c.remaining - 1 : c.remaining + 1;
        toast.success(booked ? `Booked into ${c.name}!` : `Cancelled booking for ${c.name}`);
        return { ...c, booked, remaining };
      }
      return c;
    });
    setClassesList(updated);
    localStorage.setItem(`classes_${profile?.uid || 'guest'}`, JSON.stringify(updated));
  };

  // Interactive 1RM formula recalculate
  const triggerOneRmCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Number(oneRmCalc.weight);
    const r = Number(oneRmCalc.reps);
    if (!w || !r) return;
    const calculated = Math.round(w * (1 + r / 30));
    setOneRmCalc(prev => ({ ...prev, result: String(calculated) }));
    toast.success(`Calculated 1-Rep Maximum limit: ${calculated} kg`);
  };

  // Trainee check-in attendance punch trigger
  const triggerPunchIn = async () => {
    if (!profile) return;
    setPunchingIn(true);
    const todayDate = new Date().toISOString().split('T')[0];

    try {
      await addDoc(collection(db, 'attendance'), {
        memberId: profile.uid,
        memberName: profile.displayName || 'Gym Member',
        date: todayDate,
        time: new Date().toLocaleTimeString(),
        gymId: profile.gymId,
        createdAt: serverTimestamp(),
      });
      toast.success("Successfully clocked in for today!");
      fetchTraineeAttendance();
    } catch (e: any) {
      toast.error("Could not write punch-in: " + e.message);
    } finally {
      setPunchingIn(false);
    }
  };

  // Calculate BMI number
  const w = Number(bioForm.weight);
  const h = Number(bioForm.height) / 100;
  const bmiVal = (w && h) ? Number((w / (h * h)).toFixed(1)) : 0;
  let bmiCategory = 'Unspecified';
  let bmiColor = 'text-zinc-550 border-zinc-500';
  if (bmiVal) {
    if (bmiVal < 18.5) { bmiCategory = 'Underweight'; bmiColor = 'text-blue-500 border-blue-500 bg-blue-500/10'; }
    else if (bmiVal < 25) { bmiCategory = 'Normal Weight'; bmiColor = 'text-green-500 border-green-500 bg-green-500/10'; }
    else if (bmiVal < 30) { bmiCategory = 'Overweight'; bmiColor = 'text-orange-500 border-orange-500 bg-orange-500/10'; }
    else { bmiCategory = 'Obese'; bmiColor = 'text-red-500 border-red-500 bg-red-500/10'; }
  }

  // ----------------- CONDITIONAL RENDERING OF SUBPAGES -----------------

  if (filter === 'today-workouts') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10">
            <CheckCircle2 className="w-80 h-80" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-red-200">TRAINEE SPECIALIST PANEL</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">Today's Workouts</h1>
          <p className="text-zinc-100 text-sm mt-1 max-w-xl">Check off each training set as completed to retain optimum physical execution and monitor progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Training Movements</h3>
            
            <div className="space-y-3">
              {todayExercises.map((ex) => (
                <div 
                  key={ex.id} 
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                    ex.done 
                      ? 'bg-green-500/5 border-green-500/20 text-zinc-400 dark:text-zinc-550' 
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-850 hover:border-red-600/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleExerciseDone(ex.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        ex.done 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-zinc-300 hover:border-red-600'
                      }`}
                    >
                      {ex.done && <span className="text-xs font-bold">✓</span>}
                    </button>
                    <div>
                      <p className={`font-bold text-sm ${ex.done ? 'line-through' : ''}`}>{ex.name}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{ex.sets} Sets × {ex.reps} Reps</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteExercise(ex.id)}
                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-650 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {todayExercises.length === 0 && (
                <div className="py-12 text-center text-zinc-500">
                  <Dumbbell className="w-12 h-12 mx-auto opacity-20 mb-3" />
                  <p className="font-bold">No custom exercises scheduled yet.</p>
                </div>
              )}
            </div>

            {/* Quick checkoff summary info */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-xs font-bold text-zinc-500 flex justify-between items-center border border-zinc-100 dark:border-zinc-850">
              <span>Completed count: {todayExercises.filter(e => e.done).length} / {todayExercises.length}</span>
              <button 
                onClick={() => {
                  const reset = todayExercises.map(e => ({ ...e, done: false }));
                  setTodayExercises(reset);
                  localStorage.setItem(`workouts_${profile?.uid || 'guest'}`, JSON.stringify(reset));
                  toast.success("Workout checks reset!");
                }}
                className="text-red-600 uppercase tracking-widest hover:underline"
              >
                Reset Progress
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Add Movement</h3>
            
            <form onSubmit={addCustomExercise} className="space-y-4">
              <Input 
                label="Exercise Name" 
                placeholder="e.g., Lat Pulldowns"
                value={newExercise.name}
                onChange={e => setNewExercise({...newExercise, name: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Sets" 
                  type="number"
                  value={newExercise.sets}
                  onChange={e => setNewExercise({...newExercise, sets: e.target.value})}
                  required
                />
                <Input 
                  label="Reps" 
                  type="number"
                  value={newExercise.reps}
                  onChange={e => setNewExercise({...newExercise, reps: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Exercise
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (filter === 'my-profile') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
          <p className="text-xs font-black uppercase tracking-widest text-red-200">PERSONAL BIO DATA</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">My Fitness Profile</h1>
          <p className="text-zinc-100 text-sm mt-1">Audit your physical characteristics and calculate target statistics.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Update Physical Biometrics</h3>
            <form onSubmit={saveBioCharacteristics} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Current Weight (kg)" 
                  type="number"
                  value={bioForm.weight}
                  onChange={e => setBioForm({...bioForm, weight: e.target.value})}
                  required
                />
                <Input 
                  label="Current Height (cm)" 
                  type="number"
                  value={bioForm.height}
                  onChange={e => setBioForm({...bioForm, height: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                  label="Daily Calories target (kcal)" 
                  type="number"
                  value={bioForm.targetCalories}
                  onChange={e => setBioForm({...bioForm, targetCalories: e.target.value})}
                  required
                />
                <Input 
                  label="Water Target (Liters)" 
                  type="number"
                  step="0.1"
                  value={bioForm.waterTarget}
                  onChange={e => setBioForm({...bioForm, waterTarget: e.target.value})}
                  required
                />
                <Input 
                  label="Sleep Target (Hours)" 
                  type="number"
                  value={bioForm.sleepTarget}
                  onChange={e => setBioForm({...bioForm, sleepTarget: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Save Attributes
              </Button>
            </form>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Core BMI Calculator</h3>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-black uppercase text-zinc-500">Your Body Mass Index (BMI)</p>
                <p className="text-5xl font-black text-red-600 mt-2">{bmiVal || 'N/A'}</p>
                
                {bmiVal > 0 && (
                  <span className={`mt-3 px-3 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${bmiColor}`}>
                    {bmiCategory}
                  </span>
                )}
                <p className="text-xs text-zinc-500 mt-4 leading-normal">Formula used: weight in kilograms divided by height in meters squared.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-black uppercase text-zinc-500 mb-2">Member Reference Details</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500">Full Name:</span><span className="font-bold">{profile?.displayName}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Email:</span><span className="font-bold truncate max-w-[150px]">{profile?.email}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">System Code:</span><span className="font-mono text-zinc-400">{profile?.uid?.substring(0, 8)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Access Tier:</span><span className="font-bold uppercase text-red-600">{profile?.role}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filter === 'my-classes') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
          <p className="text-xs font-black uppercase tracking-widest text-red-200">ACADEMY PROGRAM DIRECTORY</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">Book Gym Classes</h1>
          <p className="text-zinc-100 text-sm mt-1">Select and request entries for high performance specialized fitness classes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classesList.map((cls) => (
            <div 
              key={cls.id} 
              className={`rounded-3xl border p-6 bg-white dark:bg-zinc-900 transition-all duration-300 ${
                cls.booked 
                  ? 'border-green-500 ring-2 ring-green-500/10 bg-green-500/[0.01]' 
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-red-600/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-600/10 text-red-600 rounded-full border border-red-500/20">
                    {cls.room}
                  </span>
                  <h3 className="text-lg font-bold mt-2">{cls.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Instructed by <span className="font-bold text-zinc-700 dark:text-zinc-350">{cls.trainer}</span></p>
                </div>
                {cls.booked && (
                  <span className="bg-green-500 text-white rounded-full p-1 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Schedule</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-300 mt-0.5">{cls.days}</p>
                </div>
                <div>
                  <p className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Timings</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-300 mt-0.5">{cls.time}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-[11px] font-medium text-zinc-500">
                  {cls.remaining} slots vacant
                </span>
                <button
                  type="button"
                  onClick={() => toggleBookClass(cls.id)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    cls.booked
                      ? 'bg-zinc-100 dark:bg-zinc-850 text-red-600 hover:bg-red-600 hover:text-white'
                      : 'bg-red-600 text-white shadow-md hover:bg-red-750'
                  }`}
                >
                  {cls.booked ? 'Cancel Slot' : 'Book Class'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filter === 'my-current-workouts') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
          <p className="text-xs font-black uppercase tracking-widest text-red-200">ROUTINE PROGRAM PROFILE</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">My Current Workouts</h1>
          <p className="text-zinc-100 text-sm mt-1">Select your athletic program route and calculate weight progression maxes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Workout Program Track</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Select Active Routine</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none"
                    value={programSplit}
                    onChange={e => setProgramSplit(e.target.value)}
                  >
                    <option value="Hypertrophy Push-Pull-Legs">Hypertrophy Chest / Pull / Legs Split</option>
                    <option value="Full Body Conditioning HIIT">Full Body Conditioning HIIT</option>
                    <option value="Arnold Classic Golden Era Split">Arnold Classic Golden Era Split</option>
                    <option value="Strength Powerlifting Bench Squat Deadlift">Strength Powerlifting Track</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-zinc-500">Program Completion Rate</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-zinc-200 dark:bg-zinc-850 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${weeklyProgress}%` }} />
                    </div>
                    <span className="text-sm font-black text-red-600">{weeklyProgress}% Done</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={weeklyProgress} 
                    onChange={e => setWeeklyProgress(Number(e.target.value))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">Drag to manually log weekly completion intervals based on workouts hit.</p>
                </div>
              </div>
            </div>

            {/* Program days visual blocks list */}
            <div>
              <h4 className="text-xs font-black uppercase text-zinc-500 mb-3 tracking-widest">Training Protocol Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-center border border-zinc-100 dark:border-zinc-850">
                  <p className="text-xs font-bold text-red-600">Day 1</p>
                  <p className="font-bold text-sm mt-1">Chest / Delts</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Heavy Press</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-center border border-zinc-105 dark:border-zinc-850">
                  <p className="text-xs font-bold text-red-600">Day 2</p>
                  <p className="font-bold text-sm mt-1">Back / Biceps</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Deadlifts / Rows</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-center border border-zinc-105 dark:border-zinc-850">
                  <p className="text-xs font-bold text-red-600">Day 3</p>
                  <p className="font-bold text-sm mt-1">Legs Split</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Squats / Extensions</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl text-center border border-zinc-105 dark:border-zinc-850">
                  <p className="text-xs font-bold text-red-600">Day 4</p>
                  <p className="font-bold text-sm mt-1">Active Core</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Core / Mobility</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">1-Rep Max Calculator</h3>
            <form onSubmit={triggerOneRmCalc} className="space-y-4">
              <Input 
                label="Weight Lifted (kg)" 
                type="number"
                value={oneRmCalc.weight}
                onChange={e => setOneRmCalc({...oneRmCalc, weight: e.target.value})}
                required
              />
              <Input 
                label="Reps Achieved" 
                type="number"
                value={oneRmCalc.reps}
                onChange={e => setOneRmCalc({...oneRmCalc, reps: e.target.value})}
                required
              />
              <Button type="submit" className="w-full">
                Calculate 1RM Max
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 text-center border border-zinc-100 dark:border-zinc-850">
              <p className="text-[10px] font-black uppercase text-zinc-500">Estimated Max Lifting limit (1RM)</p>
              <p className="text-3xl font-black text-red-600 mt-1">{oneRmCalc.result} kg</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filter === 'my-attendance-report') {
    const isTodayCheckedIn = attendanceLogs.some(item => item.date === new Date().toISOString().split('T')[0]);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
          <p className="text-xs font-black uppercase tracking-widest text-red-200">DAILY TIMING TRACKER</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">My Attendance Report</h1>
          <p className="text-zinc-100 text-sm mt-1">Check-in for today's session and monitor your monthly attendance logs.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm text-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">My Attendance Stats</h3>
              <div className="w-32 h-32 rounded-full border-8 border-red-600/10 border-t-red-600 flex items-center justify-center mx-auto my-4 transform hover:scale-105 duration-300">
                <span className="text-2xl font-black text-red-600">{attendancePercentage}%</span>
              </div>
              <p className="text-xs text-zinc-500">Target rating: Maintain above 80% to maintain optimized progress rates.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold border-b border-zinc-105 dark:border-zinc-800 pb-2 mb-4">Interactive Clock-In</h3>
              {isTodayCheckedIn ? (
                <div className="p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-2xl flex items-center gap-3 text-sm font-bold justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Clocked In Successfully for Today!</span>
                </div>
              ) : (
                <Button onClick={triggerPunchIn} loading={punchingIn} className="w-full">
                  Punch-In Today
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold border-b border-zinc-105 dark:border-zinc-800 pb-3 mb-4">Checked-In Logging History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <th className="p-3">Reference Date</th>
                    <th className="p-3">Check-In Time</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                  {attendanceLogs.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-zinc-805 dark:text-zinc-200">{item.date}</td>
                      <td className="p-3 text-zinc-500 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {item.time || '08:15 AM'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/10 rounded-lg">
                          Present
                        </span>
                      </td>
                    </tr>
                  ))}

                  {attendanceLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-zinc-500">
                        No checked attendance logs found on your system. Click Punch-In above to log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (filter === 'my-payment-history') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
          <p className="text-xs font-black uppercase tracking-widest text-red-200">TRAINEE BILLING CENTER</p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">My Payment History</h1>
          <p className="text-zinc-100 text-sm mt-1">View past invoices, premium packages billing records, and print official receipts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">Gym Dues / Receipts Ledger</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-medium border-collapse text-sm">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500">
                    <th className="p-3 font-semibold">Date Paid</th>
                    <th className="p-3 font-semibold">Sub-Amount</th>
                    <th className="p-3 font-semibold">Gateway Method</th>
                    <th className="p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                  {receiptsList.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/40">
                      <td className="p-3 font-bold">{item.date}</td>
                      <td className="p-3 font-bold text-red-600">₹{item.amount || '1,800'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] bg-zinc-100 dark:bg-zinc-800 font-bold uppercase border border-zinc-200 dark:border-zinc-700">
                          {item.method || 'Cash / UPI'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button 
                          onClick={() => {
                            setSelectedReceipt(item);
                            toast.success("Opening invoice breakdown!");
                          }}
                          className="text-xs font-bold text-red-600 hover:underline"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}

                  {receiptsList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-500">
                        No official payment transaction docs recorded for your trainee account.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit space-y-4">
            <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-3">Active Subscription</h3>
            <div className="p-4 bg-red-600/5 rounded-2xl border border-red-600/10 text-xs space-y-2">
              <div className="flex justify-between font-bold"><span className="text-zinc-500">Plan Type:</span><span className="text-red-600">Elite Quarterly Membership</span></div>
              <div className="flex justify-between font-bold"><span className="text-zinc-500">Renewal Status:</span><span className="text-green-500">Active</span></div>
              <div className="flex justify-between font-bold"><span className="text-zinc-500">Due Expiration:</span><span className="text-zinc-800 dark:text-zinc-200">Sep 15, 2026</span></div>
            </div>
          </div>
        </div>

        {/* Invoice Modal Popup details */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 relative">
              <h3 className="text-xl font-bold border-b pb-3 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-600" />
                Gym Service Invoice
              </h3>
              
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between border-b pb-1.5"><span className="text-zinc-500">Bill To Name:</span><span className="font-bold">{profile?.displayName}</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-zinc-500">Transaction Date:</span><span className="font-bold">{selectedReceipt.date}</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-zinc-500">Payment Channel:</span><span className="font-bold uppercase">{selectedReceipt.method}</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-zinc-550">Receipt Code:</span><span className="font-mono text-xs">{selectedReceipt.id}</span></div>
                <div className="flex justify-between text-base font-black pt-2"><span className="text-zinc-800 dark:text-zinc-200">Grand Total Amount Paid:</span><span className="text-red-600">₹{selectedReceipt.amount}</span></div>
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button 
                  onClick={() => {
                    const printBox = `
                      <h2>C Vidya Gym Management System Invoicing</h2>
                      <p><b>Recipient:</b> ${profile?.displayName}</p>
                      <p><b>Payment Ref ID:</b> ${selectedReceipt.id}</p>
                      <p><b>Paid on date:</b> ${selectedReceipt.date}</p>
                      <h3><b>Grand Total Paid:</b> ₹${selectedReceipt.amount}</h3>
                      <p>Thank you for choosing C Vidya Fitness Zone!</p>
                    `;
                    const win = window.open("", "_blank");
                    win?.document.write(`<html><head><title>Receipt ${selectedReceipt.id}</title><style>body { font-family: sans-serif; padding: 30px; line-height: 1.5; }</style></head><body>${printBox}</body></html>`);
                    win?.document.close();
                    win?.print();
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-600 font-bold text-white text-xs hover:bg-red-750"
                >
                  Print Receipt
                </button>
                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-600 dark:text-zinc-300 text-xs"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------- ORIGINAL AI ZONE VIEW -----------------
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="text-zinc-850 dark:text-zinc-700">/</span>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-600/10 text-red-600 border border-red-500/20">
              ⚡ LIVE INTEGRATED COGNITION
            </span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-red-600 animate-pulse" />
            CV AI Workspace Zone
          </h1>
          <p className="text-zinc-500 mt-1">SaaS Neural Network models providing elite workouts, customized diets, and real-time business health predictions.</p>
        </div>
      </div>

      {/* Glassmorphic tab headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => { setActiveTab('workout'); setResult(null); }}
          className={`p-6 rounded-3xl border text-left transition-all duration-300 ${
            activeTab === 'workout' 
              ? 'bg-red-600 text-white border-red-600 shadow-xl' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-red-600/30'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'workout' ? 'bg-white/10 text-white' : 'bg-red-600/10 text-red-650'}`}>
              <Dumbbell className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-60">Engine Alpha</p>
          <p className="text-xl font-bold tracking-tight">AI Workout Suggestion</p>
        </button>

        <button 
          onClick={() => { setActiveTab('diet'); setResult(null); }}
          className={`p-6 rounded-3xl border text-left transition-all duration-300 ${
            activeTab === 'diet' 
              ? 'bg-red-600 text-white border-red-600 shadow-xl' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-red-600/30'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'diet' ? 'bg-white/10 text-white' : 'bg-green-650/10 text-green-500'}`}>
              <Apple className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-60">Engine Beta</p>
          <p className="text-xl font-bold tracking-tight">AI Diet Plan Suggester</p>
        </button>

        <button 
          onClick={() => { setActiveTab('business'); setResult(null); }}
          className={`p-6 rounded-3xl border text-left transition-all duration-300 ${
            activeTab === 'business' 
              ? 'bg-red-600 text-white border-red-600 shadow-xl' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-red-600/30'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'business' ? 'bg-white/10 text-white' : 'bg-orange-650/10 text-orange-500'}`}>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-60">Enterprise Suite</p>
          <p className="text-xl font-bold tracking-tight">AI Performance & SWOT Analyst</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Parameters input form */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="text-lg font-black uppercase italic tracking-tight mb-4 border-b border-zinc-100 dark:border-zinc-805 pb-3">
            Setup Parameters
          </h3>

          {activeTab === 'workout' && (
            <form onSubmit={handleWorkoutSubmit} className="space-y-4">
              <Input 
                label="Athlete / Member Name"
                value={workoutForm.memberName}
                onChange={e => setWorkoutForm({...workoutForm, memberName: e.target.value})}
                required
              />
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Training Goal</label>
                <select 
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                  value={workoutForm.goal}
                  onChange={e => setWorkoutForm({...workoutForm, goal: e.target.value})}
                >
                  <option value="Muscle Hypertrophy & Bulk">Muscle Hypertrophy & Bulk</option>
                  <option value="Cardio Shredding & Fat Loss">Cardio Shredding & Fat Loss</option>
                  <option value="Olympic Powerlifting & Max Torque">Olympic Powerlifting & Max Torque</option>
                  <option value="Functional Yoga Core Stability">Functional Yoga Core Stability</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Emphasis Target</label>
                <select 
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                  value={workoutForm.focusArea}
                  onChange={e => setWorkoutForm({...workoutForm, focusArea: e.target.value})}
                >
                  <option value="Full Body Mastery">Full Body Mastery</option>
                  <option value="Hyper Anterior Split (Chest/Tricep)">Hyper Anterior Split (Chest/Tricep)</option>
                  <option value="Posterior Chain Growth (Back/Bicep)">Posterior Chain Growth (Back/Bicep)</option>
                  <option value="Barbell Leg Extension Core Split">Barbell Leg Extension Core Split</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Expert Level</label>
                  <select 
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                    value={workoutForm.level}
                    onChange={e => setWorkoutForm({...workoutForm, level: e.target.value})}
                  >
                    <option value="Beginor">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Iron Warrior Elite">Iron Warrior Elite</option>
                  </select>
                </div>
                <Input 
                  label="Duration (Weeks)"
                  type="number"
                  value={workoutForm.durationWeeks}
                  onChange={e => setWorkoutForm({...workoutForm, durationWeeks: e.target.value})}
                  required
                />
              </div>

              <Button type="submit" loading={loading} className="w-full mt-4">
                <Brain className="w-5 h-5 mr-2" />
                Compute Workout Matrix
              </Button>
            </form>
          )}

          {activeTab === 'diet' && (
            <form onSubmit={handleDietSubmit} className="space-y-4">
              <Input 
                label="Athlete / Member Name"
                value={dietForm.memberName}
                onChange={e => setDietForm({...dietForm, memberName: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Weight (kg)"
                  type="number"
                  value={dietForm.weight}
                  onChange={e => setDietForm({...dietForm, weight: e.target.value})}
                  required
                />
                <Input 
                  label="Height (cm)"
                  type="number"
                  value={dietForm.height}
                  onChange={e => setDietForm({...dietForm, height: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Nutrition Regime</label>
                <select 
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-600 outline-none"
                  value={dietForm.dietType}
                  onChange={e => setDietForm({...dietForm, dietType: e.target.value})}
                >
                  <option value="High-Protein Vegetarian">High-Protein Vegetarian</option>
                  <option value="Carnivore Peak Bullet Plan">Carnivore Peak Bullet Plan</option>
                  <option value="Clean Mediterranean Keto">Clean Mediterranean Keto</option>
                  <option value="Vegan Bodybuilding Fuel">Vegan Bodybuilding Fuel</option>
                </select>
              </div>

              <Input 
                label="Target Daily Calories"
                type="number"
                value={dietForm.caloriesLimit}
                onChange={e => setDietForm({...dietForm, caloriesLimit: e.target.value})}
                required
              />

              <Button type="submit" loading={loading} className="w-full mt-4">
                <Brain className="w-5 h-5 mr-2" />
                Compute Diet Matrix
              </Button>
            </form>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">Branch Core Metrics Feed</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between font-bold">
                    <span>Registered Members:</span>
                    <span className="text-red-500">{stats.membersCount}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Gross Recorded Revenue:</span>
                    <span className="text-red-500">₹{stats.paymentsSum}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Peak Retention Rate:</span>
                    <span className="text-red-500">78.5%</span>
                  </div>
                </div>
              </div>

              {profile?.role !== 'admin' ? (
                <div className="flex items-center gap-2 p-3 bg-red-550/10 rounded-xl text-yellow-650 border border-yellow-500/10 text-xs font-bold leading-normal">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>Only CV Gym Admins are permitted to compile business audits.</span>
                </div>
              ) : (
                <Button onClick={handleBusinessSubmit} loading={loading} className="w-full">
                  <Cpu className="w-5 h-5 mr-2 animate-pulse" />
                  Generate Executive SWOT
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Render Result cleanly */}
        <div className="lg:col-span-8 flex flex-col min-h-[400px]">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 flex-1 shadow-sm flex flex-col justify-between relative overflow-hidden">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 border-4 border-red-650 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-red-600 animate-pulse">Running Neural Optimization...</p>
                  <p className="text-xs text-zinc-500 max-w-sm">Generating top-class personalized results with Gemini Flash API...</p>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-6 flex-1">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                    ✓ SECURE GENERATION SUCCESSFUL
                  </span>
                  <button 
                    onClick={() => {
                      const printContent = document.getElementById("ai-report-box")?.innerHTML;
                      if(printContent) {
                        const win = window.open("", "_blank");
                        win?.document.write(`<html><head><title>C Vidya Fitness Zone AI Plan</title><style>body { font-family: sans-serif; padding: 40px; line-height: 1.6; } pre { background: #f4f4f5; padding: 15px; border-radius: 8px; }</style></head><body>${printContent}</body></html>`);
                        win?.document.close();
                        win?.print();
                      }
                    }}
                    className="text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Print Plan Options
                  </button>
                </div>
                
                {/* Beautiful custom rendered text box */}
                <div id="ai-report-box" className="text-zinc-750 dark:text-zinc-300 text-sm leading-relaxed font-medium prose max-w-none dark:prose-invert markdown-body prose-headings:text-red-600 prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-3 prose-p:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-table:border prose-table:border-zinc-200 dark:prose-table:border-zinc-800 prose-table:w-full prose-th:bg-zinc-50 dark:prose-th:bg-zinc-850 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-td:border-t dark:prose-td:border-zinc-800">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-zinc-400">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl mb-4 border border-zinc-100 dark:border-zinc-850">
                  <Cpu className="w-12 h-12 text-zinc-400 opacity-40 animate-pulse" />
                </div>
                <h3 className="font-black uppercase italic text-sm tracking-widest mb-1 text-zinc-550">AWAITING SIMULATION</h3>
                <p className="text-xs text-zinc-500 max-w-xs">Fill the custom dashboard attributes to compile instant athletic results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
