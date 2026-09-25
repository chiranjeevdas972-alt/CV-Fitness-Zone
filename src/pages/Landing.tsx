import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Users, Calendar, CreditCard, Shield, Zap, ArrowRight, CheckCircle2, Mail, Phone, Target, Trophy, ShieldCheck, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/Form';
import { useAuth } from '../contexts/AuthContext';
import { Shop } from './Shop';
import { PartnerInquirySection } from '../components/PartnerInquirySection';
import { FitnessTipsSection } from '../components/FitnessTipsSection';
import { DPDPPrivacyModal } from '../components/DPDPPrivacyModal';
import gymMenTraining from '../assets/images/gym_men_training_1790264975329.jpg';
import gymWomenTraining from '../assets/images/gym_women_training_1790264993675.jpg';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDPDPModalOpen, setIsDPDPModalOpen] = useState(false);

  useEffect(() => {
    // Set light mode for pristine white background aesthetics
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-blue-500/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-black tracking-tighter uppercase italic text-zinc-950 truncate max-w-[200px] sm:max-w-none">
              C Vidya Fitness Zone
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-black uppercase tracking-widest text-zinc-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#shop" className="hover:text-blue-600 transition-colors">Shop</a>
            <a href="#tips" className="hover:text-blue-600 transition-colors">Tips</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#partner-inquiry" className="hover:text-blue-600 transition-colors">Connect</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-xs sm:text-sm font-black uppercase tracking-widest px-3 sm:px-4 text-zinc-800 hover:text-blue-600 hover:bg-zinc-100">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="text-xs sm:text-sm font-black uppercase tracking-widest px-3 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25">Get Started</Button>
            </Link>
            
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-blue-600 hover:bg-zinc-200 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-blue-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-zinc-200 px-6 py-6 space-y-4 shadow-xl"
            >
              <div className="flex flex-col space-y-3 font-black text-sm uppercase tracking-wider text-zinc-700">
                <a 
                  href="#features" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                >
                  Features
                </a>
                <a 
                  href="#shop" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                >
                  Shop
                </a>
                <a 
                  href="#tips" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                >
                  Tips
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                >
                  Pricing
                </a>
                <a 
                  href="#partner-inquiry" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                >
                  Connect
                </a>
                <a 
                  href="#about" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-xl hover:bg-zinc-100 hover:text-blue-600 transition-colors"
                >
                  About
                </a>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest py-3 text-zinc-800">Login to Account</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full text-xs font-black uppercase tracking-widest py-3 bg-blue-600 hover:bg-blue-700 text-white">Get Started Free</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.95] sm:leading-[0.9] mb-6 sm:mb-8 text-zinc-950">
                Elevate Your <span className="text-blue-600">Fitness</span> <span className="text-yellow-500">Business</span>
              </h1>
              <p className="text-base sm:text-xl text-zinc-700 font-semibold leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
                The All-In-One Platform To Manage Members, Trainers, Attendance, And Payments With Professional Precision.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-0">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg uppercase tracking-widest font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/25 group">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Gym Facility Showcase & Training Zones */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            {/* Clear, unblurred, fully visible gym facility image */}
            <div className="relative rounded-3xl overflow-hidden border border-zinc-200 shadow-xl bg-white">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920&h=900" 
                alt="C Vidya Fitness Zone Facility" 
                className="w-full h-[380px] md:h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Professional Training Showcase: One side boys, one side girls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Men's Training Zone (Boys) */}
              <div className="group relative rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl">
                <div className="h-72 sm:h-80 w-full overflow-hidden bg-zinc-100">
                  <img 
                    src={gymMenTraining} 
                    alt="Men's Strength & Power Training Zone - Full Coverage Gym Attire" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 bg-white border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">Men's Training Zone</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">Strength & Power</span>
                  </div>
                  <h4 className="text-xl font-black uppercase italic tracking-tight text-zinc-950">Heavy Lifting & Conditioning</h4>
                  <p className="text-zinc-700 text-xs mt-1 font-semibold">Olympic weights, power racks, muscle hypertrophy, and progressive overload setups.</p>
                </div>
              </div>

              {/* Women's Training Zone (Girls) */}
              <div className="group relative rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-lg transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl">
                <div className="h-72 sm:h-80 w-full overflow-hidden bg-zinc-100">
                  <img 
                    src={gymWomenTraining} 
                    alt="Women's Fitness & Tone Training Zone - Full Coverage Gym Attire" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6 bg-white border-t border-zinc-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">Women's Training Zone</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">Tone & Wellness</span>
                  </div>
                  <h4 className="text-xl font-black uppercase italic tracking-tight text-zinc-950">Cardio, Core & Aerobic Tone</h4>
                  <p className="text-zinc-700 text-xs mt-1 font-semibold">Functional training, kettlebells, resistance sculpting, endurance, and flexibility.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4 text-zinc-950">
              Built for <span className="text-blue-600">Professionals</span>
            </h2>
            <p className="text-zinc-700 font-semibold max-w-2xl mx-auto">Everything you need to run a high-performance fitness facility without the administrative headache.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Member Management", desc: "Track profiles, goals, and membership status with ease." },
              { icon: Calendar, title: "Attendance Tracking", desc: "Digital check-ins and attendance history for every member." },
              { icon: CreditCard, title: "Payment Processing", desc: "Manage subscriptions, renewals, and payment history securely." },
              { icon: Shield, title: "Role-Based Access", desc: "Secure permissions for admins, trainers, and staff." },
              { icon: Dumbbell, title: "Trainer Portals", desc: "Dedicated views for trainers to manage their assigned members." },
              { icon: Zap, title: "Instant Insights", desc: "Revenue reports and growth analytics at your fingertips." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-8 bg-white border border-zinc-200 rounded-3xl hover:border-blue-500/50 hover:shadow-xl transition-all shadow-sm"
              >
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="text-blue-600 w-7 h-7" />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-3 text-zinc-950">{feature.title}</h3>
                <p className="text-zinc-700 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-24 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Shop />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4 text-zinc-950">
              Flexible <span className="text-blue-600">Pricing</span> <span className="text-yellow-500">Plans</span>
            </h2>
            <p className="text-zinc-700 font-semibold max-w-2xl mx-auto">Choose the perfect plan for your fitness center. Scale as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "1,499",
                period: "/month",
                desc: "Perfect for new or small gyms",
                features: [
                  "Active Member Directory (Up to 500)",
                  "2 Professional Gym Trainer Accounts",
                  "Manual QR & Biometric Check-in logs",
                  "GST-Compliant Receipts & Billing invoices",
                  "Standard Email & Platform Support"
                ],
                popular: false
              },
              {
                name: "Victory Pro",
                price: "12,999",
                period: "/year",
                desc: "For established high-growth gyms",
                features: [
                  "Unlimited Members & Elite Trainers",
                  "AI Workout & Personalized Diet Coach (AiZone)",
                  "Live QR Attendance & Dashboard Monitoring",
                  "E-Store Supplement Sales & Protein Inventory Tracker",
                  "Interactive CRM Lead Generation Pipelines",
                  "WhatsApp Auto-Simulation Alerts & SMS broadcasts",
                  "Multi-Segment Financial & Operational analytics"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                desc: "For gym chains and franchises",
                features: [
                  "Ecosystem Multi-Branch Switch System",
                  "Whitelabel Custom Domain Gym Brand Portals",
                  "Unified Bulk Payment Gateway Clearances",
                  "Secure Database System Backup Triggers",
                  "Custom WhatsApp Cloud API Gateways",
                  "24/7 Phone SLA Support & Transition Training"
                ],
                popular: false
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "relative p-8 rounded-[2.5rem] border transition-all duration-300",
                  plan.popular 
                    ? "bg-white border-2 border-blue-600 shadow-2xl shadow-blue-600/15 md:scale-105 z-10" 
                    : "bg-white border-zinc-200 hover:border-blue-400 shadow-md"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md border border-yellow-500/40">
                    ⭐ Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase italic mb-2 text-zinc-950">{plan.name}</h3>
                  <p className="text-zinc-600 text-sm font-semibold">{plan.desc}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-zinc-950">₹{plan.price}</span>
                  <span className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-zinc-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.popular ? "primary" : "outline"} 
                  className={cn(
                    "w-full py-6 uppercase tracking-widest text-xs font-black rounded-2xl transition-all cursor-pointer",
                    plan.popular 
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25" 
                      : "border-zinc-300 hover:border-blue-600 hover:text-blue-600 text-zinc-900 bg-white"
                  )}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitness Tips & Daily Articles Section */}
      <FitnessTipsSection />

      {/* Partner & Inquiry Section */}
      <PartnerInquirySection />

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-12"
          >
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-6 text-zinc-950">
                Our Commitment to <span className="text-blue-600">Victory</span> & <span className="text-yellow-500">Excellence</span>
              </h2>
              <p className="text-zinc-700 font-semibold leading-relaxed text-lg">
                At C Vidya Fitness Zone, we believe that fitness is the foundation of a successful life. Our mission is to empower fitness center owners with the digital tools they need to inspire their members and manage their growth seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Target, title: "Our Mission", desc: "To revolutionize gym management through cutting-edge technology and intuitive design." },
                { icon: Trophy, title: "Our Vision", desc: "To be the global standard for fitness business intelligence and member engagement." },
                { icon: ShieldCheck, title: "Our Core", desc: "Built on integrity, performance, and a relentless pursuit of member success." }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white border border-zinc-200 rounded-3xl hover:border-blue-500/50 hover:shadow-xl transition-all shadow-sm group">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <item.icon className="text-blue-600 w-6 h-6 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-base font-black uppercase italic mb-2 tracking-wider text-zinc-950">{item.title}</h4>
                  <p className="text-xs text-zinc-700 font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-blue-600 w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-zinc-950 md:tracking-widest">C Vidya Fitness Zone</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-black uppercase tracking-[0.1em] text-zinc-600">
                <Mail className="w-4 h-4 text-blue-600" />
                <a href="mailto:cvidyasolutions@gmail.com" className="hover:text-blue-600 transition-colors">cvidyasolutions@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-black uppercase tracking-[0.1em] text-zinc-600">
                <Phone className="w-4 h-4 text-blue-600" />
                <a href="tel:+919288517027" className="hover:text-blue-600 transition-colors">+91 92885 17027</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms-and-conditions" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <button
                type="button"
                onClick={() => setIsDPDPModalOpen(true)}
                className="hover:text-blue-600 transition-colors cursor-pointer text-zinc-700 font-black uppercase tracking-[0.2em]"
              >
                DPDP Act 2023 Compliant
              </button>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">
                © 2026 C Vidya Fitness Zone. All Rights Reserved.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 border border-zinc-200 rounded-full hover:border-zinc-300 transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Director by</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Chiranjeev Das</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* DPDP Act 2023 Statutory Privacy & PRD Rights Modal */}
      {isDPDPModalOpen && (
        <DPDPPrivacyModal isOpen={isDPDPModalOpen} onClose={() => setIsDPDPModalOpen(false)} />
      )}
    </div>
  );
}
