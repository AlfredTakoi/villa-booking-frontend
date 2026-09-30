'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, Phone, Menu, X, Compass, User, LogIn, ChevronDown, LogOut, Lock, Sparkles, UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import OnlineBookingModal from '@/components/booking/OnlineBookingModal';
import { useVilla } from '@/context/VillaContext';
import { resolveMediaUrl } from '@/lib/utils/api';
import { useAuthStore } from '@/lib/authStore';

export default function Navbar() {
  const { villa } = useVilla();
  const { user, isAuthenticated, initialize, isInitialized, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingParams, setBookingParams] = useState<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>({});

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Lock body scroll when mobile menu is open & listen for Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const rawPhone = (villa.phone || '').replace(/[^0-9]/g, '');
  const waPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : (rawPhone || '628164819298');
  const displayPhone = villa.phone || '+62 816-4819-298';

  const userInitial = (user?.nama_lengkap || user?.username || 'U').charAt(0).toUpperCase();

  return (
    <>
      {/* Dimmed Backdrop for Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup menu navigasi"
          />
        )}
      </AnimatePresence>

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || mobileMenuOpen
            ? 'bg-charcoal-900/95 backdrop-blur-md py-3 shadow-luxury border-b border-white/10'
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
                onError={(e) => {
                  e.currentTarget.src = resolveMediaUrl('/villa-logo.png');
                }}
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
          <div className="hidden lg:flex items-center gap-3">
            {/* Auth section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gold-500 to-gold-600 text-charcoal-950 font-bold flex items-center justify-center text-[11px]">
                    {userInitial}
                  </div>
                  <span className="max-w-[100px] truncate">{user.nama_lengkap || user.username}</span>
                  <ChevronDown size={14} className={`text-gold-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-charcoal-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden py-2 text-white z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-white/10">
                        <p className="text-xs font-bold text-white truncate">{user.nama_lengkap || user.username}</p>
                        <p className="text-[11px] text-white/50 truncate font-mono">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <User size={14} className="text-gold-400" />
                          <span>Profil Saya</span>
                        </Link>

                        <Link
                          href="/profile?tab=bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Calendar size={14} className="text-gold-400" />
                          <span>Riwayat Reservasi</span>
                        </Link>

                        <Link
                          href="/profile?tab=password"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Lock size={14} className="text-gold-400" />
                          <span>Ganti Password</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Keluar (Logout)</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogIn size={13} />
                  <span>Masuk</span>
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gold-300 hover:text-gold-200 border border-gold-400/40 hover:bg-gold-500/10 transition-colors"
                >
                  <UserPlus size={13} />
                  <span>Daftar</span>
                </Link>
              </div>
            )}

            {/* Booking Button: Hanya tampil jika user sudah login */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-charcoal-950 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer ml-1"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservasi Villa</span>
              </button>
            )}
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

        {/* Animated Mobile Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -16, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden md:hidden bg-charcoal-950/95 backdrop-blur-2xl border-b border-white/15 px-6 py-6 text-white shadow-2xl relative z-50"
            >
                <div className="space-y-3">
                  {/* User greeting if logged in */}
                  {isAuthenticated && user && (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-gold-600 text-charcoal-950 font-bold flex items-center justify-center text-sm">
                          {userInitial}
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-xs font-bold text-white truncate">{user.nama_lengkap || user.username}</p>
                          <p className="text-[10px] text-gold-400 font-mono">Tamu Terdaftar</p>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {/* Auth links in mobile drawer */}
                  {isAuthenticated && user ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.28, duration: 0.25 }}
                      >
                        <Link
                          href="/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 text-base font-medium py-2 px-3 text-white/90 hover:text-gold-400"
                        >
                          <User className="w-4 h-4 text-gold-400" />
                          <span>Profil Saya</span>
                        </Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.25 }}
                      >
                        <Link
                          href="/profile?tab=bookings"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 text-base font-medium py-2 px-3 text-white/90 hover:text-gold-400"
                        >
                          <Calendar className="w-4 h-4 text-gold-400" />
                          <span>Riwayat Reservasi Saya</span>
                        </Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.32, duration: 0.25 }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2.5 text-sm font-semibold py-2 px-3 text-red-400 hover:text-red-300 w-full text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar (Logout)</span>
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28, duration: 0.25 }}
                      className="grid grid-cols-2 gap-2 pt-2"
                    >
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
                      >
                        <LogIn size={14} />
                        <span>Masuk</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-500/20 border border-gold-400/40 text-gold-300 hover:bg-gold-500/30 font-semibold text-xs transition-colors"
                      >
                        <UserPlus size={14} />
                        <span>Daftar</span>
                      </Link>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.25 }}
                    className="pt-2 space-y-2.5"
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
                    {/* Tombol Reservasi Villa di Mobile: Hanya tampil jika user sudah login */}
                    {isAuthenticated && (
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
                    )}
                  </motion.div>
                </div>
              </motion.div>
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

