import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { AuthWrapper } from '../components/shared/AuthWrapper';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/user/forgot-password', { email });
      if (res.status === 200) {
        setIsSubmitted(true);
        toast.success(res.data.message || 'Reset link sent successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper 
      title="Forgot Password" 
      subtitle={isSubmitted 
        ? "Check your email for reset instructions" 
        : "Enter your email to receive a reset link"}
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            icon={<Mail size={20} />}
          />

          <Button 
            type="submit"
            className="w-full"
            disabled={isLoading}
            rightIcon={<ArrowRight size={20} />}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm text-center">
            We've sent a password reset link to your email address. Please check your inbox and spam folder.
          </div>
          <Button 
            variant="secondary"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link to="/login" className="text-slate-500 text-sm font-bold hover:text-indigo-600 flex items-center justify-center gap-2 transition-colors">
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    </AuthWrapper>
  );
}
