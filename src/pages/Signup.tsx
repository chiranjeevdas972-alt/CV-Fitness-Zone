import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { CVidyaIcon } from '../components/CVidyaLogo';
import { toast } from 'sonner';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: '',
        role: 'admin', // First user is admin by default for simplicity in this SaaS demo
        gymId: 'default-gym',
        createdAt: new Date().toISOString(),
      });

      toast.success('Account created! Please verify your email.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-zinc-900 flex flex-col justify-between py-6 sm:py-8 lg:py-10 px-4 sm:px-6">
      {/* Top Header Row with Only Arrow Icon Button */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-4">
        <button 
          type="button"
          onClick={() => navigate('/')}
          aria-label="Back to home"
          title="Back to home"
          className="w-10 h-10 inline-flex items-center justify-center text-zinc-700 hover:text-blue-600 bg-white hover:bg-zinc-100 border border-zinc-200/90 rounded-full shadow-sm hover:shadow transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        </button>

        <div className="flex items-center gap-2 select-none">
          <div className="w-6 h-6 flex items-center justify-center">
            <CVidyaIcon className="w-full h-full" variant="original" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-zinc-600">
            C Vidya
          </span>
        </div>
      </div>

      {/* Main Signup Card */}
      <div className="w-full max-w-md mx-auto my-auto space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/90 shadow-lg">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100/90 p-2.5 flex items-center justify-center shadow-sm mb-3">
            <CVidyaIcon className="w-full h-full" variant="original" />
          </div>
          <h2 className="text-2xl font-black text-zinc-950 uppercase italic tracking-tight">Join C Vidya Fitness</h2>
          <p className="text-blue-600 mt-1 font-bold text-xs uppercase tracking-wider">Start your victory journey today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-3">
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/80 border border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-sm"
                required
              />
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors ml-1">
            Sign in
          </Link>
        </p>
      </div>

      <div className="max-w-md mx-auto w-full pt-4 mt-4 border-t border-zinc-200/60 text-center text-xs text-zinc-500">
        <span>&copy; {new Date().getFullYear()} C Vidya Solutions. All rights reserved.</span>
      </div>
    </div>
  );
}
