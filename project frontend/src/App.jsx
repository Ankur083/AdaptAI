
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoalInput from './pages/GoalInput';
import StudyPlan from './pages/StudyPlan';
import PreEvaluation from './pages/PreEvaluation';
import LearningEngine from './pages/LearningEngine';
import Dashboard from './pages/Dashboard';
import CourseAssign from './pages/CourseAssign';
import CourseDetail from './pages/CourseDetail';
import QuizTopicSelection from './pages/QuizTopicSelection';
import Quiz from './pages/Quiz';
import FinalQuiz from './pages/FinalQuiz';
import Profile from './pages/Profile';
import Result from './pages/Result';
import Progress from './pages/Progress';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/goal-input" element={<ProtectedRoute><GoalInput /></ProtectedRoute>} />
            <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
            <Route path="/pre-evaluation" element={<ProtectedRoute><PreEvaluation /></ProtectedRoute>} />
            <Route path="/learning-engine" element={<ProtectedRoute><LearningEngine /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CourseAssign /></ProtectedRoute>} />
            <Route path="/courses/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/quiz-topics" element={<ProtectedRoute><QuizTopicSelection /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/final-quiz" element={<ProtectedRoute><FinalQuiz /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </Router>
    </>

  );
}
