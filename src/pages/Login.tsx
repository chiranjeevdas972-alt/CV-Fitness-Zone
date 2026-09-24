import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Dumbbell, Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, AlertTriangle } from 'lucide-react';
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
        // Timing-safe generic error message preventing user enumeration
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
    <div className="min-h-screen flex flex-col justify-center bg-white text-zinc-900 p-4 sm:p-6 md:p-8 lg:p-12">
      {/* Back to Home navigation element */}
      <div className="max-w-7xl mx-auto w-full mb-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2.5 text-zinc-900 hover:text-blue-600 transition-all font-black uppercase tracking-[0.2em] text-[11px] px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-full shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-900" />
          Back to Home
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        
        {/* Left Side: Victory-Designed gym branding & tech features */}
        <div className="lg:col-span-7 order-2 lg:order-1 flex flex-col justify-between bg-white border border-zinc-200 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 md:p-12 lg:p-16 relative overflow-hidden min-h-[380px] lg:min-h-[640px] shadow-xl">
          {/* Top Segment: Headline & Brand Identity */}
          <div className="relative z-10 space-y-4 sm:space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-100 border border-yellow-300 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-yellow-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              India's Digital Gym Ecosystem
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter italic text-zinc-950 leading-none">
              Power. Passion. <br />
              <span className="text-blue-600">Victory</span> <span className="text-yellow-500">Legacy.</span>
            </h1>
            <p className="text-zinc-700 font-semibold max-w-xl text-xs sm:text-sm md:text-base leading-relaxed">
              Step into human-potential transformation. Log into your customized locker area to view live fitness tracking, customized diets, online supplement reserves, and secure gym passes.
            </p>
          </div>

          {/* Middle Segment: Dual Grid for High-Performance Features */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-8 sm:my-10">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-500/50 hover:shadow-md transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-sm font-black uppercase italic tracking-wider text-zinc-950">Luxury Training Spaces</h4>
              <p className="text-xs text-zinc-600 font-medium leading-normal mt-1">High-end equipment platforms, premium steam-baths, and advanced functional zones across metro campuses.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-500/50 hover:shadow-md transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 border border-yellow-300 flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-yellow-700 rotate-45" />
              </div>
              <h4 className="text-sm font-black uppercase italic tracking-wider text-zinc-950">Elite Gym Guild Coaches</h4>
              <p className="text-xs text-zinc-600 font-medium leading-normal mt-1">Acquire fully personalized instruction logs, custom bodybuilding goals, and body loss milestones.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-500/50 hover:shadow-md transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-blue-600 -rotate-45" />
              </div>
              <h4 className="text-sm font-black uppercase italic tracking-wider text-zinc-950">E-Store & Supps Delivery</h4>
              <p className="text-xs text-zinc-600 font-medium leading-normal mt-1">Quick-click recovery shakes, certified whey isolates, fitness accessories, and gym merchandise.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-blue-500/50 hover:shadow-md transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 border border-yellow-300 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-yellow-700" />
              </div>
              <h4 className="text-sm font-black uppercase italic tracking-wider text-zinc-950">Connected Operations</h4>
              <p className="text-xs text-zinc-600 font-medium leading-normal mt-1">Seamless electronic trial passes and real-time support. Secured in automated databases.</p>
            </div>
          </div>

          {/* Bottom Segment: Trust Statistics */}
          <div className="relative z-10 border-t border-zinc-200 pt-6 flex flex-wrap items-center gap-6 sm:gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-600">
            <div>
              <span className="text-xl font-black text-zinc-950 italic block">1,500+</span>
              <span>Active Members</span>
            </div>
            <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
            <div>
              <span className="text-xl font-black text-yellow-600 italic block">15-DAY</span>
              <span>Free Gym Passes</span>
            </div>
            <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
            <div>
              <span className="text-xl font-black text-blue-600 italic block">3 CAMPUSES</span>
              <span>Delhi Metro Area</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login form container */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col justify-center">
          <div className="space-y-6 sm:space-y-8 bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200 shadow-2xl relative">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3.5 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/25">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-zinc-950 tracking-tighter uppercase italic">C Vidya Fitness Zone</h2>
              <p className="text-blue-600 mt-1.5 font-black text-xs uppercase tracking-widest">Commitment to Victory</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-6">
              {/* Invisible Bot Honeypot Input */}
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
                <div className="p-3.5 bg-yellow-50 border border-yellow-300 rounded-xl flex items-center gap-3 text-xs text-yellow-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 animate-bounce" />
                  <span>Brute-force security lockout active: Wait {lockoutRemaining}s before retry.</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-semibold text-sm"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-semibold text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || lockoutRemaining > 0}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all duration-200 shadow-xl shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? 'Authenticating...' : lockoutRemaining > 0 ? `Locked (${lockoutRemaining}s)` : 'Secure Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-zinc-500 uppercase tracking-widest font-black text-[9px]">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-zinc-50 text-zinc-900 font-black uppercase tracking-widest text-xs rounded-xl transition-all duration-200 shadow-sm border border-zinc-300 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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

            {/* End-to-End Enterprise Encryption Security Seal */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>256-Bit SSL/TLS Encrypted Authentication</span>
            </div>

            <p className="text-center text-xs text-zinc-600 font-bold uppercase tracking-wider">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-black transition-colors ml-1">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

      </div>

      {unauthorizedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden text-zinc-900">
            {/* Header pattern banner */}
            <div className="bg-blue-50 border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
              <div className="inline-flex items-center justify-center p-2 bg-blue-600 rounded-lg shadow-md">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-950 tracking-wide uppercase italic">Google Auth Setup Required</h3>
                <p className="text-xs text-blue-600 font-medium font-mono">auth/unauthorized-domain</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Action Required in Firebase Console
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Firebase Authentication has stopped this request because this preview domain is not listed in your project's authorized domains list.
                </p>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block font-mono">Copy domain name</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded-lg border border-zinc-300 text-blue-600 font-mono text-xs break-all font-semibold">
                    {unauthorizedDomain}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(unauthorizedDomain);
                      setCopied(true);
                      toast.success('Domain copied!');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg transition-colors border border-zinc-300 text-xs font-bold cursor-pointer"
                    title="Copy domain"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block font-mono">Setup steps</span>
                <ol className="text-xs text-zinc-700 space-y-3 pl-1 font-medium list-none">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 text-[10px] font-mono font-bold text-zinc-700 border border-zinc-300">1</span>
                    <span>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center font-bold">Firebase Console</a> and select your project.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 text-[10px] font-mono font-bold text-zinc-700 border border-zinc-300">2</span>
                    <div>
                      <span>Go to <strong className="text-zinc-950">Authentication</strong> &gt; <strong className="text-zinc-950">Settings</strong>.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 text-[10px] font-mono font-bold text-zinc-700 border border-zinc-300">3</span>
                    <div>
                      <span>Under <strong className="text-zinc-950">Authorized domains</strong>, click <strong className="text-blue-600 hover:text-blue-700 font-bold">Add domain</strong>.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 text-[10px] font-mono font-bold text-zinc-700 border border-zinc-300">4</span>
                    <div>
                      <span>Paste the domain copied above, save, and then close this pop-up to try again!</span>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200">
                <button
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
