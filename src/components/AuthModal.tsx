'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, User, X, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, signUp, googleLogin, sanitizeError } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateEmail = (value: string) => emailPattern.test(value.trim());
  const validatePassword = (value: string) => value.length >= 6;
  const emailValid = validateEmail(email);
  const passwordValid = mode === 'forgot' ? true : validatePassword(password);
  const fullNameValid = mode === 'signup' ? fullName.trim().length > 0 : true;
  const canSubmit = emailValid && passwordValid && fullNameValid && !loading;

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailValid) {
      setEmailError('Enter a valid email address.');
      return;
    }

    if (mode !== 'forgot' && !passwordValid) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (mode === 'signup' && !fullNameValid) {
      setError('Full Name is required!');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
        handleClose();
      } else if (mode === 'signup') {
        await signUp(email, password, fullName);
        handleClose();
      } else {
        // Forgot password simulation
        setError('A secure reset link has been dispatched to your inbox.');
        setLoading(false);
        return;
      }
    } catch (err: Error | any) {
      setError(sanitizeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await googleLogin();
      handleClose();
    } catch (err: Error | any) {
      setError(sanitizeError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAuthModalOpen(false);
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setEmailError('');
    setPasswordError('');
    setEmailTouched(false);
    setPasswordTouched(false);
    setMode('signin');
  };
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative max-w-md w-full bg-[#F8F5F0] rounded-2xl border border-amber-100 shadow-2xl p-6 sm:p-8 overflow-hidden z-10"
        >
          {/* Accent golden bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#D4AF37]" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-display font-light tracking-wide text-[#1A1A1A] tracking-wider uppercase mb-1">
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-xs uppercase tracking-widest text-[#4B352A] font-medium italic">
              KAELORA Jewellery
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg flex items-start gap-2 text-xs mb-4 ${
              error.includes('dispatched') 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                : 'bg-red-50 text-red-800 border border-red-100'
            }`}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium tracking-wider text-[#4B352A] uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-amber-100 bg-white text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] transition-colors duration-200"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium tracking-wider text-[#4B352A] uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmail(value);
                    setEmailTouched(true);
                    setError('');

                    if (!value.trim()) {
                      setEmailError('Email is required.');
                    } else if (!validateEmail(value)) {
                      setEmailError('Enter a valid email address.');
                    } else {
                      setEmailError('');
                    }
                  }}
                  onBlur={() => setEmailTouched(true)}
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none transition-colors duration-200 ${
                    emailTouched && emailError
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-amber-100 focus:border-[#D4AF37]'
                  }`}
                />
              </div>
              {emailTouched && emailError && (
                <p className="text-xs text-red-700 mt-1">{emailError}</p>
              )}
            </div>

            {mode !== 'forgot' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium tracking-wider text-[#4B352A] uppercase">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-[#D4AF37] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      setPasswordTouched(true);
                      setError('');

                      if (!validatePassword(value)) {
                        setPasswordError('Password must be at least 6 characters');
                      } else {
                        setPasswordError('');
                      }
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none transition-colors duration-200 ${
                      passwordTouched && passwordError
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-amber-100 focus:border-[#D4AF37]'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
                {passwordTouched && passwordError && (
                  <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {passwordError}
                  </p>
                )}
              </div>
            )}

            {/* Premium CTA Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] active:scale-[0.98] text-[#EDE6DA] font-medium text-sm rounded-xl transition-transform duration-200 shadow-md flex items-center justify-center gap-1 group relative overflow-hidden disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-amber-100/40 border-t-[#EDE6DA] rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Password Reset'}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In (Divider & Google) */}
          {mode !== 'forgot' && (
            <div className="mt-5 flex flex-col gap-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-amber-100"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest">Or Continue With</span>
                <div className="flex-grow border-t border-amber-100"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-gray-50 active:scale-[0.98] border border-amber-100 text-[#1A1A1A] font-medium text-sm rounded-xl transition-transform duration-200 shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Mode Switcher Footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            {mode === 'signin' ? (
              <p>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setEmailError('');
                    setPasswordError('');
                    setEmailTouched(false);
                    setPasswordTouched(false);
                  }}
                  className="text-[#D4AF37] font-medium hover:underline"
                >
                  Sign Up
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setError('');
                    setEmailError('');
                    setPasswordError('');
                    setEmailTouched(false);
                    setPasswordTouched(false);
                  }}
                  className="text-[#D4AF37] font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Return to{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setError('');
                    setEmailError('');
                    setPasswordError('');
                    setEmailTouched(false);
                    setPasswordTouched(false);
                  }}
                  className="text-[#D4AF37] font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default AuthModal;
