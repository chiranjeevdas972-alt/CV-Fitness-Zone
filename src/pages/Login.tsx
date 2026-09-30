import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, ArrowRight, ArrowLeft, AlertTriangle, ShieldCheck, Trophy, Users, Zap } from 'lucide-react';
import { CVidyaIcon } from '../components/CVidyaLogo';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [botTrap, setBotTrap] = useState(''); // Anti-bot honeypot field
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Cooldown timer effect for brute-force protection
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutRemaining > 0) {
      timer = setInterval(() => {
        setLockoutRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Anti-bot honeypot check (hidden field)
    if (botTrap) {
      console.warn("Security Alert: Automated bot submission intercepted.");
      return;
    }

    // 2. Brute-force lockout check
    if (lockoutRemaining > 0) {
      toast.error(`Too many failed attempts. Security cooldown active: Please wait ${lockoutRemaining} seconds.`);
      return;
    }

    // 3. Input validation & sanitization
    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedEmail)) {
      toast.error('Please enter a valid, safe email address format.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      setFailedAttempts(0);
      toast.success('Welcome back! Secure session initialized.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Authentication Error:', error);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockoutRemaining(30);
        toast.error('Security alert: 5 failed attempts reached. Login locked for 30 seconds to prevent brute-force attacks.');
      } else {
        if (
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential'
        ) {
          toast.error(`Invalid email or password. Attempt ${newAttempts} of 5.`);
        } else {
          toast.error(error.message || 'Authentication failed. Please verify credentials.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setUnauthorizedDomain(null);
    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in with Google');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      if (error.code === 'auth/unauthorized-domain' || (error.message && error.message.includes('auth/unauthorized-domain'))) {
        setUnauthorizedDomain(window.location.hostname);
        toast.error('Google Sign-In failed: Domain not authorized in Firebase.');
      } else {
        toast.error(error.message || 'An error occurred during Google Sign-In.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-zinc-900 flex flex-col justify-between py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Header Row with Only Arrow Icon Button */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between mb-4 sm:mb-6">
        <button 
          type="button"
          onClick={() => navigate('/')}
          aria-label="Back to home"
          title="Back to home"
          className="w-10 h-10 inline-flex items-center justify-center text-zinc-700 hover:text-blue-600 bg-white hover:bg-zinc-100 border border-zinc-200/90 rounded-full shadow-sm hover:shadow transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>

        {/* Brand identity badge */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 flex items-center justify-center">
            <CVidyaIcon className="w-full h-full" variant="original" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-zinc-600 hidden sm:inline">
            C Vidya Solutions
          </span>
        </div>
      </div>

      {/* Main Content Area: Harmonious, Balanced Dual Grid */}
      <div className="max-w-6xl mx-auto w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Side: Brand highlights & tech features */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
            {/* Top: Headline & Subtitle */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight italic text-zinc-950 leading-tight">
                Power. Passion. <br />
                <span className="text-blue-600">Victory</span> <span className="text-amber-500">Legacy.</span>
              </h1>
              <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-lg">
                Log into your locker to view live workout tracking, customized nutrition splits, online supplement orders, and contactless gym check-ins.
              </p>
            </div>

            {/* Middle: Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 my-6 sm:my-8">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-blue-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 border border-blue-200/60 flex items-center justify-center mb-2.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xs font-black uppercase italic tracking-wider text-zinc-950">Luxury Campus Zones</h3>
                <p className="text-xs text-zinc-600 leading-normal mt-1">Olympic free-weights, steam baths, and bio-metric turnstiles across 3 locations.</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-blue-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-200/60 flex items-center justify-center mb-2.5">
                  <Trophy className="w-4 h-4 text-amber-700" />
                </div>
                <h3 className="text-xs font-black uppercase italic tracking-wider text-zinc-950">Elite Guild Coaches</h3>
                <p className="text-xs text-zinc-600 leading-normal mt-1">Certified exercise logs, bespoke muscle splits, and progressive overload tracking.</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-blue-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 border border-blue-200/60 flex items-center justify-center mb-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-xs font-black uppercase italic tracking-wider text-zinc-950">Verified Nutrition Store</h3>
                <p className="text-xs text-zinc-600 leading-normal mt-1">Lab-certified whey isolate, clean creatine, and post-workout recovery shakes.</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-blue-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-100/70 border border-amber-200/60 flex items-center justify-center mb-2.5">
                  <Users className="w-4 h-4 text-amber-700" />
                </div>
                <h3 className="text-xs font-black uppercase italic tracking-wider text-zinc-950">Automated Attendance</h3>
                <p className="text-xs text-zinc-600 leading-normal mt-1">Single-tap check-in, real-time locker access, and digital membership renewals.</p>
              </div>
            </div>

            {/* Bottom: Trust stats */}
            <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-6 text-xs text-zinc-600">
              <div>
                <span className="text-lg font-black text-zinc-950 italic block tabular-nums">1,500+</span>
                <span className="font-semibold text-[11px] uppercase tracking-wider text-zinc-500">Active Members</span>
              </div>
              <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
              <div>
                <span className="text-lg font-black text-amber-600 italic block">15-Day</span>
                <span className="font-semibold text-[11px] uppercase tracking-wider text-zinc-500">Pass Guarantee</span>
              </div>
              <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
              <div>
                <span className="text-lg font-black text-blue-600 italic block tabular-nums">3 Hubs</span>
                <span className="font-semibold text-[11px] uppercase tracking-wider text-zinc-500">Metro Network</span>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white p-6 sm:p-8 md:p-9 rounded-3xl border border-zinc-200/90 shadow-lg relative">
              {/* Form Header with C Vidya SVG Logo Icon */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100/90 p-2.5 flex items-center justify-center shadow-sm mb-3">
                  <CVidyaIcon className="w-full h-full" variant="original" />
                </div>
                <h2 className="text-2xl font-black text-zinc-950 tracking-tight uppercase italic">
                  C Vidya Fitness Zone
                </h2>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* Invisible Bot Honeypot */}
                <input
                  type="text"
                  name="gym_auth_verification_trap"
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  style={{ display: 'none' }}
                />

                {/* Cooldown Alert Banner */}
                {lockoutRemaining > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Security lockout active: Wait {lockoutRemaining}s before retrying.</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 border border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
                      required
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 border border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || lockoutRemaining > 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {loading ? 'Authenticating...' : lockoutRemaining > 0 ? `Locked (${lockoutRemaining}s)` : 'Sign In'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-zinc-500 font-semibold text-[10px] uppercase tracking-wider">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 border border-zinc-300 cursor-pointer shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <p className="text-center text-xs text-zinc-600 font-medium mt-5">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-bold transition-colors ml-1">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Footer Attribution */}
      <div className="max-w-6xl mx-auto w-full pt-4 mt-4 border-t border-zinc-200/60 text-center text-xs text-zinc-500">
        <span>&copy; {new Date().getFullYear()} C Vidya Solutions. All rights reserved.</span>
      </div>

      {/* Unauthorized domain modal */}
      {unauthorizedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden text-zinc-900">
            <div className="bg-blue-50 border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 p-2 flex items-center justify-center shadow-md">
                <CVidyaIcon className="w-full h-full" variant="white" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-950 uppercase italic">Google Auth Setup Required</h3>
                <p className="text-xs text-blue-600 font-mono">auth/unauthorized-domain</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-zinc-600 leading-relaxed">
                Firebase Authentication requires adding this preview domain to your project's authorized domains list.
              </p>

              <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200 space-y-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block font-mono">Copy domain</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-zinc-300 text-blue-600 font-mono text-xs break-all font-semibold">
                    {unauthorizedDomain}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(unauthorizedDomain);
                      setCopied(true);
                      toast.success('Domain copied!');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center justify-center px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg transition-colors border border-zinc-300 text-xs font-bold cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => setUnauthorizedDomain(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-colors text-xs border border-zinc-300 cursor-pointer"
                >
                  Close
                </button>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 text-xs shadow-md shadow-blue-600/20"
                >
                  Open Firebase
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
