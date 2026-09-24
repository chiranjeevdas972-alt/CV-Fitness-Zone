import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Dumbbell, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 p-4">
      <div className="w-full max-w-md mb-4">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-zinc-900 hover:text-blue-600 transition-colors font-black uppercase tracking-widest text-xs px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-zinc-900" />
          Back to Home
        </button>
      </div>
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-zinc-200 shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3.5 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-600/25">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-zinc-950 uppercase italic tracking-tight">Join C Vidya Fitness</h2>
          <p className="text-blue-600 mt-1.5 font-black text-xs uppercase tracking-widest">Start your victory journey today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-300 hover:border-zinc-400 rounded-xl text-zinc-950 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-semibold text-sm"
                required
              />
            </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all duration-200 shadow-xl shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 font-bold uppercase tracking-wider">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-black transition-colors ml-1">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
