'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useVilla } from '@/context/VillaContext';

export default function WhatsAppButton() {
  const { villa } = useVilla();

  const rawPhone = (villa.phone || '').replace(/[^0-9]/g, '');
  const phone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : (rawPhone || process.env.NEXT_PUBLIC_ADMIN_PHONE || '6283865079814');
  const defaultText = encodeURIComponent(`Halo ${villa.name || 'Villa Casa Anandefa'}, saya tertarik untuk menanyakan ketersediaan dan reservasi villa.`);
  const waUrl = `https://wa.me/${phone}?text=${defaultText}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-emerald-600/40 transition-all duration-300 transform hover:-translate-y-1 text-decoration-none"
      aria-label="Chat via WhatsApp"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block pr-1 text-white">
        Tanya {villa.name || 'Villa'} di WhatsApp
      </span>
    </a>
  );
}
