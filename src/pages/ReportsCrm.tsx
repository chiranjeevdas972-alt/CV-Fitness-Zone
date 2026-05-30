import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  ArrowLeft, 
  Plus, 
  Search, 
  CreditCard, 
  Download, 
  Building2, 
  CalendarCheck, 
  PhoneCall, 
  MessageSquare,
  Users,
  Percent,
  TrendingUp,
  FileSpreadsheet,
  FileCheck2,
  DatabaseBackup,
  AlertOctagon,
  CheckCircle2,
  BellRing,
  Printer
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

export function ReportsCrm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard & Switchers
  const [activeTab, setActiveTab] = useState<'crm' | 'reports' | 'gst' | 'branches'>('crm');
  const [selectedBranch, setSelectedBranch] = useState('CV Fitness Delhi South');
  
  // Backups Loading State
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupPayload, setBackupPayload] = useState<any>(null);

  // CRM Leads List
  const [leads, setLeads] = useState<any[]>([
    { id: '1', name: 'Rohan Sharma', phone: '+91 91122 34455', status: 'Lead', source: 'Instagram Ads', date: '25-05-2026' },
    { id: '2', name: 'Priya Verma', phone: '+91 95533 55667', status: 'Trial Class', source: 'Friend Referral', date: '24-05-2026' },
    { id: '3', name: 'Amit Mishra', phone: '+91 88877 66554', status: 'Contacted', source: 'Google Search', date: '21-05-2026' },
    { id: '4', name: 'Kabir Dev', phone: '+91 77766 55443', status: 'Lead', source: 'Gym Banner', date: '19-05-2026' },
  ]);
  const [newLeadForm, setNewLeadForm] = useState({ name: '', phone: '', source: 'Walk-In' });

  // GST State
  const [gstForm, setGstForm] = useState({
    buyerName: '',
    itemName: 'CV Pro Annual membership package',
    priceExclusive: '15000',
    invoiceId: `CVFZ-INV-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toISOString().split('T')[0]
  });
  const [invoicePrintable, setInvoicePrintable] = useState<any>(null);

  // Firestore DB Context parameters for Exporting Standard Datasets CSV
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetchFreshCollections = async () => {
      try {
        const mc = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
        const mSnap = await getDocs(mc);
        setMembersList(mSnap.docs.map(d => ({ id: d.id, name: d.data().name, phone: d.data().phone, planName: d.data().planName || 'Pro package', paymentStatus: d.data().paymentStatus })));

        const pc = query(collection(db, 'payments'), where('gymId', '==', profile.gymId));
        const pSnap = await getDocs(pc);
        setPaymentsList(pSnap.docs.map(d => ({ id: d.id, memberName: d.data().memberName, amount: d.data().amount, method: d.data().method, date: d.data().date })));

        const ac = query(collection(db, 'attendance'), where('gymId', '==', profile.gymId));
        const aSnap = await getDocs(ac);
        setAttendanceList(aSnap.docs.map(d => ({ id: d.id, memberName: d.data().memberName, date: d.data().date, time: d.data().time })));
      } catch (err) {
        console.error("Failed to sync context metrics lists", err);
      }
    };
    fetchFreshCollections();
  }, [profile]);

  const addCrmLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      toast.error("Please fill Name and Phone number");
      return;
    }
    const leadItem = {
      id: String(leads.length + 1),
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      status: 'Lead',
      source: newLeadForm.source,
      date: new Date().toLocaleDateString()
    };
    setLeads([leadItem, ...leads]);
    setNewLeadForm({ name: '', phone: '', source: 'Walk-In' });
    toast.success("CRM lead tracked successfully!");
  };

  const updateLeadStatus = (id: string, newStatus: string) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    toast.success(`Lead status updated to ${newStatus}`);
  };

  const sendWhatsAppReminder = async (leadName: string, phone: string, customMessage: string) => {
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          memberName: leadName,
          customText: customMessage
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.info(`[WhatsApp API Feed]: sent reminder to ${leadName}!`);
      } else {
        toast.error("Failed to send simulation warning.");
      }
    } catch (err) {
      toast.error("WhatsApp Integration offline.");
    }
  };

  const calculateGstInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstForm.buyerName) {
      toast.error("Please insert Buyer's Name.");
      return;
    }
    const price = Number(gstForm.priceExclusive);
    const gstAmount = Math.floor(price * 0.18);
    const grandTotal = price + gstAmount;

    setInvoicePrintable({
      invoiceId: gstForm.invoiceId,
      buyerName: gstForm.buyerName,
      itemName: gstForm.itemName,
      priceExcl: price,
      gstValue: gstAmount,
      grandTotal: grandTotal,
      date: gstForm.date
    });
    toast.success("GST Invoice rendered beautifully!");
  };

  const downloadCsvReport = async (type: string) => {
    let dataToExport: any[] = [];
    if (type === 'payments') dataToExport = paymentsList;
    else if (type === 'members') dataToExport = membersList;
    else if (type === 'attendance') dataToExport = attendanceList;

    if (dataToExport.length === 0) {
      toast.error("No database records found to compile custom report Excel files.");
      return;
    }

    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionType: type, data: dataToExport })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CV_Fitness_${type}_Compiled_Report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(`Standard ${type} Excel spreadsheet downloaded successfully!`);
      } else {
        toast.error("Process failed on server.");
      }
    } catch (err) {
      toast.error("Network file export error.");
    }
  };

  const triggerFullSystemBackup = async () => {
    setBackupLoading(true);
    setBackupPayload(null);
    try {
      const response = await fetch('/api/backup');
      const data = await response.json();
      setBackupPayload(data);
      toast.success("Manual Multi-system secure cloud backup created successfully!");
    } catch (err) {
      toast.error("Backup system error.");
    } finally {
      setBackupLoading(false);
    }
  };

  // Switch Branch Graph data
  const getBranchRevenueHistory = () => {
    if (selectedBranch === 'CV Fitness Delhi South') {
      return [
        { name: 'Jan', amount: 85000 },
        { name: 'Feb', amount: 98000 },
        { name: 'Mar', amount: 112000 },
        { name: 'Apr', amount: 125000 },
        { name: 'May', amount: 145000 },
      ];
    } else if (selectedBranch === 'CV Fitness Connaught CP') {
      return [
        { name: 'Jan', amount: 120000 },
        { name: 'Feb', amount: 140000 },
        { name: 'Mar', amount: 155000 },
        { name: 'Apr', amount: 172000 },
        { name: 'May', amount: 198000 },
      ];
    } else {
      return [
        { name: 'Jan', amount: 60000 },
        { name: 'Feb', amount: 72000 },
        { name: 'Mar', amount: 89000 },
        { name: 'Apr', amount: 95000 },
        { name: 'May', amount: 105000 },
      ];
    }
  };

  const pieDataCombined = [
    { name: 'Direct Lead', value: leads.filter(l => l.status === 'Lead').length },
    { name: 'Contacted', value: leads.filter(l => l.status === 'Contacted').length },
    { name: 'Trial Classes', value: leads.filter(l => l.status === 'Trial Class').length },
  ];
  const COLORS = ['#dc2626', '#18181b', '#27272a'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <span className="text-zinc-800 dark:text-zinc-700">/</span>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-600/10 text-red-650 tracking-widest leading-none border border-red-500/20">
            🏢 CUSTOM MULTI-BRANCH ENTERPRISE DASHBOARD
          </span>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mt-1 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-red-600" />
            CRM Pipeline & GST Accounts
          </h1>
          <p className="text-zinc-500 mt-1">Manage leads, verify transaction sheets, generate GST compliant client receipts and execute backups.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button 
          onClick={() => setActiveTab('crm')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'crm' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-red-600'
          }`}
        >
          CRM & Prospect Pipe
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'reports' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-red-500'
          }`}
        >
          Excel Exports & Multi-System Backups
        </button>
        <button 
          onClick={() => setActiveTab('gst')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'gst' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-red-600'
          }`}
        >
          GST Automated Billing & Invoices
        </button>
        <button 
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
            activeTab === 'branches' ? 'bg-red-600 text-white shadow-lg' : 'text-zinc-500 hover:text-red-600'
          }`}
        >
          Branches Network config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* TAB 1: CRM LEAD MANAGEMENT */}
        {activeTab === 'crm' && (
          <>
            {/* Adding Prospects form */}
            <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
              <h3 className="text-lg font-black uppercase italic tracking-tighter mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                Record Prospect Lead
              </h3>
              <form onSubmit={addCrmLead} className="space-y-4">
                <Input 
                  label="Prospect Name"
                  placeholder="e.g., Harshit Bansal"
                  value={newLeadForm.name}
                  onChange={e => setNewLeadForm({...newLeadForm, name: e.target.value})}
                  required
                />
                <Input 
                  label="Mobile / WhatsApp number"
                  placeholder="+91 XXXXX XXXXX"
                  value={newLeadForm.phone}
                  onChange={e => setNewLeadForm({...newLeadForm, phone: e.target.value})}
                  required
                />
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Lead Ingestion Channel</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-red-600 font-bold"
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({...newLeadForm, source: e.target.value})}
                  >
                    <option value="Walk-In">Walk-In (In-person Inquiry)</option>
                    <option value="Instagram Ads">Instagram Promotional Ads</option>
                    <option value="Google Search">Google Search / Maps Location</option>
                    <option value="Friend Referral">Friend Referral Club Coupon</option>
                  </select>
                </div>

                <Button type="submit" className="w-full mt-4">
                  <Plus className="w-5 h-5 mr-2" />
                  Register CRM Prospect
                </Button>
              </form>
            </div>

            {/* Leads list and pipelines */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">CRM Status Pipeline Grid</h3>
                  <span className="text-[10px] bg-red-600/10 text-red-600 px-3 py-1 font-black uppercase tracking-widest rounded-full">
                    Total Prospects: {leads.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {leads.map(lead => (
                    <div key={lead.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-100 dark:border-zinc-800 hover:border-red-600/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black uppercase tracking-tight text-sm text-zinc-900 dark:text-white">{lead.name}</p>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                            Source: {lead.source}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold">{lead.phone} • Added on {lead.date}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Pipelines action */}
                        <div className="flex items-center gap-1.5 mr-4">
                          <button 
                            onClick={() => updateLeadStatus(lead.id, 'Contacted')}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                              lead.status === 'Contacted' ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-300 dark:border-zinc-700 hover:border-blue-600'
                            }`}
                          >
                            Contacted
                          </button>
                          <button 
                            onClick={() => updateLeadStatus(lead.id, 'Trial Class')}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                              lead.status === 'Trial Class' ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-500'
                            }`}
                          >
                            Trial
                          </button>
                          <button 
                            onClick={() => updateLeadStatus(lead.id, 'Lead')}
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                              lead.status === 'Lead' ? 'bg-zinc-700 border-zinc-700 text-white' : 'border-zinc-300 dark:border-zinc-700'
                            }`}
                          >
                            Reset
                          </button>
                        </div>

                        {/* WhatsApp automated simulation */}
                        <button 
                          onClick={() => sendWhatsAppReminder(lead.name, lead.phone, `Hi ${lead.name}, gym passes are ready today at CV Fitness Zone. Confirm booking here!`)}
                          className="p-2 bg-green-500/10 text-green-500 hover:bg-green-600 hover:text-white rounded-xl transition-all"
                          title="Simulate WhatsApp promotional message alert"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: EXCEL REPORTS AND BACKUPS */}
        {activeTab === 'reports' && (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: EXCEL CSV GENERATORS */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div className="p-3 bg-red-600/10 rounded-2xl text-red-650">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">Enterprise Excel Reports Exporter</h3>
                  <p className="text-xs text-zinc-500">Query real records and trigger custom localized downloads.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-2xl border border-zinc-250 dark:border-zinc-800 hover:border-red-600/30 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Payments Ledger Spreadsheet</h4>
                    <p className="text-xs text-zinc-500">Includes Member ID, amounts paid, billing date, and transaction mechanisms.</p>
                  </div>
                  <Button onClick={() => downloadCsvReport('payments')} size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </Button>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-250 dark:border-zinc-800 hover:border-red-600/30 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Members Consolidated Registry</h4>
                    <p className="text-xs text-zinc-500">Includes phone directory info, package names, registration dates, due statuses.</p>
                  </div>
                  <Button onClick={() => downloadCsvReport('members')} size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </Button>
                </div>

                <div className="p-4 rounded-2xl border border-zinc-250 dark:border-zinc-800 hover:border-red-600/30 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Daily Attendance Registry Logs</h4>
                    <p className="text-xs text-zinc-500">Daily member logs tracking hours checked in, peak timestamps, and gyms visited.</p>
                  </div>
                  <Button onClick={() => downloadCsvReport('attendance')} size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: SYSTEM-WIDE CONFIG SECURE BACKUPS */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-650 dark:text-zinc-400">
                  <DatabaseBackup className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">Secure Core Database Backups</h3>
                  <p className="text-xs text-zinc-500">Back up and extract full gym schemas for disaster mitigation.</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-zinc-500 leading-relaxed font-bold">
                  Execute secure manual backup triggers for CV Fitness Zone. This packs current schemas (leads, configurations, trainer data, settings) to locally downloadable configurations.
                </p>

                <Button onClick={triggerFullSystemBackup} loading={backupLoading} className="w-full">
                  Compile Multi-System Backup File
                </Button>

                {backupPayload && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-xs font-mono space-y-2">
                    <p className="text-green-500 font-bold">✓ SECURE PACKAGE CONFIRMED</p>
                    <div className="grid grid-cols-2 gap-y-1 text-zinc-500">
                      <span>Source:</span> <span className="text-zinc-800 dark:text-zinc-300">{backupPayload.softwareName}</span>
                      <span>Export timestamp:</span> <span className="text-zinc-800 dark:text-zinc-300">{backupPayload.exportTime}</span>
                      <span>Unique ID:</span> <span className="text-zinc-800 dark:text-zinc-300">{backupPayload.backupId}</span>
                      <span>Collection arrays:</span> <span className="text-zinc-800 dark:text-zinc-300">{backupPayload.tablesSupported.join(", ")}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: GST COMPLIANT BILLING SYSTEM */}
        {activeTab === 'gst' && (
          <>
            {/* Setup calculator */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
              <h3 className="text-lg font-black uppercase italic tracking-tighter mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                GST Automated Invoice Setup
              </h3>
              <form onSubmit={calculateGstInvoice} className="space-y-4">
                <Input 
                  label="Buyer / Member Registered Name"
                  placeholder="e.g. Sarthak Juneja"
                  value={gstForm.buyerName}
                  onChange={e => setGstForm({...gstForm, buyerName: e.target.value})}
                  required
                />
                
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Purchased Item Line</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-red-650 font-bold"
                    value={gstForm.itemName}
                    onChange={e => setGstForm({...gstForm, itemName: e.target.value})}
                  >
                    <option value="CV Pro Annual membership package">CV Pro Annual membership package</option>
                    <option value="Body Transformation Supplement Pack">Body Transformation Supplement Pack (Whey/Creatine)</option>
                    <option value="Elite 1-on-1 PT Coaching pass">Elite 1-on-1 PT Coaching pass (1 Month)</option>
                    <option value="CV Corporate Access Card with Gym Lockers">CV Corporate Access Card with Gym Lockers</option>
                  </select>
                </div>

                <Input 
                  label="Price (Exclusive of GST)"
                  type="number"
                  value={gstForm.priceExclusive}
                  onChange={e => setGstForm({...gstForm, priceExclusive: e.target.value})}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Transaction Date"
                    type="date"
                    value={gstForm.date}
                    onChange={e => setGstForm({...gstForm, date: e.target.value})}
                    required
                  />
                  <Input 
                    label="Assigned Invoice ID"
                    value={gstForm.invoiceId}
                    onChange={e => setGstForm({...gstForm, invoiceId: e.target.value})}
                    required
                  />
                </div>

                <Button type="submit" className="w-full mt-4">
                  <Percent className="w-5 h-5 mr-2" />
                  Generate Printable GST Receipt
                </Button>
              </form>
            </div>

            {/* Rendered Invoice preview */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
              {invoicePrintable ? (
                <div className="space-y-6">
                  {/* Clean Printable Receipt Block */}
                  <div id="gym-gst-invoice" className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-sans space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                      <div>
                        <h4 className="font-black text-lg uppercase italic tracking-tighter">CV Fitness Zone Ltd.</h4>
                        <p className="text-[10px] text-zinc-500">GSTIN: 07AAAAC1234F1Z8 • Authorized Invoice Receipt</p>
                      </div>
                      <span className="text-xs bg-red-600 font-bold px-3 py-1 rounded-lg text-white">TAX INVOICE</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-500">
                      <div>
                        <p className="font-bold text-zinc-400">CUSTOMER BILL TO:</p>
                        <p className="font-black text-sm text-zinc-800 dark:text-zinc-200 mt-1">{invoicePrintable.buyerName}</p>
                        <p className="text-[10px] mt-0.5">Physical Gym Member ID: Verified Active</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-400">INVOICE DETAILS:</p>
                        <p className="font-black text-zinc-800 dark:text-zinc-200 mt-1">Invoice: {invoicePrintable.invoiceId}</p>
                        <p className="text-[10px] mt-0.5">Date Issued: {invoicePrintable.date}</p>
                      </div>
                    </div>

                    {/* Table invoice details */}
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                      <div className="flex justify-between font-black text-xs uppercase tracking-wider text-zinc-400 mb-2">
                        <span>Description</span>
                        <span>Sum Total</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-805 pb-3">
                        <span>{invoicePrintable.itemName}</span>
                        <span>₹{invoicePrintable.priceExcl}</span>
                      </div>
                    </div>

                    {/* Breakdowns */}
                    <div className="space-y-1.5 text-xs font-semibold text-zinc-500 text-right">
                      <div className="flex justify-between">
                        <span>Subtotal Exclusive:</span>
                        <span className="text-zinc-800 dark:text-zinc-200">₹{invoicePrintable.priceExcl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CGST + SGST (18% Flat):</span>
                        <span className="text-zinc-800 dark:text-zinc-200">₹{invoicePrintable.gstValue}</span>
                      </div>
                      <div className="flex justify-between text-base font-black border-t border-zinc-200 dark:border-zinc-800 pt-3 text-red-600">
                        <span className="uppercase">Grand Total:</span>
                        <span>₹{invoicePrintable.grandTotal}</span>
                      </div>
                    </div>

                    {/* QR block standard UPI */}
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex items-center justify-between gap-4">
                      <div className="text-[10px] text-zinc-500 leading-normal max-w-xs">
                        <p className="font-bold mb-1 uppercase tracking-wide">Direct UPI Payment Mechanism:</p>
                        <p>Scan the code via BHIM, GPay, Paytm, phonePe or Razorpay to clear membership totals securely. This updates your CV Fitness zone app profile instantly.</p>
                      </div>
                      <div className="flex-shrink-0 bg-white p-2.5 rounded-xl border border-zinc-200">
                        {/* Elegant custom placeholder simulated QR code vector with canvas-branding */}
                        <svg className="w-16 h-16" viewBox="0 0 100 100">
                          <rect width="10" height="10" fill="#000" />
                          <rect x="90" width="10" height="10" fill="#000" />
                          <rect y="90" width="10" height="10" fill="#000" />
                          <rect x="20" y="20" width="20" height="20" fill="#3f3f46" />
                          <rect x="60" y="20" width="20" height="20" fill="#dc2626" />
                          <rect x="20" y="60" width="20" height="20" fill="#444" />
                          <rect x="50" y="50" width="10" height="10" fill="#000" />
                          <rect x="80" y="80" width="20" height="20" fill="#000" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Print Trigger */}
                  <div className="pt-4 flex justify-end">
                    <Button 
                      onClick={() => {
                        const content = document.getElementById("gym-gst-invoice")?.innerHTML;
                        const win = window.open("", "_blank");
                        win?.document.write(`<html><head><title>Print Invoice - CV Fitness</title><style>body { font-family: sans-serif; padding: 40px; line-height: 1.5; color: #18181b; } .flex { display: flex; justify-content: space-between; } .border-b { border-bottom: 1px solid #e4e4e7; } .pb-4 { padding-bottom: 16px; }</style></head><body>${content}</body></html>`);
                        win?.document.close();
                        win?.print();
                      }} 
                      className="w-full sm:w-auto"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      Print tax Invoice PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-zinc-400">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl mb-4 border border-zinc-100 dark:border-zinc-850">
                    <FileCheck2 className="w-12 h-12 text-zinc-400 opacity-40" />
                  </div>
                  <h3 className="font-black uppercase italic text-sm tracking-widest mb-1 text-zinc-550">Invoice Generator Awaiting</h3>
                  <p className="text-xs text-zinc-500 max-w-xs">Fill out standard buyer details to render tax receipts on-the-fly.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 4: SWITCH AND MANAGE MULTIPLE BRANCHES */}
        {activeTab === 'branches' && (
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter mb-1">Ecosystem Multi-Branch switch</h3>
                <p className="text-xs text-zinc-500">Pivot operational views across CV Fitness Zone branches instantly.</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedBranch('CV Fitness Delhi South')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedBranch === 'CV Fitness Delhi South' ? 'border-red-600 bg-red-600/5' : 'border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm">Delhi South Hub</h4>
                    <p className="text-[10px] text-zinc-500 font-bold">Safdarjung Enclave, Delhi</p>
                  </div>
                  <Building2 className={`w-5 h-5 ${selectedBranch === 'CV Fitness Delhi South' ? 'text-red-650' : 'text-zinc-400'}`} />
                </button>

                <button 
                  onClick={() => setSelectedBranch('CV Fitness Connaught CP')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedBranch === 'CV Fitness Connaught CP' ? 'border-red-600 bg-red-600/5' : 'border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm">CP Elite Peak</h4>
                    <p className="text-[10px] text-zinc-500 font-bold">Connaught Place Central Hub</p>
                  </div>
                  <Building2 className={`w-5 h-5 ${selectedBranch === 'CV Fitness Connaught CP' ? 'text-red-650' : 'text-zinc-400'}`} />
                </button>

                <button 
                  onClick={() => setSelectedBranch('CV Fitness Noida Hub')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    selectedBranch === 'CV Fitness Noida Hub' ? 'border-red-600 bg-red-600/5' : 'border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm">Gurgaon Core Arena</h4>
                    <p className="text-[10px] text-zinc-500 font-bold">Sector 45 DLF Phase Peak</p>
                  </div>
                  <Building2 className={`w-5 h-5 ${selectedBranch === 'CV Fitness Noida Hub' ? 'text-red-550' : 'text-zinc-400'}`} />
                </button>
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-black uppercase italic tracking-tighter">Performance Comparison Graph</h3>
                  <p className="text-xs text-zinc-500">Gross revenue performance logs compiled over last 5 months.</p>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-red-600">
                  {selectedBranch}
                </span>
              </div>

              {/* Chart container */}
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getBranchRevenueHistory()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Bar dataKey="amount" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
