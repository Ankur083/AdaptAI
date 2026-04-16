import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const ProgressBar = ({ value = 0, max = 100, className, barClassName }) => {
  const percentage = Math.min(Math.max(((value || 0) / max) * 100, 0), 100);

  return (
    <div className={cn('h-2 bg-slate-100 rounded-full overflow-hidden w-full', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('h-full bg-indigo-600 rounded-full', barClassName)}
      />
    </div>
  );
};
