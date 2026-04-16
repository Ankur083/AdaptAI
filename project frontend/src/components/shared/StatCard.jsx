import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

export const StatCard = ({ label, value, icon, color, bg, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="hover:shadow-md transition-shadow flex flex-col items-center text-center">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg", bg || color, !bg && "text-white")}>
          {icon}
        </div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </Card>
    </motion.div>
  );
};
