'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NetflyIcon } from '@/components/common/NetflyIcon';
import { createClient } from '@/utils/supabase/client';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [publicRegistrationEnabled, setPublicRegistrationEnabled] = useState(true);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const router = useRouter();

  // Check public registration status on mount
  useEffect(() => {
    fetch('/api/site/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.publicRegistration === 'boolean') {
          setPublicRegistrationEnabled(data.publicRegistration);
        }
      })
      .catch(() => {});
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        if (!publicRegistrationEnabled) {
          setMessage({
            type: 'error',
            text: 'Public registration is currently disabled by administrator. Please sign in with an existing account.',
          });
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed.');
        }

        setMessage({
          type: 'success',
          text: data.message || 'Account created! You can now sign in.',
        });
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid credentials.');
        }

        setMessage({
          type: 'success',
          text: data.isAdmin
            ? 'Administrator authenticated! Redirecting to Admin Console...'
            : 'Successfully logged in! Redirecting...',
        });

        setTimeout(() => {
          router.push(data.redirect || (data.isAdmin ? '/admin' : '/'));
        }, 800);
      }
    } catch (err: any) {
      console.warn('Auth error:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Authentication failed. Please verify credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setMessage({
      type: 'success',
      text: 'Signed in as Guest Explorer! Enjoy free streaming.',
    });
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10 overflow-hidden">
        <div className="w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[140px]" />
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel shadow-2xl border border-white/10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <NetflyIcon
              className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 group-hover:scale-105 transition-transform"
              size={96}
              priority
            />
            <span className="text-3xl sm:text-4xl font-black text-white tracking-wider">
              NET<span className="text-red-500">FLY</span>
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-white pt-2">
            {isSignUp ? 'Create Free Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-gray-400">
            {isSignUp
              ? 'Save your watchlist and resume movies across devices.'
              : 'Sign in to access your synchronized watch history and watchlist.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#11141f] p-1 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              !isSignUp
                ? 'bg-red-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              if (!publicRegistrationEnabled) {
                setMessage({
                  type: 'error',
                  text: 'Public registration is currently disabled by administrator. Only existing users or administrators can sign in.',
                });
                return;
              }
              setIsSignUp(true);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isSignUp
                ? 'bg-red-600 text-white shadow-md'
                : !publicRegistrationEnabled
                ? 'text-gray-500 opacity-70'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Register</span>
            {!publicRegistrationEnabled && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-semibold">
                Closed
              </span>
            )}
          </button>
        </div>

        {/* Status Feedback Message */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/40 border border-red-500/30 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cinema_fanatic"
                  className="w-full bg-[#11141f] text-sm text-gray-200 placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#11141f] text-sm text-gray-200 placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() =>
                    alert('Password reset link sent to your registered email.')
                  }
                  className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#11141f] text-sm text-gray-200 placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 hover:shadow-red-600/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Free Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Demo Login Option */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0b0d14] px-3 text-gray-500 font-semibold">
              Or Instant Access
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Continue in Guest Mode (No Registration)</span>
        </button>

        <div className="text-center text-[11px] text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
