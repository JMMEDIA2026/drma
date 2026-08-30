import React, { useState } from 'react';
import { Film, Mail, Lock, User, Eye, EyeOff, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthView: React.FC = () => {
  const { login, signup, authError, t, setLanguageModalOpen } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('dramabox_saved_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(() => {
    try {
      return localStorage.getItem('dramabox_auto_login') !== 'false';
    } catch {
      return true;
    }
  });
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
      await login(email, password, autoLogin);
    } else {
      await signup(email, password, nickname);
    }
    setSubmitting(false);
  };

  const error = localError || authError;

  return (
    <div className="text-zinc-100 px-6 py-8 font-sans relative">
      <button
        id="btn-auth-language"
        onClick={() => setLanguageModalOpen(true)}
        className="absolute top-3.5 right-3.5 p-2 rounded-full bg-[#1C1C24] hover:bg-[#23232D] border border-white/10 text-zinc-300 transition-colors"
        title={t('common_language')}
      >
        <Globe className="w-4 h-4" />
      </button>

      <div className="w-full space-y-6 pt-2">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Film className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{t('auth_title')}</h1>
            <p className="text-xs text-zinc-400 mt-1">{t('auth_subtitle')}</p>
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
            {t('auth_login')}
          </button>
          <button
            id="btn-auth-tab-signup"
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${
              mode === 'signup' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t('auth_signup')}
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
                placeholder={t('auth_nickname')}
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
              placeholder={t('auth_email')}
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
              placeholder={t('auth_password')}
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

          {mode === 'login' && (
            <label
              id="label-auth-auto-login"
              htmlFor="input-auth-auto-login"
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <input
                id="input-auth-auto-login"
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-[#1C1C24] text-rose-600 accent-rose-600 cursor-pointer"
              />
              <span className="text-xs text-zinc-400">{t('auth_auto_login')}</span>
            </label>
          )}

          {mode === 'signup' && (
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="input-auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth_confirm_password')}
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
            {submitting ? t('auth_processing') : mode === 'login' ? t('auth_login_button') : t('auth_signup_button')}
          </button>
        </form>

        <p className="text-center text-[11px] text-zinc-500 leading-relaxed">
          {t('auth_terms')}
        </p>
      </div>
    </div>
  );
};
