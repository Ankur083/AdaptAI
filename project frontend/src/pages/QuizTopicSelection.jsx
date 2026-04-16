import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Brain, 
  Code2, 
  Palette, 
  Database, 
  Globe, 
  Cpu,
  ChevronRight,
  Clock,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import api from '../api/axiosInstance';

const TOPICS = [
  {
    id: 'react',
    title: 'React Fundamentals',
    description: 'Hooks, Virtual DOM, and Component Lifecycle.',
    icon: Code2,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    questions: 15,
    time: '20 min',
    difficulty: 'Intermediate'
  },
  {
    id: 'js',
    title: 'Modern JavaScript',
    description: 'ES6+, Async/Await, and Closures.',
    icon: Globe,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    questions: 20,
    time: '25 min',
    difficulty: 'Advanced'
  },
  {
    id: 'design',
    title: 'UI Design Principles',
    description: 'Color theory, Typography, and Spacing.',
    icon: Palette,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    questions: 12,
    time: '15 min',
    difficulty: 'Beginner'
  },
  {
    id: 'db',
    title: 'Database Design',
    description: 'Normalization, SQL, and NoSQL patterns.',
    icon: Database,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    questions: 18,
    time: '22 min',
    difficulty: 'Intermediate'
  },
  {
    id: 'algo',
    title: 'Algorithms & DS',
    description: 'Sorting, Searching, and Big O notation.',
    icon: Brain,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    questions: 10,
    time: '30 min',
    difficulty: 'Advanced'
  },
  {
    id: 'sys',
    title: 'System Architecture',
    description: 'Microservices, Scalability, and Load Balancing.',
    icon: Cpu,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    questions: 15,
    time: '25 min',
    difficulty: 'Advanced'
  }
];

export default function QuizTopicSelection() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [customTopics, setCustomTopics] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await api.get('/user/courses');
        const courses = response.data?.data || response.data || [];
        const formattedTopics = courses.map(course => ({
          id: course._id,
          title: course.title,
          description: course.description || 'Custom course',
          courseId: course._id
        }));
        setCustomTopics(formattedTopics);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      }
    };
    fetchTopics();
  }, []);

  const allTopics = [
    ...TOPICS,
    ...customTopics.map(topic => ({
      ...topic,
      icon: Brain, // Default icon for AI suggested topics
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      isCustom: true
    }))
  ];

  const filteredTopics = allTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Knowledge Assessment</h1>
          <p className="text-slate-500 mt-1">Select a topic to test your skills and update your learning path.</p>
        </div>
        <div className="w-full sm:w-80">
          <Input 
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={20} />}
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic, i) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => topic.isCustom ? navigate(`/courses/${topic.id}`) : navigate('/pre-evaluation')}
            className="group cursor-pointer"
          >
            <Card className="p-8 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden h-full rounded-[32px]">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
                topic.bg,
                topic.color
              )}>
                <topic.icon size={28} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {topic.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                {topic.description}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-slate-400 mb-1">
                    <HelpCircle size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Items</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{topic.questions}</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-slate-400 mb-1">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Time</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{topic.time}</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-slate-400 mb-1">
                    <BarChart3 size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Level</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{topic.difficulty}</span>
                </div>
              </div>

              <div className="absolute top-8 right-8 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                <ChevronRight size={24} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTopics.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No topics found</h3>
          <p className="text-slate-500 mt-2">Try searching for something else like "React" or "Design".</p>
        </div>
      )}
    </div>
  );
}
