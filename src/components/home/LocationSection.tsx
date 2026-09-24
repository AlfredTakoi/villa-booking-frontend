'use client';

import React from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { useVilla } from '@/context/VillaContext';

const nearbySpots = [
  { name: 'Taman Safari Indonesia Bogor', time: '10 Menit', dist: '3.5 km' },
  { name: 'Tea Bridge & Agrowisata Gunung Mas', time: '15 Menit', dist: '5.2 km' },
  { name: 'Telaga Warna Puncak', time: '20 Menit', dist: '7.8 km' },
  { name: 'Cimory Riverside & Dairyland Puncak', time: '25 Menit', dist: '10 km' },
  { name: 'Nicole\'s River Park & Brasco Puncak', time: '20 Menit', dist: '8.5 km' },
];

export default function LocationSection() {
  const { villa } = useVilla();

  return (
    <section id="location" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Info Kiri */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 leading-tight">
              Tersembunyi di Kedamaian {villa.city || 'Puncak, Bogor'}, Dekat Menuju Destinasi Ikonik
            </h2>

            <div className="flex items-start gap-3 p-4 bg-sand-50 rounded-2xl border border-sand-300">
              <MapPin className="w-5 h-5 text-gold-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-charcoal-900">Alamat Lengkap</h4>
                <p className="text-xs sm:text-sm text-charcoal-800/70 mt-1">
                  {villa.address || 'Jl. Taman Safari, Cisarua, Puncak, Kabupaten Bogor, Jawa Barat 16750'}
                </p>
              </div>
            </div>

            <p className="text-charcoal-800/70 text-sm leading-relaxed font-light">
              Terletak di lokasi strategis nan asri di {villa.city || 'Puncak, Bogor'}, {villa.name || 'Villa Casa Anandefa'} memberikan akses cepat menuju destinasi wisata favorit seperti Taman Safari Indonesia tanpa kehilangan privasi dari hiruk pikuk keramaian.
            </p>

            {/* List Jarak */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-2">
                <Compass className="w-4 h-4 text-gold-500" />
                Destinasi Wisata Terdekat:
              </h4>
              <div className="space-y-2">
                {nearbySpots.map((spot, i) => (
                  <div key={i} className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-sand-200">
                    <span className="text-charcoal-900 font-medium">{spot.name}</span>
                    <span className="text-gold-600 font-bold bg-gold-50 px-2.5 py-0.5 rounded-full">
                      {spot.time} &bull; {spot.dist}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Maps Kanan */}
          <div className="lg:col-span-7">
            <div className="w-full h-[450px] sm:h-[500px] rounded-3xl overflow-hidden shadow-luxury border-4 border-white">
              <iframe
                title={`${villa.name || 'Villa Casa Anandefa'} Location Maps`}
                src={villa.maps_embed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15852.123456!2d106.968712!3d-6.702856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69b823456789%3A0x123456789!2sPuncak%2C%20Cisarua%2C%20Bogor!5e0!3m2!1sen!2sid!4v1710000000000!5m2!1sen!2sid"}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
