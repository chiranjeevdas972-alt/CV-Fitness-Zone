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
  Sun,
  Moon,
  Package,
  Megaphone,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'trainer', 'member'] },
    { name: 'AI Zone', icon: Sparkles, path: '/ai-zone', roles: ['admin', 'trainer', 'member'] },
    { name: 'Reports & CRM', icon: BarChart3, path: '/reports-crm', roles: ['admin', 'trainer'] },
    { name: 'Members', icon: Users, path: '/members', roles: ['admin', 'trainer'] },
    { name: 'Trainers', icon: UserSquare2, path: '/trainers', roles: ['admin'] },
    { name: 'Shop', icon: ShoppingBag, path: '/shop', roles: ['admin', 'trainer', 'member'] },
    { name: 'Body Gain', icon: TrendingUp, path: '/shop?category=gain', roles: ['admin', 'trainer', 'member'] },
    { name: 'Body Loss', icon: TrendingDown, path: '/shop?category=loss', roles: ['admin', 'trainer', 'member'] },
    { name: 'Plans', icon: Layers, path: '/plans', roles: ['admin'] },
    { name: 'Payments', icon: CreditCard, path: '/payments', roles: ['admin'] },
    { name: 'Attendance', icon: CalendarCheck, path: '/attendance', roles: ['admin', 'trainer'] },
    { name: 'Inventory', icon: Package, path: '/inventory', roles: ['admin'] },
    { name: 'Announcements', icon: Megaphone, path: '/announcements', roles: ['admin', 'trainer', 'member'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    profile && item.roles.includes(profile.role)
  );

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
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-4">
            <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-600/20">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl leading-none tracking-tighter uppercase italic">CV Fitness</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black mt-1">Victory Zone</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            <div className="px-4 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Main Menu</p>
            </div>
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  location.pathname === item.path
                    ? "bg-red-600 text-white shadow-xl shadow-red-600/20"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", 
                    location.pathname === item.path ? "text-white" : "text-zinc-400 group-hover:text-red-600"
                  )} />
                  <span className="font-bold text-sm uppercase tracking-wider">{item.name}</span>
                </div>
                {location.pathname === item.path && (
                  <ChevronRight className="w-4 h-4 text-white/50" />
                )}
              </Link>
            ))}
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
              {navItems.find(item => item.path === location.pathname)?.name || 'Management'}
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
