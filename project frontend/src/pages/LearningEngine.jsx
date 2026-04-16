import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Lightbulb,
  FileText,
  Youtube,
  RefreshCw
} from 'lucide-react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { generateTopicContent } from '../lib/gemini';

export default function LearningEngine() {
  const [plan, setPlan] = React.useState(null);
  const [currentTopicIndex, setCurrentTopicIndex] = React.useState(0);
  const [content, setContent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('explanation');
  const navigate = useNavigate();

  React.useEffect(() => {
    const storedPlan = localStorage.getItem('currentStudyPlan');
    const storedIndex = localStorage.getItem('currentTopicIndex');
    const isReteach = localStorage.getItem('isReteach') === 'true';

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(storedPlan);
      setPlan(parsedPlan);
      const index = parseInt(storedIndex || '0');
      setCurrentTopicIndex(index);
      if (!parsedPlan.subTopics || !parsedPlan.subTopics[index]) {
        navigate('/goal-input');
        return;
      }
      fetchContent(parsedPlan.topic, parsedPlan.subTopics[index].title, isReteach);
    } catch {
      navigate('/goal-input');
      return;
    }
    // if (storedPlan) {
    //   const parsedPlan = JSON.parse(storedPlan);
    //   setPlan(parsedPlan);
    //   const index = parseInt(storedIndex || '0');
    //   setCurrentTopicIndex(index);
    //   fetchContent(parsedPlan.topic, parsedPlan.subTopics[index].title, isReteach);
    // } else {
    //   navigate('/goal-input');
    // }
  }, [navigate]);

  const fetchContent = async (topic, subTopic, isReteach) => {
    setIsLoading(true);
    setContent(null); // Clear old content while loading
    try {
      // In a real RAG system, we'd pass the isReteach flag to the backend
      const res = await generateTopicContent(topic, subTopic);
      setContent(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicChange = (index) => {
    if (index >= 0 && index < plan.subTopics.length) {
      setCurrentTopicIndex(index);
      localStorage.setItem('currentTopicIndex', index.toString());
      localStorage.removeItem('isReteach');
      fetchContent(plan.topic, plan.subTopics[index].title, false);
    }
  };

  if (!plan) return null;

  if (isLoading || !content) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Preparing your lesson...</p>
        </div>
      </div>
    );
  }

  const currentSubTopic = plan.subTopics[currentTopicIndex];

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 min-h-screen">
      <div className="mb-6">
        <button 
          onClick={() => {
            const dest = plan.courseId || plan.id || plan._id;
            if (dest) {
              navigate('/courses/' + dest);
            } else {
              navigate(-1);
            }
          }} 
          className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Subtopics
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content Area */}
        <div className="flex-grow space-y-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTopicChange(currentTopicIndex - 1)}
              disabled={currentTopicIndex === 0}
              leftIcon={<ChevronLeft size={16} />}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
              <BookOpen size={16} />
              Topic {currentTopicIndex + 1} of {plan.subTopics.length}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleTopicChange(currentTopicIndex + 1)}
              disabled={currentTopicIndex === plan.subTopics.length - 1}
              rightIcon={<ChevronRight size={16} />}
            >
              Next
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {localStorage.getItem('isReteach') === 'true' && (
                <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1">
                  <RefreshCw size={12} className="animate-spin-slow" />
                  Review Mode
                </div>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {currentSubTopic.title}
            </h1>
            <p className="text-slate-500 text-lg">
              {currentSubTopic.description}
            </p>
          </div>

          {/* Setup Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => setActiveTab('explanation')}
              className={`flex-1 py-3 px-6 text-base font-medium rounded-lg transition-all ${
                activeTab === 'explanation' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Explanation
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`flex-1 py-3 px-6 text-base font-medium rounded-lg transition-all ${
                activeTab === 'examples' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Examples
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 py-3 px-6 text-base font-medium rounded-lg transition-all ${
                activeTab === 'video' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Video Resources
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`flex-1 py-3 px-6 text-base font-medium rounded-lg transition-all ${
                activeTab === 'documentation' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              Documentation
            </button>
          </div>

          <div className="mt-8">
            {activeTab === 'explanation' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Text Explanation */}
                <Card className="p-10 rounded-[40px] border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <FileText className="text-indigo-600" />
                    Deep Dive
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                      {content.text}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'examples' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Examples */}
                <div className="flex flex-col gap-6">
                  {content.examples.map((example, i) => (
                    <Card key={i} className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
                        <Lightbulb size={20} className="text-amber-500" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-4 text-xl">Example {i + 1}</h3>
                      <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">
                        {example}
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'video' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Video Section */}
                <Card className="aspect-video bg-slate-900 rounded-[40px] overflow-hidden relative group shadow-2xl shadow-indigo-500/10">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center">
                    <div 
                      className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform cursor-pointer"
                      onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(content.videoSearchQuery)}`, '_blank')}
                    >
                      <Play size={32} fill="currentColor" className="ml-1" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Recommended Video</h3>
                    <p className="text-slate-400 max-w-md">
                      Search YouTube for: <span className="text-indigo-400 italic">"{content.videoSearchQuery}"</span>
                    </p>
                    <Button
                      variant="outline"
                      className="mt-8 border-white/20 text-white hover:bg-white/10"
                      onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(content.videoSearchQuery)}`, '_blank')}
                      icon={<Youtube size={20} />}
                    >
                      Watch on YouTube
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'documentation' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-10 rounded-[40px] border-slate-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen size={32} className="text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Official Documentation</h3>
                  <p className="text-slate-500 mb-8 max-w-lg">
                    Check out the official documentation or trusted developers' guides for a more technical dive into <span className="font-semibold text-slate-700">{currentSubTopic.title}</span>.
                  </p>
                  
                  <Button
                    className="w-full py-5 text-lg"
                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(plan.topic + " " + currentSubTopic.title + " documentation")}`, '_blank')}
                    icon={<BookOpen size={20} />}
                  >
                    Read Documentation
                  </Button>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="pt-8 flex justify-end">
            <Button
              size="lg"
              onClick={() => navigate('/quiz')}
              className="px-12 py-8 text-lg rounded-2xl shadow-xl shadow-indigo-500/20"
              icon={<ArrowRight size={24} />}
            >
              Take Topic Quiz
            </Button>
          </div>
        </div>

        {/* Sidebar: Progress */}
        <div className="w-full md:w-80 shrink-0">
          <Card className="p-8 rounded-[32px] sticky top-8">
            <h3 className="font-bold text-slate-900 mb-6">Learning Path</h3>
            <div className="space-y-4">
              {plan.subTopics.map((sub, i) => (
                <button
                  key={sub.id || sub._id || sub.subtopicId || i}
                  onClick={() => handleTopicChange(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left group ${i === currentTopicIndex
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                    : i < currentTopicIndex
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {i < currentTopicIndex ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shrink-0 ${i === currentTopicIndex ? 'border-indigo-600' : 'border-slate-200'
                      }`}>
                      {i + 1}
                    </div>
                  )}
                  <span className="text-sm font-bold truncate">{sub.title}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
