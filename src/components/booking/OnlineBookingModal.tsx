'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Users,
  ArrowRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Clock,
} from 'lucide-react';
import { useVilla } from '@/context/VillaContext';
import CustomSelect from '@/components/ui/CustomSelect';
import { buildApiUrl } from '@/lib/utils/api';

function formatRupiah(amount: number | string): string {
  const num = Math.round(Number(amount) || 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

interface DailyRate {
  date: string;
  day: number;
  price: number;
  formatted_price: string;
  short_price: string;
  rule: string;
  is_weekend: boolean;
  is_blocked: boolean;
  block_type: 'booking' | 'manual' | null;
  block_reason: string | null;  // e.g. 'Sudah Dipesan (Terkonfirmasi)', 'Perawatan / Renovasi'
  block_notes: string | null;   // e.g. 'Tamu: Alfred G. Takoi'
  is_best_price: boolean;
  min_stay: number;
}

interface OnlineBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string;
}

const MONTH_NAMES_ID = [
  'JANUARI', 'FEBRUARY', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

const DAY_NAMES_ID = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

export default function OnlineBookingModal({
  isOpen,
  onClose,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: OnlineBookingModalProps) {
  const router = useRouter();
  const { villa } = useVilla();
  const maxGuests = villa.max_guests || 6;
  const allowGuestSelection = Boolean(villa.allow_guest_selection);

  // Animation States for Smooth Fade In & Fade Out
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Selected state
  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn || null);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut || null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Form fields
  const [adults, setAdults] = useState<number>(initialGuests ? Math.min(maxGuests, Math.max(1, Number(initialGuests) || 2)) : 2);
  const [children, setChildren] = useState<number>(0);

  // Data Kontak Pemesan & Keperluan
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [eventType, setEventType] = useState<string>('Acara Keluarga');
  const [eventTypeOther, setEventTypeOther] = useState<string>('');
  const [hasStayedBefore, setHasStayedBefore] = useState<boolean>(false);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [paymentType, setPaymentType] = useState<'dp' | 'full'>('dp');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // API data
  const [dailyRates, setDailyRates] = useState<Record<string, DailyRate>>({});
  const [basePrice, setBasePrice] = useState<number>(2750000);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Calendar month offset (0 = current month, 1 = next month, etc.)
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // Handle Fade In & Fade Out transitions & sync initial params from Hero Section
  useEffect(() => {
    if (isOpen) {
      if (initialCheckIn) setCheckIn(initialCheckIn);
      if (initialCheckOut) setCheckOut(initialCheckOut);
      if (initialGuests) {
        const gNum = Math.min(maxGuests, Math.max(1, Number(initialGuests) || 2));
        setAdults(gNum);
        setChildren(0);
      }
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 20);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // matches duration-300
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialCheckIn, initialCheckOut, initialGuests, maxGuests]);

  // Graceful close trigger with fade out
  const triggerClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        triggerClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, triggerClose]);

  // Fetch rates and blocked dates (covers from current month to 12 months ahead)
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchRates() {
      setIsLoadingRates(true);
      try {
        const todayObj = new Date();
        const startOfMonth = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-01`;
        const res = await fetch(`/api/villa/availability?start_date=${startOfMonth}`);
        const result = await res.json();

        if (isMounted && result.success && result.data) {
          if (result.data.daily_rates) {
            setDailyRates(result.data.daily_rates);
          }
          if (result.data.base_price) {
            setBasePrice(Number(result.data.base_price));
          }
        }
      } catch (err) {
        console.error('Gagal memuat tarif kalender reservasi:', err);
      } finally {
        if (isMounted) setIsLoadingRates(false);
      }
    }

    fetchRates();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Compute reference months
  const now = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [now]);

  const month1Date = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [now, monthOffset]);

  const month2Date = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);
  }, [now, monthOffset]);

  // Helper to build days array for a month
  const buildMonthGrid = useCallback((monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun (Min)

    const cells: Array<{
      dayNumber: number | null;
      dateStr: string | null;
    }> = [];

    // Empty cells before 1st of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ dayNumber: null, dateStr: null });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dayNumber: d, dateStr });
    }

    return {
      year,
      month,
      monthName: MONTH_NAMES_ID[month],
      cells,
    };
  }, []);

  const gridMonth1 = useMemo(() => buildMonthGrid(month1Date), [buildMonthGrid, month1Date]);
  const gridMonth2 = useMemo(() => buildMonthGrid(month2Date), [buildMonthGrid, month2Date]);

  // Handle cell click
  const handleDateClick = (dateStr: string) => {
    setAlertMessage(null);
    const rateInfo = dailyRates[dateStr];
    const isPast = dateStr < todayStr;
    const isBlocked = rateInfo?.is_blocked ?? false;

    if (isPast) {
      return;
    }

    if (isBlocked) {
      const reason = rateInfo?.block_reason;
      const notes = rateInfo?.block_notes;
      const type = rateInfo?.block_type;

      let msg = `Tanggal ${formatDisplayDate(dateStr)} tidak tersedia.`;
      if (type === 'booking') {
        msg = `Tanggal ${formatDisplayDate(dateStr)} sudah dipesan tamu lain.`;
        if (reason) msg += ` Status: ${reason}.`;
        if (notes) msg += ` ${notes}.`;
      } else if (type === 'manual') {
        msg = `Tanggal ${formatDisplayDate(dateStr)} ditutup oleh pengelola villa.`;
        if (reason) msg += ` Alasan: ${reason}.`;
        if (notes) msg += ` (${notes})`;
      }
      setAlertMessage(msg);
      return;
    }

    // 1. If nothing selected or both already selected -> set checkIn
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut(null);
      return;
    }

    // 2. If checkIn is selected and clicking another date
    if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        // If clicking earlier date or same date, reset checkIn to that date
        setCheckIn(dateStr);
        setCheckOut(null);
        return;
      }

      // Check if any date in between is blocked in admin panel
      let hasBlockedInRange = false;
      const startD = new Date(checkIn);
      const endD = new Date(dateStr);
      const cur = new Date(startD);
      cur.setDate(cur.getDate() + 1);

      while (cur < endD) {
        const dStr = cur.toISOString().split('T')[0];
        if (dailyRates[dStr]?.is_blocked) {
          hasBlockedInRange = true;
          break;
        }
        cur.setDate(cur.getDate() + 1);
      }

      if (hasBlockedInRange) {
        setAlertMessage('Rentang tanggal terpilih melewati tanggal yang sudah dibooking. Silakan tentukan rentang tanggal lain.');
        setCheckIn(dateStr);
        setCheckOut(null);
        return;
      }

      setCheckOut(dateStr);
    }
  };

  // Helper date formatter in Bahasa Indonesia
  const formatDisplayDate = (dStr: string | null) => {
    if (!dStr) return null;
    const parts = dStr.split('-');
    if (parts.length !== 3) return dStr;
    const day = parts[2];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    const shortMonth = MONTH_NAMES_ID[monthIndex]?.substring(0, 3) || '';
    return `${day} ${shortMonth} ${year}`;
  };

  // Total estimate calculation
  const calculationSummary = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

    if (nights <= 0) return null;

    let total = 0;
    const cur = new Date(start);
    for (let i = 0; i < nights; i++) {
      const dStr = cur.toISOString().split('T')[0];
      const rate = dailyRates[dStr]?.price ?? basePrice;
      total += rate;
      cur.setDate(cur.getDate() + 1);
    }

    // Ketentuan DP: Rp 1.000.000 / malam
    const dpAmount = nights * 1000000;
    const remainingAmount = Math.max(0, total - dpAmount);
    const payableAmount = paymentType === 'full' ? total : dpAmount;

    return {
      nights,
      total,
      formattedTotal: formatRupiah(total),
      dpAmount,
      formattedDpAmount: formatRupiah(dpAmount),
      remainingAmount,
      formattedRemainingAmount: formatRupiah(remainingAmount),
      payableAmount,
      formattedPayableAmount: formatRupiah(payableAmount),
    };
  }, [checkIn, checkOut, dailyRates, basePrice, paymentType]);

  // Handle Book submit
  const handleProceedBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAlertMessage(null);

    if (!checkIn) {
      setAlertMessage('Silakan pilih Tanggal Kedatangan (Check-in) di kalender terlebih dahulu.');
      return;
    }

    let finalCheckOut = checkOut;
    if (!finalCheckOut) {
      // Auto-set checkOut to next day if available
      const nextDay = new Date(checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      if (!dailyRates[nextDayStr]?.is_blocked) {
        finalCheckOut = nextDayStr;
      } else {
        setAlertMessage('Silakan pilih Tanggal Keberangkatan (Check-out) di kalender.');
        return;
      }
    }

    if (finalCheckOut <= checkIn) {
      setAlertMessage('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    // Validasi data kontak pemesan
    if (!guestName.trim()) {
      setAlertMessage('Mohon lengkapi Nama Lengkap pemesan sesuai KTP/Paspor.');
      return;
    }

    if (!guestPhone.trim()) {
      setAlertMessage('Mohon lengkapi Nomor WhatsApp / HP aktif untuk konfirmasi reservasi.');
      return;
    }

    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setAlertMessage('Mohon lengkapi Alamat Email yang valid untuk pengiriman invoice.');
      return;
    }

    if (eventType === 'Lainnya' && !eventTypeOther.trim()) {
      setAlertMessage('Mohon sebutkan rincian keperluan menginap Anda.');
      return;
    }

    if (!agreedTerms) {
      setAlertMessage('Anda harus menyetujui tata tertib dan ketentuan villa untuk melanjutkan.');
      return;
    }

    const totalGuests = allowGuestSelection ? adults + children : 1;
    if (allowGuestSelection && totalGuests > maxGuests) {
      setAlertMessage(`Kapasitas maksimal ${villa.name || 'villa'} adalah ${maxGuests} orang tamu.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(buildApiUrl('/api/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          check_in: checkIn,
          check_out: finalCheckOut,
          total_guests: totalGuests,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_phone: guestPhone.trim(),
          notes: notes.trim(),
          event_type: eventType,
          event_type_other: eventTypeOther.trim(),
          has_stayed_before: hasStayedBefore ? 1 : 0,
          agreed_terms: agreedTerms ? 1 : 0,
          payment_type: paymentType,
        }),
      });

      const result = await res.json();

      if (result.success && result.data?.booking_code) {
        triggerClose();
        router.push(`/booking?code=${result.data.booking_code}`);
      } else {
        setAlertMessage(result.message || 'Gagal memproses reservasi. Silakan periksa kembali data Anda.');
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setAlertMessage('Terjadi gangguan jaringan saat menghubungi server. Silakan coba beberapa saat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto lg:overflow-hidden transition-opacity duration-300 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={triggerClose}
    >
      {/* Outer Modal Box with Scale & Fade Animation */}
      <div
        className={`relative w-full max-w-7xl 2xl:max-w-[1420px] max-h-[94vh] lg:h-[90vh] lg:max-h-[850px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col lg:flex-row my-auto transition-all duration-300 ease-out transform ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= LEFT SECTION: DUA BULAN KALENDER ================= */}
        <div className="flex-1 p-4 sm:p-6 lg:p-6 xl:p-8 bg-white text-charcoal-900 flex flex-col justify-between overflow-y-auto lg:overflow-hidden h-full">
          <div>
            {/* Header Title (Bahasa Indonesia) */}
            <div className="text-center mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-gold-600 uppercase font-sans font-bold block mb-0.5">
                Villa Casa Anandefa &bull; Puncak Bogor
              </span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl tracking-[0.18em] font-semibold text-charcoal-900 uppercase">
                RESERVASI ONLINE
              </h2>
              <div className="w-14 sm:w-16 h-0.5 bg-gold-400 mx-auto mt-1.5"></div>
            </div>

            {/* Alert banner if error or validation */}
            {alertMessage && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="font-medium">{alertMessage}</span>
              </div>
            )}

            {/* Month Navigation Controls & Months Display */}
            <div className="relative">
              {/* Previous Month Button */}
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
                disabled={monthOffset === 0}
                className={`absolute -top-1 left-0 p-2 rounded-full border transition-all z-10 ${
                  monthOffset === 0
                    ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                    : 'text-charcoal-800 border-gray-300 hover:bg-gold-50 hover:border-gold-500'
                }`}
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Month Button */}
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => Math.min(11, prev + 1))}
                disabled={monthOffset >= 11}
                className="absolute -top-1 right-0 p-2 rounded-full border border-gray-300 text-charcoal-800 hover:bg-gold-50 hover:border-gold-500 transition-all z-10"
                aria-label="Bulan Berikutnya"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Calendars Grid with Loading State */}
              {isLoadingRates ? (
                <div className="py-20 text-center flex flex-col items-center justify-center space-y-3 bg-gray-50/50 rounded-2xl border border-gray-100 my-2">
                  <div className="w-10 h-10 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 tracking-wider uppercase block">
                      Memuat Ketersediaan &amp; Tarif Kalender...
                    </span>
                    <span className="text-[11px] text-gray-500 font-light mt-0.5 block">
                      Mohon tunggu sebentar, sistem sedang sinkronisasi tanggal
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 pt-1">
                  {/* Bulan 1 */}
                  <MonthBlock
                    grid={gridMonth1}
                    todayStr={todayStr}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    hoverDate={hoverDate}
                    dailyRates={dailyRates}
                    basePrice={basePrice}
                    onDateClick={handleDateClick}
                    onDateHover={setHoverDate}
                  />

                  {/* Bulan 2 */}
                  <div className="hidden md:block">
                    <MonthBlock
                      grid={gridMonth2}
                      todayStr={todayStr}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      hoverDate={hoverDate}
                      dailyRates={dailyRates}
                      basePrice={basePrice}
                      onDateClick={handleDateClick}
                      onDateHover={setHoverDate}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Legend (Bahasa Indonesia) */}
          <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-600 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold text-sm">▼</span>
              <span className="font-medium">Tarif Terbaik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span className="font-medium">Kamar Terisi / Diblokir</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="font-mono font-bold text-gray-400">///</span>
              <span>Minimal Menginap: 1 Malam</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION: DARK BOOKING SIDEBAR ================= */}
        <div className="w-full lg:w-[440px] xl:w-[480px] 2xl:w-[500px] bg-charcoal-950 text-white flex flex-col h-full max-h-full border-t lg:border-t-0 lg:border-l border-white/10 relative overflow-hidden flex-shrink-0">
          {/* Pinned Top Bar with Title & Close Button */}
          <div className="p-4 sm:p-5 pb-3 sm:pb-3.5 border-b border-white/10 flex items-start justify-between gap-3 bg-charcoal-950 flex-shrink-0 z-20">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400 block mb-0.5">
                {villa.name || 'Villa Casa Anandefa'} {villa.city ? `• ${villa.city}` : ''}
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                Rincian &amp; Kontak Reservasi
              </h3>
              <p className="text-[11px] text-white/60 font-light mt-0.5">
                Tentukan tanggal dan lengkapi data kontak pemesan untuk konfirmasi instan.
              </p>
            </div>
            <button
              type="button"
              onClick={triggerClose}
              className="text-white/60 hover:text-white p-1.5 -mr-1 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Tutup popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dedicated Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 lg:p-6">
            <form onSubmit={handleProceedBooking} className="space-y-4">
              {/* Alert banner jika ada validasi / error */}
              {alertMessage && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{alertMessage}</span>
                </div>
              )}

            {/* Tanggal Kedatangan & Keberangkatan (Grid 2 Kolom) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Check-in</span>
                  {checkIn && (
                    <button
                      type="button"
                      onClick={() => {
                        setCheckIn(null);
                        setCheckOut(null);
                      }}
                      className="text-[9px] text-white/40 hover:text-gold-300 underline lowercase"
                    >
                      reset
                    </button>
                  )}
                </div>
                <div className="font-medium text-xs sm:text-sm text-white truncate">
                  {formatDisplayDate(checkIn) || (
                    <span className="text-white/40 italic text-xs">Pilih di kalender</span>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="text-[10px] font-bold text-gold-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Check-out</span>
                  {checkOut && (
                    <button
                      type="button"
                      onClick={() => setCheckOut(null)}
                      className="text-[9px] text-white/40 hover:text-gold-300 underline lowercase"
                    >
                      ubah
                    </button>
                  )}
                </div>
                <div className="font-medium text-xs sm:text-sm text-white truncate">
                  {formatDisplayDate(checkOut) || (
                    <span className="text-white/40 italic text-xs">Pilih di kalender</span>
                  )}
                </div>
              </div>
            </div>

            {/* Jumlah Tamu (Dewasa & Anak Side by Side) - Hanya tampil jika diizinkan di admin panel */}
            {allowGuestSelection && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                    Dewasa
                  </label>
                  <CustomSelect
                    value={String(adults)}
                    onChange={(val) => setAdults(Number(val))}
                    size="sm"
                    options={Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => ({
                      value: String(n),
                      label: `${n} Dewasa ${n === maxGuests ? '(Maks)' : ''}`,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1">
                    Anak-anak
                  </label>
                  <CustomSelect
                    value={String(children)}
                    onChange={(val) => setChildren(Number(val))}
                    size="sm"
                    options={Array.from({ length: Math.max(1, maxGuests - 1) + 1 }, (_, i) => i).map((n) => ({
                      value: String(n),
                      label: `${n} Anak`,
                    }))}
                  />
                </div>
              </div>
            )}

            {/* Ringkasan Estimasi Biaya & Opsi DP */}
            {calculationSummary ? (
              <div className="space-y-2.5">
                {/* Opsi Tipe Pembayaran */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/80 uppercase tracking-wider mb-1.5">
                    Skema Pembayaran Reservasi
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentType('dp')}
                      className={`p-2.5 rounded-xl text-left border transition-all relative ${
                        paymentType === 'dp'
                          ? 'bg-gold-500/20 border-gold-400 text-white shadow-sm ring-1 ring-gold-400/50'
                          : 'bg-charcoal-900 border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-gold-300">Bayar DP</span>
                        <span className="text-[9px] bg-gold-400 text-charcoal-950 font-bold px-1.5 py-0.5 rounded-full">
                          Standar
                        </span>
                      </div>
                      <div className="text-xs font-serif font-bold text-white">
                        Rp {calculationSummary.formattedDpAmount}
                      </div>
                      <div className="text-[10px] text-white/60 mt-0.5 leading-tight">
                        Rp 1.000.000 / malam
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType('full')}
                      className={`p-2.5 rounded-xl text-left border transition-all relative ${
                        paymentType === 'full'
                          ? 'bg-gold-500/20 border-gold-400 text-white shadow-sm ring-1 ring-gold-400/50'
                          : 'bg-charcoal-900 border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-gold-300">Bayar Penuh</span>
                        <span className="text-[9px] bg-white/15 text-white/80 font-medium px-1.5 py-0.5 rounded-full">
                          Lunas
                        </span>
                      </div>
                      <div className="text-xs font-serif font-bold text-white">
                        Rp {calculationSummary.formattedTotal}
                      </div>
                      <div className="text-[10px] text-white/60 mt-0.5 leading-tight">
                        Tanpa sisa saat check-in
                      </div>
                    </button>
                  </div>
                </div>

                {/* Ringkasan Rincian Biaya */}
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/25 text-xs space-y-1.5">
                  <div className="flex justify-between text-white/80">
                    <span>Durasi Menginap:</span>
                    <span className="font-semibold text-white">{calculationSummary.nights} Malam</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Total Biaya Sewa Villa:</span>
                    <span className="font-medium text-white">Rp {calculationSummary.formattedTotal}</span>
                  </div>
                  {paymentType === 'dp' && (
                    <div className="flex justify-between text-gold-300/90 text-[11px]">
                      <span>Sisa Pelunasan Saat Check-in:</span>
                      <span className="font-medium text-white">Rp {calculationSummary.formattedRemainingAmount}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-1.5 flex justify-between items-baseline">
                    <span className="text-white font-semibold">
                      {paymentType === 'dp' ? 'Tagihan Transfer DP Sekarang:' : 'Total Tagihan Transfer:'}
                    </span>
                    <span className="font-serif font-bold text-gold-400 text-sm sm:text-base">
                      Rp {calculationSummary.formattedPayableAmount}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-900 border border-white/15 text-[11px] space-y-2 text-white/80">
                  <div className="flex items-center gap-1.5 text-gold-400 font-bold uppercase tracking-wider text-[10px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Ketentuan &amp; Cara Booking</span>
                  </div>
                  <ul className="space-y-1.5 pl-3 list-disc text-white/70 text-[10.5px] leading-relaxed">
                    {(villa.booking_instructions ||
                      'Pembayaran DP sebesar Rp 1.000.000 / malam untuk mengunci tanggal menginap.\nSetelah DP diterima, tanggal langsung kami booked dan invoice resmi dikirimkan paling lambat 1 x 24 jam.\nPembatalan tidak dapat dilakukan (non-refundable), namun boleh reschedule maksimal 1x (diinformasikan maksimal 10 hari sebelumnya / H-10).\nBantuan & info ketersediaan: 0813-8266-7801 / 0816-4819-298.'
                    )
                      .split('\n')
                      .map((p) => p.trim().replace(/^[-•*]\s*/, ''))
                      .filter(Boolean)
                      .map((point, idx) => {
                        const colonIndex = point.indexOf(':');
                        if (colonIndex > 0 && colonIndex <= 35 && !point.slice(0, colonIndex).includes('http')) {
                          return (
                            <li key={idx}>
                              <strong className="text-white">{point.slice(0, colonIndex)}:</strong>
                              {point.slice(colonIndex + 1)}
                            </li>
                          );
                        }
                        return <li key={idx}>{point}</li>;
                      })}
                  </ul>
                  <div className="pt-1.5 border-t border-white/10 text-right">
                    <Link
                      href="/tata-tertib"
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[10.5px] text-gold-400 hover:text-gold-300 transition-colors font-medium group"
                    >
                      <span>Lihat Tata Tertib &amp; Kebijakan Lengkap</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/50 text-center italic">
                Pilih tanggal check-in &amp; check-out di kalender
              </div>
            )}

            {/* Divider: Data Kontak Pemesan */}
            <div className="pt-2 border-t border-white/15">
              <div className="flex items-center gap-2 mb-2.5">
                <Users className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Data Kontak Pemesan
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Nama Lengkap (KTP/Paspor) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    required
                    className="w-full bg-charcoal-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Nomor WhatsApp / HP Aktif <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    required
                    className="w-full bg-charcoal-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                  <span className="text-[10px] text-white/40 mt-0.5 block">
                    Konfirmasi booking & invoice dikirim ke WA ini
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Alamat Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full bg-charcoal-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Catatan Khusus (Opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Jam kedatangan perkiraan pukul 14:00 WIB"
                    className="w-full bg-charcoal-900 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors resize-none"
                  />
                </div>

                {/* Keperluan Menginap */}
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Keperluan Menginap <span className="text-red-400">*</span>
                  </label>
                  <CustomSelect
                    value={eventType}
                    onChange={(val) => setEventType(val)}
                    size="sm"
                    options={[
                      { value: 'Acara Keluarga', label: 'Acara Keluarga' },
                      { value: 'Gathering Kantor', label: 'Gathering Kantor' },
                      { value: 'Arisan', label: 'Arisan' },
                      { value: 'Reuni', label: 'Reuni' },
                      { value: 'Lainnya', label: 'Lainnya (Sebutkan)' },
                    ]}
                  />
                  {eventType === 'Lainnya' && (
                    <input
                      type="text"
                      value={eventTypeOther}
                      onChange={(e) => setEventTypeOther(e.target.value)}
                      placeholder="Sebutkan keperluan acara / menginap..."
                      required
                      className="w-full mt-2 bg-charcoal-900 border border-gold-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-400 transition-colors"
                    />
                  )}
                </div>

                {/* Pertanyaan Pernah Menginap */}
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Apakah Anda pernah menginap sebelumnya?
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setHasStayedBefore(true)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        hasStayedBefore
                          ? 'bg-gold-500/20 border-gold-400 text-gold-300'
                          : 'bg-charcoal-900 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      Ya, Pernah
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasStayedBefore(false)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        !hasStayedBefore
                          ? 'bg-gold-500/20 border-gold-400 text-gold-300'
                          : 'bg-charcoal-900 border-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      Belum Pernah
                    </button>
                  </div>
                </div>

                {/* Checkbox Persetujuan Tata Tertib */}
                <div className="pt-2 border-t border-white/10">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-white/30 bg-charcoal-900 text-gold-500 focus:ring-gold-400 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] text-white/80 group-hover:text-white transition-colors leading-relaxed">
                      Saya menyetujui{' '}
                      <a
                        href="/tata-tertib"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gold-400 font-semibold underline hover:text-gold-300 transition-colors"
                      >
                        tata tertib dan ketentuan
                      </a>{' '}
                      menginap di {villa.name || 'villa'}.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Tombol Aksi Booking */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 disabled:opacity-50 disabled:cursor-not-allowed text-charcoal-950 font-bold py-3 px-4 rounded-xl tracking-wider text-xs uppercase transition-all duration-300 transform active:scale-95 shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
                    <span>Memproses Reservasi...</span>
                  </>
                ) : (
                  <>
                    <span>BUAT RESERVASI & LANJUT KE PEMBAYARAN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <Link
                href="/cek-booking"
                onClick={triggerClose}
                className="block text-center text-xs text-white/50 hover:text-gold-400 transition-colors mt-2.5 underline underline-offset-4"
              >
                Cek Status / Kelola Reservasi Sebelumnya
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}

// ================= INTERNAL MONTH COMPONENT =================
interface MonthBlockProps {
  grid: {
    year: number;
    month: number;
    monthName: string;
    cells: Array<{ dayNumber: number | null; dateStr: string | null }>;
  };
  todayStr: string;
  checkIn: string | null;
  checkOut: string | null;
  hoverDate: string | null;
  dailyRates: Record<string, DailyRate>;
  basePrice: number;
  onDateClick: (dateStr: string) => void;
  onDateHover: (dateStr: string | null) => void;
}

function MonthBlock({
  grid,
  todayStr,
  checkIn,
  checkOut,
  hoverDate,
  dailyRates,
  basePrice,
  onDateClick,
  onDateHover,
}: MonthBlockProps) {
  return (
    <div>
      {/* Judul Bulan */}
      <h3 className="font-serif text-center font-bold text-base sm:text-lg tracking-widest text-charcoal-900 uppercase mb-2 sm:mb-3">
        {grid.monthName} {grid.year}
      </h3>

      {/* Header Hari (Bahasa Indonesia) */}
      <div className="grid grid-cols-7 text-center mb-2 gap-1.5 sm:gap-2">
        {DAY_NAMES_ID.map((d, i) => (
          <span
            key={i}
            className={`text-xs font-bold uppercase tracking-wider py-1 ${
              i === 0 || i === 6 ? 'text-gold-600' : 'text-gray-500'
            }`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* Grid Tanggal dengan Ukuran Kotak (Square) & Harga Sejajar */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {grid.cells.map((cell, idx) => {
          if (!cell.dayNumber || !cell.dateStr) {
            return <div key={`empty-${idx}`} className="aspect-square w-full" />;
          }

          const { dayNumber, dateStr } = cell;
          const rateInfo = dailyRates[dateStr];
          const price = rateInfo?.price ?? basePrice;
          const isBlocked = rateInfo?.is_blocked ?? false;
          const blockType = rateInfo?.block_type ?? null;
          const blockReason = rateInfo?.block_reason ?? null;
          const blockNotes = rateInfo?.block_notes ?? null;
          const isBestPrice = rateInfo?.is_best_price ?? (price <= basePrice);
          const isPast = dateStr < todayStr;

          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const isInRange = Boolean(checkIn && checkOut && dateStr > checkIn && dateStr < checkOut);
          const isHoveredRange = Boolean(
            checkIn && !checkOut && hoverDate && dateStr > checkIn && dateStr <= hoverDate
          );

          // Card visual styling
          let cellStyle =
            'bg-white border border-gray-200 text-charcoal-900 hover:border-gold-500 hover:shadow-md cursor-pointer';

          if (isPast) {
            cellStyle = 'bg-gray-50 border-gray-100 text-gray-300 opacity-40 cursor-not-allowed pointer-events-none';
          } else if (isBlocked) {
            cellStyle = 'bg-red-50/40 border-red-200/60 text-gray-400 cursor-not-allowed';
          } else if (isCheckIn || isCheckOut) {
            cellStyle = 'bg-charcoal-950 border-charcoal-950 text-white font-bold shadow-lg ring-2 ring-gold-400 z-10';
          } else if (isInRange) {
            cellStyle = 'bg-gold-100/90 border-gold-300 text-charcoal-950 font-medium';
          } else if (isHoveredRange) {
            cellStyle = 'bg-gold-50 border-gold-300 text-charcoal-900';
          }

          // Tooltip title for blocked dates
          const blockedTitle = isBlocked
            ? [blockReason, blockNotes].filter(Boolean).join(' — ')
            : undefined;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast || isBlocked}
              onClick={() => onDateClick(dateStr)}
              onMouseEnter={() => {
                if (!isPast && !isBlocked) onDateHover(dateStr);
              }}
              onMouseLeave={() => onDateHover(null)}
              title={blockedTitle}
              className={`aspect-square w-full flex flex-col items-center justify-between p-1 sm:p-1.5 relative transition-all rounded-xl select-none group ${cellStyle}`}
            >
              {/* Indikator Atas Kanan: Segitiga Hijau untuk Tarif Terbaik */}
              {isBestPrice && !isPast && !isBlocked && !isCheckIn && !isCheckOut && (
                <span className="absolute top-1 right-1 text-[8px] text-emerald-600 font-bold leading-none" title="Tarif Terbaik">
                  ▼
                </span>
              )}

              {/* Angka Tanggal */}
              <div className="w-full flex justify-center pt-0.5">
                <span
                  className={`text-xs sm:text-sm leading-tight ${
                    isCheckIn || isCheckOut
                      ? 'text-gold-400 font-extrabold'
                      : isBlocked
                      ? 'text-gray-400 font-semibold'
                      : 'font-bold text-charcoal-900'
                  }`}
                >
                  {String(dayNumber).padStart(2, '0')}
                </span>
              </div>

              {/* Bottom label: harga 1 baris sejajar (misal "2,74 juta") atau status diblokir */}
              {!isPast ? (
                isBlocked ? (
                  <div className="w-full flex items-center justify-center leading-none pb-0.5">
                    <span className="text-[7px] sm:text-[8px] font-bold text-red-500/90 uppercase tracking-tighter text-center leading-none block truncate">
                      {blockType === 'manual'
                        ? (blockReason === 'Perawatan / Renovasi' ? 'Renov' : 'Tutup')
                        : 'Dipesan'}
                    </span>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center leading-none pb-0.5">
                    <span
                      className={`text-[8px] sm:text-[10px] font-bold tracking-tight whitespace-nowrap leading-none ${
                        isCheckIn || isCheckOut
                          ? 'text-white'
                          : 'text-charcoal-800 group-hover:text-gold-700'
                      }`}
                    >
                      {formatIdPrice(price)}
                    </span>
                  </div>
                )
              ) : (
                <div className="h-1.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Format harga compact untuk sel kalender (e.g. 2.500.000 menjadi "2,5 juta" sejajar 1 baris)
function formatIdPrice(val: number): string {
  if (val >= 1000000) {
    const juta = val / 1000000;
    const formatted = parseFloat(juta.toFixed(2)).toString().replace('.', ',');
    return `${formatted} juta`;
  }
  if (val >= 1000) {
    return `${(val / 1000).toFixed(0)}rb`;
  }
  return val.toString();
}
