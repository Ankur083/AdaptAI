import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BookOpen, Trophy, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { MOCK_USER } from '../constants';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CourseCard } from '../components/shared/CourseCard';
import api from '../api/axiosInstance';

export default function Progress() {
  const { user } = useUser();
  const [customTopics, setCustomTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/user/courses');
        if (res.data?.data) {
          setCustomTopics(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const trackedCourses = [
    ...customTopics.map((topic, index) => ({
      id: topic._id,
      title: topic.title,
      description: topic.description || 'Personalized learning path created just for you.',
      instructor: topic.instructor || 'AI Coach',
      thumbnail: topic.thumbnail || `https://picsum.photos/seed/${topic.title}/800/450`,
      progress: topic.progress || 0,
      category: topic.category || 'Personalized',
      difficulty: topic.difficulty || 'Custom',
      modules: [],
    }))
  ].sort((a, b) => (b.progress || 0) - (a.progress || 0));

  const overallProgress = Math.round(
    trackedCourses.reduce((total, course) => total + (course.progress || 0), 0) / trackedCourses.length
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Progress Overview</h1>
          <p className="text-slate-500 mt-2">Monitor your learning momentum, goal completion, and course progress from one place.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="outline">
            Jump to top
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Learning Momentum</p>
              <h2 className="text-2xl font-bold text-slate-900">{overallProgress}%</h2>
            </div>
            <TrendingUp size={32} className="text-indigo-600" />
          </div>
          <ProgressBar value={overallProgress} className="mb-4" />
          <p className="text-sm text-slate-500">Average progress across your active courses and custom topics.</p>
        </Card>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Weekly goal</p>
              <h2 className="text-2xl font-bold text-slate-900">{MOCK_USER.stats.streak * 12}%</h2>
            </div>
            <Clock size={32} className="text-emerald-600" />
          </div>
          <ProgressBar value={Math.min(MOCK_USER.stats.streak * 12, 100)} className="mb-4" barClassName="bg-emerald-600" />
          <p className="text-sm text-slate-500">You are on track with your current streak and weekly learning targets.</p>
        </Card>

        <Card className="p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Quiz mastery</p>
              <h2 className="text-2xl font-bold text-slate-900">{MOCK_USER.stats.averageScore}%</h2>
            </div>
            <Trophy size={32} className="text-yellow-500" />
          </div>
          <ProgressBar value={MOCK_USER.stats.averageScore} className="mb-4" barClassName="bg-yellow-500" />
          <p className="text-sm text-slate-500">Your quiz performance is strong — keep reviewing weak areas for faster gains.</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Active Course Progress</h2>
            <p className="text-slate-500">Your most recent learning paths and how far you’ve come.</p>
          </div>
          <Link to="/courses" className="text-indigo-600 text-sm font-semibold hover:underline">Explore all courses</Link>
        </div>

        <div className="grid gap-4">
          {trackedCourses.slice(0, 4).map((course, index) => (
            <CourseCard key={course.id} course={course} variant="horizontal" index={index} />
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Course streak</h3>
          <p className="text-slate-500 mb-6">Keep your streak alive by completing at least one lesson every day.</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Perfect streak days</span>
              <span className="font-semibold text-slate-900">{MOCK_USER.stats.streak} days</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Courses completed</span>
              <span className="font-semibold text-slate-900">{MOCK_USER.stats.coursesCompleted}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Learning hours</span>
              <span className="font-semibold text-slate-900">{MOCK_USER.stats.learningHours} hrs</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 shadow-sm bg-indigo-600 text-white">
          <h3 className="text-lg font-semibold mb-4">Keep this up, {user?.fullName || 'Learner'}!</h3>
          <p className="text-slate-200 mb-6">Your focus this week is on completing advanced modules and maintaining your quiz score above 85%.</p>
          <div className="space-y-3 text-sm text-slate-200">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white" /> Finish 3 lessons
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white" /> Review AI-generated summaries
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white" /> Attempt one quiz daily
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
