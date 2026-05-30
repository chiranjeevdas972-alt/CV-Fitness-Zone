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
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Award,
  X,
  UserSquare2,
  ArrowLeft
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Trainers() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
  });

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'trainers'), where('gymId', '==', profile.gymId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTrainers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        gymId: profile.gymId,
        updatedAt: serverTimestamp(),
      };

      if (editingTrainer) {
        await updateDoc(doc(db, 'trainers', editingTrainer.id), data);
        toast.success('Trainer updated successfully');
      } else {
        await addDoc(collection(db, 'trainers'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.success('Trainer added successfully');
      }
      setIsModalOpen(false);
      setEditingTrainer(null);
      setFormData({ name: '', phone: '', email: '', specialization: '' });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteDoc(doc(db, 'trainers', id));
        toast.success('Trainer deleted');
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
          <h1 className="text-3xl font-bold tracking-tight">Trainers</h1>
          <p className="text-zinc-500 mt-1">Manage your professional training staff.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Add Trainer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <div key={trainer.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:shadow-red-600/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600">
                  <UserSquare2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{trainer.name}</h3>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest">{trainer.specialization}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    setEditingTrainer(trainer);
                    setFormData({
                      name: trainer.name,
                      phone: trainer.phone,
                      email: trainer.email,
                      specialization: trainer.specialization,
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(trainer.id)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Phone className="w-4 h-4 text-red-600" />
                {trainer.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Mail className="w-4 h-4 text-red-600" />
                {trainer.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <Award className="w-4 h-4 text-red-600" />
                Expert in {trainer.specialization}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <Button variant="outline" size="sm" className="w-full">View Schedule</Button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTrainer(null);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Full Name"
                placeholder="Trainer Name"
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
                placeholder="trainer@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
              <Input
                label="Specialization"
                placeholder="Yoga, Bodybuilding, etc."
                value={formData.specialization}
                onChange={e => setFormData({...formData, specialization: e.target.value})}
                required
              />

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTrainer(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTrainer ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
