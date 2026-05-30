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
  Edit2, 
  Trash2, 
  Check,
  X,
  Layers,
  IndianRupee,
  ArrowLeft
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Plans() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMonths: '',
    features: '',
  });

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'plans'), where('gymId', '==', profile.gymId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const data = {
        name: formData.name,
        price: Number(formData.price),
        durationMonths: Number(formData.durationMonths),
        features: formData.features.split(',').map(f => f.trim()),
        gymId: profile.gymId,
        updatedAt: serverTimestamp(),
      };

      if (editingPlan) {
        await updateDoc(doc(db, 'plans', editingPlan.id), data);
        toast.success('Plan updated successfully');
      } else {
        await addDoc(collection(db, 'plans'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.success('Plan created successfully');
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      setFormData({ name: '', price: '', durationMonths: '', features: '' });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteDoc(doc(db, 'plans', id));
        toast.success('Plan deleted');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Membership Plans</h1>
          <p className="text-zinc-500 mt-1">Create and manage subscription packages.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Create Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 flex flex-col hover:shadow-2xl hover:shadow-red-600/10 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-red-600/10 p-3 rounded-2xl text-red-600">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    setEditingPlan(plan);
                    setFormData({
                      name: plan.name,
                      price: plan.price.toString(),
                      durationMonths: plan.durationMonths.toString(),
                      features: plan.features.join(', '),
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(plan.id)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-red-600">₹{plan.price}</span>
              <span className="text-zinc-500 font-medium">/ {plan.durationMonths} months</span>
            </div>

            <div className="space-y-4 flex-1 mb-8">
              {plan.features.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-medium">
                  <div className="bg-green-500/10 p-1 rounded-full text-green-500">
                    <Check className="w-3 h-3" />
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full rounded-2xl">Select Plan</Button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPlan(null);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Plan Name"
                placeholder="e.g. Premium Yearly"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input
                label="Price (₹)"
                type="number"
                placeholder="9999"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                required
              />
              <Input
                label="Duration (Months)"
                type="number"
                placeholder="12"
                value={formData.durationMonths}
                onChange={e => setFormData({...formData, durationMonths: e.target.value})}
                required
              />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Features (comma separated)</label>
                <textarea
                  value={formData.features}
                  onChange={e => setFormData({...formData, features: e.target.value})}
                  placeholder="Personal Trainer, Steam Bath, Diet Plan"
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[100px]"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPlan(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingPlan ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
