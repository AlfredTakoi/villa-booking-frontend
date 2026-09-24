'use client';

import React from 'react';
import { useVilla } from '@/context/VillaContext';

interface FacilityDisplayItem {
  iconClass: string;
  title: string;
  desc: string;
}

const defaultFacilitiesList: FacilityDisplayItem[] = [
  {
    iconClass: 'ph-duotone ph-cooking-pot',
    title: 'Peralatan Makan Premium',
    desc: 'Peralatan makan lengkap disediakan untuk kenyamanan seluruh tamu.',
  },
  {
    iconClass: 'ph-duotone ph-snowflake',
    title: 'Kulkas & Dispenser Air',
    desc: 'Dilengkapi kulkas besar dan dispenser dengan dua galon air mineral gratis.',
  },
  {
    iconClass: 'ph-duotone ph-cooking-pot',
    title: 'Microwave & Peralatan Dapur',
    desc: 'Tersedia microwave, rice cooker, ketel listrik, dan blender untuk kebutuhan memasak Anda.',
  },
  {
    iconClass: 'ph-duotone ph-bed',
    title: 'Linen Bersih & Segar',
    desc: 'Sprei, selimut, dan sarung bantal selalu diganti baru untuk setiap tamu.',
  },
  {
    iconClass: 'ph-duotone ph-armchair',
    title: 'Sofa Bersih & Higienis',
    desc: 'Sofa dibersihkan secara rutin untuk menjaga kebersihan dan kenyamanan.',
  },
  {
    iconClass: 'ph-duotone ph-bed',
    title: 'Gratis 10 Extra Bed',
    desc: 'Termasuk sprei, selimut, dan sarung bantal tanpa biaya tambahan.',
  },
  {
    iconClass: 'ph-duotone ph-baby',
    title: 'Ramah Anak',
    desc: 'Area aman dan nyaman untuk anak-anak bermain dan bersenang-senang.',
  },
  {
    iconClass: 'ph-duotone ph-first-aid',
    title: 'Ramah Lansia',
    desc: 'Desain vila memudahkan akses dan memberikan kenyamanan bagi tamu lansia.',
  },
  {
    iconClass: 'ph-duotone ph-bathtub',
    title: 'Kamar Mandi Estetis',
    desc: 'Kamar mandi bersih dan modern dilengkapi dengan water heater.',
  },
  {
    iconClass: 'ph-duotone ph-television',
    title: 'Hiburan Lengkap',
    desc: 'Nikmati Smart TV, Wi-Fi berkecepatan tinggi, dan set karaoke untuk momen seru bersama keluarga.',
  },
  {
    iconClass: 'ph-duotone ph-map-pin',
    title: 'Akses Mudah',
    desc: 'Lokasi strategis dengan akses mudah via jalur utama maupun jalur alternatif.',
  },
  {
    iconClass: 'ph-duotone ph-car',
    title: 'Parkir Max 6 Mobil',
    desc: 'Area parkir luas yang dapat menampung hingga 6 mobil dengan aman.',
  },
  {
    iconClass: 'ph-duotone ph-swimming-pool',
    title: 'Kolam Renang Privat',
    desc: 'Kolam renang pribadi yang eksklusif untuk kenyamanan tamu.',
  },
  {
    iconClass: 'ph-duotone ph-tree-palm',
    title: 'Dekat Taman Safari',
    desc: 'Berlokasi hanya 1 km dari Taman Safari Indonesia untuk kemudahan rekreasi.',
  },
  {
    iconClass: 'ph-duotone ph-game-controller',
    title: 'Billiard & Playroom',
    desc: 'Meja billiard dan ruang bermain lengkap untuk hiburan keluarga.',
  },
];

export default function FacilitiesSection() {
  const { villa, facilities: apiFacilities } = useVilla();

  const displayList: FacilityDisplayItem[] = (apiFacilities && apiFacilities.length > 0)
    ? apiFacilities.map((f) => ({
        iconClass: f.icon || 'ph-duotone ph-sparkles',
        title: f.name,
        desc: f.description || '',
      }))
    : defaultFacilitiesList;

  return (
    <section id="facilities" className="py-24 bg-sand-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 mt-4 mb-4">
            Kenyamanan Maksimal di {villa.name || 'Villa Casa Anandefa'}
          </h2>
          <p className="text-charcoal-800/70 text-sm sm:text-base font-light">
            Rasakan kenyamanan maksimal di vila eksklusif kami yang terletak di sejuknya dataran tinggi Puncak, Bogor. Kami menyediakan beragam fasilitas premium yang dirancang untuk melengkapi liburan keluarga Anda, mulai dari perlengkapan dapur modern hingga hiburan keluarga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayList.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-sand-300 shadow-sm hover:shadow-luxury hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-200/50 flex items-center justify-center text-gold-600 mb-5">
                <i className={`${item.iconClass || 'ph-duotone ph-sparkles'} text-2xl leading-none`} />
              </div>

              <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-800/70 leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
