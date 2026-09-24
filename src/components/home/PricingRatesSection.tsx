'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles, Calendar, ArrowRight, ShieldCheck, Clock, Users } from 'lucide-react';
import { useVilla } from '@/context/VillaContext';

function formatRupiah(amount: number | string): string {
  const num = Math.round(Number(amount) || 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function PricingRatesSection() {
  const { villa, rateSeasons, facilities } = useVilla();

  const basePriceFormatted = formatRupiah(villa.base_price || 2700000);
  const maxGuests = villa.max_guests || 20;

  // 1. Jumat & Minggu
  const friSunSeason = rateSeasons.find(r => {
    const sName = (r.name || r.season_name || '').toLowerCase();
    return sName.includes('jumat') || sName.includes('minggu');
  });
  const friSunPriceFormatted = friSunSeason && Number(friSunSeason.price) > 0
    ? formatRupiah(friSunSeason.price)
    : '3.000.000';

  // 2. Sabtu (Weekend)
  const satSeason = rateSeasons.find(r => {
    const sName = (r.name || r.season_name || '').toLowerCase();
    return sName.includes('sabtu');
  });
  const satPriceFormatted = satSeason && Number(satSeason.price) > 0
    ? formatRupiah(satSeason.price)
    : '4.200.000';

  const rateInclusions = facilities.filter(f => f.is_included_in_rate);

  const defaultInclusions = [
    'Akses privat 100% untuk seluruh area villa (tanpa tamu lain)',
    'Kolam renang pribadi eksklusif dengan view alam pegunungan',
    'Gratis 10 Extra Bed lengkap dengan sprei & selimut',
    'Meja billiard dan ruang bermain lengkap',
    'Smart TV, Wi-Fi berkecepatan tinggi, dan set karaoke',
    'Dapur lengkap dengan kulkas, microwave, rice cooker & dispenser',
    'Kamar mandi bersih modern dengan water heater',
    'Area parkir luas dapat menampung hingga 6 mobil',
  ];

  const inclusions = rateInclusions.length > 0
    ? rateInclusions.map(f => f.name)
    : defaultInclusions;

  const handleOpenCalendar = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-online-booking-modal'));
    }
  };

  return (
    <section id="pricing" className="py-24 bg-sand-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Tarif & Harga sesuai Gambar */}
        <div className="relative rounded-3xl overflow-hidden mb-14 shadow-luxury-lg border border-sand-300">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${villa.cover_image_url || '/app_asset/images/villa-hero.jpg'})`,
            }}
          />
          <div className="absolute inset-0 bg-charcoal-950/85 backdrop-blur-xs" />

          {/* Content */}
          <div className="relative z-10 px-6 py-14 sm:px-12 sm:py-16 text-center text-white">
            <div className="text-xs sm:text-sm font-bold tracking-[0.25em] text-gold-400 uppercase mb-2 flex items-center justify-center gap-2">
              <span>✦</span>
              <span>TARIF &amp; HARGA</span>
              <span>✦</span>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gold-300 mt-2 mb-4 tracking-wide">
              {villa.name || 'Casa Anandefa'}
            </h2>
            
            <p className="max-w-2xl mx-auto text-white/80 text-xs sm:text-sm md:text-base font-light mb-12">
              Berikut merupakan harga sewa villa {villa.name || 'Casa Anandefa'} yang berlokasi di Cisarua, Puncak Bogor.
            </p>

            {/* 4 Rate Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {/* 1. Senin – Kamis */}
              <div className="flex flex-col items-center">
                <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-xs sm:text-sm px-6 py-2 rounded-md shadow-md mb-3.5 inline-block">
                  Senin – Kamis
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-700"></div>
                </div>
                <div className="font-serif text-base sm:text-lg font-bold text-white tracking-wide" suppressHydrationWarning>
                  IDR {basePriceFormatted} <span className="text-xs font-sans font-normal text-white/70">/ Malam</span>
                </div>
              </div>

              {/* 2. Jumat & Minggu */}
              <div className="flex flex-col items-center">
                <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-xs sm:text-sm px-6 py-2 rounded-md shadow-md mb-3.5 inline-block">
                  Jumat &amp; Minggu
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-700"></div>
                </div>
                <div className="font-serif text-base sm:text-lg font-bold text-white tracking-wide" suppressHydrationWarning>
                  IDR {friSunPriceFormatted} <span className="text-xs font-sans font-normal text-white/70">/ Malam</span>
                </div>
              </div>

              {/* 3. Sabtu (Weekend) */}
              <div className="flex flex-col items-center">
                <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-xs sm:text-sm px-6 py-2 rounded-md shadow-md mb-3.5 inline-block">
                  Sabtu (Weekend)
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-700"></div>
                </div>
                <div className="font-serif text-base sm:text-lg font-bold text-white tracking-wide" suppressHydrationWarning>
                  IDR {satPriceFormatted} <span className="text-xs font-sans font-normal text-white/70">/ Malam</span>
                </div>
              </div>

              {/* 4. Hari Libur Nasional */}
              <div className="flex flex-col items-center">
                <div className="relative bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold text-xs sm:text-sm px-6 py-2 rounded-md shadow-md mb-3.5 inline-block">
                  Hari Libur Nasional
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-700"></div>
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/90 leading-tight max-w-[200px]">
                  Harga Menyesuaikan dengan Kondisi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Detail Inclusions & Tombol Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Info Inclusions Kiri */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-sand-300 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-sand-200 pb-5">
              <div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                  Fasilitas Termasuk dalam Tarif
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-800/70 mt-1">
                  Seluruh fasilitas di bawah ini dapat dinikmati tanpa biaya tambahan.
                </p>
              </div>
              <span className="badge bg-gold-100 text-gold-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-gold-300/50 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Maks. {maxGuests} Tamu
              </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {inclusions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-charcoal-800/80">
                  <div className="w-4 h-4 rounded-full bg-gold-400/20 text-gold-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card Kanan: Ringkasan Reservasi */}
          <div className="lg:col-span-5">
            <div className="bg-charcoal-900 text-white rounded-3xl p-8 sm:p-9 shadow-luxury-lg border border-white/10 relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

              <h4 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-400" />
                Ketentuan Waktu Menginap
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs text-white/60 block">Waktu Check-in</span>
                  <span className="text-lg font-bold text-gold-300 font-monospace">
                    {villa.checkin_time || '14:00'} WIB
                  </span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs text-white/60 block">Waktu Check-out</span>
                  <span className="text-lg font-bold text-gold-300 font-monospace">
                    {villa.checkout_time || '12:00'} WIB
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gold-500/10 rounded-2xl border border-gold-400/20 text-xs text-gold-200/90 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Jaminan Privasi Penuh:</strong> Anda mendapatkan akses 100% ke seluruh area properti tanpa tamu lain, lengkap dengan keamanan 24 jam.
                </div>
              </div>

              <Link
                href="/booking"
                onClick={handleOpenCalendar}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-950 py-4 rounded-full font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer text-decoration-none"
              >
                <Calendar className="w-4 h-4" />
                <span>Pilih Tanggal &amp; Reservasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

