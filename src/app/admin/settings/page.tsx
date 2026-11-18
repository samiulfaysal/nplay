'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
  Activity,
  Save,
  RefreshCw,
  Database,
  Film,
  Server,
  AlertCircle,
  CheckCircle2,
  Users,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Active configurations
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Access Control & Admin credentials
  const [publicRegistration, setPublicRegistration] = useState(true);
  const [adminPassword, setAdminPassword] = useState('Admin@123456');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Multi-server streaming configurations
  const [serverVidsrc, setServerVidsrc] = useState('');
  const [serverAutoembed, setServerAutoembed] = useState('');
  const [serverTwoEmbed, setServerTwoEmbed] = useState('');
  const [serverCinejoy, setServerCinejoy] = useState('');
  const [serverFmovies, setServerFmovies] = useState('');
  const [serverNet77, setServerNet77] = useState('');
  const [serverFlixora, setServerFlixora] = useState('');

  // Visibility toggles
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showTmdbKey, setShowTmdbKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Connection test results
  const [testResult, setTestResult] = useState<{
    supabase?: { ok: boolean; latencyMs: number; message: string };
    tmdb?: { ok: boolean; latencyMs: number; message: string };
  } | null>(null);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSupabaseUrl(data.config?.supabaseUrl || '');
        setSupabaseAnonKey(data.config?.supabaseAnonKey || '');
        setTmdbApiKey(data.config?.tmdbApiKey || '');
        setAdminEmail(data.config?.adminEmail || '');
        setPublicRegistration(data.config?.publicRegistration !== false);
        if (data.config?.adminPassword) {
          setAdminPassword(data.config.adminPassword);
        }
        setServerVidsrc(data.config?.serverVidsrc || 'https://vidsrc.to/embed/{type}/{tmdbId}');
        setServerAutoembed(data.config?.serverAutoembed || 'https://multiembed.mov/?video_id={tmdbId}&tmdb=1');
        setServerTwoEmbed(data.config?.serverTwoEmbed || 'https://www.2embed.cc/embed/{tmdbId}');
        setServerCinejoy(data.config?.serverCinejoy || 'https://vidsrc.me/embed/{type}?tmdb={tmdbId}');
        setServerFmovies(data.config?.serverFmovies || 'https://autoembed.co/{type}/tmdb/{tmdbId}');
        setServerNet77(data.config?.serverNet77 || 'https://vidsrc.xyz/embed/{type}?tmdb={tmdbId}');
        setServerFlixora(data.config?.serverFlixora || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run live connection test
  const handleTestConnections = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/test-connections');
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Failed to complete connection ping test.',
      });
    } finally {
      setTesting(false);
    }
  };

  // Save runtime override to Supabase site_settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl,
          supabaseAnonKey,
          tmdbApiKey,
          adminEmail,
          publicRegistration,
          serverVidsrc,
          serverAutoembed,
          serverTwoEmbed,
          serverCinejoy,
          serverFmovies,
          serverNet77,
          serverFlixora,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          text: 'Configuration successfully saved and applied across the platform!',
        });
        if (data.config) {
          setPublicRegistration(data.config.publicRegistration !== false);
        }
        // Automatically re-test connections with the new keys
        handleTestConnections();
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Error saving settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            API & Credentials Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Inspect, override, and test Supabase & TMDB API keys in real time.
          </p>
        </div>

        <button
          onClick={handleTestConnections}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
        >
          {testing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Activity className="w-4 h-4" />
          )}
          <span>{testing ? 'Pinging Services...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border border-red-500/30 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Connection Test Results Banner */}
      {testResult && (
        <div className="p-5 rounded-2xl glass-panel grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white/10">
          {/* Supabase Ping */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Supabase Database Ping</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  testResult.supabase?.ok
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {testResult.supabase?.ok ? 'Connected' : 'Error'}
              </span>
            </div>
            <div className="text-xs text-gray-200">
              {testResult.supabase?.message}
            </div>
          </div>

          {/* TMDB Ping */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-red-400" />
                <span>TMDB Metadata Ping</span>
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  testResult.tmdb?.ok
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {testResult.tmdb?.ok ? 'Active' : 'Missing / Invalid'}
              </span>
            </div>
            <div className="text-xs text-gray-200">
              {testResult.tmdb?.message}
            </div>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* User Registration & Access Control */}
        <div className="p-6 rounded-2xl glass-panel space-y-5 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-base font-bold text-white">
                  User Registration & Access Control
                </h2>
                <p className="text-xs text-gray-400">
                  Control whether public visitors can create new user accounts on your platform.
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                publicRegistration
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  publicRegistration ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{publicRegistration ? 'Registration Open' : 'Registration Closed'}</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
            <div className="space-y-1">
              <div className="text-sm font-bold text-gray-200 flex items-center gap-2">
                {publicRegistration ? (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <UserX className="w-4 h-4 text-red-400" />
                )}
                <span>Allow Public Registrations (/auth)</span>
              </div>
              <p className="text-xs text-gray-400 max-w-xl">
                {publicRegistration
                  ? 'Active: Anyone can register an account, bookmark content, and track their watch history.'
                  : 'Closed: Registration is blocked on /auth. Only existing users and administrators can sign in.'}
              </p>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={publicRegistration}
              onClick={() => setPublicRegistration(!publicRegistration)}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                publicRegistration ? 'bg-emerald-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  publicRegistration ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Master Administrator Credentials Card */}
        <div className="p-6 rounded-2xl glass-panel space-y-5 border border-red-500/20 bg-gradient-to-b from-red-950/20 to-black/40">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <h2 className="text-base font-bold text-white">
                  Master Administrator Credentials
                </h2>
                <p className="text-xs text-gray-400">
                  Use these credentials to sign in and access the Admin Console from any device.
                </p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-600/20 text-red-400 border border-red-500/30">
              Master Root
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admin Username / Email */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">
                  Admin Username / Email
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(adminEmail || 'admin@nplay.tv', 'adminEmail')}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                >
                  {copiedKey === 'adminEmail' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'adminEmail' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-sm font-bold text-gray-100 select-all">
                {adminEmail || 'admin@nplay.tv'}
              </div>
            </div>

            {/* Admin Password */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">
                  Admin Password
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    {showAdminPass ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>{showAdminPass ? 'Mask' : 'Reveal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(adminPassword, 'adminPass')}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'adminPass' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'adminPass' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="font-mono text-sm font-bold text-gray-100 select-all">
                {showAdminPass ? adminPassword : '••••••••••••'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span>
              Sign in at: <code className="text-red-400 font-mono">/auth</code>
            </span>
            <a
              href="/auth"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold"
            >
              <span>Test Sign In Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Section 1: Supabase Credentials */}
        <div className="p-6 rounded-2xl glass-panel space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Database className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Supabase PostgreSQL & Auth Credentials
            </h2>
          </div>

          <div className="space-y-4">
            {/* Supabase URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                NEXT_PUBLIC_SUPABASE_URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Supabase Anon Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY / PUBLISHABLE_KEY
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAnonKey(!showAnonKey)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    {showAnonKey ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>{showAnonKey ? 'Mask' : 'Reveal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(supabaseAnonKey, 'anon')}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'anon' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'anon' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showAnonKey ? 'text' : 'password'}
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: TMDB Credentials */}
        <div className="p-6 rounded-2xl glass-panel space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Film className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-white">
              The Movie Database (TMDB) API Key
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-300">
                  NEXT_PUBLIC_TMDB_API_KEY
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTmdbKey(!showTmdbKey)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    {showTmdbKey ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    <span>{showTmdbKey ? 'Mask' : 'Reveal'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(tmdbApiKey, 'tmdb')}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'tmdb' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'tmdb' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <input
                type={showTmdbKey ? 'text' : 'password'}
                value={tmdbApiKey}
                onChange={(e) => setTmdbApiKey(e.target.value)}
                placeholder="Paste your 32-character TMDB v3 API key..."
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>

            {/* Admin Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                ADMIN_EMAIL (Master Controller Account)
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all"
              />
              <p className="text-[11px] text-gray-500">
                Any user authenticated with this email address automatically possesses full administrator privileges.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Multi-Server Streaming Architecture */}
        <div className="p-6 rounded-2xl glass-panel space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Server className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Multi-Server Streaming Architecture (VidSrc, AutoEmbed, 2Embed, Cinejoy, FMovies, Net77, Direct HLS)
            </h2>
          </div>

          <div className="space-y-4">
            {/* Server 1: VidSrc HD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Server 1: VidSrc HD URL Template</span>
                <span className="text-[10px] text-emerald-400 font-mono">VidSrc Cloud Core</span>
              </label>
              <input
                type="text"
                value={serverVidsrc}
                onChange={(e) => setServerVidsrc(e.target.value)}
                placeholder="https://vidsrc.to/embed/{type}/{tmdbId}"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
              <p className="text-[11px] text-gray-500">
                Tokens: <code className="text-red-400">{"{type}"}</code>, <code className="text-red-400">{"{tmdbId}"}</code>, <code className="text-red-400">{"{season}"}</code>, <code className="text-red-400">{"{episode}"}</code>
              </p>
            </div>

            {/* Server 2: AutoEmbed VIP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Server 2: AutoEmbed VIP URL Template</span>
                <span className="text-[10px] text-amber-400 font-mono">MultiEmbed VIP</span>
              </label>
              <input
                type="text"
                value={serverAutoembed}
                onChange={(e) => setServerAutoembed(e.target.value)}
                placeholder="https://multiembed.mov/?video_id={tmdbId}&tmdb=1"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>

            {/* Server 3: 2Embed Mirror */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Server 3: 2Embed Mirror URL Template</span>
                <span className="text-[10px] text-cyan-400 font-mono">2Embed CC Mirror</span>
              </label>
              <input
                type="text"
                value={serverTwoEmbed}
                onChange={(e) => setServerTwoEmbed(e.target.value)}
                placeholder="https://www.2embed.cc/embed/{tmdbId}"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>

            {/* Server 4: Cinejoy 4K */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Server 4: Cinejoy 4K Auto-Stream URL Template</span>
                <span className="text-[10px] text-blue-400 font-mono">Cinejoy Ultra HD</span>
              </label>
              <input
                type="text"
                value={serverCinejoy}
                onChange={(e) => setServerCinejoy(e.target.value)}
                placeholder="https://vidsrc.me/embed/{type}?tmdb={tmdbId}"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>

            {/* Server 5: FMovies HD */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Server 5: FMovies HD URL Template</span>
                <span className="text-[10px] text-purple-400 font-mono">FMovies AutoEmbed</span>
              </label>
              <input
                type="text"
                value={serverFmovies}
                onChange={(e) => setServerFmovies(e.target.value)}
                placeholder="https://autoembed.co/{type}/tmdb/{tmdbId}"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>

            {/* Server 6: Net77 Fast */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Server 6: Net77 Fast Cloud Player URL Template</span>
                <span className="text-[10px] text-pink-400 font-mono">Net77 High-Speed</span>
              </label>
              <input
                type="text"
                value={serverNet77}
                onChange={(e) => setServerNet77(e.target.value)}
                placeholder="https://vidsrc.xyz/embed/{type}?tmdb={tmdbId}"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>

            {/* Direct Fast HLS / Flixora Core */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Direct Fast HLS / Flixora Direct Extractor Stream (HLS .m3u8)</span>
                <span className="text-[10px] text-rose-400 font-mono">Ad-Free HLS Core</span>
              </label>
              <input
                type="text"
                value={serverFlixora}
                onChange={(e) => setServerFlixora(e.target.value)}
                placeholder="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-red-600/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving to Database...' : 'Save Configuration Override'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
