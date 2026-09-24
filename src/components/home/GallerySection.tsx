'use client';

import React, { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';
import { useVilla } from '@/context/VillaContext';
import { resolveMediaUrl } from '@/lib/utils/api';

interface ImageItem {
  url: string;
  caption: string;
  category: string;
}

const defaultImages: ImageItem[] = [
  {
    url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80',
    caption: 'Private Infinity Pool with Sun Deck at Dusk',
    category: 'exterior',
  },
  {
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
    caption: 'Open Air Living Pavilion with Tropical Breeze',
    category: 'interior',
  },
  {
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=80',
    caption: 'Master Suite with King Bed and Garden View',
    category: 'bedroom',
  },
  {
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80',
    caption: 'Semi-open Spa Bathroom with Natural Stone Tub',
    category: 'bathroom',
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    caption: 'Sunken Pool Lounge & Daybeds',
    category: 'exterior',
  },
  {
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80',
    caption: 'Gourmet Kitchen & Dining Area',
    category: 'interior',
  },
];

export default function GallerySection({ images }: { images?: ImageItem[] }) {
  const { villa, images: apiImages, galleryCategories } = useVilla();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Handle open & close fade-in/fade-out transitions
  useEffect(() => {
    if (selectedImage) {
      setActiveImage(selectedImage);
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 20);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else if (activeImage) {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setActiveImage(null);
      }, 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [selectedImage]);

  const handleClose = () => {
    setSelectedImage(null);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const dynamicImages: ImageItem[] = (apiImages && apiImages.length > 0)
    ? apiImages.map((img) => ({
        url: img.url,
        caption: img.caption || villa.name || 'Villa Casa Anandefa',
        category: img.category || 'exterior',
      }))
    : defaultImages;

  const displayImages = (images && images.length > 0) ? images : dynamicImages;

  const filtered = activeTab === 'all'
    ? displayImages
    : displayImages.filter((img) => img.category === activeTab);

  // Dynamic category tabs from CMS settings
  const categoryTabs = [
    { id: 'all', label: 'Semua Foto' },
    ...(galleryCategories && galleryCategories.length > 0
      ? galleryCategories.map((c) => ({ id: c.code, label: c.name }))
      : [
          { id: 'exterior', label: 'Kolam Renang & Luar' },
          { id: 'interior', label: 'Ruang Santai' },
          { id: 'bedroom', label: 'Kamar Tidur' },
          { id: 'bathroom', label: 'Kamar Mandi Spa' },
        ]),
  ];

  const getCategoryLabel = (catCode: string) => {
    const found = galleryCategories?.find((c) => c.code === catCode);
    if (found) return found.name;
    const defaultMap: Record<string, string> = {
      exterior: 'Kolam Renang & Luar',
      interior: 'Ruang Santai',
      bedroom: 'Kamar Tidur',
      bathroom: 'Kamar Mandi Spa',
    };
    return defaultMap[catCode] || catCode;
  };

  return (
    <section id="gallery" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 mt-4 mb-4">
            Eksplorasi Setiap Sudut Kemewahan Villa
          </h2>
          <p className="text-charcoal-800/70 text-sm sm:text-base font-light">
            Setiap detil arsitektur, interior, dan lanskap dirancang dengan teliti untuk memberikan kenyamanan berlibur tanpa tanding di {villa.city || 'Puncak, Bogor'}.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-charcoal-900 text-gold-400 shadow-md'
                  : 'bg-sand-100 text-charcoal-800 hover:bg-sand-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(img)}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-luxury transition-all duration-500 bg-sand-200"
            >
              <img
                src={resolveMediaUrl(img.url)}
                alt={img.caption}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-gold-300 text-xs uppercase tracking-wider font-semibold mb-1">
                  {getCategoryLabel(img.category)}
                </span>
                <p className="text-white font-serif text-lg font-bold">
                  {img.caption}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-white/80 font-medium">
                  <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                  <span>Lihat Ukuran Penuh</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal with Smooth Fade-In & Fade-Out */}
      {activeImage && (
        <div
          className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 transition-opacity duration-300 ease-out ${
            isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleClose}
        >
          <div
            className={`relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center transition-all duration-300 ease-out transform ${
              isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute -top-4 right-0 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              aria-label="Tutup"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={resolveMediaUrl(activeImage.url)}
              alt={activeImage.caption}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="text-center mt-4 text-white">
              <h3 className="font-serif text-xl font-bold">{activeImage.caption}</h3>
              <p className="text-xs text-gold-400 uppercase tracking-widest mt-1">
                {villa.name || 'Villa Casa Anandefa'} {villa.city ? `• ${villa.city}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

