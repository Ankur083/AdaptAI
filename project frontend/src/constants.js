export const MOCK_USER = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'student',
  avatar: 'https://picsum.photos/seed/alex/200',
  stats: {
    coursesCompleted: 12,
    averageScore: 88,
    learningHours: 145,
    streak: 7
  }
};

export const MOCK_COURSES = [
  {
    id: 'c1',
    title: 'Advanced React Patterns',
    description: 'Master higher-order components, render props, and hooks for scalable applications.',
    instructor: 'Sarah Drasner',
    thumbnail: 'https://picsum.photos/seed/react/800/450',
    progress: 65,
    category: 'Development',
    difficulty: 'Advanced',
    modules: []
  },
  {
    id: 'c2',
    title: 'Data Structures & Algorithms',
    description: 'A comprehensive guide to solving complex problems efficiently.',
    instructor: 'Robert Martin',
    thumbnail: 'https://picsum.photos/seed/algo/800/450',
    progress: 30,
    category: 'Computer Science',
    difficulty: 'Intermediate',
    modules: []
  },
  {
    id: 'c3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of color, typography, and layout for modern web apps.',
    instructor: 'Gary Simon',
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    progress: 90,
    category: 'Design',
    difficulty: 'Beginner',
    modules: []
  }
];
