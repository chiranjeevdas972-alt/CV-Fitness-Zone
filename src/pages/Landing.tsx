import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Dumbbell, Users, Calendar, CreditCard, Shield, Zap, ArrowRight, CheckCircle2, Mail, Phone, Target, Trophy, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Form';
import { useAuth } from '../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-600/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">CV Fitness Zone</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-bold uppercase tracking-widest">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="text-sm font-bold uppercase tracking-widest px-6">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-6">
                The Future of Gym Management
              </span>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] mb-8">
                Elevate Your <span className="text-red-600">Fitness</span> Business
              </h1>
              <p className="text-xl text-zinc-400 font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
                The all-in-one platform to manage members, trainers, attendance, and payments with professional precision.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg uppercase tracking-widest group">
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 py-6 text-lg uppercase tracking-widest border-zinc-800 hover:bg-zinc-900">
                    Live Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-red-600/5">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1920&h=1080" 
                alt="Dashboard Preview" 
                className="w-full grayscale opacity-40 group-hover:opacity-60 transition-opacity duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl max-w-lg text-center">
                  <Zap className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-black uppercase italic mb-2">Real-Time Analytics</h3>
                  <p className="text-zinc-400 font-medium">Track your gym's performance with beautiful charts and instant data updates.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4">Built for Professionals</h2>
            <p className="text-zinc-400 font-medium max-w-2xl mx-auto">Everything you need to run a high-performance fitness facility without the administrative headache.</p>
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
                whileHover={{ y: -10 }}
                className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-red-600/50 transition-colors"
              >
                <div className="w-14 h-14 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="text-red-600 w-7 h-7" />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-3">{feature.title}</h3>
                <p className="text-zinc-400 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4">Flexible <span className="text-red-600">Pricing</span></h2>
            <p className="text-zinc-400 font-medium max-w-2xl mx-auto">Choose the perfect plan for your fitness center. Scale as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "1,499",
                period: "/month",
                desc: "Perfect for new or small gyms",
                features: ["Up to 500 Members", "2 Trainer Accounts", "Basic Analytics", "Email Support", "Attendance Tracking"],
                popular: false
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
                    ? "bg-zinc-900 border-red-600 shadow-2xl shadow-red-600/10 scale-105 z-10" 
                    : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-black uppercase italic mb-2">{plan.name}</h3>
                  <p className="text-zinc-500 text-sm font-medium">{plan.desc}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-black">₹{plan.price}</span>
                  <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-zinc-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.popular ? "primary" : "outline"} 
                  className={cn(
                    "w-full py-6 uppercase tracking-widest text-xs font-black rounded-2xl",
                    !plan.popular && "border-zinc-800 hover:bg-zinc-900"
                  )}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000" 
                  alt="Professional Gym Interior" 
                  className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-red-600/10 blur-[80px] rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-red-600/20 rounded-[2.5rem] -rotate-3 -z-0" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-6">
                  Our Commitment to <span className="text-red-600">Victory</span>
                </h2>
                <p className="text-zinc-400 font-medium leading-relaxed text-lg">
                  At CV Fitness Zone, we believe that fitness is the foundation of a successful life. Our mission is to empower fitness center owners with the digital tools they need to inspire their members and manage their growth seamlessly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: Target, title: "Our Mission", desc: "To revolutionize gym management through cutting-edge technology and intuitive design." },
                  { icon: Trophy, title: "Our Vision", desc: "To be the global standard for fitness business intelligence and member engagement." },
                  { icon: ShieldCheck, title: "Our Core", desc: "Built on integrity, performance, and a relentless pursuit of member success." }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-red-600/30 transition-colors group">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-600/10 transition-colors">
                      <item.icon className="text-zinc-500 w-6 h-6 group-hover:text-red-600 transition-colors" />
                    </div>
                    <h4 className="text-sm font-black uppercase italic mb-2 tracking-wider">{item.title}</h4>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-zinc-900">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 overflow-hidden bg-zinc-800">
                        <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="Team" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase italic tracking-tighter">Trusted by 500+ Gyms</p>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Across India & Beyond</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <section className="py-24 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125">
            <span className="text-3xl font-black tracking-tighter uppercase italic">Iron Paradise</span>
            <span className="text-3xl font-black tracking-tighter uppercase italic">Elite Fitness</span>
            <span className="text-3xl font-black tracking-tighter uppercase italic">Power House</span>
            <span className="text-3xl font-black tracking-tighter uppercase italic">Titan Gym</span>
            <span className="text-3xl font-black tracking-tighter uppercase italic">Alpha Box</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/5" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="bg-zinc-900 border border-zinc-800 p-12 md:p-20 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-6 leading-tight">
              Ready to Transform Your <br /> <span className="text-red-600">Gym Operations?</span>
            </h2>
            <p className="text-xl text-zinc-400 font-medium mb-10 max-w-xl mx-auto">
              Join hundreds of gym owners who have scaled their business with CV Fitness Zone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto px-12 py-6 text-xl uppercase tracking-widest">
                  Get Started Now
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 uppercase tracking-widest">
                <CheckCircle2 className="text-red-600 w-5 h-5" />
                No Credit Card Required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <div className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-red-600 w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">CV Fitness Zone</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-bold uppercase tracking-[0.1em] text-zinc-500">
                <Mail className="w-4 h-4 text-red-600" />
                <a href="mailto:cvidyalibrary32@gmail.com" className="hover:text-white transition-colors">cvidyalibrary32@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start text-xs font-bold uppercase tracking-[0.1em] text-zinc-500">
                <Phone className="w-4 h-4 text-red-600" />
                <a href="tel:+918987766981" className="hover:text-white transition-colors">+91 89877 66981</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6 text-center md:text-right">
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
              <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
                © 2026 CV Fitness Zone. All Rights Reserved.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Developed by</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-600">chiranjeev Das</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
