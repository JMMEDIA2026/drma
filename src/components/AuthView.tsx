import React, { useState } from 'react';
import { Film, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthView: React.FC = () => {
  const { login, signup, authError } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setSubmitting(true);
    if (mode === 'login') {
      await login(email, password);
    } else {
      await signup(email, password, nickname);
    }
    setSubmitting(false);
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-[#101014] text-zinc-100 flex flex-col items-center justify-center px-6 py-10 font-sans">
      <div className="w-full max-w-sm space-y-7">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Film className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">DramaBox</h1>
            <p className="text-xs text-zinc-400 mt-1">최신 K-드라마 숏폼 스트리밍</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#1C1C24] rounded-full p-1">
          <button
            id="btn-auth-tab-login"
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
              mode === 'login' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            로그인
          </button>
          <button
            id="btn-auth-tab-signup"
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
              mode === 'signup' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="input-auth-nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#1C1C24] border border-white/10 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-rose-500 transition-colors"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              id="input-auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#1C1C24] border border-white/10 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-rose-500 transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              id="input-auth-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (8자 이상)"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#1C1C24] border border-white/10 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-rose-500 transition-colors"
              minLength={8}
              required
            />
            <button
              id="btn-auth-toggle-password"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {mode === 'signup' && (
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="input-auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 확인"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#1C1C24] border border-white/10 text-white text-sm placeholder:text-zinc-500 outline-none focus:border-rose-500 transition-colors"
                minLength={8}
                required
              />
            </div>
          )}

          {error && (
            <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all"
          >
            {submitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입 완료'}
          </button>
        </form>

        <p className="text-center text-[11px] text-zinc-500 leading-relaxed">
          가입 시 DramaBox 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
};
