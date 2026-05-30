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
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Megaphone, 
  Trash2, 
  Clock,
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

export function Announcements() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info', // info, warning, success
  });

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'announcements'), 
      where('gymId', '==', profile.gymId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        gymId: profile.gymId,
        authorName: profile.displayName,
        createdAt: serverTimestamp(),
      });
      toast.success('Announcement posted');
      setIsModalOpen(false);
      setFormData({ title: '', content: '', type: 'info' });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await deleteDoc(doc(db, 'announcements', id));
        toast.success('Announcement deleted');
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
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-zinc-500 mt-1">Broadcast news and updates to your gym community.</p>
        </div>
        {profile?.role === 'admin' && (
          <Button onClick={() => setIsModalOpen(true)} className="sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${
              ann.type === 'warning' ? 'bg-orange-500' : 
              ann.type === 'success' ? 'bg-green-500' : 'bg-red-600'
            }`} />
            
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  ann.type === 'warning' ? 'bg-orange-500/10 text-orange-500' : 
                  ann.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-600/10 text-red-600'
                }`}>
                  {ann.type === 'warning' ? <AlertCircle className="w-6 h-6" /> : 
                   ann.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">{ann.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      {ann.createdAt?.toDate().toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                      <Bell className="w-3.5 h-3.5" />
                      Posted by {ann.authorName}
                    </div>
                  </div>
                </div>
              </div>
              {profile?.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-xl transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {announcements.length === 0 && !loading && (
          <div className="py-20 text-center bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-zinc-700 opacity-20" />
            <p className="text-zinc-500 font-medium">No announcements yet. Keep your members informed!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">Post Announcement</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Title"
                placeholder="e.g. Holiday Schedule Update"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="info">Information (Red)</option>
                  <option value="warning">Warning (Orange)</option>
                  <option value="success">Success (Green)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider ml-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your announcement here..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 min-h-[150px]"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Post Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
