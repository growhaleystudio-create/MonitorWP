import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token } = response.data;
      onLogin(token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f3f7f9] p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100/80 rounded p-8 md:p-10 shadow-lg relative z-10">
        {/* Logo / Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <img src="/logo.svg" className="h-10 w-10 mb-2 shrink-0" alt="Growhaley Logo" />
          <h1 className="font-bold text-[20px] tracking-tight text-slate-900 leading-none">
            Growhaley
          </h1>
          <span className="text-[10px] font-semibold text-primary-teal uppercase tracking-widest mt-1.5 block">
            WP Monitoring
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-coral/10 border border-coral/20 text-coral-dark flex items-start gap-3 text-xs font-semibold shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full !pl-11 clean-input"
                placeholder="Enter admin username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full !pl-11 clean-input"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-teal w-full mt-3 h-11 flex items-center justify-center font-semibold"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-semibold tracking-wider uppercase text-slate-400">
          CMS Scoring & Monitoring System
        </div>
      </div>
    </div>
  );
}

export default Login;
