import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  ChevronRight,
  Loader2,
  Check,
  Flame,
  Award,
  Clock,
  Users,
  QrCode,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/Form';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

type PlanId = 'starter' | 'victory-pro' | 'enterprise';

interface PlanDetail {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  badge?: string;
  desc: string;
  features: string[];
}

const PLANS: PlanDetail[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹1,499',
    period: '/month',
    desc: 'Perfect for new or boutique fitness centers',
    features: [
      'Active Member Directory (Up to 500)',
      '2 Professional Gym Trainer Accounts',
      'Manual QR & Biometric Check-in logs',
      'GST-Compliant Receipts & Billing invoices',
      'Standard Email & Platform Support'
    ]
  },
  {
    id: 'victory-pro',
    name: 'Victory Pro',
    price: '₹12,999',
    period: '/year',
    badge: '⭐ MOST POPULAR',
    desc: 'For established high-growth gyms & studios',
    features: [
      'Unlimited Members & Elite Trainers',
      'AI Workout & Personalized Diet Coach (AiZone)',
      'Live QR Attendance & Dashboard Monitoring',
      'E-Store Supplement Sales & Protein Tracker',
      'Interactive CRM Lead Generation Pipelines',
      'WhatsApp Auto-Simulation Alerts & SMS broadcasts',
      'Multi-Segment Financial & Operational analytics'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'SLA',
    badge: 'MULTI-BRANCH',
    desc: 'For multi-location gym chains & franchises',
    features: [
      'Ecosystem Multi-Branch Switch System',
      'Whitelabel Custom Domain Gym Brand Portals',
      'Unified Bulk Payment Gateway Clearances',
      'Secure Database System Backup Triggers',
      'Custom WhatsApp Cloud API Gateways',
      '24/7 Phone SLA Support & Transition Training'
    ]
  }
];

const AVAILABLE_FACILITIES = [
  { id: 'free-weights', label: 'Olympic Free Weights & Racks', icon: Dumbbell },
  { id: 'cardio-deck', label: 'Treadmills & Cardio Deck', icon: Flame },
  { id: 'crossfit-zone', label: 'Crossfit & Functional Rig', icon: Layers },
  { id: 'steam-sauna', label: 'Steam Room & Luxury Lockers', icon: Award },
  { id: 'personal-training', label: '1-on-1 Personal Training Area', icon: Users },
  { id: 'qr-biometrics', label: 'Automated QR Check-in Terminal', icon: QrCode },
];

export function Onboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Wizard Step (1: Plan, 2: Gym Profile, 3: Account, 4: Launching)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Step 1: Selected Plan
  const planQuery = searchParams.get('plan') as PlanId;
  const initialPlan: PlanId = planQuery && ['starter', 'victory-pro', 'enterprise'].includes(planQuery) 
    ? planQuery 
    : 'victory-pro';
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(initialPlan);

  // Step 2: Gym & Facility Details
  const [gymName, setGymName] = useState<string>('C Vidya Fitness Zone');
  const [branchCode, setBranchCode] = useState<string>('CVFZ-MAIN-01');
  const [city, setCity] = useState<string>('Bangalore');
  const [stateName, setStateName] = useState<string>('Karnataka');
  const [address, setAddress] = useState<string>('100 Feet Road, Indiranagar');
  const [memberCapacity, setMemberCapacity] = useState<string>('200-500');
  const [operatingHours, setOperatingHours] = useState<string>('05:30 AM - 10:30 PM');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'free-weights',
    'cardio-deck',
    'crossfit-zone',
    'personal-training',
    'qr-biometrics'
  ]);

  // Step 3: Admin & Account Setup
  const [adminName, setAdminName] = useState<string>(user?.displayName || '');
  const [adminEmail, setAdminEmail] = useState<string>(user?.email || '');
  const [adminPhone, setAdminPhone] = useState<string>('+91 98765 43210');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [includeDemoData, setIncludeDemoData] = useState<boolean>(true);
  const [enterpriseNotes, setEnterpriseNotes] = useState<string>('');

  // Step 4: Provisioning Checklist state
  const [provisionProgress, setProvisionProgress] = useState<number>(0);
  const [provisionSteps, setProvisionSteps] = useState([
    { title: 'Initializing C Vidya Fitness Branch Database', done: false },
    { title: 'Activating Selected Plan Tier & Feature Licenses', done: false },
    { title: 'Configuring QR Attendance Codes & Locker Directories', done: false },
    { title: 'Enabling AI Zone Workout & Nutrition Engines', done: false },
  ]);

  useEffect(() => {
    if (planQuery && ['starter', 'victory-pro', 'enterprise'].includes(planQuery)) {
      setSelectedPlan(planQuery);
    }
  }, [planQuery]);

  useEffect(() => {
    if (user) {
      if (!adminName && user.displayName) setAdminName(user.displayName);
      if (!adminEmail && user.email) setAdminEmail(user.email);
    }
  }, [user]);

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facilityId) 
        ? prev.filter(f => f !== facilityId) 
        : [...prev, facilityId]
    );
  };

  const handleGoogleQuickAuth = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        setAdminName(res.user.displayName || 'Gym Administrator');
        setAdminEmail(res.user.email || '');
        toast.success(`Signed in as ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!gymName.trim()) {
        toast.error('Please enter your gym center name.');
        return;
      }
      if (!city.trim()) {
        toast.error('Please provide a city for your gym branch.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleSubmitOnboarding();
    }
  };

  const handleSubmitOnboarding = async () => {
    // If not authenticated, ensure email & password are provided
    if (!user) {
      if (!adminName.trim()) {
        toast.error('Please provide the Administrator / Owner Name.');
        return;
      }
      if (!adminEmail.trim()) {
        toast.error('Please provide a valid Admin Email address.');
        return;
      }
      if (!adminPassword || adminPassword.length < 6) {
        toast.error('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);
    setCurrentStep(4);

    try {
      let activeUid = user?.uid;
      let activeEmail = user?.email || adminEmail.trim().toLowerCase();

      // 1. Create user account if not signed in
      if (!user) {
        const credential = await createUserWithEmailAndPassword(
          auth, 
          activeEmail, 
          adminPassword
        );
        activeUid = credential.user.uid;
        await updateProfile(credential.user, { displayName: adminName });
      }

      // Simulate provisioning animation smoothly
      for (let i = 0; i < provisionSteps.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setProvisionSteps(prev => prev.map((step, idx) => idx === i ? { ...step, done: true } : step));
        setProvisionProgress(((i + 1) / provisionSteps.length) * 100);
      }

      // 2. Save gym settings & profile into Firestore
      const gymPayload = {
        gymId: branchCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        gymName,
        branchCode,
        city,
        state: stateName,
        address,
        memberCapacity,
        operatingHours,
        facilities: selectedFacilities,
        plan: selectedPlan,
        ownerUid: activeUid,
        ownerEmail: activeEmail,
        ownerName: adminName || user?.displayName || 'Gym Owner',
        ownerPhone: adminPhone,
        includeDemoData,
        enterpriseNotes: selectedPlan === 'enterprise' ? enterpriseNotes : '',
        onboardingCompletedAt: new Date().toISOString(),
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata'
      };

      if (activeUid) {
        // Save user profile with admin privileges and assigned plan
        await setDoc(doc(db, 'users', activeUid), {
          uid: activeUid,
          email: activeEmail,
          displayName: adminName || user?.displayName || 'Gym Administrator',
          role: 'admin',
          plan: selectedPlan,
          gymId: gymPayload.gymId,
          gymName: gymName,
          phone: adminPhone,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Record gym branch settings document
        try {
          await setDoc(doc(db, 'settings', gymPayload.gymId), gymPayload, { merge: true });
        } catch (settingsErr) {
          console.warn("Settings document write notice:", settingsErr);
        }
      }

      // If enterprise plan, log inquiry for high-priority sales contact
      if (selectedPlan === 'enterprise') {
        try {
          await addDoc(collection(db, 'inquiries'), {
            name: adminName || activeEmail,
            email: activeEmail,
            phone: adminPhone,
            category: 'Enterprise Onboarding',
            source: 'Onboarding Flow',
            message: `Enterprise onboarding request for ${gymName} (${city}). Capacity: ${memberCapacity}. Facilities: ${selectedFacilities.join(', ')}. Notes: ${enterpriseNotes}`,
            status: 'Hot Lead',
            createdAt: new Date().toISOString()
          });
        } catch (inqErr) {
          console.warn("Enterprise inquiry log notice:", inqErr);
        }
      }

      toast.success('Congratulations! Your C Vidya Fitness Zone is ready!');
    } catch (err: any) {
      console.error('Onboarding execution error:', err);
      toast.error(err.message || 'An error occurred during onboarding. Proceeding to workspace.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanObj = PLANS.find(p => p.id === selectedPlan) || PLANS[1];

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col selection:bg-blue-600/20">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0 group-hover:scale-105 transition-transform">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tighter uppercase italic text-zinc-950 block">
                C Vidya Fitness Zone
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 block -mt-1">
                Workspace Onboarding Setup
              </span>
            </div>
          </Link>

          <Link to="/">
            <Button variant="ghost" className="text-xs font-black uppercase tracking-wider text-zinc-700 hover:text-blue-600 hover:bg-zinc-100 flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to</span> Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Progress Stepper Header */}
        <div className="mb-10 sm:mb-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic text-zinc-950">
              Welcome to <span className="text-blue-600">C Vidya Fitness</span> Onboarding
            </h1>
            <p className="text-zinc-600 font-semibold text-sm sm:text-base mt-2">
              Launch your gym management software in less than 2 minutes. Configured with automated check-ins, members CRM, and AI coaching.
            </p>
          </div>

          {/* Stepper indicator bar */}
          <div className="flex items-center justify-center max-w-3xl mx-auto">
            {[
              { num: 1, label: 'Select Plan' },
              { num: 2, label: 'Gym Profile' },
              { num: 3, label: 'Admin Setup' },
              { num: 4, label: 'Launch' }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      currentStep > step.num
                        ? 'bg-blue-600 text-white'
                        : currentStep === step.num
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                        : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                    }`}
                  >
                    {currentStep > step.num ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider mt-2 hidden sm:block ${
                    currentStep >= step.num ? 'text-zinc-950' : 'text-zinc-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all ${
                    currentStep > step.num ? 'bg-blue-600' : 'bg-zinc-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Form Panels */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {/* STEP 1: PLAN SELECTION */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-950">
                    Step 1: Confirm Your C Vidya Fitness Plan
                  </h2>
                  <p className="text-zinc-600 font-semibold text-sm mt-1">
                    Choose the subscription tier tailored for your facility scale. You can upgrade or change tiers anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-600/10'
                            : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-yellow-400 border border-yellow-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                            {plan.badge}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-3 mt-1">
                            <h3 className="text-xl font-black uppercase italic text-zinc-950">{plan.name}</h3>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-zinc-300'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <span className="text-3xl font-black text-zinc-950">{plan.price}</span>
                            <span className="text-zinc-500 font-bold text-xs ml-1 uppercase tracking-wider">{plan.period}</span>
                          </div>

                          <p className="text-zinc-600 text-xs font-semibold mb-6">{plan.desc}</p>

                          <div className="space-y-2.5 pt-4 border-t border-zinc-100">
                            {plan.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-zinc-800">
                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-8 pt-4">
                          <button
                            type="button"
                            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
                  <span className="text-xs font-bold text-zinc-500">
                    Selected Plan: <span className="text-blue-600 font-black uppercase">{selectedPlanObj.name} ({selectedPlanObj.price}{selectedPlanObj.period})</span>
                  </span>
                  <Button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                  >
                    Continue to Gym Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: GYM & FACILITY SETUP */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-950">
                    Step 2: Tell Us About Your Fitness Center
                  </h2>
                  <p className="text-zinc-600 font-semibold text-sm mt-1">
                    Enter your gym location and features to automatically brand your reports, receipts, and member passes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gym Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Fitness Center / Gym Name *
                    </label>
                    <input
                      type="text"
                      value={gymName}
                      onChange={(e) => setGymName(e.target.value)}
                      placeholder="e.g. C Vidya Fitness Zone - Central"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  {/* Branch Code */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Branch Reference Code
                    </label>
                    <input
                      type="text"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                      placeholder="e.g. CVFZ-BLR-01"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      City / Metro *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bangalore"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      State
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800">
                      Street Address & Landmark
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 100 Feet Road, Near Metro Station"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Operating Hours */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      Daily Operating Hours
                    </label>
                    <input
                      type="text"
                      value={operatingHours}
                      onChange={(e) => setOperatingHours(e.target.value)}
                      placeholder="05:30 AM - 10:30 PM"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Member Capacity */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      Estimated Active Members
                    </label>
                    <select
                      value={memberCapacity}
                      onChange={(e) => setMemberCapacity(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    >
                      <option value="Under 100">Boutique (Under 100 Members)</option>
                      <option value="100-300">Medium Club (100 - 300 Members)</option>
                      <option value="300-800">High-Traffic Gym (300 - 800 Members)</option>
                      <option value="800+">Mega Franchise / Multi-Location (800+ Members)</option>
                    </select>
                  </div>
                </div>

                {/* Facility Highlights Selection */}
                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-800 block">
                    Available Gym Zones & Equipment
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AVAILABLE_FACILITIES.map((facility) => {
                      const Icon = facility.icon;
                      const isChecked = selectedFacilities.includes(facility.id);
                      return (
                        <div
                          key={facility.id}
                          onClick={() => toggleFacility(facility.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isChecked
                              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                              : 'border-zinc-200 bg-zinc-50/50 text-zinc-700 hover:border-zinc-300'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-600'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold flex-1">{facility.label}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-400'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 font-black text-xs uppercase tracking-wider border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl cursor-pointer"
                  >
                    Back to Plans
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                  >
                    Continue to Admin Setup
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ADMIN & SECURITY SETUP */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight text-zinc-950">
                    Step 3: Administrator & Master Credentials
                  </h2>
                  <p className="text-zinc-600 font-semibold text-sm mt-1">
                    {user 
                      ? 'You are currently logged in. Verify your administrator details below to link your gym.'
                      : 'Create your owner login credentials to access the C Vidya Fitness management dashboard.'}
                  </p>
                </div>

                {user ? (
                  <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                      {user.displayName ? user.displayName[0].toUpperCase() : 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-zinc-950">{user.displayName || 'Gym Owner'}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase">Active Account</span>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleGoogleQuickAuth}
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-white border border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 rounded-xl font-black text-xs uppercase tracking-wider text-zinc-800 flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      1-Click Sign Up with Google
                    </button>

                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-zinc-200 w-full" />
                      <span className="bg-white px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 absolute">Or Set Master Password</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Admin Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-blue-600" />
                      Owner / Admin Full Name *
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Master Trainer"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      required
                    />
                  </div>

                  {/* Admin Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Admin Email *
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@cvidyafitness.com"
                      disabled={!!user}
                      className={`w-full px-4 py-3 border rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                        user ? 'bg-zinc-100 border-zinc-200 text-zinc-600 cursor-not-allowed' : 'bg-zinc-50 border-zinc-300 text-zinc-950 focus:bg-white'
                      }`}
                      required
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-blue-600" />
                      WhatsApp Notification Phone Number
                    </label>
                    <input
                      type="tel"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Password (if not logged in) */}
                  {!user && (
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-blue-600" />
                        Create Master Password *
                      </label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        required
                        minLength={6}
                      />
                    </div>
                  )}

                  {/* Enterprise notes if selected */}
                  {selectedPlan === 'enterprise' && (
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Enterprise Chain Requirements / Multi-Branch Notes
                      </label>
                      <textarea
                        value={enterpriseNotes}
                        onChange={(e) => setEnterpriseNotes(e.target.value)}
                        rows={2}
                        placeholder="Specify number of branches, custom domain requirements, or hardware integration needs..."
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-950 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Demo Data Option */}
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="demoData"
                    checked={includeDemoData}
                    onChange={(e) => setIncludeDemoData(e.target.checked)}
                    className="w-4 h-4 mt-1 rounded text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <label htmlFor="demoData" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                    <span className="font-black text-zinc-900 block">Pre-load Starter Demo Records (Recommended)</span>
                    Includes sample active gym members, certified trainers, and membership plans so your dashboard is instantly operational.
                  </label>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 font-black text-xs uppercase tracking-wider border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl cursor-pointer"
                  >
                    Back to Gym Details
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    disabled={loading}
                    className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Complete Onboarding & Launch
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PROVISIONING & FINAL LAUNCH */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-8"
              >
                <div>
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-600/30">
                    <Dumbbell className="text-white w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tight text-zinc-950">
                    Setting Up Your <span className="text-blue-600">Fitness OS</span>
                  </h2>
                  <p className="text-zinc-600 font-semibold text-sm mt-1 max-w-md mx-auto">
                    Please hold on while we build your gym's cloud configuration and feature dashboard.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${provisionProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                    {Math.round(provisionProgress)}% Configured
                  </span>
                </div>

                {/* Provisioning Checklist */}
                <div className="max-w-md mx-auto text-left space-y-3 bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                  {provisionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs font-bold text-zinc-800">
                      {step.done ? (
                        <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center shrink-0">
                          <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                        </div>
                      )}
                      <span className={step.done ? 'text-zinc-950' : 'text-zinc-500'}>{step.title}</span>
                    </div>
                  ))}
                </div>

                {/* Ready CTA */}
                {provisionProgress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4 space-y-4"
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate('/dashboard')}
                      className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white text-base font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/30 cursor-pointer"
                    >
                      Enter C Vidya Fitness Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>

                    <div>
                      <p className="text-xs font-semibold text-zinc-500">
                        Workspace initialized for <span className="font-black text-zinc-900">{gymName}</span> with <span className="text-blue-600 font-black uppercase">{selectedPlanObj.name}</span> plan.
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-200 bg-white text-center text-xs font-semibold text-zinc-500">
        <p>© {new Date().getFullYear()} C Vidya Fitness Zone. All rights reserved. Enterprise Fitness Management Platform.</p>
      </footer>
    </div>
  );
}
