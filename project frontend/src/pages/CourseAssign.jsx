import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { MOCK_COURSES } from '../constants';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { CourseCard } from '../components/shared/CourseCard';
import api from '../api/axiosInstance';

export default function CourseAssign() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customTopics, setCustomTopics] = useState([]);
  const [dbCourses, setDbCourses] = useState([]);

  const categories = ['All', 'Development', 'Design', 'Business', 'Marketing', 'Data Science', 'AI Personalized','Programming', 'Computer Science'];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get('/user/courses');
        setDbCourses(response.data.data || []);
      } catch (error) {
        console.error('Failed to load database courses:', error);
      }
    };

    loadCourses();
  }, []);

  const allCourses = [
    ...dbCourses.map((course) => ({
      ...course,
      id: course._id,
      category: course.category || 'CS',
      instructor: course.instructor || 'AI Assistant',
      isCustom: true,
      thumbnail: course.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(course.title)}/800/450`,
      progress: course.progress || 0,
      difficulty: course.difficulty || 'Intermediate',
      questions: course.questions || 10,
      time: course.time || '20 min'
    }))
  ];

 const filteredCourses = allCourses.filter(course => {
  const title = (course.title || "").toLowerCase();
  const description = (course.description || "").toLowerCase();
  const query = searchQuery.toLowerCase();

  const matchesSearch =
    title.includes(query) || description.includes(query);

  const matchesCategory =
    selectedCategory === 'All' ||
    (course.category || "").toLowerCase() === selectedCategory.toLowerCase();

  return matchesSearch && matchesCategory;
});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Courses</h1>
          <p className="text-slate-500 mt-1">Discover your next learning adventure with our adaptive curriculum.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={20} />}
            className="sm:w-80 shadow-sm"
          />
          <Button variant="outline" className="p-3 shadow-sm" leftIcon={<Filter size={20} />} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border",
              selectedCategory === cat 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" 
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course, i) => {
          const content = <CourseCard course={course} variant="horizontal" index={i} />;

          return course.isCustom ? (
            <Link key={course.id} to={`/courses/${course.id}`} className="group block w-full">
              {content}
            </Link>
          ) : (
            <div key={course.id} className="w-full">{content}</div>
          );
        })}
      </div>

      {/* Load More or Empty State */}
      {filteredCourses.length === 0 && (
        <div className="py-20 text-center">
          <Card className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 border-none">
            <Search size={32} />
          </Card>
          <h3 className="text-xl font-bold text-slate-900">No courses found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
            className="mt-6 text-indigo-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
