import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { db } from '../lib/firebase';
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
  ArrowLeft
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
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    planName: 'Monthly',
    paymentStatus: 'paid',
  });

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const data = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        gymId: profile.gymId,
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
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        age: '',
        weight: '',
        height: '',
        planName: 'Monthly',
        paymentStatus: 'paid',
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteDoc(doc(db, 'members', id));
        toast.success('Member deleted');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

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
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-zinc-500 mt-1">Manage your gym community and memberships.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Add Member
        </Button>
      </div>

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
        <Button variant="outline" className="sm:w-auto">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:shadow-red-600/5 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold text-red-600 border-2 border-transparent group-hover:border-red-600 transition-colors">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
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
                    onClick={() => {
                      setEditingMember(member);
                      setFormData({
                        name: member.name,
                        phone: member.phone,
                        email: member.email || '',
                        age: member.age.toString(),
                        weight: member.weight.toString(),
                        height: member.height.toString(),
                        planName: member.planName,
                        paymentStatus: member.paymentStatus,
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(member.id)}
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
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Weight className="w-4 h-4" />
                  {member.weight} kg
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Ruler className="w-4 h-4" />
                  {member.height} cm
                </div>
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
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingMember ? 'Edit Member' : 'Add New Member'}</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingMember(null);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <Input
                  label="Age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={e => setFormData({...formData, age: e.target.value})}
                  required
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  placeholder="75"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  required
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  placeholder="180"
                  value={formData.height}
                  onChange={e => setFormData({...formData, height: e.target.value})}
                  required
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Plan</label>
                  <select
                    value={formData.planName}
                    onChange={e => setFormData({...formData, planName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Payment Status</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={e => setFormData({...formData, paymentStatus: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingMember(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingMember ? 'Update Member' : 'Save Member'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
