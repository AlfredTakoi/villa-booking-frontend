'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Phone, Menu, X, Compass } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import OnlineBookingModal from '@/components/booking/OnlineBookingModal';
import { useVilla } from '@/context/VillaContext';
import { resolveMediaUrl } from '@/lib/utils/api';

export default function Navbar() {
  const { villa } = useVilla();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingParams, setBookingParams] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    // Global listener so other buttons can trigger this modal with selected params
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ checkIn?: string; checkOut?: string; guests?: string }>;
      if (customEvent && customEvent.detail) {
        setBookingParams(customEvent.detail);
      } else {
        setBookingParams({});
      }
      setIsBookingModalOpen(true);
    };
    window.addEventListener('open-online-booking-modal', handleOpenModal);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('open-online-booking-modal', handleOpenModal);
    };
  }, []);

  const rawPhone = (villa.phone || '').replace(/[^0-9]/g, '');
  const waPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : (rawPhone || '628164819298');
  const displayPhone = villa.phone || '+62 816-4819-298';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-charcoal-900/90 backdrop-blur-md py-3 shadow-luxury border-b border-white/10'
            : 'bg-gradient-to-b from-charcoal-950/80 via-charcoal-950/40 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3 text-white text-decoration-none">
            <div className="w-11 h-11 shadow-md flex items-center justify-center overflow-hidden bg-transparent transition-all">
              <img
                src={resolveMediaUrl(villa.logo_url)}
                alt={villa.system_title || villa.name || 'Villa Casa Anandefa'}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-white uppercase block leading-none">
                {villa.system_title || villa.name || 'Casa Anandefa'}
              </span>
              <span className="text-[10px] tracking-[0.25em] text-gold-400/90 uppercase font-sans font-medium block mt-1">
                {villa.city || 'Puncak • Bogor'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wider uppercase text-white/90">
            <Link href="/#about" className="hover:text-gold-400 transition-colors">
              Tentang
            </Link>
            <Link href="/#gallery" className="hover:text-gold-400 transition-colors">
              Galeri
            </Link>
            <Link href="/#facilities" className="hover:text-gold-400 transition-colors">
              Fasilitas
            </Link>
            <Link href="/#location" className="hover:text-gold-400 transition-colors">
              Lokasi
            </Link>
            <Link
              href="/cek-booking"
              className="flex items-center gap-1.5 text-gold-300 hover:text-gold-200 transition-colors font-semibold"
            >
              <Compass className="w-4 h-4" />
              Cek Reservasi
            </Link>
          </nav>

          {/* Right CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={`https://wa.me/${waPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              <span>{displayPhone}</span>
            </a>
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-950 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservasi Villa</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
            aria-label="Toggle Menu"
          >
            <motion.div
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gold-400" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </button>
        </div>

        {/* Animated Mobile Drawer & Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Dimmed Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 top-[64px] z-40 bg-black/65 backdrop-blur-sm md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Slide Down Mobile Menu Drawer */}
              <motion.div
                initial={{ opacity: 0, y: -16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden md:hidden bg-charcoal-950/95 backdrop-blur-2xl border-b border-white/15 px-6 py-6 text-white shadow-2xl relative z-50"
              >
                <div className="space-y-3">
                  {[
                    { href: '/#about', label: 'Tentang Villa' },
                    { href: '/#gallery', label: 'Galeri Foto' },
                    { href: '/#facilities', label: 'Fasilitas' },
                    { href: '/#location', label: 'Lokasi' },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx + 0.05, duration: 0.25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-base font-medium py-2.5 px-3 rounded-xl border-b border-white/5 hover:bg-white/5 hover:text-gold-400 active:scale-[0.99] transition-all"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.25 }}
                  >
                    <Link
                      href="/cek-booking"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 text-base font-semibold py-2.5 px-3 rounded-xl bg-gold-500/10 border border-gold-400/20 text-gold-300 hover:text-gold-200 active:scale-[0.99] transition-all"
                    >
                      <Compass className="w-5 h-5 text-gold-400" />
                      <span>Cek Status Reservasi</span>
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.25 }}
                    className="pt-3 space-y-2.5"
                  >
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-full font-semibold text-xs tracking-wider transition-all active:scale-[0.98] text-decoration-none"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold-400" />
                      <span>WhatsApp: {displayPhone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-950 py-3.5 rounded-full font-bold uppercase text-xs tracking-wider cursor-pointer shadow-lg shadow-gold-500/20 active:scale-[0.98] transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Reservasi Villa Sekarang</span>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Online Booking Calendar Modal */}
      <OnlineBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialCheckIn={bookingParams.checkIn}
        initialCheckOut={bookingParams.checkOut}
        initialGuests={bookingParams.guests}
      />
    </>
  );
}

