import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Play, Target, Trophy, Sparkles, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { generateStudyPlan } from '../lib/gemini';
import { cn } from '../lib/utils';
import api from '../api/axiosInstance';

export default function CourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/user/courses/${courseId}`);
        const dbCourse = response.data.data;

        if (dbCourse) {
          const resolvedCourse = {
            ...dbCourse,
            id: dbCourse._id,
            dbId: dbCourse._id,
            thumbnail: dbCourse.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(dbCourse.title)}/800/450`,
            isCustom: true
          };
          setCourse(resolvedCourse);

          if (dbCourse.studyPlans?.length > 0) {
            const resolvedPlan = {
              ...dbCourse.studyPlans[0],
              topic: resolvedCourse.title,
              title: resolvedCourse.title
            };
            setStudyPlan(resolvedPlan);
          }
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError('This course has been deleted from your account.');
          setCourse(null);
          setStudyPlan(null);
        } else {
          setError('This course could not be found.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleGeneratePlan = async () => {
    if (!course) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await generateStudyPlan(course.title, course.dbId || course.id, course.difficulty);
      const plan = res.data;
      if (!plan || !plan.subTopics) {
        throw new Error('Failed to generate a valid study plan.');
      }

      const storedPlans = localStorage.getItem('studyPlans');
      const plans = storedPlans ? JSON.parse(storedPlans) : {};
      plans[courseId] = { ...plan, courseId };
      localStorage.setItem('studyPlans', JSON.stringify(plans));
      localStorage.setItem('currentStudyPlan', JSON.stringify(plans[courseId]));
      localStorage.setItem('currentTopicIndex', '0');

      setStudyPlan(plans[courseId]);
    } catch (err) {
      console.error(err);
      setError('Unable to generate the study plan at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStudy = () => {
    if (!studyPlan) return;
    localStorage.setItem('currentStudyPlan', JSON.stringify(studyPlan));
    localStorage.setItem('currentTopicIndex', '0');
    localStorage.removeItem('isReteach');
    navigate('/learning-engine');
  };

  const handleStartQuiz = () => {
    if (!studyPlan) return;
    localStorage.setItem('currentStudyPlan', JSON.stringify(studyPlan));
    localStorage.setItem('currentTopicIndex', '0');
    navigate('/pre-evaluation');
  };

  if (!course) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-6 text-center">
        <p className="text-slate-500">{error || 'Loading course...'}</p>
        <div className="mt-8">
          <Link to="/courses" className="text-indigo-600 font-semibold hover:underline">Back to My Courses</Link>
        </div>
      </div>
    );
  }

  const progressValue = studyPlan ? Math.round((studyPlan.subTopics?.length ? 100 : 0)) : 0;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/courses" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800">
            <ArrowLeft size={18} /> Back to My Courses
          </Link>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-4">{course.title}</h1>
          <p className="text-slate-500 mt-2">{course.description || `Start the personalized learning path for ${course.title}.`}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button variant="secondary" onClick={handleGeneratePlan} disabled={isLoading}>
            {studyPlan ? 'Refresh Study Plan' : 'Generate Study Plan'}
          </Button>
          <Button onClick={handleStartStudy} disabled={!studyPlan}>
            Study Topic
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-indigo-600">
            <BookOpen size={20} />
            <span className="font-bold">Course Summary</span>
          </div>
          <div className="space-y-4 text-sm text-slate-600">
            <p><span className="font-semibold">Instructor:</span> {course.instructor || 'AI Assistant'}</p>
            <p><span className="font-semibold">Lesson style:</span> AI-generated study plan and quiz-based learning</p>
            <p><span className="font-semibold">Video lectures:</span> Not included yet</p>
            <p><span className="font-semibold">Difficulty:</span> {course.difficulty || 'Intermediate'}</p>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Path Status</p>
              <h2 className="text-2xl font-bold text-slate-900">{studyPlan ? 'Ready to learn' : 'Plan not created'}</h2>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <Sparkles size={24} />
            </div>
          </div>
          <ProgressBar value={progressValue} className="mb-4" />
          <div className="text-sm text-slate-500">
            {studyPlan
              ? `Study plan contains ${studyPlan.subTopics.length} subtopics and is ready to use.`
              : 'Generate a study plan to unlock topic lessons and quizzes.'
            }
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <Trophy size={20} />
            <span className="font-bold">Learning Goals</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1 w-2 h-2 rounded-full bg-slate-400" /> Save the course topic in My Courses.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-2 h-2 rounded-full bg-slate-400" /> View the AI-generated study plan anytime.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 w-2 h-2 rounded-full bg-slate-400" /> Start a quiz for this topic directly from the detail page.
            </li>
          </ul>
        </Card>
      </div>

      {error && (
        <div className="rounded-3xl bg-red-50 border border-red-100 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {studyPlan ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Study Plan</h2>
              <p className="text-slate-500">Inspect each topic in the path and jump straight into lessons or quiz practice.</p>
            </div>
            <Button onClick={handleStartQuiz} disabled={!studyPlan}>
              Start Quiz
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {studyPlan.subTopics.map((subTopic, index) => (
              <Card key={subTopic.id || index} className={cn(
                'p-6 border transition-all cursor-pointer hover:border-indigo-400 hover:shadow-md',
                index === 0 ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'
              )} onClick={() => {
                localStorage.setItem('currentStudyPlan', JSON.stringify({ ...course, subTopics: studyPlan.subTopics, topic: course.title }));
                localStorage.setItem('currentTopicIndex', index.toString());
                navigate('/learning-engine');
              }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded mb-2">{subTopic.level || 'Beginner'} Level</span>
                    <p className="text-slate-400 text-xs uppercase tracking-[0.2em]">Step {index + 1}</p>
                    <h3 className="text-lg font-bold text-slate-900">{subTopic.title}</h3>
                  </div>
                  <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Play size={20} />
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">{subTopic.description}</p>
                <div className="flex gap-2 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4">
                  <span className="flex-1 bg-slate-50 text-center py-2 rounded">Video (Empty)</span>
                  <span className="flex-1 bg-slate-50 text-center py-2 rounded">Docs (Empty)</span>
                  <span className="flex-1 bg-slate-50 text-center py-2 rounded">Quiz</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-900">No study plan yet</h2>
            <p className="text-slate-500">Create a study plan for this topic and then you will be able to review the full path, start learning, and take quizzes from this page.</p>
            <Button onClick={handleGeneratePlan} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate Study Plan'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
