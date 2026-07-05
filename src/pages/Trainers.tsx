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
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
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
  ArrowLeft,
  Dumbbell,
  GraduationCap,
  Users,
  Bookmark,
  Contact,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  Info,
  Check,
  Activity,
  Tag
} from 'lucide-react';
import { Button, Input } from '../components/ui/Form';
import { toast } from 'sonner';

// Helper to conditional join classnames
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export function Trainers() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const [trainers, setTrainers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [assignedWorkouts, setAssignedWorkouts] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [workoutTemplates, setWorkoutTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Input forms triggers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. ADD / EDIT Staff form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
  });

  // 2. ASSIGN WORKOUT state
  const [workoutForm, setWorkoutForm] = useState({
    memberId: '',
    routineName: 'Hypertrophy Program',
    notes: 'Focus on full range of motion. Rest 90 seconds between sets.',
    exercises: [
      { name: 'Incline Barbell Chest Press', sets: '4', reps: '10', weight: '60' },
      { name: 'Lat Pulldown Wide Grip', sets: '4', reps: '12', weight: '50' }
    ]
  });
  const [newExercise, setNewExercise] = useState({ name: '', sets: '4', reps: '12', weight: '20' });

  // Form state for Assign Workouts matching screenshot
  const [assignForm, setAssignForm] = useState({
    assignedById: '',
    assignTo: 'member', // 'member' | 'class'
    targetId: '', // memberId or classId
    fromDate: new Date().toISOString().slice(0, 10),
    repeatDays: '1',
    exercises: [
      { day: 'Monday', workout: '', weight: '', sets: '', reps: '', rest: '', description: '' }
    ]
  });

  const handleAddNewRow = () => {
    setAssignForm(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { day: 'Monday', workout: '', weight: '', sets: '', reps: '', rest: '', description: '' }
      ]
    }));
  };

  const handleRemoveRow = (index: number) => {
    setAssignForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index)
    }));
  };

  const handleUpdateRow = (index: number, field: string, value: string) => {
    setAssignForm(prev => {
      const newExercises = [...prev.exercises];
      newExercises[index] = {
        ...newExercises[index],
        [field]: value
      };
      return {
        ...prev,
        exercises: newExercises
      };
    });
  };

  const handleResetForm = () => {
    setAssignForm({
      assignedById: '',
      assignTo: 'member',
      targetId: '',
      fromDate: new Date().toISOString().slice(0, 10),
      repeatDays: '1',
      exercises: [
        { day: 'Monday', workout: '', weight: '', sets: '', reps: '', rest: '', description: '' }
      ]
    });
    toast.info('Workout assignment form cleared.');
  };

  // 3. CLASS FORM state
  const [classForm, setClassForm] = useState({
    name: '',
    time: '07:00 AM',
    days: 'Mon, Wed, Fri',
    trainerName: '',
    room: 'Arena Studio A',
    capacity: '15'
  });

  // 4. BULK TEMPLATE state
  const [templateForm, setTemplateForm] = useState({
    title: 'Fat Loss Circuit HIIT',
    description: 'High intensity aerobic circuit consisting of kettlebells and box jumps.',
    level: 'Intermediate',
    durationWeeks: '4'
  });

  // 5. TRAINEE PROGRESS NOTE state
  const [noteForm, setNoteForm] = useState({
    memberId: '',
    status: 'Stable',
    content: ''
  });
  const [traineeNotes, setTraineeNotes] = useState<any[]>([
    { id: 'n1', memberName: 'Arjun Singh', trainerName: 'Coach Priya', status: 'Excellent', content: 'Cardio endurance shows a strong 15% increase over last weeks checks.', date: '2026-06-03' },
    { id: 'n2', memberName: 'Meera Patel', trainerName: 'Coach Priya', status: 'Stable', content: 'Posture form during back squats corrected. Recommended focus on core stabilizer metrics.', date: '2026-06-01' }
  ]);

  // Initial stream fetching queries (real time snapshots)
  useEffect(() => {
    if (!profile) return;

    // Stream 1: Trainers list
    const q1 = query(collection(db, 'trainers'), where('gymId', '==', profile.gymId));
    const unsub1 = onSnapshot(q1, (snap) => {
      setTrainers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Stream 2: Members list
    const q2 = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
    const unsub2 = onSnapshot(q2, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Stream 3: Assigned Workouts
    const q3 = query(collection(db, 'assigned_workouts'), where('gymId', '==', profile.gymId));
    const unsub3 = onSnapshot(q3, (snap) => {
      setAssignedWorkouts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Stream 4: Classes
    const q4 = query(collection(db, 'classes'), where('gymId', '==', profile.gymId));
    const unsub4 = onSnapshot(q4, (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Stream 5: Workout templates catalog
    const q5 = query(collection(db, 'workout_templates'), where('gymId', '==', profile.gymId));
    const unsub5 = onSnapshot(q5, (snap) => {
      setWorkoutTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, [profile]);

  // Handle staff addition/upgrades
  const handleTrainerSubmit = async (e: React.FormEvent) => {
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

  const handleTrainerDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteDoc(doc(db, 'trainers', id));
        toast.success('Trainer deleted');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  // Workout assignment operations
  const addExerciseToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExercise.name.trim()) return;
    setWorkoutForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...newExercise }]
    }));
    setNewExercise({ name: '', sets: '4', reps: '12', weight: '20' });
    toast.success("Exercise appended to workout draft!");
  };

  const removeExerciseFromDraft = (index: number) => {
    setWorkoutForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index)
    }));
  };

  const handleAssignWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!workoutForm.memberId) {
      toast.error("Please choose a target member trainee.");
      return;
    }
    if (workoutForm.exercises.length === 0) {
      toast.error("Please add at least one physical exercise set.");
      return;
    }

    const targetMember = members.find(m => m.id === workoutForm.memberId);
    try {
      await addDoc(collection(db, 'assigned_workouts'), {
        memberId: workoutForm.memberId,
        memberName: targetMember ? targetMember.name : 'Gym Trainee',
        routineName: workoutForm.routineName,
        notes: workoutForm.notes,
        exercises: workoutForm.exercises,
        assignedBy: profile.displayName || 'Head Coach',
        gymId: profile.gymId,
        createdAt: serverTimestamp()
      });
      toast.success(`Workout assigned to ${targetMember ? targetMember.name : 'Trainee'} successfully!`);
      // Reset form
      setWorkoutForm({
        memberId: '',
        routineName: 'Hypertrophy Program',
        notes: 'Focus on full range of motion.',
        exercises: []
      });
    } catch (err: any) {
      toast.error("Could not assign workout: " + err.message);
    }
  };

  const handleNewAssignWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!assignForm.assignedById) {
      toast.error("Please select who Assigned By.");
      return;
    }
    if (!assignForm.targetId) {
      toast.error("Please pick a target member or group class.");
      return;
    }
    if (assignForm.exercises.length === 0) {
      toast.error("Please formulate at least one row in the workouts schedule.");
      return;
    }

    // Verify all rows
    for (let i = 0; i < assignForm.exercises.length; i++) {
      const ex = assignForm.exercises[i];
      if (!ex.workout.trim()) {
        toast.error(`Row ${i + 1} is missing a workout name.`);
        return;
      }
      if (!ex.sets.trim()) {
        toast.error(`Row ${i + 1} is missing the number of sets.`);
        return;
      }
      if (!ex.reps.trim()) {
        toast.error(`Row ${i + 1} is missing reps.`);
        return;
      }
      if (!ex.rest.trim()) {
        toast.error(`Row ${i + 1} is missing rest minutes.`);
        return;
      }
      if (!ex.description.trim()) {
        toast.error(`Row ${i + 1} is missing description instructions.`);
        return;
      }
    }

    let targetName = 'Academy Trainee';
    if (assignForm.assignTo === 'member') {
      const foundM = members.find(m => m.id === assignForm.targetId);
      if (foundM) targetName = foundM.name;
    } else {
      const foundC = classes.find(c => c.id === assignForm.targetId);
      if (foundC) targetName = foundC.name;
    }

    try {
      await addDoc(collection(db, 'assigned_workouts'), {
        memberId: assignForm.assignTo === 'member' ? assignForm.targetId : '',
        classId: assignForm.assignTo === 'class' ? assignForm.targetId : '',
        memberName: targetName,
        routineName: `${targetName} Split`,
        notes: `Program from ${assignForm.fromDate}. Repeat cycle is ${assignForm.repeatDays} day(s).`,
        exercises: assignForm.exercises.map(ex => ({
          name: ex.workout,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || '0',
          day: ex.day,
          rest: ex.rest,
          description: ex.description
        })),
        assignedBy: assignForm.assignedById,
        assignToType: assignForm.assignTo,
        fromDate: assignForm.fromDate,
        repeatDaysCount: parseInt(assignForm.repeatDays) || 1,
        gymId: profile.gymId,
        createdAt: serverTimestamp()
      });

      toast.success(`Workout successfully assigned to ${targetName}!`);
      // Reset form
      setAssignForm({
        assignedById: '',
        assignTo: 'member',
        targetId: '',
        fromDate: new Date().toISOString().slice(0, 10),
        repeatDays: '1',
        exercises: [
          { day: 'Monday', workout: '', weight: '', sets: '', reps: '', rest: '', description: '' }
        ]
      });
    } catch (error: any) {
      handleFirestoreError(error, 'write', 'assigned_workouts');
    }
  };

  const handleDeleteAssignment = async (id: string, memberName: string) => {
    if (window.confirm(`Revoke assigned workout program for ${memberName}?`)) {
      try {
        await deleteDoc(doc(db, 'assigned_workouts', id));
        toast.success(`Active workout program for ${memberName} was deleted.`);
      } catch (err: any) {
        toast.error("Delete failed: " + err.message);
      }
    }
  };

  // Group fitness class operations
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!classForm.name.trim()) {
      toast.error("Please enter a valid class title.");
      return;
    }

    try {
      await addDoc(collection(db, 'classes'), {
        name: classForm.name,
        time: classForm.time,
        days: classForm.days,
        trainerName: classForm.trainerName || 'General Staff',
        room: classForm.room,
        capacity: Number(classForm.capacity || 15),
        gymId: profile.gymId,
        createdAt: serverTimestamp()
      });
      toast.success("Fitness class scheduled and published!");
      setClassForm({
        name: '',
        time: '07:00 AM',
        days: 'Mon, Wed, Fri',
        trainerName: '',
        room: 'Arena Studio A',
        capacity: '15'
      });
    } catch (err: any) {
      toast.error("Class execution error: " + err.message);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm("Permanently cancel this scheduled group fitness class?")) {
      try {
        await deleteDoc(doc(db, 'classes', id));
        toast.success("Group fitness class canceled.");
      } catch (e: any) {
        toast.error("Cancellation error: " + e.message);
      }
    }
  };

  // Global Workout template handlers
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, 'workout_templates'), {
        ...templateForm,
        gymId: profile.gymId,
        createdAt: serverTimestamp()
      });
      toast.success("Custom fitness routine template added to catalog!");
      setTemplateForm({ title: '', description: '', level: 'Intermediate', durationWeeks: '4' });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm("Delete this routine template?")) {
      try {
        await deleteDoc(doc(db, 'workout_templates', id));
        toast.success("Routine template removed.");
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  // Trainee Notes progress logging
  const handleAddProgressNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.memberId) {
      toast.error("Please pick a target member.");
      return;
    }
    if (!noteForm.content.trim()) {
      toast.error("Please add note description details.");
      return;
    }

    const trainee = members.find(m => m.id === noteForm.memberId);
    const newNote = {
      id: 'usr_' + Date.now(),
      memberName: trainee ? trainee.name : 'Unknown Trainee',
      trainerName: profile?.displayName || 'Head Coach',
      status: noteForm.status,
      content: noteForm.content,
      date: new Date().toISOString().slice(0, 10)
    };
    setTraineeNotes(prev => [newNote, ...prev]);
    setNoteForm({ memberId: '', status: 'Stable', content: '' });
    toast.success("Trainee progress checklist note successfully logged!");
  };

  const handleDeleteProgressNote = (id: string) => {
    setTraineeNotes(prev => prev.filter(n => n.id !== id));
    toast.info("Trainee progress note deleted.");
  };

  // Header and layout dynamic metadata
  const getHeaderInfo = () => {
    switch (filter) {
      case 'assign-workouts':
        return {
          title: "Assign Workouts",
          description: "Design custom physical exercise splits and assign them directly to registered members."
        };
      case 'my-classes':
        return {
          title: "My Classes Schedule",
          description: "Plan collective gym sessions, timings, days, and room allocations."
        };
      case 'my-trainees':
        return {
          title: "My Trainees Directory",
          description: "Track progress notes, health metrics states, and attendance logs for your student roster."
        };
      case 'assigned-trainees':
        return {
          title: "Assigned To Trainees",
          description: "Review comprehensive list of workout routines currently assigned to active students."
        };
      case 'assigned-to-class':
        return {
          title: "Class Instructors Allocations",
          description: "Inspect trainer distribution mapped across scheduled active group workouts classrooms."
        };
      case 'all-workouts':
        return {
          title: "All Workouts Library",
          description: "Database directory of fitness workout blueprints and repeatable trainee templates."
        };
      default:
        return {
          title: "Staff Trainers Directory",
          description: "Manage professional trainers, credentials, credentials mapping and specialized tracks."
        };
    }
  };

  const headerInfo = getHeaderInfo();

  // Search logic for trainers staff grid
  const filteredTrainers = trainers.filter(t => 
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Navigation Headers */}
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
        {filter && (
          <>
            <span className="text-zinc-800 dark:text-zinc-700">/</span>
            <button 
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete('filter');
                setSearchParams(params);
              }}
              className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
            >
              Back to Trainers
            </button>
          </>
        )}
      </div>

      {/* Visual Hub Card */}
      <div className="bg-gradient-to-r from-red-650 to-red-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-red-600/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10">
          <Dumbbell className="w-80 h-80" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-red-200">ACADEMY OPERATIONS DESK</p>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mt-1">{headerInfo.title}</h1>
        <p className="text-zinc-100 text-sm mt-1 max-w-xl font-medium">{headerInfo.description}</p>
      </div>

      {/* -------------------- VIEW 1: ASSIGN WORKOUTS -------------------- */}
      {filter === 'assign-workouts' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8 max-w-6xl mx-auto">
          <form onSubmit={handleNewAssignWorkout} className="space-y-8">
            {/* Top Config Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/50 dark:bg-zinc-950/20 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-850">
              {/* Assigned By */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block ml-1">
                  Assigned By <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignForm.assignedById}
                  onChange={e => setAssignForm({ ...assignForm, assignedById: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 font-bold text-sm text-zinc-800 dark:text-zinc-100 outline-none transition-all"
                  required
                >
                  <option value="">-Select-</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                  {profile?.displayName && (
                    <option value={profile.displayName}>{profile.displayName}</option>
                  )}
                </select>
              </div>

              {/* Assign To (Radios and Dropdown) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block ml-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-6 py-2.5">
                  <label className="flex items-center gap-2 font-bold text-sm cursor-pointer text-zinc-800 dark:text-zinc-200">
                    <input 
                      type="radio" 
                      name="assignTo" 
                      value="member" 
                      checked={assignForm.assignTo === 'member'} 
                      onChange={() => setAssignForm({ ...assignForm, assignTo: 'member', targetId: '' })}
                      className="w-4 h-4 text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-800"
                    />
                    Member
                  </label>
                  <label className="flex items-center gap-2 font-bold text-sm cursor-pointer text-zinc-800 dark:text-zinc-200">
                    <input 
                      type="radio" 
                      name="assignTo" 
                      value="class" 
                      checked={assignForm.assignTo === 'class'} 
                      onChange={() => setAssignForm({ ...assignForm, assignTo: 'class', targetId: '' })}
                      className="w-4 h-4 text-violet-600 focus:ring-violet-500 border-zinc-300 dark:border-zinc-800"
                    />
                    Class
                  </label>
                </div>
                
                <div className="mt-1">
                  {assignForm.assignTo === 'member' ? (
                    <select
                      value={assignForm.targetId}
                      onChange={e => setAssignForm({ ...assignForm, targetId: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 font-bold text-sm text-zinc-800 dark:text-zinc-100 outline-none transition-all"
                      required
                    >
                      <option value="">-Select-</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name} {m.phone ? `(${m.phone})` : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={assignForm.targetId}
                      onChange={e => setAssignForm({ ...assignForm, targetId: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 font-bold text-sm text-zinc-800 dark:text-zinc-100 outline-none transition-all"
                      required
                    >
                      <option value="">-Select-</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* From Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block ml-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date"
                  value={assignForm.fromDate}
                  onChange={e => setAssignForm({ ...assignForm, fromDate: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-violet-600 focus:outline-none text-sm outline-none transition-all"
                  required
                />
              </div>

              {/* No Of Days Repeat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 block ml-1">
                  No Of Days Repeat <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  placeholder="#######"
                  min="1"
                  value={assignForm.repeatDays}
                  onChange={e => setAssignForm({ ...assignForm, repeatDays: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-violet-600 focus:outline-none text-sm outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Workouts Table Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-base text-zinc-800 dark:text-zinc-200 tracking-tight">Workouts</span>
                <span className="text-violet-650 font-black text-sm">*</span>
              </div>

              <div className="overflow-x-auto border border-zinc-250 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-950">
                <table className="w-full border-collapse text-left text-xs min-w-[950px]">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-extrabold uppercase tracking-widest text-[10px]">
                      <th className="py-3 px-3 w-[150px]">Days *</th>
                      <th className="py-3 px-3 w-[180px]">Workout *</th>
                      <th className="py-3 px-3 w-[110px]">Weight (Kg)</th>
                      <th className="py-3 px-3 w-[90px]">Sets *</th>
                      <th className="py-3 px-3 w-[90px]">Reps *</th>
                      <th className="py-3 px-3 w-[110px]">Rest (min) *</th>
                      <th className="py-3 px-3">Description *</th>
                      <th className="py-3 px-3 w-[50px] text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {assignForm.exercises.map((ex, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/10">
                        {/* Days */}
                        <td className="py-3 px-3">
                          <select
                            value={ex.day}
                            onChange={e => handleUpdateRow(idx, 'day', e.target.value)}
                            className="w-full px-2 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-violet-600 outline-none font-bold text-zinc-800 dark:text-zinc-100"
                            required
                          >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </td>

                        {/* Workout */}
                        <td className="py-3 px-3">
                          <input 
                            type="text"
                            placeholder="e.g. Chest Press"
                            value={ex.workout}
                            onChange={e => handleUpdateRow(idx, 'workout', e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-violet-600 outline-none text-zinc-800 dark:text-zinc-100 font-bold"
                            required
                          />
                        </td>

                        {/* Weight */}
                        <td className="py-3 px-3">
                          <input 
                            type="text"
                            placeholder="60"
                            value={ex.weight}
                            onChange={e => handleUpdateRow(idx, 'weight', e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-violet-600 outline-none text-zinc-800 dark:text-zinc-100 font-semibold"
                          />
                        </td>

                        {/* Sets */}
                        <td className="py-3 px-3">
                          <input 
                            type="text"
                            placeholder="4"
                            value={ex.sets}
                            onChange={e => handleUpdateRow(idx, 'sets', e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-violet-600 outline-none text-zinc-800 dark:text-zinc-100 font-bold text-center"
                            required
                          />
                        </td>

                        {/* Reps */}
                        <td className="py-3 px-3">
                          <input 
                            type="text"
                            placeholder="12"
                            value={ex.reps}
                            onChange={e => handleUpdateRow(idx, 'reps', e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-violet-600 outline-none text-zinc-800 dark:text-zinc-100 font-bold text-center"
                            required
                          />
                        </td>

                        {/* Rest */}
                        <td className="py-3 px-3">
                          <input 
                            type="text"
                            placeholder="1"
                            value={ex.rest}
                            onChange={e => handleUpdateRow(idx, 'rest', e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-violet-600 outline-none text-zinc-800 dark:text-zinc-100 font-bold text-center"
                            required
                          />
                        </td>

                        {/* Description */}
                        <td className="py-3 px-3">
                          <input 
                            type="text"
                            placeholder="Slow repetitions"
                            value={ex.description}
                            onChange={e => handleUpdateRow(idx, 'description', e.target.value)}
                            className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:ring-1 focus:ring-violet-600 outline-none text-zinc-800 dark:text-zinc-100 font-medium"
                            required
                          />
                        </td>

                        {/* Remove Action */}
                        <td className="py-3 px-3 text-center">
                          {assignForm.exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors"
                              title="Delete exercise item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add New Button aligned centered to mirror screenshot */}
              <div className="flex justify-center border-b border-zinc-100 dark:border-zinc-850 pb-6">
                <button
                  type="button"
                  onClick={handleAddNewRow}
                  className="flex items-center gap-1.5 text-violet-600 hover:text-violet-700 bg-violet-600/5 hover:bg-violet-600/10 px-4 py-2 rounded-xl text-xs font-black transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>
            </div>

            {/* Bottom Form Actions (Assign & Reset Buttons aligned left) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 active:bg-violet-850 text-white font-extrabold px-8 py-2.5 rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider text-xs"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-850 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-extrabold px-8 py-2.5 rounded-xl cursor-pointer transition-all uppercase tracking-wider text-xs"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* -------------------- VIEW 2: MY CLASSES -------------------- */}
      {filter === 'my-classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Class register form */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="font-bold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">Schedule Group Class</h3>
            
            <form onSubmit={handleCreateClass} className="space-y-4">
              <Input 
                label="Class Title"
                placeholder="e.g. Kettlebell Power Blast"
                value={classForm.name}
                onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Time Slot"
                  placeholder="e.g. 05:00 PM"
                  value={classForm.time}
                  onChange={e => setClassForm({ ...classForm, time: e.target.value })}
                  required
                />
                <Input 
                  label="Max Seats"
                  type="number"
                  placeholder="15"
                  value={classForm.capacity}
                  onChange={e => setClassForm({ ...classForm, capacity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase block ml-1">Days Selector</label>
                <select
                  value={classForm.days}
                  onChange={e => setClassForm({ ...classForm, days: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold text-sm outline-none"
                >
                  <option value="Mon, Wed, Fri">Mon, Wed, Fri</option>
                  <option value="Tue, Thu">Tue, Thu</option>
                  <option value="Sat, Sun">Sat, Sun</option>
                  <option value="Mon to Sat">Mon to Sat</option>
                  <option value="Friday Only">Friday Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase block ml-1">Trainer Instructor</label>
                <select
                  value={classForm.trainerName}
                  onChange={e => setClassForm({ ...classForm, trainerName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold text-sm outline-none"
                >
                  <option value="">Choose instructor...</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.specialization})</option>
                  ))}
                  {trainers.length === 0 && (
                    <option value="Senior Staff">Coach Priya Sharma</option>
                  )}
                </select>
              </div>

              <Input 
                label="Allocated Room / Zone"
                placeholder="Arena Zone B"
                value={classForm.room}
                onChange={e => setClassForm({ ...classForm, room: e.target.value })}
                required
              />

              <div className="pt-2">
                <Button type="submit" className="w-full font-bold">
                  Schedule Class Now
                </Button>
              </div>
            </form>
          </div>

          {/* Classes lists */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">Active Group Fitness Timetable</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map(c => (
                <div key={c.id} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl relative overflow-hidden group">
                  <div className="absolute right-4 top-4">
                    <button 
                      onClick={() => handleDeleteClass(c.id)}
                      className="p-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="px-2 py-0.5 bg-red-600/10 text-red-600 rounded-md text-[9px] font-black uppercase tracking-wider">{c.room}</span>
                  
                  <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100 mt-2">{c.name}</h4>
                  
                  <div className="space-y-1.5 text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-150 dark:border-zinc-850/80">
                    <div className="flex items-center gap-2 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{c.time} ({c.days})</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                      <UserSquare2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>Instructor: {c.trainerName}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 p-2 rounded-xl mt-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">Class Room Limit:</span>
                      <span className="font-mono font-bold text-red-600">{c.capacity} Members</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Class fallbacks (always display dynamic scheduled classes) */}
              {[
                { id: 'p_cls1', name: 'Zumba Cardio Burn', room: 'Arena Studio A', time: '07:00 AM', days: 'Mon, Wed, Fri', trainerName: 'Priya Sharma', capacity: 20 },
                { id: 'p_cls2', name: 'Power Lifting Club', room: 'Heavy Iron Stage', time: '06:00 PM', days: 'Tue, Thu', trainerName: 'Rohan Malhotra', capacity: 15 }
              ].map(c => {
                // Only show if db list has fewer items to prevent overflow
                if (classes.length > 3) return null;
                return (
                  <div key={c.id} className="p-5 border border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 rounded-2xl opacity-80 border-dashed">
                    <span className="px-2 py-0.5 bg-violet-600/10 text-violet-600 rounded-md text-[9px] font-black uppercase tracking-wider">{c.room}</span>
                    <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100 mt-2">{c.name}</h4>
                    <div className="space-y-1.5 text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        <span>{c.time} ({c.days})</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold">
                        <UserSquare2 className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        <span>Instructor: {c.trainerName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 3: MY TRAINEES -------------------- */}
      {filter === 'my-trainees' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Progress note logging */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="font-bold text-lg mb-6 border-b border-zinc-100 dark:border-zinc-850 pb-3">Log Trainee Progress</h3>
            
            <form onSubmit={handleAddProgressNote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block ml-1">Select Active Trainee</label>
                <select
                  value={noteForm.memberId}
                  onChange={e => setNoteForm({ ...noteForm, memberId: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold text-sm outline-none"
                  required
                >
                  <option value="">Select student...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block ml-1">Biometric / Athletic State</label>
                <select
                  value={noteForm.status}
                  onChange={e => setNoteForm({ ...noteForm, status: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-semibold text-sm outline-none"
                >
                  <option value="Excellent">Excellent Progress</option>
                  <option value="Stable">Stable Alignment</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block ml-1">Training details note</label>
                <textarea
                  value={noteForm.content}
                  onChange={e => setNoteForm({ ...noteForm, content: e.target.value })}
                  required
                  placeholder="Record squat execution corrections, cardiorespiratory heart rate metrics, or active updates."
                  className="w-full min-h-[110px] px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-xs font-medium"
                />
              </div>

              <Button type="submit" className="w-full font-bold">
                Publish Progress Note
              </Button>
            </form>
          </div>

          {/* Trainees lists and progress alerts */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">My Assigned Students</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-805 text-zinc-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-4">Student Trainee</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Plan Mapping</th>
                      <th className="p-4">Weight/Height</th>
                      <th className="p-4 pr-6 text-right">Reference Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/60 font-semibold">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="p-4 flex items-center gap-2.5 font-extrabold text-zinc-805 dark:text-zinc-100">
                          <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center font-bold">
                            {m.name.charAt(0)}
                          </div>
                          <span>{m.name}</span>
                        </td>
                        <td className="p-4 text-zinc-505 dark:text-zinc-400 font-mono">{m.phone}</td>
                        <td className="p-4 text-red-600">{m.planName || 'Monthly Base'}</td>
                        <td className="p-4 font-medium text-zinc-500">{m.weight || 70}kg / {m.height || 175}cm</td>
                        <td className="p-4 pr-6 text-right">
                          <button 
                            onClick={() => navigate(`/members/${m.id}`)}
                            className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-600 hover:text-white rounded-lg text-[11px] font-bold transition-all uppercase"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-zinc-505 font-medium italic">
                          No student trainees loaded. Add a member in the Members panel to populate this index list.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note logs dynamic cards */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">Trainee Progress Log Records</h3>
              
              <div className="space-y-4">
                {traineeNotes.map(n => (
                  <div key={n.id} className="p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl relative">
                    <div className="absolute right-4 top-4">
                      <button 
                        onClick={() => handleDeleteProgressNote(n.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{n.memberName}</span>
                      <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded font-black uppercase ml-2",
                        n.status === 'Excellent' ? "bg-green-500/10 text-green-600" : 
                        n.status === 'Stable' ? "bg-blue-500/10 text-blue-600" : "bg-orange-500/10 text-orange-600"
                      )}>
                        {n.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-650 dark:text-zinc-450 mt-2 mb-3 leading-relaxed font-semibold">{n.content}</p>
                    
                    <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-400">
                      <span>Date logged: {n.date}</span>
                      <span>•</span>
                      <span>Assigned Coach: {n.trainerName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 4: ASSIGNED WORKOUTS VIEW -------------------- */}
      {filter === 'assigned-trainees' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">Active Assigned Routines List</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {assignedWorkouts.map(item => (
              <div key={item.id} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                      {item.routineName}
                    </span>
                    <button 
                      onClick={() => handleDeleteAssignment(item.id, item.memberName)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 mt-3">{item.memberName}</h4>
                  <p className="text-xs text-zinc-450 mt-0.5 italic">Assigned by {item.assignedBy || 'Coach Staff'}</p>
                  
                  {item.notes && (
                    <p className="text-xs text-zinc-500 mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl leading-relaxed">
                      {item.notes}
                    </p>
                  )}

                  <div className="space-y-1.5 mt-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Exercises included ({item.exercises?.length || 0}):</p>
                    <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                      {item.exercises?.map((ex: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-850">
                          <span className="font-black truncate max-w-[150px]">{ex.name}</span>
                          <span className="font-mono text-[10px] shrink-0 font-bold">{ex.sets}s×{ex.reps}r • {ex.weight}kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-150 dark:border-zinc-850/80 flex items-center justify-between text-[11px] font-semibold text-zinc-500">
                  <span>Logged Date: {item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString() : 'Today'}</span>
                  <span>Active</span>
                </div>
              </div>
            ))}

            {assignedWorkouts.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-zinc-20s dark:border-zinc-800 rounded-2xl text-zinc-500">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h4 className="font-bold">No routine assignments detected.</h4>
                <p className="text-xs mt-1 text-zinc-400">Navigate to Assign Workouts to compose target member splits.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- VIEW 5: ASSIGNED TO CLASS VIEW (TRAINERS REGISTERED TO CLASSES) -------------------- */}
      {filter === 'assigned-to-class' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">Class Instructors Allocations Grid</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(c => (
              <div key={c.id} className="p-6 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl">
                <span className="px-2.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[10px] font-black uppercase rounded-lg border border-zinc-300 dark:border-zinc-700">{c.room}</span>
                
                <h4 className="font-black text-lg text-zinc-900 dark:text-zinc-100 mt-3">{c.name}</h4>
                <p className="text-xs text-zinc-450 mt-1">Schedule Slot: {c.time} ({c.days})</p>

                <div className="mt-5 p-4 rounded-xl bg-red-600/5 border border-red-500/10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-650 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    <UserSquare2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Assigned Instructor Coach</p>
                    <p className="font-black text-sm text-red-600 mt-0.5">{c.trainerName || 'Coach Priya Sharma'}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Always seed mockup allocations for preview fidelity */}
            {classes.length < 3 && [
              { id: 'sa1', name: 'Zumba Cardio Burn', room: 'Arena Studio A', time: '07:00 AM', days: 'Mon, Wed, Fri', trainerName: 'Priya Sharma' },
              { id: 'sa2', name: 'Power Weightlifting Club', room: 'Heavy Iron Stage', time: '06:00 PM', days: 'Tue, Thu', trainerName: 'Rohan Malhotra' },
              { id: 'sa3', name: 'Yoga Core Alignment', room: 'Zen Pavilion Hall', time: '08:00 AM', days: 'Sat, Sun', trainerName: 'Ananya Sen' }
            ].map(c => (
              <div key={c.id} className="p-6 border border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 rounded-2xl opacity-75 border-dashed">
                <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-650 text-[10px] font-bold rounded">{c.room}</span>
                <h4 className="font-extrabold text-lg text-zinc-900 mt-3">{c.name}</h4>
                <p className="text-xs text-zinc-400 mt-1">Preset Schedule Track: {c.time} ({c.days})</p>
                
                <div className="mt-5 p-4 rounded-xl bg-violet-600/5 border border-violet-500/10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#7c3aed] text-white rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold">Allocated Coach preset</p>
                    <p className="font-black text-sm text-violet-600 mt-0.5">{c.trainerName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- VIEW 6: ALL WORKOUTS CATALOG -------------------- */}
      {filter === 'all-workouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Add workout catalog preset form */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-fit">
            <h3 className="font-bold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">Record Catalog Routine</h3>
            
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <Input 
                label="Routine Title Preset"
                placeholder="Lean Body HIIT Blast"
                value={templateForm.title}
                onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block ml-1">Workout Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Outline metabolic benefits, core muscular load split specifications, etc."
                  className="w-full min-h-[90px] px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block ml-1">Skill Stage</label>
                  <select
                    value={templateForm.level}
                    onChange={e => setTemplateForm({ ...templateForm, level: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-semibold focus:outline-none outline-none"
                  >
                    <option value="Beginner">Beginner Stage</option>
                    <option value="Intermediate">Intermediate Stage</option>
                    <option value="Elite Athlete">Elite Stage</option>
                  </select>
                </div>
                <Input 
                  label="Duration Weeks"
                  type="number"
                  placeholder="4"
                  value={templateForm.durationWeeks}
                  onChange={e => setTemplateForm({ ...templateForm, durationWeeks: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full font-bold">
                Publish Catalog Blueprint
              </Button>
            </form>
          </div>

          {/* Blueprint catalog listing */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-lg mb-6 border-b border-zinc-150 dark:border-zinc-850 pb-3">Pre-Configured Workout Blueprint Presets</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workoutTemplates.map(t => (
                <div key={t.id} className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-2xl relative overflow-hidden group">
                  <div className="absolute right-4 top-4">
                    <button 
                      onClick={() => handleDeleteTemplate(t.id)}
                      className="text-zinc-405 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="px-2.5 py-0.5 bg-violet-600/10 text-violet-600 text-[9px] font-black uppercase rounded-lg border border-violet-500/10">{t.level}</span>
                  
                  <h4 className="font-black text-base text-zinc-900 dark:text-zinc-100 mt-2.5">{t.title}</h4>
                  <p className="text-xs text-zinc-500 mt-1 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-xl p-2.5 font-medium leading-relaxed">{t.description}</p>
                  
                  <div className="mt-3 flex justify-between items-center text-[10px] uppercase font-bold text-zinc-400">
                    <span>Duration schedule:</span>
                    <span className="text-red-650 font-black">{t.durationWeeks} Weeks</span>
                  </div>
                </div>
              ))}

              {/* Seamless preset catalog items for initial preview setup */}
              {[
                { id: 'wp1', title: 'Power Lifting Build Stage', level: 'Intermediate', durationWeeks: 8, description: 'Powerlift sets targeting central nervous systems resistance thresholds. Focuses on squat, bench press, deadlift splits.' },
                { id: 'wp2', title: 'Zumba Core Aerobics', level: 'Beginner', durationWeeks: 4, description: 'Cardio HIIT routines to improve core core resistance power limits while maintaining cardiorespiratory burn metrics.' }
              ].map(t => (
                <div key={t.id} className="p-5 border border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-900/40 rounded-2xl opacity-75 border-dashed">
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[9px] font-bold rounded">{t.level}</span>
                  <h4 className="font-extrabold text-base text-zinc-900 mt-2.5">{t.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed bg-zinc-50 dark:bg-zinc-950/20 p-2.5 rounded-xl">{t.description}</p>
                  <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                    <span>Duration track:</span>
                    <span className="text-violet-600 font-black">{t.durationWeeks} Weeks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- DEFAULT VIEW: TRAINERS MANAGING STAFF DIRECTORY -------------------- */}
      {!filter && (
        <>
          {/* Quick Operations Hub Grid */}
          <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-850 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-zinc-900 dark:text-zinc-100 font-extrabold tracking-tight text-lg">Trainer Module Sub-Features & Operations</h2>
                <p className="text-zinc-500 text-xs font-semibold mt-0.5">Quickly access and launch full interactive workloads of the Staff Coach module.</p>
              </div>
              <span className="px-2 py-1 bg-red-600/10 text-red-600 dark:text-red-400 font-bold uppercase rounded-lg text-[10px] tracking-wide border border-red-500/10">6 active operational tools</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'assign-workouts', title: 'Assign Workouts', desc: 'Design custom exercise splits and assign directly to gym members.', icon: Dumbbell, metric: 'Workout Splits' },
                { id: 'my-classes', title: 'Classes Schedule', desc: 'Manage fitness classroom sessions, day timings, and room capacity.', icon: GraduationCap, metric: 'Room Allocations' },
                { id: 'my-trainees', title: 'My Trainees Directory', desc: 'Track member biometric updates, progress notes, and athletic logs.', icon: Users, metric: 'Progress Tracker' },
                { id: 'assigned-trainees', title: 'Assigned Routines List', desc: 'Review lists of workout routine splits assigned to active trainees.', icon: Bookmark, metric: 'Active Splits' },
                { id: 'assigned-to-class', title: 'Instructor Allocations', desc: 'Map staff coaches distribution across scheduled fitness classes.', icon: Contact, metric: 'Coach Roster' },
                { id: 'all-workouts', title: 'Workouts Preset Library', desc: 'Explore the pre-configured sequence and routine template catalog.', icon: Activity, metric: 'Preset Catalog' }
              ].map(feat => {
                const IconComponent = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('filter', feat.id);
                      setSearchParams(params);
                    }}
                    className="p-5 flex flex-col justify-between text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-600 dark:hover:border-red-600 rounded-2xl group transition-all duration-300 hover:shadow-lg hover:shadow-red-650/5 relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 dark:bg-red-600/10 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300" />
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center shrink-0 mb-4 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">{feat.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{feat.desc}</p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <span>{feat.metric}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-2" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search trainers by name or specialty..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-650"
              />
            </div>
            <Button onClick={() => {
              setEditingTrainer(null);
              setFormData({ name: '', phone: '', email: '', specialization: '' });
              setIsModalOpen(true);
            }} className="sm:w-auto">
              <Plus className="w-5 h-5 mr-1" />
              Add Trainer Coach
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[250px]">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTrainers.map((trainer) => (
                <div key={trainer.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:shadow-red-600/5 transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-red-650/10 flex items-center justify-center text-red-650 shrink-0">
                        <UserSquare2 className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">{trainer.name}</h3>
                        <p className="text-xs font-black text-red-650 uppercase tracking-widest">{trainer.specialization}</p>
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
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleTrainerDelete(trainer.id)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 font-semibold text-zinc-500 dark:text-zinc-400 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-red-650" />
                      <span>{trainer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-red-650 animate-pulse" />
                      <span className="truncate max-w-[200px]">{trainer.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-red-650" />
                      <span>Expert Trainer in {trainer.specialization}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/85">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('filter', 'my-classes');
                        setSearchParams(params);
                      }}
                      className="w-full text-xs"
                    >
                      View Scheduled Classes
                    </Button>
                  </div>
                </div>
              ))}

              {filteredTrainers.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <UserSquare2 className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-20" />
                  <p className="text-zinc-550 font-bold">No registered trainer coaches match this search query.</p>
                </div>
              )}
            </div>
          )}

          {/* Staff Manager Modal popup */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200 text-left">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingTrainer ? 'Update Coach Specs' : 'Register New Coach'}</h2>
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
                
                <form onSubmit={handleTrainerSubmit} className="p-6 space-y-4">
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
                    placeholder="Physical Trainer, Kettlebell, Zumba"
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
                      {editingTrainer ? 'Update Specs' : 'Save Coach'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
