import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Handshake, 
  UserCheck, 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  Package,
  Award,
  Users
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { toast } from 'sonner';

export function PartnerInquirySection() {
  const [activeTab, setActiveTab] = useState<'inquiry' | 'partner'>('inquiry');
  const [submitting, setSubmitting] = useState(false);

  // Inquiry form states
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'General Inquiry',
    message: ''
  });

  // Partner form states
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    partnerType: 'Franchise Partner',
    proposal: ''
  });

  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInquiryForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePartnerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPartnerForm(prev => ({ ...prev, [name]: value }));
  };

  const submitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.phone || !inquiryForm.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        name: inquiryForm.name,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        status: 'Lead',
        source: 'Website Inquiry Form',
        category: inquiryForm.category,
        message: inquiryForm.message,
        createdAt: new Date().toISOString()
      });

      toast.success('Inquiry submitted successfully! A gym representative will contact you shortly.');
      setInquiryForm({
        name: '',
        email: '',
        phone: '',
        category: 'General Inquiry',
        message: ''
      });
    } catch (error: any) {
      console.error("Gym Inquiry Submission Error:", error);
      handleFirestoreError(error, 'create', 'inquiries');
      toast.error(`Failed to submit inquiry. Please try again. ${error?.message || ''}`);
    } finally {
      setSubmitting(false);
    }
  };

  const submitPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name || !partnerForm.email || !partnerForm.phone || !partnerForm.company || !partnerForm.proposal) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        name: partnerForm.name,
        email: partnerForm.email,
        phone: partnerForm.phone,
        company: partnerForm.company,
        status: 'Lead',
        source: 'Website Partnership Proposal',
        category: partnerForm.partnerType,
        message: `Company: ${partnerForm.company} | Proposal: ${partnerForm.proposal}`,
        createdAt: new Date().toISOString()
      });

      toast.success('Partnership proposal submitted successfully! Our business development team will review it.');
      setPartnerForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        partnerType: 'Franchise Partner',
        proposal: ''
      });
    } catch (error: any) {
      console.error("Partnership Proposal Submission Error:", error);
      handleFirestoreError(error, 'create', 'inquiries');
      toast.error(`Failed to submit proposal. Please try again. ${error?.message || ''}`);
    } finally {
      setSubmitting(false);
    }
  };

  const partnerTracks = [
    {
      id: 'Franchise Partner',
      title: 'Franchise Program',
      description: 'Acquire your own territory and launch a premium C Vidya Fitness Zone franchise branch with our proven tech stack and brand playbook.',
      badge: 'Aggressive Growth',
      icon: Building2,
      accent: 'text-red-500 bg-red-600/10'
    },
    {
      id: 'Corporate Wellness',
      title: 'Corporate Wellness',
      description: 'Deploy executive-grade fitness and nutrition guidelines to keep your workforce high-performance, healthy, and highly motivated.',
      badge: 'For Employers',
      icon: Users,
      accent: 'text-blue-500 bg-blue-600/10'
    },
    {
      id: 'Guild Trainer',
      title: 'Elite Trainer Guild',
      description: 'Are you a verified weight trainer, coach, or nutritionist? Team up with our premium network to scale your bookings and roster.',
      badge: 'Certified Pros',
      icon: Award,
      accent: 'text-amber-500 bg-amber-600/10'
    },
    {
      id: 'Vendor Partner',
      title: 'Equipment & Resellers',
      description: 'Integrate advanced hardware systems, cardio gear, premium supplements, or custom brand products directly into our shop ecosystem.',
      badge: 'Integrators',
      icon: Package,
      accent: 'text-emerald-500 bg-emerald-600/10'
    }
  ];

  const handleTrackSelection = (trackId: string) => {
    setActiveTab('partner');
    setPartnerForm(prev => ({ ...prev, partnerType: trackId }));
    // Smooth scroll down slightly to focus the fields
    const formElement = document.getElementById('partner-form-anchor');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="partner-inquiry" className="py-24 bg-zinc-950 border-t border-zinc-900 overflow-hidden relative">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[35rem] h-[35rem] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[25rem] h-[25rem] bg-zinc-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title Grid */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-4">
            Connect & Grow
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
            Partner With Us & <span className="text-red-600">Get in Touch</span>
          </h2>
          <p className="text-zinc-400 font-medium max-w-2xl mx-auto mt-4 text-base md:text-lg">
            Whether you want to launch a world-class gym franchise, register employees for corporate plans, join as a trainer, or ask a general query—experience our unified full-stack support.
          </p>
        </div>

        {/* Unified Interactive Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab('inquiry')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === 'inquiry' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              General Inquiry
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${
                activeTab === 'partner' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Handshake className="w-4 h-4" />
              Partner with Us
            </button>
          </div>
        </div>

        {/* Modular Grid Panel splits the form from features depending on current active tab */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" id="partner-form-anchor">
          
          {/* LEFT SIDE: Visual Track Details or Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            {activeTab === 'inquiry' ? (
              <div className="space-y-6">
                <div className="p-8 bg-zinc-900/50 border border-zinc-800/80 rounded-3xl">
                  <h3 className="text-2xl font-black uppercase italic text-white mb-4">India's Premiere Fitness Zone</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-medium mb-6">
                    Our luxury facilities provide professional-grade cardio lines, advanced plate-loaded equipment, certified nutritional coaches, and highly responsive digital dashboard tracking tools.
                  </p>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-600/10 rounded-full flex items-center justify-center mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Fast Turnaround</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">We reply back to all general client queries and member trial requests in under 24 business hours.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-600/10 rounded-full flex items-center justify-center mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Custom Tour & Trial Pass</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">Request a personalized fitness evaluation and gym floor walkthrough on us.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-red-600/10 rounded-full flex items-center justify-center mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Secure Database Storage</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">Your phone numbers and emails are secured inside our private Firestore stack.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Sparkles className="text-red-500 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase italic tracking-wider">Trial Pass Campaign</h4>
                    <p className="text-xs text-zinc-400 mt-1">Submit your details to start your custom digital locker training sequence today!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-black uppercase italic text-zinc-400">Select a Collaboration Track:</h3>
                  <p className="text-xs text-zinc-500 mt-1">Click any tier below to instantly adjust the partnership questionnaire.</p>
                </div>
                {partnerTracks.map((track) => {
                  const IconComponent = track.icon;
                  const isSelected = partnerForm.partnerType === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleTrackSelection(track.id)}
                      className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'bg-zinc-900 border-red-500 shadow-xl scale-[1.02]' 
                          : 'bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${track.accent}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <h4 className="text-sm font-black uppercase italic text-white tracking-wider">{track.title}</h4>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          isSelected ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {track.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-semibold mt-2">{track.description}</p>
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest">
                          <span>Active Track</span>
                          <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Submissions form (Inquiry vs Partnership Proposal) */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-10 bg-zinc-900 border border-zinc-805 rounded-[2rem] shadow-2xl relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 blur-[50px] rounded-full pointer-events-none" />
              
              {activeTab === 'inquiry' ? (
                /* INQUIRY FORM */
                <form onSubmit={submitInquiry} className="space-y-6">
                  <div className="border-b border-zinc-800/80 pb-4 mb-6">
                    <h3 className="text-2xl font-black uppercase italic text-white">General Inquiry Panel</h3>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">Submit your training questions, corporate discount requests, or trial access inputs.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={inquiryForm.name}
                        onChange={handleInquiryChange}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={inquiryForm.phone}
                        onChange={handleInquiryChange}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={inquiryForm.email}
                        onChange={handleInquiryChange}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Inquiry Type *</label>
                      <select
                        name="category"
                        value={inquiryForm.category}
                        onChange={handleInquiryChange}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-black uppercase text-zinc-400"
                      >
                        <option value="General Inquiry">General Gym Inquiry</option>
                        <option value="15-Day Free Trial">15-Day Free Trial</option>
                        <option value="Personal Training">Personal Training</option>
                        <option value="Corporate Membership">Corporate Membership</option>
                        <option value="Batch Timing Query">Batch Timing / Schedule</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Your Message *</label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={inquiryForm.message}
                      onChange={handleInquiryChange}
                      placeholder="Give us a brief description of what you are looking to achieve, or your query details..."
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs py-4 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Gym Inquiry
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* PARTNER WITH US FORM */
                <form onSubmit={submitPartner} className="space-y-6">
                  <div className="border-b border-zinc-800/80 pb-4 mb-65">
                    <h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-2">
                      <Handshake className="text-red-500 w-6 h-6 shrink-0" />
                      Partner Proposal Form
                    </h3>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">Submit franchise proposals, equipment sales portfolios, or corporate package inquiries.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Contact Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={partnerForm.name}
                        onChange={handlePartnerChange}
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Company / Organization *</label>
                      <input
                        type="text"
                        name="company"
                        required
                        value={partnerForm.company}
                        onChange={handlePartnerChange}
                        placeholder="e.g. FitCorp India Pvt Ltd"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Direct Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={partnerForm.phone}
                        onChange={handlePartnerChange}
                        placeholder="e.g. +91 99988 77766"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Business Email *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={partnerForm.email}
                        onChange={handlePartnerChange}
                        placeholder="partner@company.com"
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Partnership Interest *</label>
                    <select
                      name="partnerType"
                      value={partnerForm.partnerType}
                      onChange={handlePartnerChange}
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-black uppercase text-zinc-400"
                    >
                      <option value="Franchise Partner">Franchise Program</option>
                      <option value="Corporate Wellness">Corporate Wellness</option>
                      <option value="Guild Trainer">Elite Trainer Guild</option>
                      <option value="Vendor Partner">Equipment / Software Vendor</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Proposal Details *</label>
                    <textarea
                      name="proposal"
                      required
                      rows={4}
                      value={partnerForm.proposal}
                      onChange={handlePartnerChange}
                      placeholder="Outline your proposal details, timeline expectations, brand resources, or questions..."
                      className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-xl transition-all text-sm font-semibold text-white placeholder-zinc-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-605 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs py-4 px-6 rounded-xl transition-all duration-300 shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Handshake className="w-4 h-4" />
                        Submit Partnership Proposal
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
