'use client'

import Link from 'next/link'
import { Compass, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center px-6 py-20 bg-sand-50 text-center">
      <div className="max-w-lg w-full bg-white border border-sand-200 rounded-3xl p-10 shadow-xl space-y-6 animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-sand-100 flex items-center justify-center text-gold-600 shadow-inner">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-gold-700 bg-sand-100 px-3 py-1 rounded-full">
            404 • Halaman Tidak Ditemukan
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal-900">
            Sanctuary Tidak Ditemukan
          </h2>
          <p className="text-charcoal-600 text-sm leading-relaxed">
            Halaman yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke beranda untuk menjelajahi keindahan Villa Casa Anandefa.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-sand-300 text-charcoal-700 hover:bg-sand-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gold-600 hover:bg-gold-700 text-white font-medium text-sm shadow-md transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
