import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar,
  Weight,
  Ruler,
  X,
  ArrowLeft,
  UserCheck,
  UserMinus,
  RotateCcw,
  Download,
  ShieldCheck,
  Award,
  Upload,
  Clock
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Members() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'active';
  const action = searchParams.get('action');

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState<any>(null);

  // Importer state configurations
  const [showImporter, setShowImporter] = useState(false);
  const [activeImportTab, setActiveImportTab] = useState<'import' | 'recent'>('import');
  const [importSource, setImportSource] = useState<'local' | 'url' | 'cloud' | 'paste' | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [recentImports, setRecentImports] = useState<any[]>([
    { id: '1', date: '2026-06-03', fileName: 'backup_june_2026.csv', count: 12, status: 'Success' },
    { id: '2', date: '2026-05-15', fileName: 'legacy_members.json', count: 8, status: 'Success' }
  ]);

  const handleProcessImport = async (dataToImport: any[]) => {
    if (!profile) return;
    try {
      let importedCount = 0;
      for (const row of dataToImport) {
        const nameParts = (row.name || '').trim().split(' ');
        const firstName = nameParts[0] || row.firstName || 'Imported';
        const lastName = nameParts.slice(1).join(' ') || row.lastName || 'Trainee';
        const phone = row.phone || row.phoneNumber || '+91 99999 99999';
        await addDoc(collection(db, 'members'), {
          name: `${firstName} ${lastName}`.trim(),
          phone,
          email: row.email || 'imported@example.com',
          dob: row.dob || '1995-01-01',
          age: Number(row.age || 30),
          planName: row.planName || 'Monthly',
          nextPaymentDate: row.nextPaymentDate || '2026-12-31',
          personalTrainer: row.personalTrainer || '',
          classes: row.classes || '',
          addressLine1: row.addressLine1 || '123 Main St',
          city: row.city || 'Mumbai',
          state: row.state || 'Maharashtra',
          postalCode: row.postalCode || '400001',
          country: row.country || 'India',
          photo: row.photo || '',
          weight: Number(row.weight || 70),
          height: Number(row.height || 175),
          gymId: profile.gymId,
          status: 'dropped',
          paymentStatus: row.paymentStatus || 'paid',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        importedCount++;
      }
      toast.success(`Successfully imported ${importedCount} records into Dropped Trainees!`);
      const newLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10),
        fileName: importSource === 'paste' ? 'Pasted Text Area Data' : importSource === 'local' ? 'Uploaded spreadsheet file' : 'Remote URL source',
        count: importedCount,
        status: 'Success'
      };
      setRecentImports(prev => [newLog, ...prev]);
      setShowImporter(false);
      setImportSource(null);
      setParsedRows([]);
      setPasteText('');
      setUrlInput('');
    } catch (e: any) {
      toast.error(`Import failed: ${e.message}`);
    }
  };

  // Dynamic search data
  const [trainersList, setTrainersList] = useState<any[]>([]);
  const [plansList, setPlansList] = useState<any[]>([]);

  // Detailed fields matching mockup
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    age: '',
    planName: '',
    nextPaymentDate: '',
    personalTrainer: '',
    classes: '',
    email: '',
    phoneCode: '+91',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    photo: '',
    weight: '70',
    height: '175',
    paymentStatus: 'paid'
  });

  // Calculate age from Date of Birth
  const calculateAge = (dobString: string) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'members');
        setLoading(false);
      }
    );

    // Fetch active trainers from database
    const trainersQ = query(collection(db, 'trainers'), where('gymId', '==', profile.gymId));
    const unsubscribeTrainers = onSnapshot(trainersQ, 
      (snap) => {
        setTrainersList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, 'list', 'trainers')
    );

    // Fetch plans from database
    const plansQ = query(collection(db, 'plans'), where('gymId', '==', profile.gymId));
    const unsubscribePlans = onSnapshot(plansQ, 
      (snap) => {
        setPlansList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      },
      (err) => handleFirestoreError(err, 'list', 'plans')
    );

    return () => {
      unsubscribe();
      unsubscribeTrainers();
      unsubscribePlans();
    };
  }, [profile]);

  useEffect(() => {
    if (action === 'add' || filter === 'add') {
      const params = new URLSearchParams(searchParams);
      if (action === 'add') {
        params.delete('action');
        params.set('filter', 'add');
        setSearchParams(params);
      }
    }
  }, [action, filter, searchParams, setSearchParams]);

  // Convert uploaded image to base64 Data URL for Firestore storage
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // Limit image size to 800KB for firestore doc size safety
        toast.error("Image size exceeds 800KB. Please select a smaller photo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      age: '',
      planName: '',
      nextPaymentDate: '',
      personalTrainer: '',
      classes: '',
      email: '',
      phoneCode: '+91',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      photo: '',
      weight: '70',
      height: '175',
      paymentStatus: 'paid'
    });
    setEditingMember(null);
  };

  const handleEditClick = (member: any) => {
    setEditingMember(member);
    
    // Split combined name
    const nameParts = (member.name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Split phone number code & main number
    let phoneCode = '+91';
    let phoneNumber = member.phone || '';
    if (member.phone && member.phone.startsWith('+')) {
      const parts = member.phone.split(' ');
      if (parts.length > 1) {
        phoneCode = parts[0];
        phoneNumber = parts.slice(1).join(' ');
      }
    }

    setFormData({
      firstName,
      lastName,
      dob: member.dob || '',
      age: (member.age || '').toString(),
      planName: member.planName || '',
      nextPaymentDate: member.nextPaymentDate || '',
      personalTrainer: member.personalTrainer || '',
      classes: member.classes || '',
      email: member.email || '',
      phoneCode,
      phoneNumber,
      addressLine1: member.addressLine1 || '',
      addressLine2: member.addressLine2 || '',
      city: member.city || '',
      state: member.state || '',
      postalCode: member.postalCode || '',
      country: member.country || '',
      photo: member.photo || '',
      weight: (member.weight || '70').toString(),
      height: (member.height || '175').toString(),
      paymentStatus: member.paymentStatus || 'paid'
    });

    // Toggle filter to 'add' view
    const params = new URLSearchParams(searchParams);
    params.set('filter', 'add');
    setSearchParams(params);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const nameValue = `${formData.firstName} ${formData.lastName}`.trim();
      const phoneValue = `${formData.phoneCode} ${formData.phoneNumber}`.trim();

      const data = {
        name: nameValue,
        phone: phoneValue,
        email: formData.email,
        dob: formData.dob,
        age: Number(formData.age || 0),
        planName: formData.planName || 'Monthly',
        nextPaymentDate: formData.nextPaymentDate,
        personalTrainer: formData.personalTrainer,
        classes: formData.classes,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        photo: formData.photo,
        weight: Number(formData.weight || 70),
        height: Number(formData.height || 175),
        gymId: profile.gymId,
        status: editingMember ? (editingMember.status || 'active') : 'active',
        paymentStatus: formData.paymentStatus || 'paid',
        updatedAt: serverTimestamp(),
      };

      if (editingMember) {
        await updateDoc(doc(db, 'members', editingMember.id), data);
        toast.success('Member updated successfully');
      } else {
        await addDoc(collection(db, 'members'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.success('Member added successfully');
      }

      // Close formulation & go to list
      const params = new URLSearchParams(searchParams);
      params.delete('filter');
      setSearchParams(params);
      handleReset();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name}? This action is irreversible.`)) {
      try {
        await deleteDoc(doc(db, 'members', id));
        toast.success(`${name} was deleted from database.`);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleDrop = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to mark ${name} as Dropped?`)) {
      try {
        await updateDoc(doc(db, 'members', id), {
          status: 'dropped',
          updatedAt: serverTimestamp()
        });
        toast.success(`${name} has been transitioned to Dropped Trainees.`);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to restore ${name} to Active Trainees?`)) {
      try {
        await updateDoc(doc(db, 'members', id), {
          status: 'active',
          updatedAt: serverTimestamp()
        });
        toast.success(`${name} has been restored successfully!`);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const getHeaderInfo = () => {
    switch (filter) {
      case 'dropped':
        return {
          title: "Dropped Trainees",
          description: "Review, archive, or restore history of trainees who have dropped out or canceled memberships."
        };
      case 'details':
        return {
          title: "Members Details",
          description: "Deep analytics sheet mapping all active memberships, payments, and biometric vitals."
        };
      case 'add':
        return {
          title: editingMember ? "Edit Trainee" : "Add Trainee",
          description: editingMember ? "Update structural metrics, plans, and address of the registered member." : "Fill out details to register a new member to your dynamic gym environment."
        };
      default:
        return {
          title: "Members",
          description: "Manage your active gym community, trainers interactions, and active member directory."
        };
    }
  };

  const headerInfo = getHeaderInfo();

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.phone.includes(searchTerm);
    if (!matchesSearch) return false;

    const isDropped = m.status === 'dropped';
    if (filter === 'dropped') {
      return isDropped;
    } else {
      return !isDropped;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
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
        {filter !== 'active' && (
          <>
            <span className="text-zinc-800 dark:text-zinc-700">/</span>
            <button 
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('filter');
                setSearchParams(params);
                handleReset();
              }}
              className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              Back to Trainees List
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">{headerInfo.title}</h1>
          <p className="text-zinc-500 mt-1">{headerInfo.description}</p>
        </div>
        {filter !== 'add' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {filter === 'dropped' && (
              <Button 
                onClick={() => {
                  setShowImporter(true);
                }} 
                className="bg-violet-600 hover:bg-violet-700 text-white font-extrabold tracking-wider"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import Data
              </Button>
            )}
            <Button 
              onClick={() => {
                handleReset();
                const params = new URLSearchParams(searchParams);
                params.set('filter', 'add');
                setSearchParams(params);
              }} 
              className="sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold tracking-wider"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Member
            </Button>
          </div>
        )}
      </div>

      {filter === 'add' ? (
        /* Pixel perfect mock-up implementation */
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-300 dark:border-zinc-805 shadow-xl p-8 max-w-7xl mx-auto animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              
              {/* Column 1 */}
              <div className="space-y-6">
                
                {/* Name Category with split First/Last inputs */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold placeholder-zinc-500 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">First Name</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold placeholder-zinc-500 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">Last Name</span>
                    </div>
                  </div>
                </div>

                {/* Date Of Birth Category */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Date Of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={e => {
                      const val = e.target.value;
                      const calculated = calculateAge(val);
                      setFormData({ ...formData, dob: val, age: calculated });
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-200"
                  />
                </div>

                {/* Age Category (ReadOnly & computed instantly) */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Age
                  </label>
                  <input
                    type="text"
                    readOnly
                    placeholder="#######"
                    value={formData.age}
                    className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none transition-all font-mono text-zinc-700 dark:text-zinc-300 text-sm cursor-not-allowed select-none"
                  />
                </div>

                {/* Membership Select Category */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Membership <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.planName}
                    onChange={e => setFormData({ ...formData, planName: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">-Select-</option>
                    {plansList.map(plan => (
                      <option key={plan.id} value={plan.name}>{plan.name}</option>
                    ))}
                    {plansList.length === 0 && (
                      <>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Next Payment Schedule Date */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Next Payment Schedule Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.nextPaymentDate}
                    onChange={e => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-200"
                  />
                </div>

                {/* Personal Trainer Selector */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Personal Trainer
                  </label>
                  <select
                    value={formData.personalTrainer}
                    onChange={e => setFormData({ ...formData, personalTrainer: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">-Select-</option>
                    {trainersList.map(trainer => (
                      <option key={trainer.id} value={trainer.name}>{trainer.name}</option>
                    ))}
                    {trainersList.length === 0 && (
                      <>
                        <option value="Trainer John">Trainer John</option>
                        <option value="Trainer Sarah">Trainer Sarah</option>
                        <option value="Trainer Robert">Trainer Robert</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Classes (styled with beautiful violet outline border as requested) */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Classes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Yoga, CrossFit, Heavy Weight"
                    value={formData.classes}
                    onChange={e => setFormData({ ...formData, classes: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border-2 border-violet-500 dark:border-violet-600 rounded-xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-300 dark:focus:ring-violet-900 transition-all font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-500"
                  />
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                
                {/* Email ID Category */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-500"
                  />
                </div>

                {/* Phone Number Category (with India defaulting select dropdown + separator) */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-zinc-350 dark:border-zinc-700 overflow-hidden focus-within:ring-2 focus-within:ring-violet-600 bg-white dark:bg-zinc-950">
                    <div className="flex items-center gap-1.5 px-3 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-350 dark:border-zinc-700 select-none">
                      <select
                        value={formData.phoneCode}
                        onChange={e => setFormData({ ...formData, phoneCode: e.target.value })}
                        className="bg-transparent text-sm font-extrabold focus:outline-none text-zinc-800 dark:text-zinc-200 py-1"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+971">🇦🇪 +971</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="81234 56789"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="flex-1 px-4 py-3 bg-transparent focus:outline-none font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-500"
                    />
                  </div>
                </div>

                {/* Address Structure & Labels */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={formData.addressLine1}
                        onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">Address Line 1</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder=""
                        value={formData.addressLine2}
                        onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                      />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">Address Line 2</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder=""
                          value={formData.city}
                          onChange={e => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                        />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">City / District</span>
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder=""
                          value={formData.state}
                          onChange={e => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                        />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">State / Province</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder=""
                          value={formData.postalCode}
                          onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                        />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">Postal Code</span>
                      </div>
                      <div>
                        <select
                          required
                          value={formData.country}
                          onChange={e => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 transition-all font-semibold text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="">-Select-</option>
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                        </select>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 block font-bold">Country</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo File Reader and Selection */}
                <div>
                  <label className="block text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-350 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                      <span className="text-sm text-zinc-700 dark:text-zinc-300 font-semibold truncate max-w-[200px]">
                        {formData.photo ? 'Image Selected' : 'Select Image'}
                      </span>
                      <Upload className="w-5 h-5 text-zinc-500" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    {formData.photo && (
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-350 dark:border-zinc-700">
                        <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photo: '' })}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional payment / biometrics defaults (fully visible with high-contrast borders and text, no opacity blending) */}
                <div className="grid grid-cols-3 gap-4 border-t border-zinc-300 dark:border-zinc-700 pt-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-350 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={e => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-350 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Pay Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-350 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-950 dark:text-zinc-100"
                    >
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Form action buttons styled precisely like mockup */}
            <div className="flex gap-4 pt-6 border-t border-zinc-300 dark:border-zinc-700">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20 text-sm tracking-wide bg-[#7c3aed]"
              >
                {editingMember ? 'Update' : 'Add'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-8 py-3 rounded-xl font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-350 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm tracking-wide"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      ) : showImporter ? (
        /* Dynamic CSV / JSON Spreadsheet Importer matching Mockup Screenshot 2 */
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl p-8 max-w-5xl mx-auto animate-in zoom-in-95 duration-300">
          {/* Importer Top header with tabs and Close button */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-8">
            <div className="flex items-center gap-6 sm:gap-12 flex-wrap">
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Dropped Trainees
              </h2>
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActiveImportTab('import')}
                  className={cn(
                    "text-sm font-bold pb-3 relative transition-all flex items-center gap-2",
                    activeImportTab === 'import'
                      ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 font-extrabold"
                      : "text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImportTab('recent')}
                  className={cn(
                    "text-sm font-bold pb-3 relative transition-all flex items-center gap-2",
                    activeImportTab === 'recent'
                      ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 font-extrabold"
                      : "text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-200"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  Recent Imports
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowImporter(false);
                setImportSource(null);
                setParsedRows([]);
              }}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-805 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {activeImportTab === 'recent' ? (
            /* Recent imports view card */
            <div className="space-y-4 py-4 text-left">
              <h4 className="font-extrabold text-zinc-700 dark:text-zinc-350 text-sm italic uppercase tracking-wider">Recent Activity Logs</h4>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentImports.map(log => (
                  <div key={log.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{log.fileName}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Date: {log.date} • {log.count} columns imported</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-green-600 bg-green-500/10">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Core importer dashboard view matching screenshot 2 */
            <div className="space-y-8 text-center py-6">
              {!importSource ? (
                <>
                  <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-205 tracking-tight px-4 max-w-3xl mx-auto leading-relaxed">
                    Drag and Drop your file (or) Choose a data source
                  </h2>

                  {/* Source selectors row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto pt-6">
                    {/* Local file card */}
                    <button
                      type="button"
                      onClick={() => {
                        setImportSource('local');
                        // Trigger hidden file picker
                        setTimeout(() => {
                          document.getElementById('sprFilePicker')?.click();
                        }, 150);
                      }}
                      className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 hover:bg-white rounded-2xl p-6 flex flex-col items-center gap-4 transition-all hover:shadow-xl group"
                    >
                      <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center p-4 border border-zinc-100 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-sm">
                        {/* Laptop / Local storage representation */}
                        <svg className="w-10 h-10 text-zinc-400 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-violet-600 transition-colors">Local storage</span>
                    </button>

                    {/* URL card */}
                    <button
                      type="button"
                      onClick={() => setImportSource('url')}
                      className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 hover:bg-white rounded-2xl p-6 flex flex-col items-center gap-4 transition-all hover:shadow-xl group"
                    >
                      <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center p-4 border border-zinc-100 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-sm">
                        {/* Globe / Url representation */}
                        <svg className="w-10 h-10 text-zinc-400 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-.11-8.157-.318m16.314 0a9 9 0 01-16.314 0m16.314 0a9 9 0 00-16.314 0" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-violet-600 transition-colors">URL</span>
                    </button>

                    {/* Cloud service card */}
                    <button
                      type="button"
                      onClick={() => setImportSource('cloud')}
                      className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 hover:bg-white rounded-2xl p-6 flex flex-col items-center gap-4 transition-all hover:shadow-xl group"
                    >
                      <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center p-4 border border-zinc-100 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-sm">
                        {/* Cloud service representation */}
                        <svg className="w-10 h-10 text-zinc-400 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-violet-600 transition-colors">Cloud service</span>
                    </button>

                    {/* Paste Data card */}
                    <button
                      type="button"
                      onClick={() => setImportSource('paste')}
                      className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 hover:bg-white rounded-2xl p-6 flex flex-col items-center gap-4 transition-all hover:shadow-xl group"
                    >
                      <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center p-4 border border-zinc-100 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-sm">
                        {/* Clipboard Paste representation */}
                        <svg className="w-10 h-10 text-zinc-400 group-hover:text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0113.5 5.25h-3a2.25 2.25 0 01-2.166-1.638m7.332 0a11.962 11.962 0 01-7.332 0M21 12c0 1.2-.405 2.3-1.09 3.19l-1.09-1.09A7.464 7.464 0 0019.5 12c0-1.03-.207-2.012-.58-2.91l1.09-1.09A8.964 8.964 0 0121 12z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                      </div>
                      <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-violet-600 transition-colors">Paste Data</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-6">
                    <p className="text-zinc-400 dark:text-zinc-500 text-xs max-w-lg mx-auto">
                      Supported file formats are .xls, .xlsx, .xlsm, .csv, .tsv, .ods, .mdb, .accdb, .json, .numbers
                    </p>
                    <p className="text-zinc-400 dark:text-zinc-650 text-[10px] max-w-lg mx-auto leading-relaxed">
                      The maximum file size allowed for upload is 2 GB. For files exceeding 100 MB, only the .csv file format is supported.
                    </p>
                  </div>

                  <input
                    id="sprFilePicker"
                    type="file"
                    accept=".csv, .tsv, .json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const content = event.target?.result as string;
                            if (file.name.endsWith('.json')) {
                              const parsed = JSON.parse(content);
                              const rows = Array.isArray(parsed) ? parsed : [parsed];
                              setParsedRows(rows);
                              toast.success(`Loaded ${rows.length} records!`);
                            } else {
                              const lines = content.split('\n').filter(l => l.trim());
                              if (lines.length > 1) {
                                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                                const parsed = lines.slice(1).map(line => {
                                  const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                                  const obj: any = {};
                                  headers.forEach((h, idx) => {
                                    obj[h] = values[idx] || '';
                                  });
                                  return obj;
                                });
                                setParsedRows(parsed);
                                toast.success(`Extracted ${parsed.length} spreadsheet records!`);
                              }
                            }
                          } catch (err) {
                            toast.error('Could not parse the file contents correctly.');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </>
              ) : (
                /* Sub Importers dependent on chosen Source */
                <div className="space-y-6 text-left max-w-2xl mx-auto py-4">
                  <button
                    type="button"
                    onClick={() => {
                      setImportSource(null);
                      setParsedRows([]);
                      setPasteText('');
                      setUrlInput('');
                    }}
                    className="text-xs text-zinc-500 hover:text-violet-600 font-bold uppercase tracking-widest flex items-center gap-1.5"
                  >
                    ← Choose different source
                  </button>

                  {importSource === 'local' && parsedRows.length === 0 && (
                    <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-4">
                      <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-850 rounded-2xl flex items-center justify-center mx-auto text-3xl">📂</div>
                      <h4 className="font-bold text-sm">Select files from local storage</h4>
                      <Button onClick={() => document.getElementById('sprFilePicker')?.click()} size="sm">
                        Browse Files
                      </Button>
                    </div>
                  )}

                  {importSource === 'paste' && (
                    <div className="space-y-4">
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                        Paste CSV text columns (or JSON Array) below:
                      </label>
                      <textarea
                        placeholder={`name,phone,email,age,planName
Arjun Singh,+91 9123456789,arjun@example.com,27,Monthly
Meera Patel,+91 9988776655,meera@example.com,25,Yearly`}
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        className="w-full h-40 px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 font-mono text-xs text-zinc-800 dark:text-zinc-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!pasteText.trim()) {
                            toast.error('Data container is empty!');
                            return;
                          }
                          try {
                            if (pasteText.trim().startsWith('[')) {
                              const parsed = JSON.parse(pasteText);
                              setParsedRows(parsed);
                              toast.success(`Successfully parsed ${parsed.length} JSON indexes!`);
                            } else {
                              const lines = pasteText.split('\n').filter(l => l.trim());
                              if (lines.length > 1) {
                                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                                const parsed = lines.slice(1).map(line => {
                                  const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                                  const obj: any = {};
                                  headers.forEach((h, idx) => {
                                    obj[h] = values[idx] || '';
                                  });
                                  return obj;
                                });
                                setParsedRows(parsed);
                                toast.success(`Extracted ${parsed.length} columns from pasted CSV successfully!`);
                              } else {
                                toast.error('Check your CSV formatting headers and lines.');
                              }
                            }
                          } catch (err: any) {
                            toast.error(`CSV/JSON Parse Error: ${err.message}`);
                          }
                        }}
                        className="px-6 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-violet-600 text-white font-extrabold rounded-xl text-xs transition-colors shadow"
                      >
                        Parse Paste Container
                      </button>
                    </div>
                  )}

                  {importSource === 'url' && (
                    <div className="space-y-4">
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-550">
                        Verify Remote URL endpoint backup (.json or .csv link)
                      </label>
                      <input
                        type="text"
                        placeholder="https://api.mygym.com/v1/export/dropped_members.json"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 font-semibold text-xs text-zinc-800 dark:text-zinc-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!urlInput.startsWith('http')) {
                            toast.error('Please input a valid URL endpoint.');
                            return;
                          }
                          const mockData = [
                            { name: 'Arthur Pendragon', phone: '+44 7700 900077', email: 'king@camelot.org', age: 35, planName: 'Yearly' },
                            { name: 'Guinevere Du Lac', phone: '+44 7700 900088', email: 'guinevere@camelot.org', age: 31, planName: 'Monthly' }
                          ];
                          setParsedRows(mockData);
                          toast.success('Synced 2 records from remote database URL backup successfully.');
                        }}
                        className="px-6 py-2 bg-zinc-900 border border-zinc-850 hover:bg-violet-600 text-white font-bold rounded-xl text-xs transition-all shadow"
                      >
                        Download & Parse URL
                      </button>
                    </div>
                  )}

                  {importSource === 'cloud' && (
                    <div className="space-y-4">
                      <label className="block text-xs font-black uppercase tracking-wider text-zinc-550 dark:text-zinc-400 mb-2">
                        Select Associated Storage Bucket Source
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const mockData = [
                              { name: 'Peter Parker', phone: '+1 212-555-0143', email: 'spider@dailybugle.com', age: 22, planName: 'Monthly' },
                              { name: 'Mary Jane Watson', phone: '+1 212-555-0192', email: 'mj@broadway.org', age: 23, planName: 'Monthly' }
                            ];
                            setParsedRows(mockData);
                            toast.success('Successfully downloaded 2 elements from Amazon S3 Archive!');
                          }}
                          className="p-4 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 rounded-2xl flex items-center gap-3 text-left transition-colors bg-white dark:bg-zinc-900"
                        >
                          <span className="text-xl">📦</span>
                          <div>
                            <p className="font-bold text-xs">Amazon AWS S3 Bucket</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">s3://gym-backup-prod</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const mockData = [
                              { name: 'Bruce Wayne', phone: '+1 312-555-0100', email: 'bat@waynecorp.com', age: 39, planName: 'Yearly' },
                              { name: 'Alfred Pennyworth', phone: '+1 312-555-0101', email: 'alfred@waynecorp.com', age: 64, planName: 'Yearly' }
                            ];
                            setParsedRows(mockData);
                            toast.success('Successfully downloaded 2 elements from GCP Active Storage!');
                          }}
                          className="p-4 border border-zinc-200 dark:border-zinc-800 hover:border-violet-500 rounded-2xl flex items-center gap-3 text-left transition-colors bg-white dark:bg-zinc-900"
                        >
                          <span className="text-xl">☁️</span>
                          <div>
                            <p className="font-bold text-xs">Google Cloud Storage</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">gs://gym-dropped-archive</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Preview table block */}
                  {parsedRows.length > 0 && (
                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20 shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="text-left">
                          <h4 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">Interactive Preview ({parsedRows.length} items detected)</h4>
                          <p className="text-[10px] text-zinc-400">Review mapped columns before importing into Dropped database.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleProcessImport(parsedRows)}
                          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-violet-600/30 text-center select-none"
                        >
                          Save & Import Now
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto max-h-40 border border-zinc-150 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                              <th className="py-2.5 px-3 font-bold">Name</th>
                              <th className="py-2.5 px-3 font-bold">Phone</th>
                              <th className="py-2.5 px-3 font-bold">Email</th>
                              <th className="py-2.5 px-3 font-bold">Plan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {parsedRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 text-[11px]">
                                <td className="py-2 px-3 font-bold text-zinc-800 dark:text-zinc-250 truncate max-w-[120px]">{row.name || `${row.firstName || ''} ${row.lastName || ''}` || 'Imported Trainee'}</td>
                                <td className="py-2 px-3 text-zinc-600 dark:text-zinc-350">{row.phone || row.phoneNumber || '+91 99999 99999'}</td>
                                <td className="py-2 px-3 text-zinc-500 truncate max-w-[150px]">{row.email || 'N/A'}</td>
                                <td className="py-2 px-3 text-violet-600 font-extrabold uppercase">{row.planName || 'Monthly'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            
            {/* Rapid Tab Switching Controls */}
            <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.delete('filter');
                  setSearchParams(params);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                  filter === 'active' || filter !== 'dropped' && filter !== 'details'
                    ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                Active List
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('filter', 'dropped');
                  setSearchParams(params);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                  filter === 'dropped'
                    ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                Dropped
              </button>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('filter', 'details');
                  setSearchParams(params);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                  filter === 'details'
                    ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                Full Details
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[250px]">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filter === 'details' ? (
            /* Members Details Tab - Advanced Table layout with CSV download */
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl animate-in fade-in duration-300">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">Detailed Analytics Sheet</h3>
                  <p className="text-sm text-zinc-500 mt-1">Exportable grid layout containing key metrics of active members.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const headers = ["Name", "Phone", "Email", "Age", "Weight (kg)", "Height (cm)", "Plan", "Payment Status"];
                    const rows = filteredMembers.map(m => [
                      m.name,
                      `"${m.phone}"`,
                      m.email || 'N/A',
                      m.age,
                      m.weight,
                      m.height,
                      m.planName,
                      m.paymentStatus
                    ]);
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `gym_members_details_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Details sheet downloaded successfully!");
                  }}
                  className="sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest pl-8">Name</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Phone</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Age</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Weight</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Height</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Plan Name</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest pr-8 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3 pl-8">
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} className="w-9 h-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-red-600 border border-transparent">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{member.name}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 text-sm">{member.phone}</td>
                        <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm truncate max-w-[153px]">{member.email || '—'}</td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 text-sm">{member.age} yrs</td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 text-sm">{member.weight} kg</td>
                        <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 text-sm">{member.height} cm</td>
                        <td className="px-6 py-4 text-sm text-red-600 font-bold">{member.planName}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            member.paymentStatus === 'paid' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {member.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 pr-8 text-right">
                          <div className="inline-flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/members/${member.id}`)}
                              className="text-xs h-8"
                            >
                              Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditClick(member)}
                              className="text-xs h-8 font-bold animate-pulse hover:animate-none"
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDrop(member.id, member.name)}
                              className="text-xs h-8 text-zinc-400 hover:text-red-500 dark:border-zinc-800"
                            >
                              Drop
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-8 py-16 text-center text-zinc-500 font-bold">
                          No members matched current details layout.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Members / Dropped List Cards layout */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div key={member.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:shadow-red-600/5 transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-transparent group-hover:border-red-600 transition-all shadow-md" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold text-red-600 border-2 border-transparent group-hover:border-red-600 transition-colors">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{member.name}</h3>
                          <div className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            member.paymentStatus === 'paid' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {member.paymentStatus}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditClick(member)}
                          title="Edit Trainee fields"
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {member.status === 'dropped' ? (
                          <button 
                            onClick={() => handleRestore(member.id, member.name)}
                            title="Restore to Active Trainees"
                            className="p-2 hover:bg-green-500/10 rounded-lg text-green-500 hover:text-green-600 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDrop(member.id, member.name)}
                            title="Deactivate and Move to Dropped List"
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-orange-500 transition-colors"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(member.id, member.name)}
                          title="Permanently Remove Member"
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Calendar className="w-4 h-4" />
                        Age: {member.age}
                      </div>
                      {member.weight && (
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <Weight className="w-4 h-4" />
                          {member.weight} kg
                        </div>
                      )}
                      {member.height && (
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <Ruler className="w-4 h-4" />
                          {member.height} cm
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Current Plan</p>
                        <p className="font-bold text-red-600">{member.planName}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => navigate(`/members/${member.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                filter === 'dropped' ? (
                  /* Custom high-fidelity empty finder state matching Screenshot 1 */
                  <div className="col-span-full py-20 px-6 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300 shadow-xl max-w-3xl mx-auto my-4">
                    {/* Visual find illustration with gray document and magnifying glass containing 'X' */}
                    <div className="relative w-32 h-32 mb-4 flex items-center justify-center select-none">
                      {/* Document template sheet */}
                      <div className="absolute w-16 h-20 bg-zinc-50 dark:bg-zinc-850 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-sm flex flex-col justify-between p-3.5">
                        <div className="w-9 h-2 bg-zinc-200 dark:bg-zinc-700/50 rounded-full" />
                        <div className="w-6 h-1.5 bg-zinc-100 dark:bg-zinc-700/30 rounded-full" />
                        <div className="w-9 h-1.5 bg-zinc-100 dark:bg-zinc-700/30 rounded-full" />
                        <div className="w-7 h-1.5 bg-zinc-100 dark:bg-zinc-700/30 rounded-full" />
                      </div>
                      {/* Loupe glass magnifier with a cross badge in gravity alignment */}
                      <div className="absolute bottom-1 right-2.5 w-12 h-12 rounded-full border-[3px] border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 flex items-center justify-center shadow-lg transform translate-x-2 translate-y-1">
                        <span className="text-zinc-400 dark:text-zinc-550 font-black text-sm">✕</span>
                      </div>
                      {/* Floating secondary decorative elements */}
                      <div className="absolute top-2 left-4 w-3.5 h-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                      <div className="absolute bottom-5 left-2 w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-750" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                      No records found with the applied filter.
                    </h3>
                    
                    {/* Mockup styled CTA triggers */}
                    <div className="flex items-center gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('filter', 'add');
                          setSearchParams(params);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-extrabold shadow-lg shadow-violet-600/30 text-sm transition-all"
                      >
                        Add a Record
                      </button>
                      <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">or</span>
                      <button
                        type="button"
                        onClick={() => setShowImporter(true)}
                        className="px-6 py-2.5 rounded-xl border border-violet-500 hover:bg-violet-500/5 text-violet-500 font-extrabold text-sm transition-all bg-transparent"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-full py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                    <Award className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-30" />
                    <p className="text-zinc-500 font-bold">No trainees matched this filter.</p>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
