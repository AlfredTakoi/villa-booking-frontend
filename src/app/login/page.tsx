'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { buildApiUrl, resolveMediaUrl } from '@/lib/utils/api';
import { useVilla } from '@/context/VillaContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, initialize, isInitialized } = useAuthStore();
  const { villa } = useVilla();

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identity.trim() || !password) {
      setError('Username/email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(buildApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identity.trim(), password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Server returned non-JSON:', jsonErr);
        setError(`Respon server tidak berupa JSON (Status HTTP ${res.status}). Pastikan backend API aktif.`);
        return;
      }

      if (data.success && data.token) {
        login(data.token, data.user);
        router.push('/');
      } else {
        setError(data.message || 'Login gagal. Periksa kembali username dan password Anda.');
      }
    } catch (err) {
      console.error('Login network error:', err);
      setError('Tidak dapat terhubung ke server. Pastikan server backend lokal aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-sand-100 to-gold-50 flex items-center justify-center px-4 py-12">
      {/* Back to home */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm font-sans text-charcoal-800/60 hover:text-gold-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src={resolveMediaUrl(villa.logo_url)}
              alt={villa.name || 'Villa Casa Anandefa'}
              className="w-20 h-20 mx-auto object-contain mb-4"
            />
          </Link>
          <h1 className="font-serif text-2xl text-charcoal-900 tracking-wide">
            Masuk ke Akun Anda
          </h1>
          <p className="font-sans text-sm text-charcoal-800/60 mt-1">
            {villa.name || 'Villa Casa Anandefa'} — Portal Tamu
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-luxury p-8 border border-sand-200">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-sans flex items-start gap-3">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username/Email */}
            <div>
              <label className="block text-sm font-sans font-semibold text-charcoal-800 mb-2">
                Username atau Email
              </label>
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full px-4 py-3 rounded-xl border border-sand-300 bg-sand-50/50 text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-sans font-semibold text-charcoal-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-sand-300 bg-sand-50/50 text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-800/40 hover:text-gold-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-sans font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-sand-300" />
            <span className="text-xs font-sans text-charcoal-800/40">atau</span>
            <div className="flex-1 h-px bg-sand-300" />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm font-sans text-charcoal-800/60">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-gold-700 hover:text-gold-800 font-semibold transition-colors"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-sans text-charcoal-800/40 mt-6">
          &copy; {new Date().getFullYear()} {villa.name || 'Villa Casa Anandefa'}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
