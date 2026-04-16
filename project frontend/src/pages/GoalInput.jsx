import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Brain, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { generateStudyPlan } from '../lib/gemini';

export default function GoalInput() {
  const [goal, setGoal] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    setError(null);
    

    try {
      const plan = await generateStudyPlan(goal, null, null, false);
      console.log(plan.data);
      localStorage.setItem('currentStudyPlan', JSON.stringify(plan.data));
      navigate('/study-plan');
    } catch (err) {
      setError('Failed to generate your learning path. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold mb-6"
        >
          <Sparkles size={16} />
          AI-Powered Learning
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          What do you want to <span className="text-indigo-600">master</span> today?
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Tell us your learning goal, and our AI will craft a personalized path, 
          extract subtopics, and identify prerequisites just for you.
        </p>
      </div>

      <Card className="p-8 md:p-12 shadow-2xl shadow-indigo-500/10 rounded-[40px] border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={24} />
            </div>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., I want to learn React from scratch and build a dashboard"
              className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-xl font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !goal.trim()}
              className="px-12 py-8 text-lg rounded-2xl shadow-xl shadow-indigo-500/20"
              icon={isLoading ? null : <ArrowRight size={24} />}
            >
              {isLoading ? 'Crafting your path...' : 'Generate My Path'}
            </Button>
          </div>
        </form>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-50 pt-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Brain size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Topic Extraction</h3>
            <p className="text-sm text-slate-500">Breaks down complex goals into manageable topics.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <Target size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Prerequisites</h3>
            <p className="text-sm text-slate-500">Identifies what you need to know before you start.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Adaptive Path</h3>
            <p className="text-sm text-slate-500">Adjusts difficulty based on your performance.</p>
          </div>
        </div>
      </Card>

      <div className="mt-12 text-center">
        <p className="text-slate-400 text-sm">
          Popular goals: "Learn Python for Data Science", "Master UI Design Principles", "Understand Quantum Computing"
        </p>
      </div>
    </div>
  );
}
