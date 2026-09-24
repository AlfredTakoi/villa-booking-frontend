'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import {
  Copy,
  Check,
  Clock,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Building2,
  Calendar,
  MessageCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useVilla } from '@/context/VillaContext';

export default function PaymentInstructionPage() {
  const { villa } = useVilla();
  const params = useParams();
  const code = params?.code as string;

  const [bookingData, setBookingData] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form Upload Bukti
  const [bankName, setBankName] = useState('BCA');
  const [accountHolder, setAccountHolder] = useState('');
  const [transferredAmount, setTransferredAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isReuploading, setIsReuploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Helper untuk membersihkan dan menormalkan URL bukti transfer
  const resolveProofUrl = (url?: string | null) => {
    if (!url) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('blob:') || trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  };

  // Fetch booking details & bank accounts
  useEffect(() => {
    async function fetchBookingDetails(isSilent = false) {
      if (!code) return;
      if (!isSilent) setIsLoading(true);

      try {
        const [resStatus, resVilla] = await Promise.all([
          fetch(`/api/booking-status?code=${encodeURIComponent(code)}`),
          fetch(`/api/villa`),
        ]);

        const dataStatus = await resStatus.json();
        const dataVilla = await resVilla.json();

        if (dataStatus.success && dataStatus.data) {
          setBookingData(dataStatus.data);
          const payable = dataStatus.data.payable_amount || (dataStatus.data.payment_type === 'dp' && dataStatus.data.dp_amount ? dataStatus.data.dp_amount : dataStatus.data.total_price);
          setTransferredAmount(payable ? String(payable) : '');
          if (dataStatus.data.payment) {
            if (dataStatus.data.payment.bank_name) setBankName(dataStatus.data.payment.bank_name);
            if (dataStatus.data.payment.account_holder) setAccountHolder(dataStatus.data.payment.account_holder);
          }
        }

        if (dataVilla.success && dataVilla.data.bank_accounts) {
          setBankAccounts(dataVilla.data.bank_accounts);
        }
      } catch (err) {
        console.error('Failed to load booking details:', err);
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    }

    fetchBookingDetails(uploadSuccess);
  }, [code, uploadSuccess]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedAccount(text);
      setTimeout(() => setCopiedAccount(null), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 1 * 1024 * 1024) {
        setUploadError('Ukuran file melebihi 1 MB. Silakan pilih berkas dengan ukuran maksimal 1 MB agar sistem tetap ringan.');
        e.target.value = '';
        setProofFile(null);
        setPreviewUrl('');
        return;
      }
      setUploadError('');
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');

    if (!proofFile) {
      setUploadError('Mohon pilih file bukti transfer.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('booking_code', code);
      formData.append('bank_name', bankName);
      formData.append('account_holder', accountHolder);
      formData.append('transferred_amount', transferredAmount);
      formData.append('proof_image', proofFile);

      const res = await fetch('/api/bookings/upload-proof', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setUploadSuccess(true);
        setIsReuploading(false);

        // Update bookingData langsung di state agar gambar langsung tampil seketika
        const uploadedUrl = result.data?.proof_image_url || result.data?.proof_url || previewUrl;
        setBookingData((prev: any) => ({
          ...prev,
          status: 'waiting_confirmation',
          payment: {
            ...(prev?.payment || {}),
            status: 'pending',
            bank_name: bankName,
            account_holder: accountHolder,
            transferred_amount: parseFloat(transferredAmount) || prev?.total_price || 0,
            proof_image_url: uploadedUrl,
          },
        }));
      } else {
        setUploadError(result.message || 'Gagal mengunggah bukti transfer.');
      }
    } catch (err) {
      setUploadError('Terjadi kesalahan jaringan saat mengunggah file.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-sand-50 pt-24 pb-16 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-charcoal-800/70">Memuat rincian reservasi...</p>
        </div>
      </main>
    );
  }

  if (!bookingData) {
    return (
      <main className="min-h-screen bg-sand-50 pt-24 pb-16">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 text-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2">Reservasi Tidak Ditemukan</h2>
          <p className="text-sm text-charcoal-800/70 mb-6">
            Kode reservasi <strong>{code}</strong> tidak terdaftar dalam sistem kami.
          </p>
          <Link href="/cek-booking" className="btn bg-charcoal-900 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider">
            Cari Ulang Reservasi
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const isConfirmed = bookingData.status === 'confirmed';
  const isWaitingConfirmation = bookingData.status === 'waiting_confirmation' || uploadSuccess;

  return (
    <main className="min-h-screen bg-sand-50 pt-24 pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Status */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-100 px-4 py-1.5 rounded-full mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Pembayaran Terverifikasi & Lunas
            </span>
          ) : isWaitingConfirmation ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-800 bg-amber-100 px-4 py-1.5 rounded-full mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              Menunggu Verifikasi Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-700 bg-gold-200 px-4 py-1.5 rounded-full mb-3">
              <Clock className="w-4 h-4 text-gold-600" />
              Menunggu Pembayaran Transfer
            </span>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900 mt-2 mb-2">
            {isConfirmed ? 'Reservasi Anda Telah Terkonfirmasi!' : 'Instruksi Pembayaran Transfer'}
          </h1>
          <p className="text-sm text-charcoal-800/70 font-light">
            {isConfirmed
              ? `Terima kasih, pembayaran Anda telah berhasil kami terima. Sampai jumpa di ${villa.name || 'Villa Casa Anandefa'}!`
              : 'Silakan transfer sejumlah nominal tagihan ke rekening resmi villa di bawah ini.'}
          </p>
        </div>

        {/* Banner Kode Booking & Total */}
        <div className="bg-charcoal-900 text-white rounded-3xl p-6 sm:p-8 shadow-luxury-lg mb-8 border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <span className="text-xs uppercase font-bold text-gold-400 tracking-widest block mb-1">
                Kode Reservasi Anda
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-white">
                  {bookingData.booking_code}
                </span>
                <button
                  onClick={() => handleCopy(bookingData.booking_code, 'code')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gold-400 transition-colors"
                  title="Salin Kode"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-xs text-white/60 block mt-2">
                Simpan kode ini untuk mengecek status pemesanan Anda kapan saja.
              </span>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-8">
              <span className="text-xs uppercase font-bold text-gold-400 tracking-widest block mb-1">
                {bookingData.payment_type === 'dp' ? 'Total Transfer DP (Rp 1.000.000 / Malam)' : 'Total Yang Harus Ditransfer'}
              </span>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-white">
                {bookingData.payable_amount_formatted || (bookingData.payment_type === 'dp' && bookingData.dp_amount_formatted ? bookingData.dp_amount_formatted : bookingData.total_price_formatted)}
              </div>
              {bookingData.payment_type === 'dp' && (
                <div className="text-xs text-gold-300 font-medium mt-1">
                  Total Nilai Sewa: {bookingData.total_price_formatted} &bull; Sisa Pelunasan: {bookingData.remaining_amount_formatted} (saat check-in)
                </div>
              )}
              <span className="text-xs text-white/60 block mt-1.5">
                Masa Inap: {bookingData.check_in} &mdash; {bookingData.check_out} ({bookingData.total_nights} Malam)
              </span>
            </div>
          </div>
        </div>

        {/* Jika Sudah Terkonfirmasi: Tampilkan Card Invoice & Selamat Datang */}
        {isConfirmed ? (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="font-serif text-2xl font-bold text-charcoal-900">
                Pemesanan Lunas & Terkonfirmasi
              </h3>
              <p className="text-sm text-charcoal-800/70">
                Invoice resmi telah diterbitkan. Anda dapat mengunduh dokumen invoice PDF di bawah ini sebagai bukti reservasi resmi saat tiba di villa.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <a
                href={`/api/invoices/download?code=${bookingData.booking_code}`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-850 text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <Download className="w-4 h-4 text-gold-400" />
                <span>Unduh Dokumen Invoice (PDF)</span>
              </a>

              <a
                href="https://wa.me/628164819298"
                target="_blank"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Admin Reservasi (WA)</span>
              </a>
            </div>
          </div>
        ) : (
          /* Jika Masih Pending atau Waiting Confirmation: Tampilkan Rekening Bank & Form Upload */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Kolom Kiri: Rekening Bank Tujuan Transfer */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2 border-b border-sand-200 pb-3">
                  <Building2 className="w-5 h-5 text-gold-500" />
                  Rekening Resmi {villa.name || 'Villa Casa Anandefa'}
                </h3>

                <p className="text-xs text-charcoal-800/70 leading-relaxed font-light">
                  Silakan lakukan pembayaran {bookingData.payment_type === 'dp' ? 'Down Payment (DP)' : ''} sejumlah{' '}
                  <strong className="text-charcoal-900 font-bold">
                    {bookingData.payable_amount_formatted || (bookingData.payment_type === 'dp' && bookingData.dp_amount_formatted ? bookingData.dp_amount_formatted : bookingData.total_price_formatted)}
                  </strong>{' '}
                  ke salah satu rekening di bawah ini:
                </p>

                <div className="space-y-4">
                  {bankAccounts.length > 0 ? (
                    bankAccounts.map((acc, i) => (
                      <div key={i} className="p-4 bg-sand-50 rounded-2xl border border-sand-300 relative group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-charcoal-900">{acc.bank_name}</span>
                          <span className="text-[11px] text-charcoal-800/60">a.n {acc.account_holder}</span>
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-sand-200">
                          <span className="font-mono text-base sm:text-lg font-bold text-charcoal-900 tracking-wider">
                            {acc.account_number}
                          </span>
                          <button
                            onClick={() => handleCopy(acc.account_number, 'bank')}
                            className="inline-flex items-center gap-1.5 text-xs text-gold-600 hover:text-gold-700 font-bold uppercase tracking-wider bg-gold-50 hover:bg-gold-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {copiedAccount === acc.account_number ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600">Disalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                        {acc.instructions && (
                          <div className="text-[11px] text-charcoal-800/60 mt-2 italic">
                            {acc.instructions}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-sand-50 rounded-2xl border border-sand-300">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">BCA (Bank Central Asia)</span>
                        <span className="text-xs text-muted">a.n {villa.name ? villa.name.toUpperCase() : 'VILLA CASA ANANDEFA'}</span>
                      </div>
                      <div className="font-mono text-lg font-bold text-charcoal-900 mt-2">
                        8420-192-881
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gold-50 rounded-2xl border border-gold-200 text-xs text-gold-900 space-y-1">
                  <strong>Penting:</strong>
                  <p className="text-[11px] text-gold-800/90 leading-relaxed">
                    Cantumkan kode reservasi <strong>{bookingData.booking_code}</strong> pada berita transfer untuk mempercepat proses verifikasi.
                  </p>
                </div>

                {/* Box Ketentuan & Cara Booking Dinamis */}
                <div className="p-5 bg-charcoal-900 text-white rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
                    <span>✦</span>
                    <span>Ketentuan &amp; Cara Booking</span>
                  </div>
                  <ul className="space-y-2 text-white/80 text-xs leading-relaxed list-disc pl-4">
                    {(villa.booking_instructions ||
                      'Pembayaran DP: Sebesar Rp 1.000.000 / malam untuk mengunci tanggal menginap.\nKonfirmasi & Invoice: Setelah DP kami terima, tanggal langsung kami booked dan invoice resmi dikirimkan paling lambat 1 x 24 jam.\nKebijakan Reschedule: Apabila sudah melakukan pembayaran, tidak dapat melakukan pembatalan (non-refundable) namun boleh mengubah tanggal menginap (reschedule) sebanyak maksimal 1x.\nBatas Waktu Reschedule: Reschedule wajib diinformasikan maksimal 10 hari sebelumnya (H-10).\nBantuan & Reservasi: Silakan hubungi nomor WhatsApp resmi kami.'
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
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-white/50">Aturan resmi villa</span>
                    <Link
                      href="/tata-tertib"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-gold-400 hover:text-gold-300 font-medium transition-colors group"
                    >
                      <span>Lihat Tata Tertib Lengkap</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Form Upload Bukti Transfer */}
            <div className="lg:col-span-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-300 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2 border-b border-sand-200 pb-3">
                  <UploadCloud className="w-5 h-5 text-gold-500" />
                  Konfirmasi Bukti Transfer
                </h3>

                {!isReuploading && (uploadSuccess || bookingData.status === 'waiting_confirmation') ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 text-base">Bukti Transfer Berhasil Dikirim!</h4>
                      <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                        Tim reservasi {villa.name || 'Villa Casa Anandefa'} sedang memeriksa transfer Anda. Status konfirmasi dan invoice akan otomatis dikirimkan ke nomor WhatsApp Anda.
                      </p>
                    </div>

                    {/* Preview Dokumen Bukti Transfer */}
                    {(() => {
                      const rawUrl = bookingData.payment?.proof_image_url;
                      const proofSrc = resolveProofUrl(rawUrl) || previewUrl;
                      if (!proofSrc) return null;

                      const isPdf = proofSrc.toLowerCase().includes('.pdf') || (proofFile && proofFile.type === 'application/pdf');

                      return (
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm text-left">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              Foto / Dokumen Bukti yang Dikirim
                            </span>
                            <a
                              href={proofSrc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1"
                            >
                              Lihat Penuh
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          {isPdf ? (
                            <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-charcoal-900 truncate max-w-[180px] sm:max-w-xs">
                                    {proofFile?.name || 'Dokumen_Bukti_Transfer.pdf'}
                                  </p>
                                  <p className="text-[11px] text-charcoal-800/60">
                                    Dokumen PDF Bukti Pembayaran
                                  </p>
                                </div>
                              </div>
                              <a
                                href={proofSrc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-bold hover:bg-charcoal-850 flex items-center gap-1.5 transition-colors shadow-sm"
                              >
                                <Download className="w-3.5 h-3.5 text-gold-400" />
                                <span>Buka PDF</span>
                              </a>
                            </div>
                          ) : (
                            <div className="relative group rounded-xl overflow-hidden border border-sand-200 bg-sand-50 p-2 text-center">
                              <a
                                href={proofSrc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block cursor-zoom-in"
                                title="Klik untuk memperbesar resolusi penuh di tab baru"
                              >
                                <img
                                  src={proofSrc}
                                  alt="Bukti Transfer"
                                  className="max-h-60 max-w-full object-contain mx-auto rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                                  onError={(e) => {
                                    if (previewUrl && e.currentTarget.src !== previewUrl) {
                                      e.currentTarget.src = previewUrl;
                                    }
                                  }}
                                />
                              </a>
                              <div className="text-[11px] text-charcoal-800/60 mt-2">
                                Klik gambar untuk melihat ukuran penuh di tab baru.
                              </div>
                            </div>
                          )}

                          {/* Data Rincian Transfer Singkat */}
                          <div className="mt-3 pt-3 border-t border-sand-200 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-charcoal-800/60 block text-[11px]">Bank Pengirim:</span>
                              <span className="font-bold text-charcoal-900">
                                {bookingData.payment?.bank_name || bankName || 'BCA'}
                              </span>
                            </div>
                            <div>
                              <span className="text-charcoal-800/60 block text-[11px]">Atas Nama:</span>
                              <span className="font-bold text-charcoal-900">
                                {bookingData.payment?.account_holder || accountHolder || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setIsReuploading(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-charcoal-800/70 hover:text-charcoal-900 font-semibold underline decoration-sand-300 hover:decoration-charcoal-900 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Unggah Ulang Bukti Transfer Lain</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    {isReuploading && (
                      <div className="flex items-center justify-between p-3 bg-sand-100 rounded-xl text-xs text-charcoal-800">
                        <span>Mode Unggah Ulang Bukti</span>
                        <button
                          type="button"
                          onClick={() => setIsReuploading(false)}
                          className="text-gold-600 hover:text-gold-700 font-bold underline"
                        >
                          Batal (Kembali ke Bukti Sebelumnya)
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                        Bank Pengirim Anda
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Contoh: BCA / Mandiri / BRI"
                        className="w-full bg-sand-50 border border-sand-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                        Nama Pemilik Rekening Pengirim
                      </label>
                      <input
                        type="text"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        placeholder="Nama sesuai rekening Anda"
                        className="w-full bg-sand-50 border border-sand-300 rounded-xl px-4 py-2.5 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5">
                        Upload Foto / Tangkapan Layar Bukti Transfer
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="w-full bg-sand-50 border border-sand-300 rounded-xl px-4 py-2.5 text-xs text-charcoal-900 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold-500 file:text-charcoal-950"
                        required
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Format JPG, PNG, WEBP, atau PDF. Maksimal 1 MB.</p>
                    </div>

                    {previewUrl && (
                      <div className="mt-2 text-center p-2 bg-sand-50 rounded-xl border border-sand-200">
                        {proofFile?.type === 'application/pdf' ? (
                          <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-charcoal-800">
                            <FileText className="w-5 h-5 text-red-600" />
                            <span>{proofFile.name} (Dokumen PDF terpilih)</span>
                          </div>
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Preview Bukti Transfer"
                            className="max-h-44 mx-auto rounded-lg border shadow-sm object-contain"
                          />
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="w-full bg-charcoal-900 hover:bg-charcoal-850 disabled:opacity-50 text-white py-3.5 rounded-full font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-4"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mengunggah Bukti...</span>
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4 text-gold-400" />
                          <span>Kirim Bukti Pembayaran</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
