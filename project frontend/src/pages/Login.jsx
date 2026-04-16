import React from 'react';
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import { AuthWrapper } from '../components/shared/AuthWrapper';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from "../api/axiosInstance";
import { toast } from 'react-toastify'

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const response = await api.post(
        "/user/login",
        { email, password }
        // { withCredentials: true }
      );

      if (response.status === 200) {
        // Store the access token in localStorage or a secure cookie
        // localStorage.setItem("accessToken", response.data.data.accessToken);

        toast.success("Login successful");

        // Login successful, navigate to dashboard
        navigate('/dashboard');

      } else {

        // Handle login error (e.g., show error message)
        toast.error("Login failed:", response.data);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.response?.data?.message || error.message);
    }

  };

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       await api.get("/user/profile"); // protected route
  //       navigate("/dashboard");
  //     } catch (err) {
  //       // Not logged in → stay on login page
  //     }
  //   };

  //   checkAuth();
  // }, [navigate]);

  return (
    <AuthWrapper
      title="Welcome Back"
      subtitle="Continue your learning journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="alex@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={20} />}
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center ml-1">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <Link to="/forgot-password" size={20} className="text-xs font-medium text-indigo-600 hover:underline">Forgot password?</Link>
          </div>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={20} />}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="xl"
          rightIcon={<ArrowRight size={20} />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">Or continue with</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <Button variant="outline" className="rounded-2xl" leftIcon={<Chrome size={20} className="text-slate-600" />}>
          Google
        </Button>
        <Button variant="outline" className="rounded-2xl" leftIcon={<Github size={20} className="text-slate-600" />}>
          GitHub
        </Button>
      </div>

      <p className="mt-10 text-center text-slate-600 text-sm">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create Account</Link>
      </p>
    </AuthWrapper>
  );
}
