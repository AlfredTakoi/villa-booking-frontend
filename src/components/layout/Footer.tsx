'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useVilla } from '@/context/VillaContext';

export default function Footer() {
  const { villa, socialLinks } = useVilla();

  const rawPhone = (villa.phone || '').replace(/[^0-9]/g, '');
  const cleanPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : (rawPhone || '6283865079814');


  return (
    <footer className="bg-charcoal-950 text-white/80 pt-20 pb-10 border-t mt-20 border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                <img
                  src={villa.logo_url || '/villa-logo.png'}
                  alt={villa.system_title || villa.name || 'Casa Anandefa'}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-serif text-2xl font-bold tracking-widest text-white uppercase">
                {villa.system_title || villa.name || 'Casa Anandefa'}
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              {villa.short_description || 'Sewa villa kawasan Puncak dengan panorama alam memukau, kolam renang pribadi, fasilitas lengkap, dan akses mudah dekat Taman Safari Bogor.'}
            </p>
            {socialLinks && socialLinks.length > 0 && (
              <div className="pt-3 flex flex-wrap items-center gap-2.5">
                {socialLinks.map((item, idx) => {
                  let href = (item.url || '').trim();
                  if (!href) return null;

                  if (item.platform === 'whatsapp') {
                    const cleanNum = href.replace(/[^0-9]/g, '');
                    href = href.startsWith('http') || href.startsWith('wa.me')
                      ? (href.startsWith('http') ? href : `https://${href}`)
                      : `https://wa.me/${cleanNum.startsWith('0') ? '62' + cleanNum.slice(1) : cleanNum}`;
                  } else if (!href.startsWith('http://') && !href.startsWith('https://')) {
                    if (item.platform === 'instagram') href = `https://instagram.com/${href.replace('@', '')}`;
                    else if (item.platform === 'tiktok') href = `https://tiktok.com/@${href.replace('@', '')}`;
                    else if (item.platform === 'facebook') href = `https://facebook.com/${href}`;
                    else if (item.platform === 'x' || item.platform === 'twitter') href = `https://x.com/${href.replace('@', '')}`;
                    else href = `https://${href}`;
                  }

                  const platformIcons: Record<string, string> = {
                    instagram: 'ph-instagram-logo',
                    whatsapp: 'ph-whatsapp-logo',
                    tiktok: 'ph-tiktok-logo',
                    facebook: 'ph-facebook-logo',
                    youtube: 'ph-youtube-logo',
                    airbnb: 'ph-house-line',
                    tripadvisor: 'ph-airplane',
                    x: 'ph-x-logo',
                    twitter: 'ph-x-logo',
                    threads: 'ph-threads-logo',
                    google_review: 'ph-map-pin',
                    custom: 'ph-globe',
                  };

                  const iconClass = platformIcons[item.platform] || 'ph-globe';

                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-white/5 hover:bg-gold-500 text-white/70 hover:text-charcoal-950 border border-white/10 hover:border-gold-400 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                      title={item.platform ? item.platform.charAt(0).toUpperCase() + item.platform.slice(1) : 'Link'}
                      aria-label={item.platform}
                    >
                      <i className={`ph-duotone ${iconClass} text-lg leading-none`} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Eksplorasi Villa
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#about" className="hover:text-gold-400 transition-colors">
                  Tentang {villa.name || 'Villa Casa Anandefa'}
                </Link>
              </li>
              <li>
                <Link href="/#gallery" className="hover:text-gold-400 transition-colors">
                  Galeri Foto & Suasana
                </Link>
              </li>
              <li>
                <Link href="/#facilities" className="hover:text-gold-400 transition-colors">
                  Fasilitas & Layanan
                </Link>
              </li>
              <li>
                <Link href="/#location" className="hover:text-gold-400 transition-colors">
                  Lokasi & Tempat Terdekat
                </Link>
              </li>
              <li>
                <Link href="/tata-tertib" className="hover:text-gold-400 transition-colors">
                  Tata Tertib & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/cek-booking" className="hover:text-gold-400 transition-colors text-gold-400 font-semibold">
                  Cek Status Reservasi Anda
                </Link>
              </li>
            </ul>
          </div>

          {/* Kebijakan Menginap (Ringkas & User-Friendly) */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Kebijakan Menginap
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <span className="text-gold-400">&bull;</span>
                <span>Check-in: {villa.checkin_time || '14:00'} WIB</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold-400">&bull;</span>
                <span>Check-out: {villa.checkout_time || '12:00'} WIB</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold-400">&bull;</span>
                <span>Kapasitas: Maks. {villa.max_guests || 20} Tamu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold-400">&bull;</span>
                <span>DP Booking: Rp 1.000.000 / Malam</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold-400">&bull;</span>
                <span>Akses 100% Privat (1 Rombongan)</span>
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/tata-tertib"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
              >
                <span>Lihat Tata Tertib &amp; Kebijakan Lengkap</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
              Kontak Reservasi
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 mt-1 flex-shrink-0" />
                <span>{villa.address || 'Jl. Taman Safari, Cisarua, Puncak, Kabupaten Bogor, Jawa Barat 16750'}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {villa.phone || '+62 816-4819-298'}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a href={`mailto:${villa.email || 'reservasi@casaanandefa.com'}`} className="hover:text-white">
                  {villa.email || 'reservasi@casaanandefa.com'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div suppressHydrationWarning>
            {villa.frontend_footer_text || `© ${new Date().getFullYear()} ${villa.name || 'Villa Casa Anandefa'}. All rights reserved.`}
          </div>
          <div className="text-white/40 flex items-center gap-2">
            <span>Privasi & Keamanan Terjamin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
