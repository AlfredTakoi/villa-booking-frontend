'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ArrowRight, AlertCircle } from 'lucide-react';
import { useVilla } from '@/context/VillaContext';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import { buildApiUrl, resolveMediaUrl } from '@/lib/utils/api';

export default function HeroSection() {
  const router = useRouter();
  const { villa, facilities, isLoading } = useVilla();
  const highlightedFacilities = facilities.filter((f) => f.is_highlight);
  const today = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrowDate);
  const [guests, setGuests] = useState('2');
  const [dailyRates, setDailyRates] = useState<Record<string, any>>({});
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const maxGuests = villa.max_guests || 6;
  const bedroomsCount = villa.bedrooms || 2;

  // Loader smooth exit animation states
  const [shouldRenderLoader, setShouldRenderLoader] = useState(isLoading);
  const [isLoaderFadingOut, setIsLoaderFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsLoaderFadingOut(true);
      const timer = setTimeout(() => {
        setShouldRenderLoader(false);
      }, 700); // 700ms smooth fade out transition
      return () => clearTimeout(timer);
    } else {
      setShouldRenderLoader(true);
      setIsLoaderFadingOut(false);
    }
  }, [isLoading]);

  // Fetch availability and daily rates on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchAvailability() {
      try {
        const todayObj = new Date();
        const startOfMonth = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-01`;
        const res = await fetch(buildApiUrl(`/api/villa/availability?start_date=${startOfMonth}`));
        const result = await res.json();
        if (isMounted && result.success && result.data?.daily_rates) {
          setDailyRates(result.data.daily_rates);
        }
      } catch (err) {
        console.error('Gagal memuat data ketersediaan tanggal:', err);
      }
    }
    fetchAvailability();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(null);

    if (!checkIn) {
      setAlertMessage('Silakan pilih tanggal check-in terlebih dahulu.');
      return;
    }

    if (checkOut && checkOut <= checkIn) {
      setAlertMessage('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    // Check if checkIn or checkOut or any date in range is blocked
    let hasBlocked = false;
    let blockedDateStr = '';

    if (dailyRates[checkIn]?.is_blocked) {
      hasBlocked = true;
      blockedDateStr = checkIn;
    } else if (checkOut && dailyRates[checkOut]?.is_blocked) {
      hasBlocked = true;
      blockedDateStr = checkOut;
    } else if (checkOut) {
      const cur = new Date(checkIn);
      const endD = new Date(checkOut);
      cur.setDate(cur.getDate() + 1);
      while (cur < endD) {
        const dStr = cur.toISOString().split('T')[0];
        if (dailyRates[dStr]?.is_blocked) {
          hasBlocked = true;
          blockedDateStr = dStr;
          break;
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    if (hasBlocked) {
      setAlertMessage(`Tanggal yang dipilih (${blockedDateStr}) sudah dipesan atau tidak tersedia. Silakan pilih tanggal lain.`);
      return;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-online-booking-modal', {
          detail: { checkIn, checkOut, guests },
        })
      );
    }
  };

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Luxury Theme Loader Screen with Smooth Fade Out Animation when API finishes loading */}
      {shouldRenderLoader && (
        <div
          className={`fixed inset-0 z-[200] bg-charcoal-950 flex flex-col items-center justify-center text-center p-6 transition-all duration-700 ease-in-out ${
            isLoaderFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-gold-500/20 animate-ping absolute inset-0" />
            <div className="w-20 h-20 rounded-full border-3 border-gold-400 border-t-transparent animate-spin flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-gold-500/40 border-b-transparent animate-spin" />
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold-400 font-sans block mb-2">
            {(villa.name || 'Villa Casa Anandefa').toUpperCase()} &bull; {(villa.city || 'Puncak, Bogor').toUpperCase()}
          </span>
          <p className="text-xs text-white/50 font-light mt-1.5 max-w-xs">
            Mohon tunggu sebentar, menyelaraskan informasi ketersediaan villa
          </p>
        </div>
      )}

      {/* Background Image with Cinematic Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={resolveMediaUrl(villa.cover_image_url, "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=2000&q=85")}
          alt={`${villa.name || 'Villa Casa Anandefa'} Infinity Pool at Dusk`}
          className="w-full h-full object-cover object-center scale-105 animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/60 to-charcoal-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/70 via-transparent to-charcoal-950/70" />
      </div>

      {/* Hero Content with Smooth Scale & Fade In Entrance Animation */}
      <div className={`relative z-10 max-w-5xl mx-auto text-center text-white mt-8 sm:mt-12 transition-all duration-1000 ease-out ${
        isLoaderFadingOut || !shouldRenderLoader ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
      }`}>
        {/* Big Heading */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
          {villa.tagline || 'A Luxury Private Sanctuary in Puncak, Bogor'}
        </h1>

        {/* Subtitle / Description Singkat */}
        <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-sans font-light leading-relaxed">
          {villa.short_description || `Sewa villa kawasan Puncak dengan panorama alam memukau, kolam renang pribadi, fasilitas lengkap, dan akses mudah dekat Taman Safari.`}
        </p>

        {/* Validation Alert Message */}
        {alertMessage && (
          <div className="max-w-2xl mx-auto mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-md animate-fade-in shadow-xl">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="font-medium">{alertMessage}</span>
          </div>
        )}

        {/* Booking Bar Widget */}
        <div className="mx-auto bg-charcoal-900/85 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-3xl sm:rounded-full shadow-2xl mb-12 max-w-3xl">
          <form
            onSubmit={handleCheckAvailability}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center"
          >
            {/* Check In */}
            <div className="text-left px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
              <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
                Check-in
              </label>
              <CustomDatePicker
                value={checkIn}
                minDate={today}
                onChange={(val) => {
                  setAlertMessage(null);
                  setCheckIn(val);
                }}
                dailyRates={dailyRates}
                placeholder="Pilih Tanggal"
              />
            </div>

            {/* Check Out */}
            <div className="text-left px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
              <label className="block text-[11px] font-bold text-gold-400 uppercase tracking-wider mb-1">
                Check-out
              </label>
              <CustomDatePicker
                value={checkOut}
                minDate={checkIn || today}
                onChange={(val) => {
                  setAlertMessage(null);
                  setCheckOut(val);
                }}
                dailyRates={dailyRates}
                placeholder="Pilih Tanggal"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full h-full min-h-[52px] bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-950 font-bold uppercase text-xs tracking-wider rounded-2xl sm:rounded-full flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 transition-all transform hover:-translate-y-0.5"
              >
                <span>Cek Ketersediaan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-white/70 font-medium">
          {highlightedFacilities.length > 0 ? (
            highlightedFacilities.map((fac, idx) => (
              <div key={fac.id || idx} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                <span>{fac.name}</span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                <span>100% Properti Privat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                <span>Private Infinity Pool</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                <span>{bedroomsCount} Kamar Tidur Suite</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-400"></span>
                <span>Kapasitas {maxGuests} Tamu</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

