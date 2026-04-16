import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthWrapper } from '../components/shared/AuthWrapper';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await api.post(`/user/reset-password/${token}`, { newPassword: password });
      if (res.status === 200) {
        setIsSuccess(true);
        toast.success('Password updated successfully');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthWrapper 
      title="Reset Password" 
      subtitle="Create a new secure password for your account"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={20} />}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            icon={<Lock size={20} />}
          />

          <Button 
            type="submit"
            className="w-full"
            disabled={isLoading}
            rightIcon={<ArrowRight size={20} />}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-emerald-700 font-bold text-lg">Password Updated!</p>
          <p className="text-slate-500 text-sm text-center">
            Your password has been successfully reset. Redirecting you to login...
          </p>
        </div>
      )}
    </AuthWrapper>
  );
}
