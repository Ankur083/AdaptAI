import React from 'react';
import { useState,useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { AuthWrapper } from '../components/shared/AuthWrapper';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';


export default function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        return;
      }

      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatar) {
      toast.error("Please upload avatar");
      return;
    }

    setLoading(true);
    try {

      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("avatar", avatar);


      const response = await api.post(
        "/user/register",
        formData
        // { withCredentials: true }
      );

      if (response.status === 201) {
        // Store the access token in localStorage or a secure cookie
        // localStorage.setItem("accessToken", response.data.data.accessToken);

        // Login successful, navigate to dashboard
        toast.success("Registration successful");
        
        await api.get("/user/profile");// to verify authentication and fetch user data
        navigate('/dashboard');

      } else {

        // Handle login error (e.g., show error message)
        toast.error("Registration failed:", response.data);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Join Us"
      subtitle="Start your personalized learning path"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          required
          placeholder="Alex Johnson"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={20} />}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="alex@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={20} />}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={20} />}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />

          {/* Preview */}
          {preview && (
            <div className="mt-3">
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border"
              />
            </div>
          )}

          {/* File Name */}
          {avatar && (
            <p className="text-sm text-green-600 mt-1">
              Selected: {avatar.name}
            </p>
          )}
        </div>


        <Button
          type="submit"
          className="w-full mt-2"
          size="xl"
          rightIcon={<ArrowRight size={20} />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">Or register with</span>
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
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign In</Link>
      </p>
    </AuthWrapper>
  );
}
