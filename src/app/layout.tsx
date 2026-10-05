import type { Metadata } from "next";
import "./globals.css";
import { VillaProvider } from "@/context/VillaContext";

export async function generateMetadata(): Promise<Metadata> {
  const backendBase =
    process.env.SIPKK_BACKEND_BASE_URL ||
    process.env.NEXT_PUBLIC_SIPKK_BACKEND_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost/booking-app';
  let title = "Casa Anandefa | Sewa Villa Puncak Bogor";
  let description = "Villa Casa Anandefa - sewa penginapan kawasan Puncak Bogor dengan panorama alam memukau, kolam renang pribadi, fasilitas lengkap, dan akses mudah dekat Taman Safari.";
  let favicon = "/favicon.png";

  try {
    const res = await fetch(`${backendBase}/api/settings`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const s = json.settings || {};
      if (s.meta_title) title = s.meta_title;
      if (s.meta_description) description = s.meta_description;
      if (s.favicon) {
        favicon = s.favicon.startsWith('//') ? `http:${s.favicon}` : s.favicon;
      }
    }
  } catch (e) {
    // fallback to defaults if server initializing
  }

  return {
    title,
    description,
    keywords: ["Villa Puncak", "Villa Casa Anandefa", "Casa Anandefa", "Sewa Villa Puncak", "Villa Dekat Taman Safari", "Villa Kolam Renang Puncak"],
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/villa-logo.png",
          width: 800,
          height: 800,
          alt: "Casa Anandefa Logo",
        },
      ],
    },
    icons: {
      icon: [
        { url: '/favicon.png?v=20260923', type: 'image/png' },
        { url: '/favicon.ico?v=20260923' },
      ],
      shortcut: '/favicon.png?v=20260923',
      apple: '/villa-logo.png?v=20260923',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-sand-50 text-charcoal-900" suppressHydrationWarning>
        <VillaProvider>
          {children}
        </VillaProvider>
      </body>
    </html>
  );
}
