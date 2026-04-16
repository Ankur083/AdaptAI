import React from 'react';
import { useRef } from "react";
import {
  User,
  Mail,
  Shield,
  Settings,
  Bell,
  CreditCard,
  ChevronRight,
  Camera,
  Trophy,
  BookOpen,
  Clock,
  Zap
} from 'lucide-react';
import { MOCK_USER } from '../constants';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/shared/StatCard';
import { Input } from '../components/ui/Input';
import { useEffect, useState } from "react";
import api from '../api/axiosInstance';
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";


export default function Profile() {
  const fileInputRef = useRef();
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await api.put(
        "http://localhost:8000/api/v1/user/update/avatar",
        formData,
        {
          withCredentials: true
        }
      );

      // update UI
      setUser(res.data.data);

      toast.success("Avatar updated");

    } catch (error) {
      console.log(error);
      toast.error("Failed to update avatar");
    }
  };

   const { user } = useUser();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile Sidebar */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          <Card className="p-8 text-center">
            <div className="relative inline-block mb-6">
              {/* <img
                src={user?.avatar}
                alt={user?.name}
                className="w-32 h-32 rounded-[40px] border-4 border-indigo-50 object-cover"
                referrerPolicy="no-referrer"
              /> */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
              />

              <img
                src={`${user?.avatar}?t=${Date.now()}`} 
                alt={user?.name}
                className="w-32 h-32 rounded-[40px] object-cover"
              />

              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center"
              >
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{user?.fullName}</h2>
            <p className="text-slate-500 font-medium mt-1">{user?.email}</p>
            <div className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm">
              <Shield size={16} />
              <span>Verified Student</span>
            </div>
          </Card>

          <Card padding="none" className="p-4 overflow-hidden">
            {[
              { icon: User, label: 'Personal Info', active: true },
              { icon: Bell, label: 'Notifications', active: false },
              { icon: Shield, label: 'Security', active: false },
              { icon: CreditCard, label: 'Billing', active: false },
              { icon: Settings, label: 'Preferences', active: false },
            ].map((item, i) => (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                  item.active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                <ChevronRight size={16} className={cn(item.active ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
              </button>
            ))}
          </Card>
        </div>

        {/* Profile Content */}
        <div className="flex-1 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Courses', value: MOCK_USER.stats.coursesCompleted, icon: BookOpen, color: 'bg-blue-500' },
              { label: 'Avg Score', value: `${MOCK_USER.stats.averageScore}%`, icon: Trophy, color: 'bg-yellow-500' },
              { label: 'Hours', value: MOCK_USER.stats.learningHours, icon: Clock, color: 'bg-purple-500' },
              { label: 'Streak', value: MOCK_USER.stats.streak, icon: Zap, color: 'bg-orange-500' },
            ].map((stat, i) => (
              <StatCard
                key={i}
                label={stat.label}
                value={stat.value}
                icon={<stat.icon size={24} />}
                color={stat.color}
                index={i}
              />
            ))}
          </div>

          {/* Form */}
          <Card className="p-8 sm:p-10">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Personal Information</h3>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="First Name"
                defaultValue={user?.fullName?.split(' ')[0]}
              />
              <Input
                label="Last Name"
                defaultValue={user?.fullName?.split(' ')[1]}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Email Address"
                  defaultValue={user?.email}
                  icon={<Mail size={20} />}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Bio</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 resize-none"
                />
              </div>
              <div className="sm:col-span-2 pt-4">
                <Button size="lg">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
