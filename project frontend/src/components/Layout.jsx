import React from 'react';
import api from '../api/axiosInstance';
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from "../context/UserContext";
import {
  LayoutDashboard,
  BookOpen,
  User,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: BookOpen, label: 'My Courses', path: '/courses' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];


  const [user, setUser] = useState({});

  const fetchUser = async () => {
    try {
      const res = await api.get(
        "/user/profile",
        { withCredentials: true }
      );

      setUser(res.data.data);

    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/pre-evaluation', '/quiz-topics'].some(path => location.pathname.startsWith(path));
    if (!isAuthPage) {
      fetchUser();
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post(
        "/user/logout",
        {},
        {
          withCredentials: true // 
        }
      );

      // remove token if stored in localStorage
      // localStorage.removeItem("accessToken");
      setUser(null);
      toast.success("Logged out successfully");

      navigate("/login");

    } catch (error) {
      console.log(error);
    }
  };

  const isAuthPageUrl = ['/login', '/register', '/forgot-password', '/reset-password', '/pre-evaluation', '/quiz-topics'].some(path => location.pathname.startsWith(path));

  if (isAuthPageUrl) return <>{children}</>;

  return (

    <UserContext.Provider value={{ user, setUser }}>



      <div className="min-h-screen bg-[#F8FAFC] flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-50",
            isSidebarOpen ? "w-64" : "w-20"
          )}
        >
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <GraduationCap size={24} />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl text-slate-800 tracking-tight">AdaptiveLearn</span>
            )}
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors group",
                  location.pathname === item.path
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <item.icon size={22} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-20 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 p-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
              )}
            >
              <LogOut size={22} />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 min-h-screen flex flex-col",
          isSidebarOpen ? "ml-64" : "ml-20"
        )}>
          {/* Header */}
          <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search courses, lessons..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800">{user?.fullName}</p>
                  <p className="text-xs text-slate-500">Student</p>
                </div>
                <img
                  src={user?.avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-indigo-100"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </header>

          <div className="p-8 flex-1">
            {children}
          </div>
        </main>
      </div>
    </UserContext.Provider>
  );
}
