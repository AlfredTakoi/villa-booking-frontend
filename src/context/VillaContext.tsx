'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { resolveMediaUrl, buildApiUrl } from '@/lib/utils/api';

export interface VillaProfileData {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  short_description?: string;
  description: string;
  address: string;
  city: string;
  country: string;
  lat: number | string;
  long: number | string;
  maps_embed: string;
  base_price: number | string;
  phone: string;
  email: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  checkin_time: string;
  checkout_time: string;
  cover_image_url: string;
  policies: string;
  allow_guest_selection?: boolean;
  logo_url?: string;
  system_title?: string;
  meta_title?: string;
  meta_description?: string;
  favicon_url?: string;
  frontend_footer_text?: string;
  booking_instructions?: string;
  social_links?: SocialLinkItem[];
}

export interface SocialLinkItem {
  platform: string;
  label: string;
  url: string;
  is_active?: boolean | number;
}

export interface VillaImageItem {
  id?: number;
  url: string;
  caption?: string;
  category?: string;
}

export interface FacilityItem {
  id?: number;
  name: string;
  icon?: string;
  description?: string;
  category?: string;
  is_highlight?: boolean;
  is_included_in_rate?: boolean;
}

export interface BankAccountItem {
  id: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_image_url?: string;
}

export interface RateSeasonItem {
  id: number;
  name?: string;
  season_name?: string;
  price: number | string;
  start_date?: string;
  end_date?: string;
  is_weekend?: boolean;
}

export interface GalleryCategoryItem {
  id?: number;
  code: string;
  name: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface VillaContextType {
  villa: VillaProfileData;
  images: VillaImageItem[];
  facilities: FacilityItem[];
  bankAccounts: BankAccountItem[];
  rateSeasons: RateSeasonItem[];
  galleryCategories: GalleryCategoryItem[];
  socialLinks: SocialLinkItem[];
  isLoading: boolean;
  refreshVilla: () => Promise<void>;
}

const defaultVilla: VillaProfileData = {
  id: 1,
  name: 'Casa Anandefa',
  slug: 'casa-anandefa',
  tagline: 'A Luxury Private Sanctuary in Puncak, Bogor',
  short_description: 'Sewa villa kawasan Puncak dengan panorama alam memukau, kolam renang pribadi, desain estetik, ramah anak & lansia, serta akses mudah dekat Taman Safari.',
  description: 'Selamat datang di Casa Anandefa, villa peristirahatan mewah privat di kawasan Puncak, Bogor. Nikmati suasana sejuk dan asri dengan panorama alam yang indah, kolam renang pribadi, fasilitas meja billiard, area bermain anak, serta kapasitas menginap hingga 20 orang.',
  address: 'Jl. Taman Safari, Cisarua, Puncak, Kabupaten Bogor, Jawa Barat 16750',
  city: 'Puncak, Bogor, Jawa Barat',
  country: 'Indonesia',
  lat: -6.702856,
  long: 106.968712,
  maps_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15852.123456!2d106.968712!3d-6.702856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69b823456789%3A0x123456789!2sPuncak%2C%20Cisarua%2C%20Bogor!5e0!3m2!1sen!2sid!4v1710000000000!5m2!1sen!2sid',
  base_price: 2700000,
  phone: '+62 816-4819-298',
  email: 'reservasi@casaanandefa.com',
  max_guests: 20,
  bedrooms: 2,
  bathrooms: 3,
  area_sqm: 450,
  checkin_time: '14:00',
  checkout_time: '12:00',
  cover_image_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1920&q=80',
  policies: '- Waktu Check-in: 14:00 WIB | Waktu Check-out: 12:00 WIB.\n- Tamu wajib menjaga ketenangan lingkungan setelah pukul 22:00 WIB.\n- Dilarang merokok di dalam ruangan kamar tidur (tersedia area merokok di area outdoor).\n- Kapasitas maksimal villa adalah 20 orang.\n- Hewan peliharaan tidak diperkenankan kecuali dengan izin khusus pihak manajemen.',
  allow_guest_selection: true,
  logo_url: resolveMediaUrl('/villa-logo.png?v=20260923'),
  system_title: 'Casa Anandefa',
  meta_title: 'Casa Anandefa | Sewa Villa Puncak Bogor',
  meta_description: 'Villa Casa Anandefa - sewa penginapan kawasan Puncak Bogor dengan panorama alam memukau, kolam renang pribadi, fasilitas lengkap, dan akses mudah dekat Taman Safari.',
  favicon_url: resolveMediaUrl('/favicon.png?v=20260923'),
  frontend_footer_text: '© 2026 Villa Casa Anandefa. All rights reserved.',
  booking_instructions:
    'Pembayaran DP sebesar Rp 1.000.000 / malam untuk mengunci tanggal menginap.\nSetelah DP diterima, tanggal langsung kami booked dan invoice resmi dikirimkan paling lambat 1 x 24 jam.\nPembatalan tidak dapat dilakukan (non-refundable), namun boleh reschedule maksimal 1x (diinformasikan maksimal 10 hari sebelumnya / H-10).\nBantuan & info ketersediaan: 0813-8266-7801 / 0816-4819-298.',
};

const defaultRateSeasons: RateSeasonItem[] = [
  { id: 1, name: 'Jumat & Minggu', price: 3000000, is_weekend: true },
  { id: 2, name: 'Sabtu (Weekend)', price: 4200000, is_weekend: true },
  { id: 3, name: 'Hari Libur Nasional', price: 0, is_weekend: false },
];

const VillaContext = createContext<VillaContextType>({
  villa: defaultVilla,
  images: [],
  facilities: [],
  bankAccounts: [],
  rateSeasons: defaultRateSeasons,
  galleryCategories: [],
  socialLinks: [],
  isLoading: false,
  refreshVilla: async () => {},
});

export function VillaProvider({ children }: { children: ReactNode }) {
  const [villa, setVilla] = useState<VillaProfileData>(defaultVilla);
  const [images, setImages] = useState<VillaImageItem[]>([]);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>([]);
  const [rateSeasons, setRateSeasons] = useState<RateSeasonItem[]>(defaultRateSeasons);
  const [galleryCategories, setGalleryCategories] = useState<GalleryCategoryItem[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic Browser Tab Title, Meta Description, & Favicon Icon update
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (villa.meta_title) {
        document.title = villa.meta_title;
      }
      if (villa.meta_description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.setAttribute('name', 'description');
          document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', villa.meta_description);
      }
      if (villa.favicon_url) {
        let linkIcon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!linkIcon) {
          linkIcon = document.createElement('link');
          linkIcon.setAttribute('rel', 'icon');
          document.head.appendChild(linkIcon);
        }
        let favUrl = villa.favicon_url.startsWith('//') ? `http:${villa.favicon_url}` : villa.favicon_url;
        if (!favUrl.includes('?')) {
          favUrl += '?v=20260923';
        }
        linkIcon.href = favUrl;
      }
    }
  }, [villa.meta_title, villa.meta_description, villa.favicon_url]);

  const fetchVillaData = async () => {
    try {
      const res = await fetch(buildApiUrl('/api/villa'));
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.villa) {
          setVilla({
            ...defaultVilla,
            ...json.data.villa,
            logo_url: resolveMediaUrl(json.data.logo_url || json.data.villa.logo_url, defaultVilla.logo_url),
            cover_image_url: resolveMediaUrl(json.data.villa.cover_image_url, defaultVilla.cover_image_url),
            system_title: json.data.system_title || json.data.villa.system_title || defaultVilla.system_title,
            meta_title: json.data.meta_title || json.data.villa.meta_title || defaultVilla.meta_title,
            meta_description: json.data.meta_description || json.data.villa.meta_description || defaultVilla.meta_description,
            favicon_url: resolveMediaUrl(json.data.favicon_url || json.data.villa.favicon_url, defaultVilla.favicon_url),
            base_price: Number(json.data.villa.base_price || defaultVilla.base_price),
            max_guests: Number(json.data.villa.max_guests || defaultVilla.max_guests),
            bedrooms: Number(json.data.villa.bedrooms || defaultVilla.bedrooms),
            bathrooms: Number(json.data.villa.bathrooms || defaultVilla.bathrooms),
            area_sqm: Number(json.data.villa.area_sqm || defaultVilla.area_sqm),
            allow_guest_selection:
              json.data.villa.allow_guest_selection === true ||
              json.data.villa.allow_guest_selection === 1 ||
              json.data.villa.allow_guest_selection === '1' ||
              json.data.villa.allow_guest_selection === 't',
            booking_instructions:
              json.data.booking_instructions ||
              json.data.villa.booking_instructions ||
              defaultVilla.booking_instructions,
          });
        }
        if (Array.isArray(json.data.images)) {
          setImages(
            json.data.images.map((img: any) => ({
              id: img.id,
              url: resolveMediaUrl(img.image_url || img.url),
              caption: img.caption,
              category: img.category,
            }))
          );
        }
        if (Array.isArray(json.data.facilities)) {
          setFacilities(
            json.data.facilities.map((f: any) => ({
              id: f.id,
              name: f.name,
              icon: f.icon,
              description: f.description,
              category: f.category,
              is_highlight: Boolean(f.is_highlight),
              is_included_in_rate: f.is_included_in_rate !== undefined ? Boolean(f.is_included_in_rate) : true,
            }))
          );
        }
        if (Array.isArray(json.data.bank_accounts)) {
          setBankAccounts(json.data.bank_accounts);
        }
        if (Array.isArray(json.data.rate_seasons)) {
          setRateSeasons(json.data.rate_seasons);
        }
        if (Array.isArray(json.data.gallery_categories)) {
          setGalleryCategories(json.data.gallery_categories);
        }
        if (Array.isArray(json.data.social_links)) {
          setSocialLinks(json.data.social_links);
        } else if (Array.isArray(json.data.villa?.social_links)) {
          setSocialLinks(json.data.villa.social_links);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil profil villa dari API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVillaData();
  }, []);

  return (
    <VillaContext.Provider
      value={{
        villa,
        images,
        facilities,
        bankAccounts,
        rateSeasons,
        galleryCategories,
        socialLinks,
        isLoading,
        refreshVilla: fetchVillaData,
      }}
    >
      {children}
    </VillaContext.Provider>
  );
}

export function useVilla() {
  return useContext(VillaContext);
}
