import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  ChevronRight, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { generatePreEvalQuestions } from '../lib/gemini';
import api from '../api/axiosInstance';

export default function PreEvaluation() {
  const [questions, setQuestions] = React.useState([]);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [score, setScore] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState([]);
  const [evalResult, setEvalResult] = React.useState(null);
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFinished, setIsFinished] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchQuestions = async () => {
      const storedPlan = localStorage.getItem('currentStudyPlan');
      if (!storedPlan) {
        navigate('/goal-input');
        return;
      }
      const plan = JSON.parse(storedPlan);
      try {
        const q = await generatePreEvalQuestions(plan.topic);
        console.log(q);
        setQuestions(q.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [navigate]);

  const handleNext = async () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === questions[currentQuestion].correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);
    
    const newAnswers = [...userAnswers, {
      question: questions[currentQuestion],
      selectedOption,
      isCorrect
    }];
    setUserAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      setIsEvaluating(true);
      try {
        const storedPlan = JSON.parse(localStorage.getItem('currentStudyPlan'));
        const response = await api.post('/gemini/evaluate', {
          topic: storedPlan.topic || storedPlan.planTitle || storedPlan.title,
          originalPlan: storedPlan,
          answers: newAnswers
        });
        setEvalResult(response.data);
        localStorage.setItem('currentDifficulty', response.data.level);
        localStorage.setItem('currentTopicIndex', '0');
        
        // Update the plan with regenerated subTopics
        const updatedPlan = { ...storedPlan, subTopics: response.data.newPlan, difficulty: response.data.level };
        localStorage.setItem('currentStudyPlan', JSON.stringify(updatedPlan));
      } catch (e) {
        console.error(e);
        setSaveError('Failed to analyze evaluation results.');
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleSaveAndContinue = async () => {
    setSaveError('');
    setIsSaving(true);

    try {
      const storedPlan = localStorage.getItem('currentStudyPlan');
      if (!storedPlan) {
        throw new Error('No study plan loaded');
      }

      let plan = JSON.parse(storedPlan);
      let planId = plan._id || plan.id;
      const currentTopicIndex = parseInt(localStorage.getItem('currentTopicIndex') || '0', 10);
      const currentSubtopic = plan.subTopics?.[currentTopicIndex];
      const subtopicId = currentSubtopic?.subtopicId || currentSubtopic?.id;

      if (!subtopicId) {
        throw new Error('Cannot identify the current subtopic');
      }

      if (!planId) {
        const savedPlanResponse = await api.post('/gemini/study-plan', {
          goal: plan.topic || plan.planTitle || plan.title,
          courseId: plan.courseId,
          difficulty: plan.difficulty || localStorage.getItem('currentDifficulty') || 'Intermediate',
          persist: true
        });

        const savedPlan = savedPlanResponse.data;
        planId = savedPlan._id || savedPlan.id;
        plan = { ...plan, ...savedPlan, courseId: plan.courseId };
        localStorage.setItem('currentStudyPlan', JSON.stringify(plan));
      }

      await api.post(`/gemini/study-plan/${planId}/subtopic`, {
        subtopicId,
        status: 'in-progress'
      });

      const updatedPlan = {
        ...plan,
        subTopics: plan.subTopics.map((item, index) =>
          index === currentTopicIndex
            ? { ...item, status: 'in-progress' }
            : item
        )
      };
      localStorage.setItem('currentStudyPlan', JSON.stringify(updatedPlan));

      navigate('/learning-engine');
    } catch (error) {
      console.error(error);
      setSaveError(error?.response?.data?.error || error.message || 'Failed to save subtopic');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Generating your assessment...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div 
              key="eval"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-10 sm:p-16 rounded-[40px]">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                      <Brain size={24} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-900">Pre-Evaluation</h1>
                      <p className="text-slate-500 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
                    </div>
                  </div>
                  <div className="w-32">
                    <ProgressBar value={progress} />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-8 leading-tight">
                  {questions[currentQuestion].text}
                </h2>

                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(index)}
                      className={cn(
                        "w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group",
                        selectedOption === index 
                          ? "border-indigo-600 bg-indigo-50/50" 
                          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      <span className={cn(
                        "font-medium",
                        selectedOption === index ? "text-indigo-900" : "text-slate-600"
                      )}>{option}</span>
                      {selectedOption === index && (
                        <CheckCircle2 size={20} className="text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-12 flex justify-end">
                  <Button
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className="px-10"
                    icon={<ChevronRight size={20} />}
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-16 text-center rounded-[40px]">
                {isEvaluating ? (
                  <div className="py-12">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800">Analyzing Your Results...</h2>
                    <p className="text-slate-500 mt-2">Identifying weak areas and regenerating study plan.</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                      <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Assessment Complete</h1>
                    <p className="text-slate-500 text-lg mb-2">
                      Score: <span className="font-bold text-indigo-600">{evalResult?.score} / {evalResult?.total}</span>
                    </p>
                    <p className="text-slate-500 text-lg mb-4">
                      Assigned Level: <span className="font-bold text-indigo-600">{evalResult?.level}</span>
                    </p>
                    {evalResult?.weakTopics?.length > 0 && (
                      <div className="bg-red-50 text-red-700 p-4 rounded-2xl mb-8 text-left">
                        <h3 className="font-bold mb-2">Areas to Improve:</h3>
                        <ul className="list-disc list-inside pl-4">
                          {evalResult.weakTopics.map((wt, i) => (
                            <li key={i}>{wt}</li>
                          ))}
                        </ul>
                        <p className="text-sm mt-3 italic">Your study plan has been regenerated to focus more on these weak concepts.</p>
                      </div>
                    )}
                    {saveError && (
                      <p className="text-sm text-red-600 mb-4">{saveError}</p>
                    )}
                    <Button
                      onClick={handleSaveAndContinue}
                      disabled={isSaving}
                      icon={<ChevronRight size={20} />}
                      className="px-10"
                    >
                      {isSaving ? 'Saving...' : 'Save & Continue'}
                    </Button>
                  </>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
