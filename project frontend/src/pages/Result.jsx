import React from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  ArrowRight, 
  Download, 
  Share2,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { generateFinalReport } from '../lib/gemini';

export default function Result() {
  const navigate = useNavigate();
  const [report, setReport] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [plan, setPlan] = React.useState(null);

  React.useEffect(() => {
    const fetchReport = async () => {
      const storedPlan = localStorage.getItem('currentStudyPlan');
      const storedReport = localStorage.getItem('finalReport');
      const storedScore = localStorage.getItem('finalScore');

      if (!storedPlan) {
        navigate('/goal-input');
        return;
      }

      const p = JSON.parse(storedPlan);
      setPlan(p);

      if (storedReport) {
        setReport(JSON.parse(storedReport));
        setIsLoading(false);
        return;
      }
      
      try {
        const score = parseInt(storedScore || '85');
        const r = await generateFinalReport(p.topic, p.subTopics.map(s => s.title), score);
        setReport(r);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, [navigate]);

  if (isLoading || !report || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Generating your final report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-12 px-6">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-indigo-200"
        >
          <Trophy size={48} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Course Completed!</h1>
          <p className="text-slate-500 text-xl font-medium">You've successfully mastered <span className="text-indigo-600 font-bold underline decoration-indigo-200">{plan.topic}</span></p>
        </div>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button icon={<Download size={20} />} variant="ghost" className="rounded-2xl px-8 py-6">Certificate</Button>
          <Button icon={<Share2 size={20} />} variant="ghost" className="rounded-2xl px-8 py-6">Share Results</Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Overall Mastery', value: '85%', icon: Target, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Topics Covered', value: plan.subTopics.length.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Learning Velocity', value: 'Fast', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-8 rounded-[40px] border-slate-100 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card className="p-12 rounded-[48px] border-slate-100 shadow-2xl shadow-indigo-500/5">
          <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <TrendingUp size={28} className="text-indigo-600" />
            Performance Summary
          </h2>
          <p className="text-slate-500 text-lg leading-relaxed mb-10">
            {report.summary}
          </p>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Key Strengths</h3>
              <div className="space-y-3">
                {report.strengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Areas for Growth</h3>
              <div className="space-y-3">
                {report.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-10">
          <Card className="p-12 rounded-[48px] bg-slate-900 text-white shadow-2xl shadow-indigo-500/10">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Lightbulb size={28} className="text-indigo-400" />
              Recommendations
            </h2>
            <div className="space-y-6">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
                    <ArrowUpRight size={18} />
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{rec}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-12 rounded-[48px] border-slate-100 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 mb-8">What's Next?</h2>
            <div className="space-y-4">
              {report.nextSteps.map((step, i) => (
                <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer">
                  <span className="font-bold text-slate-700">{step}</span>
                  <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              ))}
            </div>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full mt-10 py-8 rounded-3xl text-lg shadow-xl shadow-indigo-500/20"
              icon={<ArrowRight size={24} />}
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
