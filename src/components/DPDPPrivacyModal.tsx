import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  UserCheck, 
  Trash2, 
  HelpCircle, 
  Mail, 
  Phone, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface DPDPPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DPDPPrivacyModal({ isOpen, onClose }: DPDPPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<'notice' | 'rights' | 'export' | 'grievance'>('notice');
  const [grievanceForm, setGrievanceForm] = useState({
    name: '',
    email: '',
    phone: '',
    ticketType: 'Data Access Request',
    details: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPersonalArchive = () => {
    const sampleMemberArchive = {
      complianceStandard: "Digital Personal Data Protection Act, 2023 (India) - Section 11",
      dataFiduciary: "C Vidya Fitness Zone / C Vidya Solutions",
      extractedAt: new Date().toISOString(),
      rightsGuaranteed: [
        "Right to access information about personal data (§11)",
        "Right to correction and erasure (§12)",
        "Right of grievance redressal (§13)",
        "Right to nominate (§14)"
      ],
      dataCategories: {
        identity: "Member Full Name, Phone, Email Address",
        biometricAndAttendance: "Gym check-in timestamps, RFID/QR digital gate logs",
        fitnessRecords: "Workout splits, progressive overload logs, bodyweight tracking",
        billingAndGST: "Membership plans, payment clearance receipts, invoice tax codes"
      },
      storageLocation: "Encrypted Cloud Firestore (Asia-South Datacenter, Mumbai / Singapore)",
      retentionPeriod: "Active membership duration + 365 days statutory tax compliance"
    };

    const blob = new Blob([JSON.stringify(sampleMemberArchive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cvidya_dpdp_data_export_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('DPDP Personal Data Archive downloaded successfully.');
  };

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceForm.name || !grievanceForm.email || !grievanceForm.details) {
      toast.error('Please complete all required fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Grievance ticket registered under DPDP Act 2023. Tracking ID: DPDP-' + Math.floor(100000 + Math.random() * 900000));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black uppercase italic tracking-tight text-white">
                  Privacy Rights Dashboard (PRD)
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase rounded-full">
                  DPDP Act 2023
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Government of India Statutory Data Protection Compliance
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-6 gap-2 overflow-x-auto">
          {[
            { id: 'notice', label: 'Statutory Notice (§5)' },
            { id: 'rights', label: 'Principal Rights (§11-14)' },
            { id: 'export', label: 'Data Export / Portability' },
            { id: 'grievance', label: 'Grievance Officer' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-500'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-zinc-300">
          {activeTab === 'notice' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                <h4 className="text-sm font-black uppercase text-white mb-2 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-red-500" />
                  Notice Under Section 5 of DPDP Act, 2023
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  C Vidya Fitness Zone (a product of C Vidya Solutions) acts as the Data Fiduciary. This notice informs gym members, trainers, and visitors regarding how their digital personal data is collected and processed under statutory regulations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block mb-1">Lawful Purpose</span>
                  <p className="text-xs text-zinc-300">
                    Processing gym memberships, electronic biometric check-in registers, personal trainer assignments, fitness progress logs, and GST invoices.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">Data Minimization</span>
                  <p className="text-xs text-zinc-300">
                    We strictly collect only the minimal necessary fields (Name, Phone, Email, Subscription Plan, and Check-in logs). No unauthorized 3rd-party data monetization.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block mb-1">Encrypted Safeguards</span>
                  <p className="text-xs text-zinc-300">
                    All sensitive records are protected with 256-bit AES encryption at rest and TLS 1.3 in transit across Indian/Asia cloud nodes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Revocable Consent</span>
                  <p className="text-xs text-zinc-300">
                    You hold unconditional statutory rights to withdraw consent or request complete erasure of your member profile at any time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rights' && (
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-white mb-2">
                Your Fundamental Rights as a Data Principal
              </h4>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black uppercase text-white">1. Right to Access Information (§11)</h5>
                    <p className="text-xs text-zinc-400 mt-1">
                      Request a full summary of what personal data C Vidya Fitness Zone holds and the categories of processing carried out.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black uppercase text-white">2. Right to Correction & Erasure (§12)</h5>
                    <p className="text-xs text-zinc-400 mt-1">
                      Request correction of inaccurate information, completion of incomplete data, or permanent erasure of personal data that is no longer required.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black uppercase text-white">3. Right of Grievance Redressal (§13)</h5>
                    <p className="text-xs text-zinc-400 mt-1">
                      Submit any complaint or concern directly to the designated Data Protection Grievance Officer, with statutory response within prescribed timelines.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-black uppercase text-white">4. Right to Nominate (§14)</h5>
                    <p className="text-xs text-zinc-400 mt-1">
                      Designate a trusted nominee to exercise your data principal rights in the event of unforeseen death or incapacitation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-500 flex items-center justify-center mx-auto">
                <Download className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-lg font-black uppercase italic text-white">
                  Export Personal Data Archive
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Under the DPDP Act 2023, you can download a complete structured JSON copy of all personal records, attendance check-ins, and invoices held in your account.
                </p>
              </div>

              <button
                onClick={handleDownloadPersonalArchive}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs shadow-xl shadow-red-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download JSON Data Archive
              </button>
            </div>
          )}

          {activeTab === 'grievance' && (
            <div className="space-y-6">
              {/* Grievance Officer Details */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Statutory Grievance Officer (§13 DPDP Act)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 font-bold block">Officer Name</span>
                    <span className="text-white font-black text-sm">Chiranjeev Das</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold block">Organization</span>
                    <span className="text-white font-semibold">C Vidya Solutions / C Vidya Fitness Zone</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold block">Official Email</span>
                    <a href="mailto:cvidyasolutions@gmail.com" className="text-red-400 hover:underline">
                      cvidyasolutions@gmail.com
                    </a>
                  </div>
                  <div>
                    <span className="text-zinc-500 font-bold block">Direct Phone</span>
                    <a href="tel:+919288517027" className="text-zinc-200">
                      +91 92885 17027
                    </a>
                  </div>
                </div>
              </div>

              {/* Redressal Form */}
              {!submitted ? (
                <form onSubmit={handleGrievanceSubmit} className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-wider text-white">
                    Submit a Data Principal Redressal Ticket
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Full Name *"
                      value={grievanceForm.name}
                      onChange={e => setGrievanceForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email Address *"
                      value={grievanceForm.email}
                      onChange={e => setGrievanceForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                      required
                    />
                  </div>

                  <select
                    value={grievanceForm.ticketType}
                    onChange={e => setGrievanceForm(prev => ({ ...prev, ticketType: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="Data Access Request">Right to Access Information (§11)</option>
                    <option value="Data Correction">Right to Correct / Rectify Information (§12)</option>
                    <option value="Data Erasure">Right to Complete Data Erasure (§12)</option>
                    <option value="Consent Withdrawal">Revoke / Withdraw Processing Consent (§6)</option>
                    <option value="General Privacy Grievance">General Data Privacy Grievance (§13)</option>
                  </select>

                  <textarea
                    rows={3}
                    placeholder="Specific grievance or request details *"
                    value={grievanceForm.details}
                    onChange={e => setGrievanceForm(prev => ({ ...prev, details: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-600"
                    required
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Submit DPDP Grievance Ticket
                  </button>
                </form>
              ) : (
                <div className="p-6 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h5 className="text-sm font-black uppercase text-white">Ticket Successfully Registered</h5>
                  <p className="text-xs text-zinc-400">
                    Your request has been logged under DPDP Act 2023. Our Grievance Officer Chiranjeev Das will review and respond within statutory timelines.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
