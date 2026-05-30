import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Lock
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export function AiZone() {
  const { profile } = useAuth();
  const navigate = useNavigate();
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
          activeCheckins: Math.floor(mSnap.size * 0.45) // Simulated active rate
        });
      } catch (err) {
        console.error("Error loading analytics context parameters", err);
      }
    };
    fetchStats();
  }, [profile]);

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
            <div className={`p-3 rounded-2xl ${activeTab === 'business' ? 'bg-white/10 text-white' : 'bg-orange-655/10 text-orange-500'}`}>
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
                    <option value="Beginer">Beginner</option>
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
                <Brain className="w-5 h-5 mr-2 animate-spin duration-300" />
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
                <div className="flex items-center gap-2 p-3 bg-red-550/10 rounded-xl text-yellow-600 border border-yellow-500/10 text-xs font-bold leading-normal">
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
                      const originalContent = document.body.innerHTML;
                      if(printContent) {
                        const win = window.open("", "_blank");
                        win?.document.write(`<html><head><title>CV Fitness Zone AI Plan</title><style>body { font-family: sans-serif; padding: 40px; line-height: 1.6; } pre { background: #f4f4f5; padding: 15px; border-radius: 8px; }</style></head><body>${printContent}</body></html>`);
                        win?.document.close();
                        win?.print();
                      }
                    }}
                    className="text-[10px] font-black uppercase tracking-widest hover:text-red-600 transition-colors"
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
                <h3 className="font-black uppercase italic text-sm tracking-widest mb-1 text-zinc-550">Awaiting Simulation</h3>
                <p className="text-xs text-zinc-500 max-w-xs">Fill the custom dashboard attributes to compile instant athletic results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
