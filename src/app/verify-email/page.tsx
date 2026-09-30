'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { buildApiUrl, resolveMediaUrl } from '@/lib/utils/api';
import { useVilla } from '@/context/VillaContext';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const { villa } = useVilla();

  const regId = searchParams.get('reg_id') || '';
  const emailParam = searchParams.get('email') || '';
  const initialDevOtp = searchParams.get('dev_otp') || '';

  const [otp, setOtp] = useState(['', '', '', '']);
  const [devOtp, setDevOtp] = useState(initialDevOtp);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Hitung mundur kirim ulang OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus kotak pertama saat load / isi jika ada devOtp
  useEffect(() => {
    if (initialDevOtp && initialDevOtp.length === 4) {
      setOtp(initialDevOtp.split(''));
    } else {
      inputRefs.current[0]?.focus();
    }
  }, [initialDevOtp]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus ke kotak berikutnya
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newOtp = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setResendMessage('');

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Masukkan 4 digit kode OTP yang dikirim ke email Anda.');
      return;
    }

    if (!regId) {
      setError('Registration ID tidak ditemukan. Silakan lakukan pendaftaran ulang.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(buildApiUrl('/api/verify-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: Number(regId),
          otp: otpCode,
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

      if (data.success) {
        setSuccess(true);
        // Jika backend mengembalikan token & data user (auto-approve), langsung login
        if (data.token && data.user) {
          login(data.token, data.user);
        }

        setTimeout(() => {
          router.replace('/');
        }, 2200);
      } else {
        setError(data.message || 'Kode OTP tidak valid atau sudah kedaluwarsa.');
      }
    } catch (err) {
      console.error('Verify OTP network error:', err);
      setError('Gagal menghubungi server. Periksa server backend lokal aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading || !regId) return;

    setResendLoading(true);
    setError('');
    setResendMessage('');

    try {
      const res = await fetch(buildApiUrl('/api/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: Number(regId) }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Server returned non-JSON:', jsonErr);
        setError(`Respon server tidak berupa JSON (Status HTTP ${res.status}).`);
        return;
      }

      if (data.success) {
        setResendMessage('Kode OTP baru telah diproses.');
        setCountdown(60);
        setCanResend(false);
        if (data.debug_otp) {
          setDevOtp(data.debug_otp);
          setOtp(data.debug_otp.split(''));
        } else {
          setOtp(['', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      } else {
        setError(data.message || 'Gagal mengirim ulang OTP.');
      }
    } catch (err) {
      console.error('Resend OTP network error:', err);
      setError('Gagal mengirim ulang OTP. Periksa server backend lokal aktif.');
    } finally {
      setResendLoading(false);
    }
  };

  // WhatsApp admin contact for manual verification
  const rawPhone = (villa.phone || '').replace(/[^0-9]/g, '');
  const waPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : (rawPhone || '628164819298');
  const waHelpMessage = encodeURIComponent(
    `Halo Admin ${villa.name || 'Villa Casa Anandefa'}, saya mengalami kendala verifikasi email OTP untuk akun dengan email: ${emailParam}. Mohon bantuannya untuk verifikasi manual akun saya. Terima kasih.`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 via-sand-100 to-gold-50 flex items-center justify-center px-4 py-12">
      {/* Back button */}
      <Link
        href="/login"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm font-sans text-charcoal-800/60 hover:text-gold-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Login
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <img
              src={resolveMediaUrl(villa.logo_url)}
              alt={villa.name || 'Villa Casa Anandefa'}
              onError={(e) => {
                e.currentTarget.src = resolveMediaUrl('/villa-logo.png');
              }}
              className="w-16 h-16 mx-auto object-contain mb-3"
            />
          </Link>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-100 text-gold-700 mb-3 shadow-inner">
            <Mail size={26} />
          </div>
          <h1 className="font-serif text-2xl text-charcoal-900 tracking-wide">
            Verifikasi Email Anda
          </h1>
          <p className="font-sans text-xs sm:text-sm text-charcoal-800/60 mt-1 max-w-xs mx-auto">
            Masukkan 4 digit kode OTP yang telah kami kirimkan ke email:{' '}
            <strong className="text-charcoal-900 block mt-0.5">{emailParam || 'email Anda'}</strong>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-luxury p-8 border border-sand-200">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-serif text-xl font-bold text-charcoal-900">
                Verifikasi Berhasil!
              </h2>
              <p className="text-sm font-sans text-charcoal-800/70">
                Akun Anda telah diaktifkan. Mengarahkan Anda ke beranda...
              </p>
              <div className="w-8 h-8 border-3 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {devOtp && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800">Mode Pengembangan / Lokal</span>
                  </div>
                  <p className="text-amber-800 mb-1.5">
                    Kode OTP Anda: <strong className="px-2 py-0.5 rounded bg-amber-200/80 font-mono text-sm tracking-widest text-amber-950 font-bold">{devOtp}</strong>
                  </p>
                  <p className="text-[11px] text-amber-700/80 leading-normal">
                    Kode telah diisi otomatis. Anda dapat langsung mengklik tombol <strong>&quot;Verifikasi &amp; Masuk&quot;</strong> di bawah.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {resendMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-sans flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">✓</span>
                  <span>{resendMessage}</span>
                </div>
              )}

              {/* 4 Digit OTP Inputs */}
              <div>
                <label className="block text-center text-xs font-sans uppercase font-bold tracking-widest text-charcoal-800/70 mb-4">
                  Kode Verifikasi OTP
                </label>
                <div className="flex justify-center gap-3 sm:gap-4" onPaste={handlePaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-14 h-16 sm:w-16 sm:h-18 text-center text-2xl font-mono font-bold rounded-2xl border-2 border-sand-300 bg-sand-50/50 text-charcoal-900 focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-400/20 transition-all shadow-sm"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 4}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-sans font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verifikasi & Aktifkan</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center pt-2">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-gold-700 hover:text-gold-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                    <span>Kirim Ulang Kode OTP</span>
                  </button>
                ) : (
                  <p className="text-xs font-sans text-charcoal-800/50">
                    Kirim ulang kode dalam <span className="font-semibold text-charcoal-800">{countdown}s</span>
                  </p>
                )}
              </div>

              {/* Manual Admin Verification Helper */}
              <div className="pt-4 border-t border-sand-200">
                <div className="bg-sand-50 rounded-2xl p-4 border border-sand-200/80">
                  <p className="text-xs font-sans text-charcoal-800/70 mb-2">
                    <strong>Mengalami kendala menerima email OTP?</strong> Anda dapat langsung menghubungi Admin untuk verifikasi manual secara instan:
                  </p>
                  <a
                    href={`https://wa.me/${waPhone}?text=${waHelpMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold shadow-sm transition-all"
                  >
                    <MessageCircle size={15} />
                    <span>Verifikasi Manual via WhatsApp Admin</span>
                  </a>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-sans text-charcoal-800/40 mt-6">
          &copy; {new Date().getFullYear()} {villa.name || 'Villa Casa Anandefa'}. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-gold-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
