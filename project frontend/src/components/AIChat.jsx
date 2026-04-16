import React from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Plus, 
  CheckCircle2,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { GoogleGenAI } from "@google/genai";
import api from '../api/axiosInstance';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: "AIzaSyCpXSiv1Srly2Z2gKCeBnIz0PHa9QPka0g" });

export default function AIChat({ isOpen, onClose, onCourseAdded }) {
  const [messages, setMessages] = React.useState([
    { role: 'ai', content: "Hi! I'm your AI Learning Assistant. What would you like to learn today? I can suggest new topics and add them to your quiz list!" }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `The user says: "${userMessage}". 
            If the user is asking to learn something new or for course recommendations, provide 1-2 specific course suggestions in a JSON format within your response.
            The JSON should be an array of objects with: title, description, questions (number), time (string like "20 min"), difficulty (Beginner/Intermediate/Advanced).
            Also provide a friendly text response.
            Format your response like this:
            [TEXT RESPONSE]
            ---
            [JSON SUGGESTIONS]
            ` }]
          }
        ],
        config: {
          systemInstruction: "You are a helpful AI learning assistant. You suggest courses and topics to users. When suggesting, always provide a JSON block after a '---' separator."
        }
      });

      const fullText = response.text;
      const [textPart, jsonPart] = fullText.split('---');
      
      let suggestions = [];
      if (jsonPart) {
        try {
          const cleanedJson = jsonPart.replace(/```json|```/g, '').trim();
          suggestions = JSON.parse(cleanedJson);
        } catch (e) {
          console.error("Failed to parse suggestions", e);
        }
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: textPart.trim(),
        suggestions: suggestions
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addCourse = async (course) => {
    const stored = localStorage.getItem('customTopics');
    const customTopics = stored ? JSON.parse(stored) : [];
    
    // Check if already exists
    if (customTopics.find(t => t.title === course.title)) return;

    const newTopic = {
      ...course,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true
    };

    const updatedTopics = [...customTopics, newTopic];
    localStorage.setItem('customTopics', JSON.stringify(updatedTopics));
    
    try {
      await api.post('/user/courses', {
        title: course.title,
        level: course.difficulty || 'Intermediate'
      });
    } catch (error) {
      if (error?.response?.status !== 409) {
        console.error('Failed to save custom course:', error);
      }
    }

    if (onCourseAdded) {
      onCourseAdded(updatedTopics.length);
    }

    setMessages(prev => [...prev, { 
      role: 'ai', 
      content: `Awesome! I've added "${course.title}" to your Knowledge Assessment topics. You can find it there now!` 
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl h-[600px] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">AI Learning Assistant</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-indigo-100">Online & Ready</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
        >
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-4",
              msg.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'ai' ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
              )}>
                {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="space-y-3 max-w-[80%]">
                <div className={cn(
                  "p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                  msg.role === 'ai' ? "bg-white text-slate-700 rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none"
                )}>
                  {msg.content}
                </div>
                
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    {msg.suggestions.map((course, idx) => (
                      <Card key={idx} className="p-4 border-indigo-100 bg-white hover:border-indigo-300 transition-all group">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{course.description}</p>
                            <div className="flex gap-3 mt-3">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.time}</span>
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{course.difficulty}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="rounded-xl h-10 w-10 p-0 shrink-0 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                            onClick={() => addCourse(course)}
                          >
                            <Plus size={20} />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Bot size={20} />
              </div>
              <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-sm font-medium text-slate-500">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to learn something new..."
              className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-[24px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
