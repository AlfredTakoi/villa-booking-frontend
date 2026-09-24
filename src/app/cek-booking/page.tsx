'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import { buildApiUrl } from '@/lib/utils/api';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ArrowRight,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Building,
  X,
  Loader2,
  CalendarDays,
} from 'lucide-react';
import { useVilla } from '@/context/VillaContext';

export default function CheckBookingPage() {
  const { villa } = useVilla();
  const [bookingCode, setBookingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Reschedule states & Smooth Animation
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [shouldRenderReschedule, setShouldRenderReschedule] = useState(false);
  const [isAnimatingReschedule, setIsAnimatingReschedule] = useState(false);

  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState('');
  const [dailyRates, setDailyRates] = useState<Record<string, any>>({});

  // Fetch availability and blocked dates for custom datepicker
  useEffect(() => {
    let isMounted = true;
    async function fetchAvailability() {
      try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const res = await fetch(buildApiUrl(`/api/villa/availability?start_date=${startOfMonth}`));
        const data = await res.json();
        if (isMounted && data.success && data.data?.daily_rates) {
          setDailyRates(data.data.daily_rates);
        }
      } catch (err) {
        console.error('Gagal memuat ketersediaan:', err);
      }
    }
    fetchAvailability();
    return () => {
      isMounted = false;
    };
  }, []);

  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const calculateCheckOut = (inDateStr: string, nights: number) => {
    if (!inDateStr || !nights) return '';
    const d = new Date(inDateStr + 'T00:00:00');
    d.setDate(d.getDate() + nights);
    return d.toISOString().split('T')[0];
  };

  const calculateCheckIn = (outDateStr: string, nights: number) => {
    if (!outDateStr || !nights) return '';
    const d = new Date(outDateStr + 'T00:00:00');
    d.setDate(d.getDate() - nights);
    return d.toISOString().split('T')[0];
  };

  // Adjust dailyRates for datepicker so current booking's dates are selectable
  const ratesForPicker = useMemo(() => {
    if (!dailyRates || !result?.check_in || !result?.check_out) return dailyRates;
    const adjusted = { ...dailyRates };
    const cur = new Date(result.check_in + 'T00:00:00');
    const end = new Date(result.check_out + 'T00:00:00');
    while (cur < end) {
      const dStr = cur.toISOString().split('T')[0];
      if (adjusted[dStr]) {
        adjusted[dStr] = { ...adjusted[dStr], is_blocked: false };
      }
      cur.setDate(cur.getDate() + 1);
    }
    return adjusted;
  }, [dailyRates, result?.check_in, result?.check_out]);

  // Fade In & Fade Out transition handlers
  useEffect(() => {
    if (isRescheduleOpen) {
      setShouldRenderReschedule(true);
      const timer = setTimeout(() => {
        setIsAnimatingReschedule(true);
      }, 20);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingReschedule(false);
      const timer = setTimeout(() => {
        setShouldRenderReschedule(false);
      }, 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isRescheduleOpen]);

  const triggerCloseReschedule = useCallback(() => {
    if (isSubmittingReschedule) return;
    setIsAnimatingReschedule(false);
    setTimeout(() => {
      setIsRescheduleOpen(false);
      setRescheduleError('');
      setRescheduleSuccess('');
    }, 300);
  }, [isSubmittingReschedule]);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRescheduleOpen) {
        triggerCloseReschedule();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRescheduleOpen, triggerCloseReschedule]);

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckIn) {
      setRescheduleError('Silakan pilih tanggal check-in baru.');
      return;
    }

    if (!newCheckOut) {
      setRescheduleError('Silakan pilih tanggal check-out baru.');
      return;
    }

    setIsSubmittingReschedule(true);
    setRescheduleError('');
    setRescheduleSuccess('');

    try {
      const res = await fetch(buildApiUrl('/api/bookings/reschedule'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          booking_code: result.booking_code,
          phone: phone || result.guest?.phone || '',
          new_check_in: newCheckIn,
          reason: rescheduleReason.trim() || 'Permintaan reschedule jadwal oleh tamu.',
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setRescheduleSuccess(resData.message || 'Jadwal reservasi berhasil di-reschedule.');
        setResult((prev: any) => ({
          ...prev,
          check_in: resData.data.check_in,
          check_out: resData.data.check_out,
          reschedule_info: resData.data.reschedule_info,
        }));
        setTimeout(() => {
          triggerCloseReschedule();
          setNewCheckIn('');
          setNewCheckOut('');
          setRescheduleReason('');
        }, 2200);
      } else {
        setRescheduleError(resData.message || 'Gagal mengajukan reschedule.');
      }
    } catch (err: any) {
      setRescheduleError('Terjadi kesalahan saat menghubungi server. Silakan coba lagi.');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const url = buildApiUrl(`/api/booking-status?code=${encodeURIComponent(bookingCode.trim())}${phone ? `&phone=${encodeURIComponent(phone.trim())}` : ''}`);
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.message || 'Kode booking tidak ditemukan.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Terkonfirmasi & Lunas
          </span>
        );
      case 'waiting_confirmation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Verifikasi Admin
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-200 text-gold-900">
            <Clock className="w-3.5 h-3.5 text-gold-700" />
            Menunggu Pembayaran
          </span>
        );
    }
  };

  return (
    <main className="min-h-screen bg-sand-50 pt-24 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 bg-gold-100 px-3 py-1 rounded-full">
            Status Reservasi
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-2 mb-3">
            Cek Status Pemesanan Villa
          </h1>
          <p className="text-sm text-charcoal-800/70 font-light">
            Masukkan kode reservasi yang Anda peroleh saat melakukan booking untuk melihat perkembangan status atau mengunduh invoice.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-luxury mb-10">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-2">
                Kode Reservasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                placeholder="Contoh: CA-20260914-XXXX"
                className="w-full bg-sand-50 border border-sand-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-charcoal-900 uppercase focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                required
              />
            </div>

            <div className="sm:col-span-6 flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-charcoal-900 hover:bg-charcoal-850 text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 text-gold-400" />
                    <span>Lacak Reservasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-3xl border border-sand-300 shadow-luxury overflow-hidden animate-fade-in">
            {/* Status Header */}
            <div className="p-6 sm:p-8 bg-sand-100 border-b border-sand-300 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-charcoal-800/60 uppercase font-semibold block mb-1">
                  KODE RESERVASI
                </span>
                <h3 className="font-mono text-2xl font-bold text-charcoal-900">
                  {result.booking_code}
                </h3>
              </div>
              <div>{getStatusBadge(result.status)}</div>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Timeline Progress */}
              <div className="border-b border-sand-200 pb-6">
                <span className="text-xs uppercase font-bold text-charcoal-800/70 tracking-wider block mb-4">
                  Tahapan Reservasi:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <span className="text-xs font-bold block">1. Booking Dibuat</span>
                    <span className="text-[10px] text-emerald-700">✓ Selesai</span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${result.status === 'pending_payment' ? 'bg-gold-100 text-gold-900 border-gold-300 font-bold' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                    <span className="text-xs font-bold block">2. Transfer Bank</span>
                    <span className="text-[10px]">{result.status === 'pending_payment' ? 'Menunggu' : '✓ Selesai'}</span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${result.status === 'waiting_confirmation' ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : (result.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-sand-50 text-charcoal-800/40 border-sand-200')}`}>
                    <span className="text-xs font-bold block">3. Verifikasi Admin</span>
                    <span className="text-[10px]">{result.status === 'waiting_confirmation' ? 'Diproses' : (result.status === 'confirmed' ? '✓ Selesai' : '-')}</span>
                  </div>
                  <div className={`p-3 rounded-2xl border ${result.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' : 'bg-sand-50 text-charcoal-800/40 border-sand-200'}`}>
                    <span className="text-xs font-bold block">4. Terkonfirmasi</span>
                    <span className="text-[10px]">{result.status === 'confirmed' ? '✓ Lunas' : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Data Inap & Tamu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gold-600 uppercase tracking-wider">
                    Detail Menginap
                  </h4>
                  <div className="text-sm space-y-1.5 text-charcoal-800/80">
                    <div>
                      <span className="text-charcoal-800/60">Check-in:</span>{' '}
                      <strong>{result.check_in} (14:00 WIB)</strong>
                    </div>
                    <div>
                      <span className="text-charcoal-800/60">Check-out:</span>{' '}
                      <strong>{result.check_out} (12:00 WIB)</strong>
                    </div>
                    <div>
                      <span className="text-charcoal-800/60">Durasi:</span>{' '}
                      <strong>{result.total_nights} Malam</strong>
                      {villa.allow_guest_selection && result.total_guests ? (
                        <> &bull; <strong>{result.total_guests} Tamu</strong></>
                      ) : null}
                    </div>
                    <div>
                      <span className="text-charcoal-800/60">Total Biaya:</span>{' '}
                      <strong className="text-success text-base">{result.total_price_formatted}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gold-600 uppercase tracking-wider">
                    Data Pemesan
                  </h4>
                  <div className="text-sm space-y-1.5 text-charcoal-800/80">
                    <div>
                      <span className="text-charcoal-800/60">Nama Tamu:</span>{' '}
                      <strong>{result.guest.name}</strong>
                    </div>
                    <div>
                      <span className="text-charcoal-800/60">Email:</span>{' '}
                      <span>{result.guest.email}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-800/60">WhatsApp:</span>{' '}
                      <span>{result.guest.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reschedule Information & Trigger */}
              {result.reschedule_info && (
                <div className="pt-2">
                  {result.reschedule_info.reschedule_count > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                        <CalendarDays className="w-4 h-4 text-amber-600" />
                        <span>Reservasi Ini Telah Pernah Di-reschedule</span>
                      </div>
                      <p>
                        Jadwal awal: <span className="font-semibold">{result.reschedule_info.original_check_in || '-'}</span> s/d{' '}
                        <span className="font-semibold">{result.reschedule_info.original_check_out || '-'}</span>.
                        Kuota reschedule maksimal 1x telah digunakan.
                      </p>
                    </div>
                  ) : (result.reschedule_info.eligible || result.reschedule_info.can_reschedule) ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
                          <CalendarDays className="w-4 h-4 text-emerald-600" />
                          <span>Fasilitas Reschedule Tanggal Tersedia</span>
                        </div>
                        <p className="text-emerald-700">
                          Anda masih memiliki kuota 1x reschedule karena jadwal check-in masih {result.reschedule_info.days_until_checkin ?? result.reschedule_info.days_before_checkin} hari lagi (minimal 10 hari sebelum check-in).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRescheduleOpen(true);
                          setNewCheckIn('');
                          setNewCheckOut('');
                          setRescheduleReason('');
                          setRescheduleError('');
                          setRescheduleSuccess('');
                        }}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow whitespace-nowrap flex items-center gap-1.5"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                        <span>Ajukan Reschedule</span>
                      </button>
                    </div>
                  ) : result.status !== 'rejected' && result.status !== 'cancelled' ? (
                    <div className="bg-sand-100 border border-sand-200 rounded-2xl p-4 text-xs text-charcoal-700">
                      <div className="font-bold flex items-center gap-1.5 mb-1 text-charcoal-800">
                        <CalendarDays className="w-4 h-4 text-sand-500" />
                        <span>Informasi Reschedule Jadwal</span>
                      </div>
                      <p>
                        {result.reschedule_info.reason_ineligible || 'Reschedule hanya dapat diajukan maksimal 10 hari sebelum tanggal check-in (H-10) dengan kuota 1x.'}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Action Buttons based on status */}
              <div className="pt-4 border-t border-sand-200 flex flex-wrap gap-4">
                {result.status === 'confirmed' && (
                  <a
                    href={`/api/invoices/download?code=${result.booking_code}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-850 text-white px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    <Download className="w-4 h-4 text-gold-400" />
                    <span>Unduh Dokumen Invoice (PDF)</span>
                  </a>
                )}

                {result.status === 'pending_payment' && (
                  <Link
                    href={`/booking?code=${result.booking_code}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-950 px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    <span>Lanjut ke Instruksi Pembayaran & Upload Bukti</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                {result.status === 'waiting_confirmation' && (
                  <Link
                    href={`/booking?code=${result.booking_code}`}
                    className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    <span>Lihat Bukti Transfer yang Telah Diunggah</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal with Smooth Fade In & Fade Out */}
      {shouldRenderReschedule && result && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-charcoal-950/80 backdrop-blur-md overflow-y-auto transition-opacity duration-300 ease-out ${
            isAnimatingReschedule ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={triggerCloseReschedule}
        >
          <div
            className={`relative w-full max-w-2xl bg-charcoal-950 text-white rounded-3xl shadow-2xl border border-white/15 p-6 sm:p-8 my-auto transition-all duration-300 ease-out transform max-h-[92vh] overflow-y-auto custom-scrollbar ${
              isAnimatingReschedule ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={triggerCloseReschedule}
              disabled={isSubmittingReschedule}
              className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Tutup popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400 block mb-0.5">
                  Reschedule Jadwal Menginap
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                  Pilih Tanggal Baru
                </h3>
                <p className="text-xs text-white/50 font-mono mt-0.5">
                  Kode: <strong className="text-gold-300">{result.booking_code}</strong>
                </p>
              </div>
            </div>

            {/* Rules Notice */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-xs text-white/70 space-y-1.5">
              <div className="font-bold text-gold-400 flex items-center gap-1.5 text-xs">
                <AlertCircle className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Ketentuan Resmi Reschedule Villa:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-white/80 pl-1 text-[11px] leading-relaxed">
                <li>Pengajuan maksimal <strong>10 hari sebelum tanggal check-in (H-10)</strong>.</li>
                <li>Setiap reservasi hanya memiliki kuota <strong>1x reschedule</strong>.</li>
                <li>Durasi menginap tetap <strong>{result.total_nights} malam</strong> (total tagihan &amp; DP tetap sah).</li>
                <li>Tanggal baru tidak boleh bentrok dengan reservasi tamu lain.</li>
              </ul>
            </div>

            {rescheduleSuccess ? (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-5 rounded-2xl text-center space-y-2 my-4 animate-fade-in">
                <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-white">{rescheduleSuccess}</p>
                <p className="text-xs text-emerald-300/80">Notifikasi jadwal baru sedang dikirimkan via WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                {rescheduleError && (
                  <div className="bg-red-500/15 border border-red-500/30 text-red-300 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                    <span>{rescheduleError}</span>
                  </div>
                )}

                {/* Current Schedule Pill */}
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white/70 flex flex-wrap items-center justify-between gap-1">
                  <span>Jadwal Saat Ini:</span>
                  <span className="font-medium text-white">
                    <strong className="text-gold-300">{result.check_in}</strong> s/d <strong className="text-gold-300">{result.check_out}</strong> ({result.total_nights} malam)
                  </span>
                </div>

                {/* Custom Date Pickers (Check-in & Check-out side by side like OnlineBookingModal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Check-in Baru */}
                  <div className="bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-gold-500/50 p-3 rounded-2xl transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                        Check-in Baru <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[10px] text-white/40">14:00 WIB</span>
                    </div>
                    <CustomDatePicker
                      value={newCheckIn}
                      minDate={getTomorrowString()}
                      onChange={(val) => {
                        setNewCheckIn(val);
                        if (result?.total_nights) {
                          setNewCheckOut(calculateCheckOut(val, result.total_nights));
                        }
                        setRescheduleError('');
                      }}
                      dailyRates={ratesForPicker}
                      placeholder="Pilih Tanggal"
                    />
                  </div>

                  {/* Check-out Baru */}
                  <div className="bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-gold-500/50 p-3 rounded-2xl transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                        Check-out Baru <span className="text-red-400">*</span>
                      </label>
                      <span className="text-[10px] text-white/40">12:00 WIB</span>
                    </div>
                    <CustomDatePicker
                      value={newCheckOut}
                      minDate={getTomorrowString()}
                      onChange={(val) => {
                        setNewCheckOut(val);
                        if (result?.total_nights) {
                          setNewCheckIn(calculateCheckIn(val, result.total_nights));
                        }
                        setRescheduleError('');
                      }}
                      dailyRates={ratesForPicker}
                      placeholder="Pilih Tanggal"
                    />
                  </div>
                </div>

                {/* Duration locked badge */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-gold-500/10 border border-gold-500/20 rounded-xl text-xs text-gold-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold-400" />
                    <span>Durasi Menginap Terkunci:</span>
                  </span>
                  <span className="text-white font-bold">{result.total_nights} Malam (Tarif Tetap Sah)</span>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                    Alasan Reschedule (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="Contoh: Ada keperluan keluarga mendadak / penyesuaian jadwal cuti"
                    className="w-full bg-white/5 border border-white/10 focus:border-gold-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={isSubmittingReschedule}
                    onClick={triggerCloseReschedule}
                    className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReschedule || !newCheckIn || !newCheckOut}
                    className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 disabled:opacity-50 text-charcoal-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmittingReschedule ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-charcoal-950" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <span>Konfirmasi Reschedule</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
