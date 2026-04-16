import React from 'react';
import { useUser } from '../context/UserContext';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp,
  MessageSquare,
  Sparkles,
  Target,
  RefreshCw
} from 'lucide-react';
import { MOCK_COURSES, MOCK_USER } from '../constants';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import api from '../api/axiosInstance';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/shared/StatCard';
import { CourseCard } from '../components/shared/CourseCard';
import AIChat from '../components/AIChat';
import { generateStudyPlan } from '../lib/gemini';

export default function Dashboard() {

   const { user } = useUser();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [customCount, setCustomCount] = React.useState(0);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [dbCourses, setDbCourses] = React.useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = React.useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/user/courses');
        if (res.data?.data) {
          const fetchedCourses = res.data.data;
          setDbCourses(fetchedCourses);
          setCustomCount(fetchedCourses.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleRefreshPath = async () => {
    const storedPlan = localStorage.getItem('currentStudyPlan');
    if (!storedPlan) return;
    
    const plan = JSON.parse(storedPlan);
    setIsUpdating(true);
    try {
      const newPlan = await generateStudyPlan(plan.topic);
      localStorage.setItem('currentStudyPlan', JSON.stringify(newPlan));
      // Optionally show a success toast or message
    } catch (error) {
      console.error("Failed to refresh path:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Map database courses for "Continue Learning"
  const allCourses = [
    ...dbCourses.map(topic => ({
      id: topic._id,
      title: topic.title,
      difficulty: topic.difficulty || 'Intermediate',
      thumbnail: topic.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(topic.title)}/800/450`,
      progress: topic.progress || 0,
      category: topic.category || 'AI Personalized'
    }))
  ].sort((a, b) => (b.progress || 0) - (a.progress || 0));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.fullName}! 👋</h1>
          <p className="text-slate-500 mt-1">You've completed 85% of your weekly goal. Keep it up!</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl font-bold">
            <Zap size={20} />
            <span>{MOCK_USER.stats.streak} Day Streak</span>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
            onClick={() => navigate('/goal-input')}
            leftIcon={<Target size={18} />}
          >
            Set Goal
          </Button>
          <Button 
            variant="outline" 
            className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-50"
            onClick={() => setIsChatOpen(true)}
            leftIcon={<MessageSquare size={18} />}
          >
            AI Chat
          </Button>
          <div className="relative">
            <Button onClick={() => navigate('/quiz-topics')}>
              Continue Learning
            </Button>
            {customCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                {customCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <AIChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        onCourseAdded={(count) => {
          setCustomCount(count);
          const stored = localStorage.getItem('customTopics');
          if (stored) setCustomTopics(JSON.parse(stored));
        }}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Courses Completed', value: MOCK_USER.stats.coursesCompleted, icon: BookOpen, color: 'bg-blue-500' },
          { label: 'Avg. Quiz Score', value: `${MOCK_USER.stats.averageScore}%`, icon: Trophy, color: 'bg-yellow-500' },
          { label: 'Learning Hours', value: MOCK_USER.stats.learningHours, icon: Clock, color: 'bg-purple-500' },
          { label: 'Knowledge Level', value: 'Pro', icon: TrendingUp, color: 'bg-emerald-500' },
        ].map((stat, i) => (
          <StatCard 
            key={i} 
            label={stat.label}
            value={stat.value}
            icon={<stat.icon size={24} />}
            color={stat.color}
            index={i} 
          />
        ))}
      </div>

      <Card className="p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Track your progress</h2>
            <p className="text-slate-500">See your overall learning momentum and progress details in one place.</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/progress')}>
            View Progress
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Goal Card */}
          <Card className="p-8 bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold">What's your next learning goal?</h2>
                <p className="text-indigo-100 max-w-md">Tell our AI what you want to learn, and we'll build a personalized path for you.</p>
              </div>
              <Button 
                onClick={() => navigate('/goal-input')}
                className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-6 rounded-2xl font-bold text-lg shadow-lg group-hover:scale-105 transition-transform"
                rightIcon={<Sparkles size={20} />}
              >
                Set New Goal
              </Button>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          </Card>

          <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Your Saved Courses</h2>
              </div>
              {isLoadingCourses ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
              ) : dbCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {dbCourses.map((c) => (
                    <CourseCard 
                      key={c._id} 
                      course={{
                        id: c._id, 
                        title: c.title, 
                        progress: c.progress || 0, 
                        totalTopics: 10,
                        completedTopics: Math.floor((c.progress || 0) / 10),
                        lastActive: new Date(c.updatedAt).toLocaleDateString(),
                        difficulty: c.difficulty,
                        thumbnail: c.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(c.title)}/800/450`,
                        description: c.description,
                        studyPlans: c.studyPlans
                      }} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 mb-8">
                  <p className="text-slate-500 mb-4">No saved courses yet.</p>
                  <Button onClick={() => navigate('/goal-input')}>Create Your First Course</Button>
                </div>
              )}

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
            <Link to="/courses" className="text-indigo-600 text-sm font-bold hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {allCourses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} variant="horizontal" />
            ))}
          </div>

          {/* Recommended for you */}
          <div className="pt-4">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {allCourses.slice(3, 5).map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Adaptive Path */}
          <Card variant="dark" className="p-8 relative overflow-hidden shadow-xl shadow-indigo-200 bg-indigo-600">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Adaptive Path</h3>
                <button 
                  onClick={handleRefreshPath}
                  disabled={isUpdating}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh Path"
                >
                  <RefreshCw size={18} className={cn(isUpdating && "animate-spin")} />
                </button>
              </div>
              <p className="text-indigo-100 text-sm mb-6">Based on your recent quiz, we've adjusted your curriculum.</p>
              
              <div className="space-y-4">
                {[
                  { label: 'Advanced Hooks', status: 'completed' },
                  { label: 'Performance Optimization', status: 'current' },
                  { label: 'Testing Strategies', status: 'upcoming' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                      step.status === 'completed' ? "bg-indigo-400 text-white" : 
                      step.status === 'current' ? "bg-white text-indigo-600" : "bg-indigo-500/50 text-indigo-200"
                    )}>
                      {step.status === 'completed' ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      step.status === 'upcoming' ? "text-indigo-300" : "text-white"
                    )}>{step.label}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-8 text-indigo-600 border-none hover:bg-indigo-50"
                rightIcon={<ArrowRight size={18} />}
                onClick={() => navigate('/learning-engine')}
              >
                Start Next Lesson
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
          </Card>

          {/* Leaderboard Mini */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" />
              Top Learners
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Ankur Raj', points: '12,450', rank: 1 },
                { name: 'Anmol Raj', points: '11,200', rank: 2, me: true },
                { name: 'Vaibhaw kumar', points: '10,800', rank: 3 },
                { name: 'Aman Kumar', points: '9,500', rank: 4 },
              ].map((user, i) => (
                <div key={i} className={cn(
                   "flex items-center justify-between p-3 rounded-2xl transition-colors",
                   user.me ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50"
                )}>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 text-center font-bold text-sm",
                      user.rank === 1 ? "text-yellow-500" : user.rank === 2 ? "text-slate-400" : user.rank === 3 ? "text-orange-400" : "text-slate-300"
                    )}>{user.rank}</span>
                    <img src={`https://picsum.photos/seed/${user.name}/100`} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    <span className={cn("text-sm font-semibold", user.me ? "text-indigo-600" : "text-slate-700")}>
                      {user.name} {user.me && "(You)"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{user.points} XP</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
