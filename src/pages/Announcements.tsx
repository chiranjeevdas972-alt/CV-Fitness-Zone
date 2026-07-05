import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Megaphone, 
  Trash2, 
  Clock,
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Heart,
  TrendingUp,
  Activity,
  Smile,
  Zap,
  Info
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Announcements() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all-updates';

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info', // info, warning, success, health
  });

  // Pre-configured Healthy Tips for Trainees under 'updates' or 'my-updates'
  const presetHealthTips = [
    {
      id: "h1",
      title: "Optimized Fluid Consumption Guideline",
      content: "Ensure to consume at least 500ml of pure electrolyte fluid 30 mins preceding heavy load training sets. This maintains maximum muscle output capacity.",
      type: "success",
      authorName: "Coach Priya",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      isHealthPreset: true
    },
    {
      id: "h2",
      title: "Nutrition Alert: Post-workout Protein Recovery Window",
      content: "Consuming 25-30g of fast-absorbing protein within 45 minutes of hyper-trophy sets maximizes amino acid uptake and speed of recovery.",
      type: "info",
      authorName: "Dr. Ananya (Nutritionist)",
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      isHealthPreset: true
    },
    {
      id: "h3",
      title: "Cardiorespiratory Conditioning Benchmark Check",
      content: "Keep your Target Heart Rate (THR) between 140bpm - 165bpm during high HIIT burn runs to build athletic pacing without exceeding maximum respiratory capacity.",
      type: "warning",
      authorName: "Sports Scientist Vikram",
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      isHealthPreset: true
    }
  ];

  // Preset targeted personalized alerts for current user under 'my-updates'
  const presetPersonalAlerts = [
    {
      id: "p1",
      title: "Customized Diet Chart Adjustment Successful",
      content: `Hello ${profile?.displayName || 'Trainee'}, your customized high-protein calorie threshold is now updated to ${profile?.role === 'member' ? '2400kcal' : '2600kcal'} in alignment with your weight metrics trends. Check your updated profiles.`,
      type: "success",
      authorName: "Diet Coach Rohan",
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      isPersonalPreset: true
    },
    {
      id: "p2",
      title: "Private Check-In Alert: Hydration Metrics Need Increment",
      content: "Your bioelectrical impedance scans show a slight decrease in overall body fluid percentages. Please increase clear water fluid intakes to 3.8 Liters tomorrow.",
      type: "warning",
      authorName: "Trainer Rohan",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      isPersonalPreset: true
    }
  ];

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'announcements'), 
      where('gymId', '==', profile.gymId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Client-side sort: descending by createdAt
      loaded.sort((a: any, b: any) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
      setAnnouncements(loaded);
      setLoading(false);
    }, (err) => {
      console.warn("Could not read announcements stream live due to permissions.", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        gymId: profile.gymId,
        authorName: profile.displayName,
        createdAt: serverTimestamp(),
      });
      toast.success('Announcement posted');
      setIsModalOpen(false);
      setFormData({ title: '', content: '', type: 'info' });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
        toast.success('Announcement deleted');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  // Determine filtered list to render based on navigation query
  let displayList = [...announcements];

  if (filter === 'updates') {
    // Show only preset health advisories + any announcements containing 'health' or 'diet'
    const dbHealth = announcements.filter(ann => 
      ann.title?.toLowerCase().includes('health') || 
      ann.content?.toLowerCase().includes('health') ||
      ann.title?.toLowerCase().includes('diet') ||
      ann.content?.toLowerCase().includes('diet') ||
      ann.type === 'health'
    );
    displayList = [...presetHealthTips, ...dbHealth];
  } else if (filter === 'my-updates') {
    // Show only targeted alerts representing current logged-in trainee name
    const dbPersonal = announcements.filter(ann => 
      ann.title?.toLowerCase().includes((profile?.displayName || 'guest').toLowerCase()) ||
      ann.content?.toLowerCase().includes((profile?.displayName || 'guest').toLowerCase())
    );
    displayList = [...presetPersonalAlerts, ...dbPersonal];
  }

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
          <Activity className="w-80 h-80" />
        </div>
        {filter === 'updates' && (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-red-200">TRAINEE COMPREHENSIVE CARE</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">Health Updates & Advisories</h1>
            <p className="text-zinc-100 text-sm mt-1 max-w-xl">Scientific fitness advice, nutritional instructions, and biochemical safety tips to excel daily.</p>
          </>
        )}
        {filter === 'my-updates' && (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-red-200">INDIVIDUAL REVIEWS FEED</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">My Health Updates</h1>
            <p className="text-zinc-100 text-sm mt-1 max-w-xl">Custom progress checkpoints, metrics warnings, and tailored guidance specified directly to you by gym trainers.</p>
          </>
        )}
        {filter === 'all-updates' && (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-red-200">COMMUNITY BROADCAST CENTER</p>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">All Gym Updates & Announcements</h1>
            <p className="text-zinc-100 text-sm mt-1 max-w-xl">Stay tuned regarding holiday listings, class booking modifications, and local branch advisories.</p>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {filter === 'updates' ? "Clinical & Fitness Guidance List" : 
             filter === 'my-updates' ? "My Private Notification Logs" : "General Community Ledger"}
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Showing compiled announcements sorted by chronological order.</p>
        </div>
        {profile?.role === 'admin' && (
          <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {displayList.map((ann) => (
          <div key={ann.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              ann.type === 'warning' ? 'bg-orange-500' : 
              ann.type === 'success' ? 'bg-green-500' : 
              ann.type === 'health' ? 'bg-emerald-500' : 'bg-red-650'
            }`} />
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  ann.type === 'warning' ? 'bg-orange-500/10 text-orange-500' : 
                  ann.type === 'success' ? 'bg-green-500/10 text-green-500' : 
                  ann.type === 'health' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-650/10 text-red-600'
                }`}>
                  {ann.type === 'warning' ? <AlertCircle className="w-6 h-6" /> : 
                   ann.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold">{ann.title}</h3>
                    {(ann.isHealthPreset || ann.isPersonalPreset) && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-red-600 bg-red-600/10 border border-red-500/10">
                        OFFICIAL BIOMETRIC INFO
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-4xl">{ann.content}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      {ann.createdAt?.toDate 
                        ? ann.createdAt.toDate().toLocaleDateString()
                        : (ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : new Date().toLocaleDateString())
                      }
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Smile className="w-3.5 h-3.5" />
                      Issued by {ann.authorName || 'Gym Advisory Team'}
                    </div>
                  </div>
                </div>
              </div>
              {profile?.role === 'admin' && !ann.isHealthPreset && !ann.isPersonalPreset && (
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {displayList.length === 0 && !loading && (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-zinc-700 opacity-20" />
            <p className="text-zinc-555 font-medium">No updates posted yet. Active events will list in this log area!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Post Announcement</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Title"
                placeholder="e.g. Holiday Schedule Update"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-650"
                  >
                    <option value="info">Info (Red)</option>
                    <option value="warning">Warning (Orange)</option>
                    <option value="success">Success (Green)</option>
                    <option value="health">Biometric Health (Emerald)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="Write details or biomechanical guidance points here..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[150px]"
                  required
                />
              </div>

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
                  Post Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

