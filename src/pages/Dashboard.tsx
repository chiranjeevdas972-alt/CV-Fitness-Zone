import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocs,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Plus,
  Megaphone,
  Package,
  CalendarCheck,
  ArrowLeft,
  GraduationCap,
  Layers,
  Settings,
  ChevronRight,
  BarChart3,
  UserSquare2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Form';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [revenuePeriod, setRevenuePeriod] = useState(7);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    dailyCheckins: 0
  });
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;

    // Fetch stats
    const membersQuery = query(collection(db, 'members'), where('gymId', '==', profile.gymId));
    const unsubscribeMembers = onSnapshot(membersQuery, 
      (snapshot) => {
        const membersList = snapshot.docs.map(doc => doc.data());
        const active = membersList.filter(m => m.paymentStatus === 'paid').length;
        setStats(prev => ({
          ...prev,
          totalMembers: snapshot.size,
          activeMembers: active
        }));
      },
      (error) => handleFirestoreError(error, 'list', 'members')
    );

    const paymentsQuery = query(collection(db, 'payments'), where('gymId', '==', profile.gymId));
    const unsubscribePayments = onSnapshot(paymentsQuery, 
      (snapshot) => {
        const paymentsList = snapshot.docs.map(doc => doc.data());
        const total = paymentsList.reduce((sum, p) => sum + (p.amount || 0), 0);
        setStats(prev => ({ ...prev, monthlyRevenue: total }));
        setAllPayments(paymentsList);
      },
      (error) => handleFirestoreError(error, 'list', 'payments')
    );

    const attendanceQuery = query(
      collection(db, 'attendance'), 
      where('gymId', '==', profile.gymId),
      where('date', '==', new Date().toISOString().split('T')[0])
    );
    const unsubscribeAttendance = onSnapshot(attendanceQuery, 
      (snapshot) => {
        setStats(prev => ({ ...prev, dailyCheckins: snapshot.size }));
      },
      (error) => handleFirestoreError(error, 'list', 'attendance')
    );

    // Recent members
    const recentQuery = query(
      collection(db, 'members'), 
      where('gymId', '==', profile.gymId)
    );
    const unsubscribeRecent = onSnapshot(recentQuery, 
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort: descending by createdAt
        loaded.sort((a: any, b: any) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setRecentMembers(loaded.slice(0, 5));
      },
      (error) => handleFirestoreError(error, 'list', 'members')
    );

    // Latest Announcements
    const announcementsQuery = query(
      collection(db, 'announcements'),
      where('gymId', '==', profile.gymId)
    );
    const unsubscribeAnnouncements = onSnapshot(announcementsQuery, 
      (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort: descending by createdAt
        loaded.sort((a: any, b: any) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setLatestAnnouncements(loaded.slice(0, 3));
      },
      (error) => handleFirestoreError(error, 'list', 'announcements')
    );

    return () => {
      unsubscribeMembers();
      unsubscribePayments();
      unsubscribeAttendance();
      unsubscribeRecent();
      unsubscribeAnnouncements();
    };
  }, [profile]);

  const revenueData = React.useMemo(() => {
    const grouped = allPayments.reduce((acc: any, p: any) => {
      const date = p.date;
      acc[date] = (acc[date] || 0) + (p.amount || 0);
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => a.date.localeCompare(b.date)).slice(-revenuePeriod);
  }, [allPayments, revenuePeriod]);

  const statCards = [
    { name: 'Total Members', value: stats.totalMembers, icon: Users, color: 'bg-blue-500', trend: '+12%', path: '/members' },
    { name: 'Active Members', value: stats.activeMembers, icon: UserCheck, color: 'bg-green-500', trend: '+5%', path: '/members' },
    { name: 'Monthly Revenue', value: `₹${stats.monthlyRevenue}`, icon: CreditCard, color: 'bg-red-500', trend: '+18%', path: '/payments' },
    { name: 'Daily Check-ins', value: stats.dailyCheckins, icon: Clock, color: 'bg-orange-500', trend: '+24%', path: '/attendance' },
  ];

  const quickActions = [
    { name: 'Add Member', icon: Plus, path: '/members?filter=add', color: 'bg-red-600' },
    { name: 'Mark Attendance', icon: CalendarCheck, path: '/attendance', color: 'bg-zinc-800' },
    { name: 'Record Payment', icon: CreditCard, path: '/payments?filter=form', color: 'bg-zinc-800' },
    { name: 'Inventory', icon: Package, path: '/inventory', color: 'bg-zinc-800' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-600 transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight italic uppercase">Welcome back, {profile?.displayName}!</h1>
          <p className="text-zinc-500 mt-1">Here's what's happening at C Vidya Fitness Zone today.</p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <button
              key={action.name}
              onClick={() => navigate(action.path)}
              className={cn(
                "p-3 rounded-xl text-white shadow-lg transition-all hover:scale-105 active:scale-95",
                action.color
              )}
              title={action.name}
            >
              <action.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <button
            key={stat.name}
            onClick={() => navigate(stat.path)}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-red-600 dark:hover:border-red-600 transition-all group cursor-pointer text-left w-full h-full block focus:ring-2 focus:ring-red-600"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                stat.color,
                "p-3 rounded-xl text-white shadow-lg transition-transform group-hover:scale-110"
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{stat.name}</p>
            <h3 className="text-3xl font-black mt-1 tracking-tighter">{stat.value}</h3>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase italic">Revenue Overview</h3>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(Number(e.target.value))}
              className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-red-600 outline-none cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
                  dy={10}
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
                    borderRadius: '16px',
                    color: '#fff',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#dc2626" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="bg-zinc-950 rounded-3xl p-8 border border-zinc-800 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Megaphone className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase italic tracking-tight">Announcements</h3>
              <Link to="/announcements" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">View All</Link>
            </div>
            <div className="space-y-6 flex-1">
              {latestAnnouncements.map((ann) => (
                <div key={ann.id} className="space-y-2 group/item cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      ann.type === 'warning' ? 'bg-orange-500' : 
                      ann.type === 'success' ? 'bg-green-500' : 'bg-red-600'
                    )} />
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{ann.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <h4 className="font-bold text-sm group-hover/item:text-red-500 transition-colors">{ann.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{ann.content}</p>
                </div>
              ))}
              {latestAnnouncements.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-600">
                  <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No updates yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Members Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-black uppercase italic">New Joinings</h3>
          <Link to="/members" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400">Manage Members</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Member</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Plan</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Status</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Joined</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentMembers.map((member) => (
                <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-black group-hover:bg-red-600 group-hover:text-white transition-all">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{member.name}</p>
                        <p className="text-[10px] text-zinc-500 font-bold">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-xs font-black uppercase tracking-widest text-red-600">{member.planName || 'Trial'}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      member.paymentStatus === 'paid' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {member.paymentStatus}
                    </div>
                  </td>
                  <td className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {member.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] font-black uppercase tracking-widest"
                      onClick={() => navigate(`/members/${member.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Operations Hub Grid */}
      <div className="bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-zinc-900 dark:text-zinc-100 font-extrabold tracking-tight text-lg">Admin Module Sub-Features & Operations</h2>
            <p className="text-zinc-500 text-xs font-semibold mt-0.5">Quickly access and launch full interactive workloads of the Gym Administration panel.</p>
          </div>
          <span className="px-2 py-1 bg-red-600/10 text-red-600 dark:text-red-400 font-bold uppercase rounded-lg text-[10px] tracking-wide border border-red-500/10">6 active operational tools</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'trainers', title: 'Staffs & Trainers', desc: 'Manage the complete roster of gym staff, personal coaches, and trainer profiles.', icon: UserSquare2, metric: 'Staff Directory', path: '/trainers' },
            { id: 'plans', title: 'Memberships Management', desc: 'Design, price, and update different subscription plans and access tiers.', icon: Layers, metric: 'Membership Tiers', path: '/plans' },
            { id: 'classes', title: 'Classes & Schedules', desc: 'Manage classroom sessions, room capacities, and gym-coaches map rosters.', icon: GraduationCap, metric: 'Scheduled Classes', path: '/trainers?filter=my-classes' },
            { id: 'attendance', title: 'Today Attendance Report', desc: 'Verify and review today check-in history tables and entry timesheets.', icon: CalendarCheck, metric: 'Today Attendance', path: '/attendance' },
            { id: 'reports', title: 'Reports & CRM Engine', desc: 'Access lead pipeline, download tax invoices, and run master database backups.', icon: BarChart3, metric: 'CRM & Accounting', path: '/reports-crm' },
            { id: 'settings', title: 'Gym Details & Settings', desc: 'Branding specifications, addresses, profiles configurations, and permissions.', icon: Settings, metric: 'Settings Config', path: '/settings' }
          ].map(feat => {
            const IconComponent = feat.icon;
            return (
              <button
                key={feat.id}
                onClick={() => navigate(feat.path)}
                className="p-5 flex flex-col justify-between text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-red-600 dark:hover:border-red-600 rounded-2xl group transition-all duration-300 hover:shadow-lg hover:shadow-red-600/5 relative overflow-hidden cursor-pointer"
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
    </div>
  );
}
