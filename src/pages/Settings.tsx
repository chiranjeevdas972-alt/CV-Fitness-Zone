import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  Dumbbell,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  Trophy,
  Zap
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Settings() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subscription'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gymSettings, setGymSettings] = useState({
    gymName: 'C Vidya Fitness Zone',
    contactEmail: '',
    contactPhone: '',
    address: '',
    logoURL: '',
    subscription: 'Enterprise', // Default for now
  });

  const [staff, setStaff] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', profile.gymId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setGymSettings(docSnap.data() as any);
        } else {
          const defaultSettings = {
            gymName: 'C Vidya Fitness Zone',
            contactEmail: profile.email,
            contactPhone: '',
            address: '',
            logoURL: '',
            gymId: profile.gymId,
            subscription: 'Enterprise',
          };
          await setDoc(docRef, defaultSettings);
          setGymSettings(defaultSettings);
        }
      } catch (error: any) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'security' && profile) {
      setStaffLoading(true);
      const q = query(
        collection(db, 'users'),
        where('gymId', '==', profile.gymId)
      );
      
      const unsubscribeStaff = onSnapshot(q, (snapshot) => {
        setStaff(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setStaffLoading(false);
      }, (error) => handleFirestoreError(error, 'list', 'users'));

      return () => unsubscribeStaff();
    }
  }, [activeTab, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);

    try {
      const docRef = doc(db, 'settings', profile.gymId);
      await updateDoc(docRef, {
        ...gymSettings,
        updatedAt: serverTimestamp(),
      });
      toast.success('Settings updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStaffRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast.success('User role updated');
    } catch (error: any) {
      toast.error('Failed to update role: ' + error.message);
    }
  };

  const PRO_PLANS = [
    {
      name: "Starter",
      price: "1,499",
      period: "/month",
      desc: "Perfect for new or small gyms",
      features: ["Up to 500 Members", "2 Trainer Accounts", "Basic Analytics", "Email Support", "Attendance Tracking"],
    },
    {
      name: "Victory Pro",
      price: "12,999",
      period: "/year",
      desc: "For established high-growth gyms",
      features: ["Unlimited Members", "Unlimited Trainers", "Advanced AI Analytics", "Inventory Management", "Priority 24/7 Support", "Custom Branding"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For gym chains and franchises",
      features: ["Multi-branch Management", "Whitelabel Mobile App", "Custom Integrations", "Dedicated Account Manager", "SLA Guarantee", "On-site Training"],
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-1">Configure your gym brand, permissions and subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300",
              activeTab === 'profile' 
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <Building2 className="w-5 h-5" />
            Gym Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300",
              activeTab === 'security' 
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <ShieldCheck className="w-5 h-5" />
            Security
          </button>
          <button 
            onClick={() => setActiveTab('subscription')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300",
              activeTab === 'subscription' 
                ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <CreditCard className="w-5 h-5" />
            Subscription
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm scale-in animate-in">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-600/20">
                  <Dumbbell className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Gym Branding</h3>
                  <p className="text-sm text-zinc-500">Update your gym's public information.</p>
                </div>
              </div>

              <div className="space-y-6">
                <Input
                  label="Gym Name"
                  placeholder="C Vidya Fitness Zone"
                  value={gymSettings.gymName}
                  onChange={e => setGymSettings({...gymSettings, gymName: e.target.value})}
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Contact Email"
                    type="email"
                    placeholder="contact@cvidyafitness.com"
                    value={gymSettings.contactEmail}
                    onChange={e => setGymSettings({...gymSettings, contactEmail: e.target.value})}
                    required
                  />
                  <Input
                    label="Contact Phone"
                    placeholder="+91 98765 43210"
                    value={gymSettings.contactPhone}
                    onChange={e => setGymSettings({...gymSettings, contactPhone: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Gym Address</label>
                  <textarea
                    value={gymSettings.address}
                    onChange={e => setGymSettings({...gymSettings, address: e.target.value})}
                    placeholder="123 Victory Lane, Fitness City"
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[100px]"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" loading={saving} className="w-full sm:w-auto">
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4">
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-red-600" />
                  Staff Management
                </h3>
                <p className="text-sm text-zinc-500 mt-1">Assign roles and permissions to your gym staff.</p>
              </div>

              <div className="p-8">
                {staffLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {staff.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group hover:border-red-600/30 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400">
                                {user.displayName?.charAt(0) || user.email?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white leading-none mb-1">{user.displayName || 'Unnamed User'}</p>
                            <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <select
                            value={user.role}
                            disabled={user.uid === profile?.uid}
                            onChange={(e) => updateStaffRole(user.id, e.target.value)}
                            className="bg-zinc-100 dark:bg-zinc-950 border-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-red-600 disabled:opacity-50"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="trainer">Trainer</option>
                            <option value="staff">Staff</option>
                            <option value="member">Member</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {staff.length === 0 && (
                      <div className="text-center py-12 text-zinc-500 italic">No staff members found in this gym.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-zinc-950 rounded-[2.5rem] p-10 border border-zinc-800 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/30 rounded-full mb-4">
                    <Trophy className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Current Plan</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase italic italic italic tracking-tighter mb-2">{gymSettings.subscription || 'Enterprise'}</h3>
                  <p className="text-zinc-500 font-medium mb-8 max-w-sm">Enjoy full access to Iron Paradise ecosystem features.</p>
                  
                  <div className="flex items-center gap-8 border-t border-zinc-800 pt-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Billing cycle</p>
                      <p className="text-sm font-bold text-zinc-300">Annual (Save 15%)</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Status</p>
                      <p className="text-sm font-bold text-green-500">Active</p>
                    </div>
                  </div>
                </div>
                <Zap className="absolute top-1/2 right-10 -translate-y-1/2 w-64 h-64 text-red-600/5 rotate-12" />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {PRO_PLANS.map((plan, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "group p-8 rounded-3xl border transition-all duration-500 relative overflow-hidden",
                      plan.name === gymSettings.subscription
                        ? "bg-zinc-900 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.1)]"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-red-600/30"
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <h4 className="text-2xl font-black uppercase italic tracking-tighter italic italic italic tracking-tighter">{plan.name}</h4>
                          {plan.popular && (
                            <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Most Popular</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                          {plan.features.slice(0, 4).map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                              <ShieldCheck className="w-3 h-3 text-red-600" />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black italic italic italic tracking-tighter">₹{plan.price}</span>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{plan.period}</span>
                        </div>
                        <Button 
                          variant={plan.name === gymSettings.subscription ? 'primary' : 'outline'}
                          disabled={plan.name === gymSettings.subscription}
                          className="px-8 min-w-[160px] rounded-xl font-black uppercase tracking-widest text-[10px]"
                        >
                          {plan.name === gymSettings.subscription ? 'Current Plan' : 'Upgrade'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
