'use client';

import React from 'react';
import { Bed, Bath, Users, Maximize2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useVilla } from '@/context/VillaContext';

export default function AboutSection() {
  const { villa, images } = useVilla();

  const secondaryImage = images[1]?.url || images[0]?.url || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80";

  const specs = [
    { icon: Bed, label: `${villa.bedrooms || 2} Kamar Tidur` },
    { icon: Bath, label: `${villa.bathrooms || 3} Kamar Mandi En-Suite` },
    { icon: Users, label: `Hingga ${villa.max_guests || 6} Tamu` },
    { icon: Maximize2, label: `Luas ${villa.area_sqm || 450} m²` },
  ];

  // Parse description into paragraphs if provided
  const descriptionParagraphs = villa.description
    ? villa.description.split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean)
    : [];

  return (
    <section id="about" className="py-24 bg-sand-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Kolom Kiri: Images Montage */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-luxury border-4 border-white">
              <img
                src={villa.cover_image_url || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"}
                alt={`${villa.name || 'Villa Casa Anandefa'} Open Living Space`}
                className="w-full h-[440px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Small floating secondary image */}
            <div className="hidden sm:block absolute -bottom-8 -right-6 z-20 w-64 h-52 rounded-2xl overflow-hidden shadow-luxury-lg border-4 border-white">
              <img
                src={secondaryImage}
                alt={`${villa.name || 'Villa Casa Anandefa'} Suite View`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Kolom Kanan: Narrative & Specs */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
              Ketenangan Hakiki di Tengah Keasrian {villa.city || 'Puncak, Bogor'}
            </h2>

            {descriptionParagraphs.length > 0 ? (
              descriptionParagraphs.map((para, idx) => (
                <p key={idx} className="text-charcoal-800/80 leading-relaxed font-normal">
                  {para}
                </p>
              ))
            ) : (
              <>
                <p className="text-charcoal-800/80 leading-relaxed font-normal">
                  Dirancang dengan perpaduan selaras antara arsitektur tropis kontemporer dan suasana alam pegunungan, {villa.name || 'Villa Casa Anandefa'} bukan sekadar tempat bermalam, melainkan tempat berpulang menuju ketenangan jiwa bersama keluarga dan sahabat.
                </p>
                <p className="text-charcoal-800/80 leading-relaxed font-normal">
                  Villa ini murni didedikasikan untuk <strong>satu penyewa dalam satu waktu</strong> tanpa berbagi dengan tamu lain. Nikmati sensasi berenang di kolam renang pribadi berlatar pemandangan pegunungan yang asri, fasilitas meja billiard, area bermain anak, serta udara Puncak yang sejuk dan menyegarkan.
                </p>
              </>
            )}

            {/* Grid Specs */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              {specs.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-sand-300 shadow-sm flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-charcoal-900">{item.label}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-online-booking-modal'));
                  }
                }}
                className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-850 text-white px-7 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Lihat Ketersediaan & Booking</span>
                <ArrowUpRight className="w-4 h-4 text-gold-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
