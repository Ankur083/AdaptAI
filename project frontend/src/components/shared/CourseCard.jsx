import React from 'react';
import { motion } from 'motion/react';
import { Play, Star, Clock, BookOpen, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const CourseCard = ({ course, variant = 'vertical', index = 0 }) => {
  if (variant === 'horizontal') {
    return (
      <Card padding="none" className="flex flex-col sm:flex-row gap-6  hover:border-indigo-200 transition-colors group overflow-hidden p-7 min-w-0">
        <div className="relative w-full sm:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-lg">
              <Play size={20} fill="currentColor" />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between p-1">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <span className="px-1 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                {course.category}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-500 text-xs font-medium">{course.difficulty}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
          </div>

          <div className=" mb-3">
              <h4 className="text-sm text-gray-800 mt-2 line-clamp-2">
                {course.description}
              </h4>
              {/* <div className="mt-2 text-xs text-slate-500 line-clamp-2">
                <strong>Topics: </strong>
                {course.studyPlans?.flatMap(plan => plan.subTopics?.map(st => st.title) || []).join(', ') || 'Various topics'}
              </div> */}
          </div>
          
          <div className="mt-4 sm:mt-0">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card padding="none" className="overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
        <div className="h-48 overflow-hidden relative">
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold text-indigo-600 shadow-sm">
            {course.category}
          </div>

          {/* <div>
            <h3>{course.description}</h3>
          </div> */}
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-slate-900/80 backdrop-blur rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
            <Star size={10} className="text-yellow-400 fill-yellow-400" />
            4.8 (1.2k)
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
              <Clock size={14} />
              12h 45m
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
              <BookOpen size={14} />
              24 Lessons
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {course.title}
          </h3>
          {course.subject && (
            <p className="text-sm text-slate-500 mb-3">Subject: {course.subject}</p>
          )}
          <p className="text-slate-500 text-sm line-clamp-2 mb-2 flex-1">
            {course.description}
          </p>
          <div className="text-xs text-slate-400 line-clamp-2 mt-2 mb-6">
            <strong>Topics: </strong>
            {course.studyPlans?.flatMap(plan => plan.subTopics?.map(st => st.title) || []).join(', ') || 'Various topics'}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor</span>
              <span className="text-sm font-bold text-slate-700">{course.instructor}</span>
            </div>
            <button className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all group/btn">
              <Plus size={24} className="group-hover/btn:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
