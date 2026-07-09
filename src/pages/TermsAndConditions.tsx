import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Dumbbell, ArrowLeft, Shield, Check, Mail, Phone, Calendar, Info } from 'lucide-react';
import { Button } from '../components/ui/Form';

export function TermsAndConditions() {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'license', title: '2. Software Access & License' },
    { id: 'accounts', title: '3. Account Registration & Security' },
    { id: 'billing', title: '4. Fees, Billing & SaaS Renewals' },
    { id: 'aizone', title: '5. AI Coach (AiZone) & Health Disclaimer' },
    { id: 'data-privacy', title: '6. Gym Data & Security Controls' },
    { id: 'liability', title: '7. Limitation of Liability' },
    { id: 'changes', title: '8. Modifications & Governing Law' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-red-600/30">
      {/* Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-red-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              C Vidya Fitness Zone
            </span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors font-bold uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest mb-4">
              <Shield className="w-3.5 h-3.5" /> LEGAL AGREEMENT
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-4">
              Terms & Conditions
            </h1>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">
              Last Updated: June 13, 2026 • Product Version 2.1
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-2 p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4 px-2">Table of Contents</p>
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block text-xs font-bold text-zinc-400 hover:text-red-500 hover:translate-x-1 transition-all py-2 px-2 border-l-2 border-transparent hover:border-red-600/40"
                >
                  {sec.title}
                </a>
              ))}
            </div>
          </div>

          {/* Legal Content */}
          <div className="lg:col-span-3 space-y-12 bg-zinc-900/20 backdrop-blur-sm border border-zinc-900/60 p-8 sm:p-12 rounded-[2rem]">
            <section id="introduction" className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-500">Welcome To C Vidya Fitness SaaS</h3>
              <p className="text-sm text-zinc-400 leading-relaxed font-semibold">
                This document sets forth the comprehensive terms of use for the{' '}
                <strong className="text-white">C Vidya Fitness Zone</strong> platform, including all associated software products, AI models, billing interfaces, trainer dashboards, and client tracking modules. Please read these terms carefully before registering your gym facility or logging in.
              </p>
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex gap-3 items-start">
                <Info className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                  By clicking "Sign Up", "Login" or interacting with this fitness business management software, you confirm your absolute acceptance of these terms on behalf of your franchise, branch, or team.
                </p>
              </div>
            </section>

            <hr className="border-zinc-900" />

            <section id="acceptance" className="space-y-4 pt-4">
              <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2">
                {sections[0].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                These terms constitute a legally binding agreement between you (whether personally or on behalf of a corporate gym entity you represent) and{' '}
                <strong className="text-zinc-200">C Vidya Fitness Zone</strong> and its founders, led by{' '}
                <strong className="text-red-500">Chiranjeev Das</strong>. If you do not agree to all provisions, you are strictly prohibited from accessing the system, and you must cease utilization of the trainer portals, check-in portals, and automated e-stores immediately.
              </p>
            </section>

            <section id="license" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[1]?.title || '2. Software Access & License'}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                We grant you a non-exclusive, non-transferable, revocable SaaS subscription license to access and use our administrative controls, live attendance check-ins, financial reports, and the interactive AiZone diet generator strictly as permitted under your designated tier:
              </p>
              <ul className="space-y-3 pl-2">
                <li className="text-xs text-zinc-400 font-semibold flex gap-2 items-start">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Starter:</strong> 1 Gym Branch, up to 500 members, 2 Trainer accounts, standard billing.</span>
                </li>
                <li className="text-xs text-zinc-400 font-semibold flex gap-2 items-start">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Victory Pro:</strong> Unlimited members & Trainers, AI Diet & Workout Coach system, full Supplement e-Store, CRM leads tracking.</span>
                </li>
                <li className="text-xs text-zinc-400 font-semibold flex gap-2 items-start">
                  <Check className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Enterprise:</strong> Multi-branch switch, whitelabel customized portal domain, active database backup rules, and full 24/7 support.</span>
                </li>
              </ul>
            </section>

            <section id="accounts" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[2].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                When you create a profile, you certify that the information you provide is accurate. You are solely responsible for maintaining the confidentiality of your credentials (including Auth IDs and API configurations). If a security breach occurs at your facility (e.g. member QR code leaks or shared staff accounts), you must report it to our security desk immediately at{' '}
                <a href="mailto:cvidyasolutions@gmail.com" className="text-red-400 font-bold hover:underline">cvidyasolutions@gmail.com</a>.
              </p>
            </section>

            <section id="billing" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[3].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                Our pricing structure is documented in our platform. Subscriptions are billed periodically (monthly or annually) and recurring. All subscription plans are subject to sales taxes (including local GST as applicable). All payments are final, and cancellations of standard billing will take effect at the conclusion of the active subscription period. No partial billing cycle refunds will be issued.
              </p>
            </section>

            <section id="aizone" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[4].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                The <strong className="text-white">AiZone (AI Workout & Diet Generator)</strong> and other smart coaching features run on high-performance Gemini LLMs under secure API pipelines. 
              </p>
              <div className="p-4 bg-red-600/5 border border-red-600/10 rounded-xl">
                <p className="text-xs text-zinc-300 font-bold uppercase tracking-widest mb-1">HEALTH & MEDICAL DISCLAIMER</p>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  All diets, meal programs, calorie allocations, and split-workout schedules generated by our AI bots or available inside the AiZone are for educational reference and auto-simulation only. This platform does not provide licensed medical advice, diagnosis, or scientific dietary prescription. Always advise your members to consult qualified healthcare practitioners before implementing intense workout splits or strict diets.
                </p>
              </div>
            </section>

            <section id="data-privacy" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[5].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                Your data is isolated and secured. We employ advanced attribute-based access controls in our back-end Firestore configurations. This ensures gym members can never access trainer analytics, and other gyms can never query your financial or member pipeline statistics. Full details are outlined in our dedicated Privacy Policy.
              </p>
            </section>

            <section id="liability" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[6].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium text-justify">
                IN NO EVENT SHALL C VIDYA FITNESS ZONE, ITS FOUNDERS, OR CHIRANJEEV DAS BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, OR PUNITIVE DAMAGES, ARISING OUT OF WORKOUT COMPLICATIONS, MEMBER ATTENDANCE SLIPS, HARDWARE INTEGRATION LOSSES, OR BILLING REVENUE DECLINES. THE PLATFORM'S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO THE PLATFORM DURING THE SIX (6) MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section id="changes" className="space-y-4">
              <h2 className="text-xl font-black uppercase italic text-white">
                {sections[7].title}
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                These terms shall be governed by and constructed in accordance with the laws of India. Any disputes arising from this platform shall be resolved within competent local jurisdictions. We reserve the absolute right to update these terms to incorporate new platform features or statutory updates.
              </p>
            </section>

            <hr className="border-zinc-900" />

            {/* Direct Contact */}
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black uppercase italic text-white mb-1">Questions or Support?</h4>
                <p className="text-xs text-zinc-500 font-medium">Reach out directly to our help desk and security office.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <a href="mailto:cvidyasolutions@gmail.com" className="flex items-center gap-2 justify-center px-5 py-3 bg-zinc-800 border border-zinc-700 hover:border-red-600/50 hover:bg-zinc-800/80 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all">
                  <Mail className="w-4 h-4 text-red-500" /> cvidyasolutions@gmail.com
                </a>
                <a href="tel:+919288517027" className="flex items-center gap-2 justify-center px-5 py-3 bg-zinc-800 border border-zinc-700 hover:border-red-600/50 hover:bg-zinc-800/80 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all">
                  <Phone className="w-4 h-4 text-red-500" /> +91 92885 17027
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Complete Footer */}
      <footer className="py-16 border-t border-zinc-900 bg-zinc-950 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-red-600 w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-white md:tracking-widest">C Vidya Fitness Zone</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-bold uppercase tracking-[0.1em] text-zinc-300">
                <Mail className="w-4 h-4 text-red-600" />
                <a href="mailto:cvidyasolutions@gmail.com" className="hover:text-red-500 transition-colors">cvidyasolutions@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-bold uppercase tracking-[0.1em] text-zinc-300">
                <Phone className="w-4 h-4 text-red-600" />
                <a href="tel:+919288517027" className="hover:text-red-500 transition-colors">+91 92885 17027</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
              <Link to="/privacy-policy" className="hover:text-red-500 transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-red-500 transition-colors">Terms of Service</Link>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">
                © 2026 C Vidya Fitness Zone. All Rights Reserved.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-700 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Director by</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Chiranjeev Das</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
