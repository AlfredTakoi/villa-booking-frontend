import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import GallerySection from '@/components/home/GallerySection';
import FacilitiesSection from '@/components/home/FacilitiesSection';
import PricingRatesSection from '@/components/home/PricingRatesSection';
import LocationSection from '@/components/home/LocationSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-sand-50">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <GallerySection />
      <FacilitiesSection />
      <PricingRatesSection />
      <LocationSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
