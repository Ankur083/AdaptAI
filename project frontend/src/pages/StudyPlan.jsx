import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Target,
  Zap,
  Sparkles,
  Edit3,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import api from '../api/axiosInstance';
import { cn } from '../lib/utils';
import { generateStudyPlan } from '../lib/gemini';

export default function StudyPlan() {
  const [plan, setPlan] = React.useState(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const storedPlan = localStorage.getItem('currentStudyPlan');
    if (storedPlan) {
      setPlan(JSON.parse(storedPlan));
    } else {
      navigate('/goal-input');
    }
  }, [navigate]);

  if (!plan) return null;

  const handleConfirm = async () => {
    setIsSaving(true);
    let existingTopic = null;

    try {
      const listResponse = await api.get('/user/courses');
      const customTopics = listResponse.data.data || [];
      existingTopic = customTopics.find(t => t.title === plan.topic);
    } catch (e) {
      console.warn("Failed to fetch existing courses", e);
    }

    let topicId = existingTopic?._id || `goal-${Date.now()}`;
    let dbCourseId = existingTopic?._id || null;
    const studyTopicTitle = plan.topic || plan.planTitle || plan.title || `Untitled Course ${Date.now()}`;
    const studyTopicSubject = plan.subject || studyTopicTitle;
    
    const topicPayload = {
      id: topicId,
      title: studyTopicTitle,
      subject: studyTopicSubject,
      description: `Master ${studyTopicTitle} with a personalized AI-generated curriculum.`,
      questions: 10,
      time: '20 min',
      difficulty: plan.difficulty || 'Intermediate',
      isCustom: true,
      progress: 0,
      instructor: 'AI Assistant',
      category: plan.subject || 'AI Personalized',
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(studyTopicTitle)}/800/450`,
      dbId: dbCourseId
    };

    try {
      if (!dbCourseId) {
        const createResponse = await api.post('/user/courses', {
          title: topicPayload.title,
          category: topicPayload.category,
          difficulty: topicPayload.difficulty,
          description: topicPayload.description,
          thumbnail: topicPayload.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(studyTopicTitle)}/800/450`
        });
        dbCourseId = createResponse.data.data._id || createResponse.data.data.id;
        topicId = dbCourseId; // Sync IDs
        topicPayload.id = topicId;
        topicPayload.dbId = dbCourseId;
      }

      // We still store studyPlan in local storage to pass to PreEvaluation
      const storedPlans = localStorage.getItem('studyPlans');
      const studyPlans = storedPlans ? JSON.parse(storedPlans) : {};
      studyPlans[topicId] = { ...plan, courseId: dbCourseId, topic: studyTopicTitle };
      localStorage.setItem('studyPlans', JSON.stringify(studyPlans));
      localStorage.setItem('currentStudyPlan', JSON.stringify(studyPlans[topicId]));

      navigate('/pre-evaluation');
    } catch (error) {
      console.error('Failed to save course or prepare study plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    // Re-generate the study plan for the same topic without persisting yet
    setIsUpdating(true);
    try {
      const res = await generateStudyPlan(plan.topic, null, null, false);
      console.log(res);
      const newPlan = res.data;
      localStorage.setItem('currentStudyPlan', JSON.stringify(newPlan));
      setPlan(newPlan);
    } catch (error) {
      console.error("Failed to update study plan:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold mb-4 uppercase tracking-wider"
          >
            <CheckCircle2 size={14} />
            Path Generated Successfully
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Personalized <span className="text-indigo-600">Learning Path</span>
          </h1>
          <p className="text-slate-500 text-lg mt-2">
            Review your study plan for <span className="font-bold text-slate-900 underline decoration-indigo-500/30">{plan.topic}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleUpdate}
            disabled={isUpdating || isSaving}
            leftIcon={isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Edit3 size={18} />}
          >
            {isUpdating ? 'Updating...' : 'Regenerate Path'}
          </Button>
          <Button onClick={handleConfirm} disabled={isUpdating || isSaving} leftIcon={<ArrowRight size={18} />}>
            {isSaving ? 'Saving...' : 'Confirm & Start'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Topics */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-indigo-600" />
            Curriculum Breakdown
          </h2>
          {plan?.subTopics?.map((sub, i) => (
            <motion.div
              key={sub.id || `sub-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 hover:border-indigo-600/30 transition-all group relative overflow-hidden rounded-3xl">
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-bold text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {i + 1}
                  </div>
                  <div className="grow">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {sub.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {sub.description}
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={16} className="text-indigo-200" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar: Prerequisites & Info */}
        <div className="space-y-8">
          <Card className="p-8 bg-indigo-600 text-white rounded-4xl border-none shadow-xl shadow-indigo-500/20">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Target size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold mb-4">Prerequisites</h2>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              To get the most out of this path, we recommend you have a basic understanding of:
            </p>
            <ul className="space-y-3">
              {plan?.prerequisites?.map((pre, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                  {pre}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-8 bg-slate-900 text-white rounded-4xl border-none">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={24} className="text-amber-400" />
            </div>
            <h2 className="text-xl font-bold mb-4">Adaptive Learning</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our system will monitor your progress. If you struggle with a topic,
              we'll provide additional resources and adjust the difficulty in real-time.
            </p>
          </Card>
        </div>
      </div>

      <div className="mt-16 flex justify-center">
        <Button
          size="lg"
          onClick={handleConfirm}
          disabled={isSaving || isUpdating}
          className="px-12 py-8 text-lg rounded-2xl shadow-xl shadow-indigo-500/20"
          icon={<ArrowRight size={24} />}
        >
          {isSaving ? 'Saving...' : 'Confirm & Start Pre-Evaluation'}
        </Button>
      </div>
    </div>
  );
}
