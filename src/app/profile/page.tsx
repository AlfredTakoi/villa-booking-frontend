'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { useAuthStore } from '@/lib/authStore';
import { buildApiUrl } from '@/lib/utils/api';
import { useVilla } from '@/context/VillaContext';
import {
  User,
  Calendar,
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Shield,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface BookingHistoryItem {
  id: number;
  booking_code: string;
  check_in: string;
  check_out: string;
  total_nights: number;
  total_guests: number;
  total_price: number;
  payment_type: string;
  dp_amount: number;
  remaining_amount: number;
  status: string;
  status_label: string;
  status_badge: string;
  payment_status: string;
  created_at: string;
}

function formatRupiah(amount: number): string {
  return 'Rp ' + Math.round(amount || 0).toLocaleString('id-ID');
}

function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, isAuthenticated, isInitialized, initialize, logout, updateUser } =
    useAuthStore();
  const { villa } = useVilla();

  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'password'>(
    initialTab === 'bookings' || initialTab === 'password' ? initialTab : 'profile'
  );

  // Profile Edit State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [phone, setPhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Bookings State
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login?redirect=/profile');
    }
  }, [isInitialized, isAuthenticated, router]);

  // Sync user state to form
  useEffect(() => {
    if (user) {
      setNamaLengkap(user.nama_lengkap || '');
      setPhone(user.no_telpon || '');
    }
  }, [user]);

  // Load bookings if tab is bookings
  useEffect(() => {
    if (activeTab === 'bookings' && token) {
      fetchMyBookings();
    }
  }, [activeTab, token]);

  const fetchMyBookings = async () => {
    if (!token) return;
    setIsLoadingBookings(true);
    try {
      const res = await fetch(buildApiUrl('/api/my-bookings'), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!namaLengkap.trim()) {
      setProfileError('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await fetch(buildApiUrl('/api/update-profile'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama_lengkap: namaLengkap.trim(),
          no_telpon: phone.trim(),
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Server returned non-JSON:', jsonErr);
        setProfileError(`Respon server tidak berupa JSON (Status HTTP ${res.status}).`);
        return;
      }

      if (data.success) {
        updateUser({
          nama_lengkap: namaLengkap.trim(),
          no_telpon: phone.trim(),
        });
        setProfileSuccess('Profil berhasil diperbarui.');
      } else {
        setProfileError(data.message || 'Gagal memperbarui profil.');
      }
    } catch {
      setProfileError('Tidak dapat terhubung ke server. Pastikan server backend lokal aktif.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Password lama dan password baru wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch(buildApiUrl('/api/change-password'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Server returned non-JSON:', jsonErr);
        setPasswordError(`Respon server tidak berupa JSON (Status HTTP ${res.status}).`);
        return;
      }

      if (data.success) {
        setPasswordSuccess('Password berhasil diubah. Gunakan password baru Anda pada login berikutnya.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Gagal mengubah password.');
      }
    } catch {
      setPasswordError('Tidak dapat terhubung ke server. Pastikan server backend lokal aktif.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      logout();
      router.push('/');
    }
  };

  if (!isInitialized || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-gold-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userInitials = (user.nama_lengkap || user.username || 'U')
    .split(' ')
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Profile Header Hero Card */}
        <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-950 to-charcoal-900 rounded-3xl p-6 sm:p-10 text-white shadow-luxury relative overflow-hidden mb-8 border border-white/10">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-charcoal-950 font-serif text-3xl font-bold flex items-center justify-center shadow-lg shadow-gold-500/20 shrink-0">
              {userInitials}
            </div>

            {/* User Meta */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/30 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Tamu Eksklusif {villa.name || 'Casa Anandefa'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Shield size={11} />
                  Akun Terverifikasi
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
                {user.nama_lengkap || user.username}
              </h1>
              <p className="text-sm text-sand-300/80 font-sans mt-1">
                @{user.username} &bull; {user.email}
              </p>
              {user.no_telpon && (
                <p className="text-xs text-sand-300/60 font-sans mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <Phone size={12} className="text-gold-400" />
                  <span>{user.no_telpon}</span>
                </p>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-red-400/50 hover:bg-red-500/10 text-white/80 hover:text-red-300 text-xs font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <LogOut size={15} />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-sand-300 gap-2 sm:gap-6 mb-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'border-gold-600 text-gold-700 font-bold'
                : 'border-transparent text-charcoal-800/60 hover:text-charcoal-900'
            }`}
          >
            <User size={16} />
            <span>Profil Saya</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'bookings'
                ? 'border-gold-600 text-gold-700 font-bold'
                : 'border-transparent text-charcoal-800/60 hover:text-charcoal-900'
            }`}
          >
            <Calendar size={16} />
            <span>Riwayat Reservasi</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold tracking-wide transition-all border-b-2 flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'password'
                ? 'border-gold-600 text-gold-700 font-bold'
                : 'border-transparent text-charcoal-800/60 hover:text-charcoal-900'
            }`}
          >
            <Lock size={16} />
            <span>Ganti Password</span>
          </button>
        </div>

        {/* Tab 1: Profil Saya */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl shadow-sm border border-sand-200 p-6 sm:p-10 max-w-2xl">
            <div className="mb-6">
              <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                Informasi Data Pribadi
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-800/60 mt-1">
                Data ini akan digunakan secara otomatis saat Anda melakukan reservasi villa.
              </p>
            </div>

            {profileSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full px-4 py-3 rounded-xl border border-sand-300 bg-sand-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                  required
                />
              </div>

              {/* Username (Read Only) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-2">
                  Username (Tidak dapat diubah)
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-sand-100/60 text-charcoal-800/60 text-sm cursor-not-allowed"
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-2">
                  Alamat Email (Terverifikasi)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-sand-200 bg-sand-100/60 text-charcoal-800/60 text-sm cursor-not-allowed"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified
                  </span>
                </div>
              </div>

              {/* Nomor WhatsApp / HP */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-2">
                  Nomor WhatsApp / HP
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 pl-10 rounded-xl border border-sand-300 bg-sand-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                  />
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-800/40" />
                </div>
                <p className="text-xs text-charcoal-800/50 mt-1">
                  Digunakan untuk pengiriman notifikasi konfirmasi reservasi
                </p>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Riwayat Reservasi */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                  Riwayat Reservasi Villa
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-800/60 mt-1">
                  Daftar seluruh jadwal booking menginap Anda di {villa.name || 'Casa Anandefa'}.
                </p>
              </div>

              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-online-booking-modal'));
                }}
                className="px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Calendar size={14} />
                <span>Buat Reservasi Baru</span>
              </button>
            </div>

            {isLoadingBookings ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-sand-200">
                <div className="w-8 h-8 border-3 border-gold-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-charcoal-800/60">Memuat riwayat reservasi...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-sand-200 p-8">
                <div className="w-16 h-16 rounded-2xl bg-sand-100 text-gold-700 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={28} />
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">
                  Belum Ada Reservasi
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-800/60 max-w-sm mx-auto mb-6">
                  Anda belum memiliki riwayat reservasi di akun ini. Rencanakan liburan istimewa Anda sekarang!
                </p>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-online-booking-modal'));
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>Pesan Sekarang</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {bookings.map((booking) => {
                  const isConfirmed = booking.status === 'confirmed';
                  const isPending = booking.status === 'pending_payment';
                  const isWaiting = booking.status === 'waiting_confirmation';

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header card */}
                        <div className="flex items-center justify-between gap-2 pb-4 border-b border-sand-200">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-800/50 block">
                              Kode Booking
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-sm font-bold text-charcoal-900">
                                {booking.booking_code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(booking.booking_code)}
                                className="text-charcoal-800/40 hover:text-gold-700 transition-colors p-1"
                                title="Salin kode"
                              >
                                {copiedCode === booking.booking_code ? (
                                  <Check size={14} className="text-emerald-600" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isWaiting
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : isPending
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-sand-100 text-charcoal-800 border border-sand-300'
                            }`}
                          >
                            {booking.status_label || booking.status}
                          </span>
                        </div>

                        {/* Dates & Guests */}
                        <div className="py-4 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-charcoal-800/60">Jadwal Menginap:</span>
                            <span className="font-semibold text-charcoal-900">
                              {formatDateIndo(booking.check_in)} — {formatDateIndo(booking.check_out)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-charcoal-800/60">Durasi & Tamu:</span>
                            <span className="font-semibold text-charcoal-900">
                              {booking.total_nights} Malam &bull; {booking.total_guests} Tamu
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-charcoal-800/60">Total Biaya:</span>
                            <span className="font-bold text-gold-700 text-sm">
                              {formatRupiah(booking.total_price)}
                            </span>
                          </div>

                          {booking.payment_type === 'dp' && (
                            <div className="flex items-center justify-between text-xs text-charcoal-800/60">
                              <span>Skema DP:</span>
                              <span>DP: {formatRupiah(booking.dp_amount)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-sand-200 flex items-center justify-between gap-3">
                        <Link
                          href={`/booking?code=${booking.booking_code}`}
                          className="flex-1 text-center py-2.5 px-4 rounded-xl bg-gold-50 hover:bg-gold-100 text-gold-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Upload Bukti / Detail</span>
                          <ArrowRight size={13} />
                        </Link>
                        <Link
                          href={`/cek-booking?code=${booking.booking_code}`}
                          className="py-2.5 px-3 rounded-xl border border-sand-300 hover:bg-sand-50 text-charcoal-800 text-xs font-semibold transition-colors"
                          title="Cek Status Reservasi"
                        >
                          Cek Status
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ganti Password */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-3xl shadow-sm border border-sand-200 p-6 sm:p-10 max-w-xl">
            <div className="mb-6">
              <h2 className="font-serif text-xl text-charcoal-900 font-bold">
                Ubah Password Akun
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-800/60 mt-1">
                Gunakan kombinasi password yang kuat untuk menjaga keamanan akun Anda.
              </p>
            </div>

            {passwordSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Password Saat Ini <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-sand-300 bg-sand-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-800/40 hover:text-gold-600"
                    tabIndex={-1}
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Password Baru (Min. 8 Karakter) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-sand-300 bg-sand-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-800/40 hover:text-gold-600"
                    tabIndex={-1}
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-800 mb-1.5">
                  Ulangi Password Baru <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-sand-300 bg-sand-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-800/40 hover:text-gold-600"
                    tabIndex={-1}
                  >
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {isSavingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Perbarui Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-gold-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
