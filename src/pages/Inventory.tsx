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
  Package,
  AlertTriangle,
  CheckCircle2,
  X,
  Wrench,
  ArrowLeft
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Inventory() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Equipment',
    quantity: '',
    status: 'Operational',
    lastMaintenance: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'inventory'), where('gymId', '==', profile.gymId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        quantity: Number(formData.quantity),
        gymId: profile.gymId,
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), data);
        toast.success('Inventory item updated');
      } else {
        await addDoc(collection(db, 'inventory'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.success('Item added to inventory');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ 
        name: '', 
        category: 'Equipment', 
        quantity: '', 
        status: 'Operational',
        lastMaintenance: new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      try {
        await deleteDoc(doc(db, 'inventory', id));
        toast.success('Item removed');
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-zinc-500 mt-1">Manage gym equipment and supplies.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:shadow-red-600/5 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-red-600 transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.category}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    setEditingItem(item);
                    setFormData({
                      name: item.name,
                      category: item.category,
                      quantity: item.quantity.toString(),
                      status: item.status,
                      lastMaintenance: item.lastMaintenance,
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Quantity</p>
                <p className="text-xl font-black">{item.quantity}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Status</p>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${
                  item.status === 'Operational' ? 'text-green-500' : 'text-orange-500'
                }`}>
                  {item.status === 'Operational' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {item.status}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <Wrench className="w-3 h-3" />
                Last Maint: {item.lastMaintenance}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Package className="w-16 h-16 mx-auto mb-4 text-zinc-700 opacity-20" />
            <p className="text-zinc-500 font-medium">No inventory items found. Start by adding equipment or supplies.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Item Name"
                placeholder="e.g. Treadmill, Dumbbells Set"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Input
                  label="Quantity"
                  type="number"
                  placeholder="10"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance Required">Maintenance Required</option>
                  <option value="Out of Order">Out of Order</option>
                </select>
              </div>
              <Input
                label="Last Maintenance Date"
                type="date"
                value={formData.lastMaintenance}
                onChange={e => setFormData({...formData, lastMaintenance: e.target.value})}
                required
              />

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingItem ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
