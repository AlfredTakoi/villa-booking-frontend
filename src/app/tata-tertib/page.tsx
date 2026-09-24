'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { useVilla } from '@/context/VillaContext';
import {
  ShieldCheck,
  ArrowLeft,
  Info,
  PhoneCall,
} from 'lucide-react';

export default function TataTertibPage() {
  const { villa } = useVilla();
  const [termsHtml, setTermsHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await fetch('/api/villa');
        const data = await res.json();
        if (data.success && data.data?.terms_conditions) {
          setTermsHtml(data.data.terms_conditions);
        }
      } catch (err) {
        console.error('Gagal memuat tata tertib:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTerms();
  }, []);

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col font-sans text-charcoal-900">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-20 bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-gold-500/30 text-gold-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>Panduan, Kebijakan &amp; Aturan Menginap</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Tata Tertib, Ketentuan &amp; Cara Booking
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Demi kenyamanan, keamanan, dan keasrian bersama selama menginap di {villa.name || 'Villa Casa Anandefa'}, mohon memperhatikan seluruh ketentuan pemesanan, tata tertib, dan kebijakan berikut.
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-12 -mt-8 relative z-20 space-y-10">
        
        {/* Navigasi Balik */}
        <div className="flex items-center justify-between px-2 mt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-700 hover:text-gold-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-xs text-charcoal-500 font-medium">
            Ketentuan Resmi Villa
          </span>
        </div>

        {/* ── BAGIAN 3: TATA TERTIB & ATURAN MENGINAP (KONTEN DARI PROFILE VILLA / CMS) ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl border border-sand-300">

          {isLoading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Memuat Informasi Tata Tertib...
              </span>
            </div>
          ) : termsHtml ? (
            <div
              className="wysiwyg-content max-w-none"
              dangerouslySetInnerHTML={{ __html: termsHtml }}
            />
          ) : (
            <div className="wysiwyg-content max-w-none">
              <div className="p-4 bg-gold-50 border border-gold-200 rounded-2xl flex items-start gap-3 text-gold-900 mb-6">
                <Info className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm mb-1 text-gold-900" style={{ margin: 0 }}>Tata Tertib Standar Villa</h4>
                  <p className="text-xs text-gold-800 leading-relaxed" style={{ margin: 0 }}>
                    Berikut adalah panduan standar keselamatan &amp; kenyamanan menginap di {villa.name || 'Villa Casa Anandefa'}.
                  </p>
                </div>
              </div>

              <h3>1. Ketentuan Check-in &amp; Check-out</h3>
              <ul>
                <li>Waktu Check-in resmi dimulai pukul <strong>14:00 WIB</strong>.</li>
                <li>Waktu Check-out maksimal pukul <strong>12:00 WIB</strong>.</li>
                <li>Setiap tamu wajib menunjukkan kartu identitas resmi (KTP / Paspor) saat proses penyerahan kunci.</li>
              </ul>

              <h3>2. Jam Tenang &amp; Ketertiban Lingkungan</h3>
              <ul>
                <li>Dilarang membunyikan musik keras atau membuat kegaduhan di atas pukul <strong>22:00 WIB</strong>.</li>
                <li>Merokok hanya diperbolehkan di area luar ruangan (outdoor / teras). Dilarang keras merokok di dalam kamar tidur.</li>
                <li>Dilarang membawa barang berbahaya, senjata tajam, narkotika, atau hewan peliharaan tanpa izin pengelola.</li>
              </ul>

              <h3>3. Penggunaan Fasilitas &amp; Kerusakan</h3>
              <ul>
                <li>Seluruh fasilitas villa (kolam renang privat, dapur, dan perlengkapan) dapat digunakan secara bijak.</li>
                <li>Kerusakan atau kehilangan inventaris villa akibat kelalaian tamu akan dikenakan biaya penggantian.</li>
              </ul>
            </div>
          )}

          {/* Bottom Help Box */}
          <div className="mt-12 p-6 bg-charcoal-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gold-500/20 border border-gold-400/40 flex items-center justify-center text-gold-300 flex-shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm">Ada Pertanyaan Seputar Aturan atau Reservasi?</h5>
                <p className="text-xs text-white/60 mt-0.5">Hubungi customer service kami: 0813-8266-7801 / 0816-4819-298</p>
              </div>
            </div>
            <a
              href={`https://wa.me/628164819298`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors flex-shrink-0"
            >
              Hubungi WhatsApp
            </a>
          </div>
        </div>

      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
