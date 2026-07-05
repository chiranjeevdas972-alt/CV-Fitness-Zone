import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Dumbbell, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
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
    <div className="min-h-screen flex flex-col justify-center bg-zinc-950 p-4 sm:p-6 md:p-8 lg:p-12">
      {/* Premium Back to Home navigation element styled in bright pristine white */}
      <div className="max-w-7xl mx-auto w-full mb-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2.5 text-white hover:text-red-500 transition-all font-black uppercase tracking-[0.2em] text-[11px] px-5 py-2.5 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 rounded-full shadow-lg hover:shadow-red-950/20 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
          Back to Home
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        
        {/* Left Side: High-Impact Victory-Designed gym branding & powerful tech features */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-zinc-900/30 border border-zinc-900/90 rounded-[2.5rem] p-8 md:p-12 lg:p-16 relative overflow-hidden min-h-[420px] lg:min-h-[640px]">
          {/* High-quality tactical glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-zinc-850/10 blur-[130px] rounded-full pointer-events-none" />

          {/* Top Segment: Headline & Brand Identity */}
          <div className="relative z-10 space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-600/10 border border-red-600/25 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              India's Digital Gym Ecosystem
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter italic text-white leading-none">
              Power. Passion. <br />
              <span className="text-red-600">Victory Legacy.</span>
            </h1>
            <p className="text-zinc-400 font-medium max-w-xl text-sm md:text-base leading-relaxed">
              Step into human-potential transformation. Log into your customized locker area to view live fitness tracking, customized diets, online supplement reserves, and secure gym passes.
            </p>
          </div>

          {/* Middle Segment: Beautiful Dual Grid for High-Performance Features */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 my-10">
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-red-500" />
              </div>
              <h4 className="text-sm font-bold uppercase italic tracking-wider text-white">Luxury Training Spaces</h4>
              <p className="text-xs text-zinc-500 leading-normal mt-1">High-end equipment platforms, premium steam-baths, and advanced functional zones across metro campuses.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-red-500 rotate-45" />
              </div>
              <h4 className="text-sm font-bold uppercase italic tracking-wider text-white">Elite Gym Guild Coaches</h4>
              <p className="text-xs text-zinc-500 leading-normal mt-1">Acquire fully personalized instruction logs, custom bodybuilding goals, and body loss milestones.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 -rotate-45" />
              </div>
              <h4 className="text-sm font-bold uppercase italic tracking-wider text-white">E-Store & Supps Delivery</h4>
              <p className="text-xs text-zinc-500 leading-normal mt-1">Quick-click recovery shakes, certified whey isolates, fitness accessories, and gym merchandise.</p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-red-500" />
              </div>
              <h4 className="text-sm font-bold uppercase italic tracking-wider text-white">Connected Operations</h4>
              <p className="text-xs text-zinc-500 leading-normal mt-1">Seamless electronic trial passes and real-time support. Secured in automated databases.</p>
            </div>
          </div>

          {/* Bottom Segment: Trust Statistics */}
          <div className="relative z-10 border-t border-zinc-800/80 pt-6 flex flex-wrap items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-500">
            <div>
              <span className="text-lg font-black text-white italic block">1,500+</span>
              <span>Active Members</span>
            </div>
            <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
            <div>
              <span className="text-lg font-black text-red-500 italic block">15-DAY</span>
              <span>Free Gym Passes</span>
            </div>
            <div className="h-6 w-px bg-zinc-800 hidden sm:block" />
            <div>
              <span className="text-lg font-black text-white italic block">3 CAMPUSES</span>
              <span>Delhi Metro Area</span>
            </div>
          </div>
        </div>

        {/* Right Side: Completely polished and stylized login form container */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="space-y-8 bg-zinc-900 p-8 sm:p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-650/5 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-600/20">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">C Vidya Fitness Zone</h2>
              <p className="text-zinc-400 mt-2 font-medium text-sm">Commitment to Victory</p>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all font-semibold"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all duration-200 shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-zinc-900 text-zinc-500 uppercase tracking-widest font-black text-[9px]">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-zinc-100 text-zinc-900 font-black uppercase tracking-widest text-xs rounded-xl transition-all duration-200 shadow-lg border border-zinc-200 cursor-pointer"
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

            <p className="text-center text-xs text-zinc-500 font-bold uppercase tracking-wider">
              Don't have an account?{' '}
              <Link to="/signup" className="text-red-500 hover:text-red-400 font-black transition-colors ml-1">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

      </div>

      {unauthorizedDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header pattern banner */}
            <div className="bg-red-650/10 border-b border-zinc-800 px-6 py-4 flex items-center gap-3">
              <div className="inline-flex items-center justify-center p-2 bg-red-600 rounded-lg shadow-md">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">Google Auth Setup Required</h3>
                <p className="text-xs text-red-500 font-medium font-mono">auth/unauthorized-domain</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Action Required in Firebase Console
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Firebase Authentication has stopped this request because this preview domain is not listed in your project's authorized domains list.
                </p>
              </div>

              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-850 space-y-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block font-mono">Copy domain name</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-805 text-red-400 font-mono text-xs break-all font-semibold">
                    {unauthorizedDomain}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(unauthorizedDomain);
                      setCopied(true);
                      toast.success('Domain copied!');
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors border border-zinc-700 text-xs font-bold"
                    title="Copy domain"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest block font-mono">Setup steps</span>
                <ol className="text-xs text-zinc-350 space-y-3 pl-1 font-medium list-none">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 border border-zinc-700">1</span>
                    <span>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline inline-flex items-center font-bold">Firebase Console</a> and select your project.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 border border-zinc-700">2</span>
                    <div>
                      <span>Go to <strong className="text-zinc-100">Authentication</strong> &gt; <strong className="text-zinc-100">Settings</strong>.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 border border-zinc-700">3</span>
                    <div>
                      <span>Under <strong className="text-zinc-100">Authorized domains</strong>, click <strong className="text-red-500 hover:text-red-400 font-bold">Add domain</strong>.</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 border border-zinc-700">4</span>
                    <div>
                      <span>Paste the domain copied above, save, and then close this pop-up to try again!</span>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
                <button
                  onClick={() => setUnauthorizedDomain(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-colors text-xs border border-zinc-750"
                >
                  Close
                </button>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-200 text-xs shadow-lg shadow-red-600/20"
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
