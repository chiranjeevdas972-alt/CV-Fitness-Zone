import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CreditCard, 
  CalendarCheck, 
  Settings, 
  LogOut,
  Menu,
  X,
  Dumbbell,
  Layers,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Package,
  Megaphone,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
  UserPlus,
  Bookmark,
  Contact,
  GraduationCap,
  Smile,
  Receipt,
  Tag,
  Activity,
  Heart,
  Hourglass,
  History,
  UserCheck,
  CheckCircle2,
  Bike
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gymName, setGymName] = useState('C Vidya Fitness Zone');

  useEffect(() => {
    if (!profile?.gymId) return;
    const docRef = doc(db, 'settings', profile.gymId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.gymName) {
          setGymName(data.gymName);
        }
      }
    }, (err) => {
      console.error("Layout dynamic settings fetch error:", err);
    });
    return () => unsubscribe();
  }, [profile?.gymId]);

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Admin': true,
    'Members': false,
    'Trainer': false,
    'Trainee': false,
    'Health Updates': false,
    'Member Payments': false
  });

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navItems = [
    { 
      name: 'Admin', 
      icon: GraduationCap, 
      path: '/dashboard', 
      roles: ['admin', 'manager'],
      subItems: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Staffs/Trainers', icon: UserSquare2, path: '/trainers' },
        { name: 'Memberships', icon: Layers, path: '/plans' },
        { name: 'All Classes', icon: GraduationCap, path: '/trainers?filter=my-classes' },
        { name: 'Today Attendance Report', icon: CalendarCheck, path: '/attendance' },
        { name: 'Gym Details', icon: Settings, path: '/settings' }
      ]
    },
    { 
      name: 'Members', 
      icon: Users, 
      path: '/members', 
      roles: ['admin', 'manager', 'trainer', 'staff'],
      subItems: [
        { name: 'Add Trainee', icon: UserPlus, path: '/members?filter=add' },
        { name: 'Trainees', icon: Users, path: '/members' },
        { name: 'Dropped Trainees', icon: Bookmark, path: '/members?filter=dropped' },
        { name: 'Members Details', icon: Contact, path: '/members?filter=details' }
      ]
    },
    { 
      name: 'Trainer', 
      icon: UserSquare2, 
      path: '/trainers', 
      roles: ['admin', 'manager', 'trainer'],
      subItems: [
        { name: 'Assign Workouts', icon: Dumbbell, path: '/trainers?filter=assign-workouts' },
        { name: 'My Classes', icon: GraduationCap, path: '/trainers?filter=my-classes' },
        { name: 'My Trainees', icon: Users, path: '/trainers?filter=my-trainees' },
        { name: 'Assigned to Trainees', icon: Bookmark, path: '/trainers?filter=assigned-trainees' },
        { name: 'Assigned to Class', icon: Contact, path: '/trainers?filter=assigned-to-class' },
        { name: 'All Workouts', icon: Dumbbell, path: '/trainers?filter=all-workouts' }
      ]
    },
    { 
      name: 'Trainee', 
      icon: Bike, 
      path: '/ai-zone', 
      roles: ['admin', 'manager', 'trainer', 'member'],
      subItems: [
        { name: 'Today Workouts', icon: CheckCircle2, path: '/ai-zone?filter=today-workouts' },
        { name: 'My Profile', icon: Smile, path: '/ai-zone?filter=my-profile' },
        { name: 'My Classes', icon: Bike, path: '/ai-zone?filter=my-classes' },
        { name: 'My Current Workouts', icon: Tag, path: '/ai-zone?filter=my-current-workouts' },
        { name: 'My Attendance Report', icon: UserCheck, path: '/ai-zone?filter=my-attendance-report' },
        { name: 'My Payment History', icon: Receipt, path: '/ai-zone?filter=my-payment-history' }
      ]
    },
    { 
      name: 'Health Updates', 
      icon: Megaphone, 
      path: '/announcements', 
      roles: ['admin', 'manager', 'trainer', 'member', 'staff'],
      subItems: [
        { name: 'Health Updates', icon: Heart, path: '/announcements?filter=updates' },
        { name: 'All Health Updates', icon: TrendingUp, path: '/announcements?filter=all-updates' },
        { name: 'My Health Updates', icon: UserSquare2, path: '/announcements?filter=my-updates' }
      ]
    },
    { 
      name: 'Member Payments', 
      icon: CreditCard, 
      path: '/payments', 
      roles: ['admin', 'manager', 'staff'],
      subItems: [
        { name: 'Payment Form', icon: CreditCard, path: '/payments?filter=form' },
        { name: 'Awaiting Payments', icon: Hourglass, path: '/payments?filter=awaiting' },
        { name: 'Payment History', icon: History, path: '/payments?filter=history' }
      ]
    },
    { name: 'Reports & CRM', icon: BarChart3, path: '/reports-crm', roles: ['admin', 'manager', 'trainer', 'member'] },
  ];

  const filteredNavItems = navItems;

  useEffect(() => {
    // Automatically expand the menu group that contains the current active route/sub-item
    const activeGroup = navItems.find(item => {
      if (item.subItems) {
        return item.subItems.some(sub => {
          const subBasePath = sub.path.split('?')[0];
          return location.pathname + location.search === sub.path || 
            (location.pathname === subBasePath && !location.search);
        });
      }
      return false;
    });

    if (activeGroup) {
      setExpandedMenus(prev => ({ ...prev, [activeGroup.name]: true }));
    }
  }, [location.pathname, location.search]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className={cn("min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200")}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 transform transition-transform duration-300 lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-[22px] flex items-center bg-zinc-950 text-white select-none border-b border-zinc-800">
            <h1 className="font-black text-lg tracking-wide uppercase text-zinc-100">Gym Management</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {filteredNavItems.map((item) => {
              const hasSubItems = !!item.subItems;
              const isExpanded = !!expandedMenus[item.name];
              
              // Determine if current main path matches
              const isCurrentPath = location.pathname === item.path && !location.search;
              const isSubActive = hasSubItems && item.subItems.some(sub => {
                const subBasePath = sub.path.split('?')[0];
                return location.pathname + location.search === sub.path || 
                  (location.pathname === subBasePath && !location.search);
              });
              const isActive = isCurrentPath || isSubActive;

              if (hasSubItems) {
                return (
                  <div key={item.name} className="flex flex-col space-y-1">
                    <button
                      onClick={() => {
                        toggleMenu(item.name);
                        if (!isActive) {
                          navigate(item.path);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                        isActive
                          ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 font-bold"
                          : "hover:bg-zinc-100/70 dark:hover:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3.5 relative z-10">
                        <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", 
                          isActive ? "text-violet-600 dark:text-violet-500" : "text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600"
                        )} />
                        <span className="font-semibold text-sm tracking-wide">{item.name === 'Admin' ? gymName : item.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white" />
                      )}
                    </button>

                    <AnimatePresence initial={true}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden pl-4 pr-1 py-1 space-y-1 self-stretch"
                        >
                          {item.subItems!.map((sub) => {
                            const isCurrentSubActive = location.pathname + location.search === sub.path || 
                              (location.pathname === sub.path && !location.search && sub.path.indexOf('?') === -1);
                            
                            return (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-xl transition-all duration-200 group font-bold text-[13px] tracking-wide",
                                  isCurrentSubActive
                                    ? "bg-violet-600 text-white font-extrabold shadow-lg shadow-violet-600/25"
                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                                )}
                              >
                                <sub.icon className={cn("w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                                  isCurrentSubActive ? "text-white" : "text-zinc-600 dark:text-zinc-400 group-hover:text-violet-500"
                                )} />
                                <span>{sub.name}</span>
                              </Link>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    location.pathname === item.path
                      ? "bg-zinc-100 dark:bg-zinc-900 text-violet-700 dark:text-violet-400 font-bold"
                      : "hover:bg-zinc-100/70 dark:hover:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", 
                      location.pathname === item.path ? "text-violet-600 dark:text-violet-500" : "text-zinc-600 dark:text-zinc-400 group-hover:text-violet-600"
                    )} />
                    <span className="font-semibold text-sm tracking-wide">{item.name === 'Admin' ? gymName : item.name}</span>
                  </div>
                  {location.pathname === item.path ? (
                    <ChevronRight className="w-4 h-4 text-violet-600 dark:text-violet-500 font-bold" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-zinc-600 dark:text-zinc-400 transition-all" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-6 mt-auto border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden border-2 border-red-600 shadow-lg">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 font-black text-xl">
                    {profile?.displayName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate uppercase tracking-tight">{profile?.displayName}</p>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{profile?.role}</p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-red-600 hover:text-white transition-all duration-300 font-bold text-xs uppercase tracking-widest group"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-black uppercase italic tracking-tight hidden sm:block">
              {(() => {
                const currentFullPath = location.pathname + location.search;
                const matchedSubItem = navItems.flatMap(item => item.subItems || []).find(sub => sub.path === currentFullPath || sub.path === location.pathname);
                if (matchedSubItem) return matchedSubItem.name;
                const matchedItem = navItems.find(item => item.path === location.pathname);
                return matchedItem ? (matchedItem.name === 'Admin' ? gymName : matchedItem.name) : 'Management';
              })()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-all duration-300 hover:rotate-12"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-zinc-600" />}
            </button>
            
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/20">
                {profile?.displayName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
