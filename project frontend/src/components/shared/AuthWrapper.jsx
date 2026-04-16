import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';

export const AuthWrapper = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-500 mt-2 text-center">{subtitle}</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
};
