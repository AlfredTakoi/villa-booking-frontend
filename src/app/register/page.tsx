'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, ArrowLeft, ShieldCheck, Mail, Phone, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { buildApiUrl, resolveMediaUrl } from '@/lib/utils/api';
import { useVilla } from '@/context/VillaContext';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, initialize, isInitialized } = useAuthStore();
  const { villa } = useVilla();

  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!namaLengkap.trim() || namaLengkap.trim().length < 3) {
      errs.namaLengkap = 'Nama lengkap minimal 3 karakter.';
    }
    if (!username.trim() || username.trim().length < 4) {
      errs.username = 'Username minimal 4 karakter.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
      errs.username = 'Username hanya boleh huruf, angka, titik, strip, dan underscore.';
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = 'Format email tidak valid.';
    }
    if (!phone.trim() || phone.trim().length < 9) {
      errs.phone = 'Nomor WhatsApp / telepon minimal 9 digit.';
    }
    if (!password || password.length < 8) {
      errs.password = 'Password minimal 8 karakter.';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/.test(password)) {
      errs.password = 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus/simbol.';
    }
    if (password !== rePassword) {
      errs.rePassword = 'Konfirmasi password tidak sesuai.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(buildApiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_lengkap: namaLengkap.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
          re_password: rePassword,
          kategori_akses: 'tamu',
          tujuan_akses_lainnya: 'Reservasi Villa Casa Anandefa',
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Server returned non-JSON:', jsonErr);
        setError(`Respon server tidak berupa JSON (Status HTTP ${res.status}). Pastikan backend API aktif.`);
        return;
      }

      if (data.success && data.registration_id) {
        // Pendaftaran berhasil, arahkan ke verifikasi OTP email
        const otpQuery = data.debug_otp ? `&dev_otp=${encodeURIComponent(data.debug_otp)}` : '';
        router.push(
          `/verify-email?reg_id=${data.registration_id}&email=${encodeURIComponent(
            email.trim().toLowerCase()
          )}${otpQuery}`
        );
      } else if (data.code === 'EMAIL_PENDING_RECOVERY' && data.registration_id) {
        // Akun sudah pernah daftar tapi belum verifikasi OTP
        const otpQuery = data.debug_otp ? `&dev_otp=${encodeURIComponent(data.debug_otp)}` : '';
        router.push(
          `/verify-email?reg_id=${data.registration_id}&email=${encodeURIComponent(
            email.trim().toLowerCase()
          )}&recovered=1${otpQuery}`
        );
      } else {
        if (data.errors) {
          const fieldErrs: Record<string, string> = {};
          Object.keys(data.errors).forEach((key) => {
            fieldErrs[key] = Array.isArray(data.errors[key])
              ? data.errors[key][0]
              : data.errors[key];
          });
          setErrors(fieldErrs);
        }
        setError(data.message || 'Pendaftaran gagal. Silakan periksa formulir Anda.');
      }
    } catch (err) {
      console.error('Registration network error:', err);
      setError('Gagal menghubungi server. Pastikan koneksi internet atau server backend lokal aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-sand-100 to-gold-50 flex items-center justify-center px-4 py-12">
      {/* Tombol Kembali ke Beranda */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm font-sans text-charcoal-800/60 hover:text-gold-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-lg">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img
              src={resolveMediaUrl(villa.logo_url)}
              alt={villa.name || 'Villa Casa Anandefa'}
              onError={(e) => {
                e.currentTarget.src = resolveMediaUrl('/villa-logo.png');
              }}
              className="w-20 h-20 mx-auto object-contain mb-4"
            />
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-900 tracking-wide">
            Daftar Akun Tamu
          </h1>
          <p className="font-sans text-sm text-charcoal-800/60 mt-1">
            Buat akun untuk melakukan reservasi dan menikmati layanan eksklusif {villa.name || 'Villa Casa Anandefa'}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-3xl shadow-luxury p-8 sm:p-10 border border-sand-200">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-sans flex items-start gap-3">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                Nama Lengkap Sesuai KTP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => {
                    setNamaLengkap(e.target.value);
                    if (errors.namaLengkap) setErrors({ ...errors, namaLengkap: '' });
                  }}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-4 py-3 pl-11 rounded-xl border ${
                    errors.namaLengkap ? 'border-red-400 bg-red-50/20' : 'border-sand-300 bg-sand-50/50'
                  } text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all`}
                  disabled={isLoading}
                />
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
              </div>
              {errors.namaLengkap && <p className="text-xs text-red-500 font-sans mt-1">{errors.namaLengkap}</p>}
            </div>

            {/* Username & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                    if (errors.username) setErrors({ ...errors, username: '' });
                  }}
                  placeholder="budisantoso"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.username ? 'border-red-400 bg-red-50/20' : 'border-sand-300 bg-sand-50/50'
                  } text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all`}
                  disabled={isLoading}
                />
                {errors.username && <p className="text-xs text-red-500 font-sans mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Email Aktif <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="nama@email.com"
                    className={`w-full px-4 py-3 pl-10 rounded-xl border ${
                      errors.email ? 'border-red-400 bg-red-50/20' : 'border-sand-300 bg-sand-50/50'
                    } text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all`}
                    disabled={isLoading}
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-sans mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* No WhatsApp / Telepon */}
            <div>
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                Nomor WhatsApp / HP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="Contoh: 081234567890"
                  className={`w-full px-4 py-3 pl-11 rounded-xl border ${
                    errors.phone ? 'border-red-400 bg-red-50/20' : 'border-sand-300 bg-sand-50/50'
                  } text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all`}
                  disabled={isLoading}
                />
                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
              </div>
              <p className="text-[11px] text-charcoal-800/50 mt-1">Digunakan untuk konfirmasi pemesanan dan update status villa</p>
              {errors.phone && <p className="text-xs text-red-500 font-sans mt-1">{errors.phone}</p>}
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    placeholder="Min. 8 karakter"
                    className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                      errors.password ? 'border-red-400 bg-red-50/20' : 'border-sand-300 bg-sand-50/50'
                    } text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-800/40 hover:text-gold-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-charcoal-800/50 mt-1">Min. 8 karakter (huruf besar, kecil, angka, &amp; simbol)</p>
                {errors.password && <p className="text-xs text-red-500 font-sans mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Ulangi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRePassword ? 'text' : 'password'}
                    value={rePassword}
                    onChange={(e) => {
                      setRePassword(e.target.value);
                      if (errors.rePassword) setErrors({ ...errors, rePassword: '' });
                    }}
                    placeholder="Ketik ulang password"
                    className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                      errors.rePassword ? 'border-red-400 bg-red-50/20' : 'border-sand-300 bg-sand-50/50'
                    } text-charcoal-900 font-sans text-sm placeholder:text-charcoal-800/40 focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRePassword(!showRePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-800/40 hover:text-gold-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showRePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.rePassword && <p className="text-xs text-red-500 font-sans mt-1">{errors.rePassword}</p>}
              </div>
            </div>

            {/* Privacy notice */}
            <div className="flex items-center gap-2 pt-2 text-xs font-sans text-charcoal-800/60">
              <ShieldCheck size={16} className="text-gold-600 shrink-0" />
              <span>Kode OTP verifikasi akan dikirimkan ke email Anda untuk mengaktifkan akun secara otomatis.</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-sans font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-sand-300" />
            <span className="text-xs font-sans text-charcoal-800/40">sudah punya akun?</span>
            <div className="flex-1 h-px bg-sand-300" />
          </div>

          {/* Login Link */}
          <p className="text-center text-sm font-sans text-charcoal-800/60">
            Sudah terdaftar?{' '}
            <Link
              href="/login"
              className="text-gold-700 hover:text-gold-800 font-semibold transition-colors"
            >
              Masuk ke Akun
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
