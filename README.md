# Villa Casa Anandefa — Frontend Web Application

Aplikasi web modern, responsif, dan elegan untuk **Villa Casa Anandefa** (Kawasan Puncak, Bogor). Dibangun menggunakan **Next.js (App Router)**, **TypeScript**, dan **Tailwind CSS** dengan nuansa estetika luxury (*Gold, Charcoal, and Sand*), aplikasi ini memberikan pengalaman reservasi villa kelas premium bagi para tamu.

---

## 🌟 Fitur & Halaman Utama

### 1. Beranda Eksklusif (`/`)
* **Showcase Properti Villa:** Galeri foto resolusi tinggi, fasilitas lengkap (kolam renang pribadi, ruang biliar, kamar tidur mewah, wifi berkecepatan tinggi, butler 24 jam).
* **Prakiraan Tarif & Musim:** Tampilan transparan untuk tarif hari kerja (*weekday*), akhir pekan (*weekend*), dan *high season*.
* **Formulir Reservasi Interaktif (Modal Booking):** Pemilihan tanggal menginap dengan kalender ketersediaan real-time, opsi pembayaran DP (Rp 1.000.000/malam) atau Full Payment, pemilihan jumlah tamu, dan estimasi biaya instan.

### 2. Instruksi Pembayaran & Unggah Bukti (`/booking?code=...`)
* **Pencarian Data Pemesanan Otomatis:** Menampilkan nomor rekening tujuan transfer bank resmi, rincian biaya, dan batas waktu transfer (*deadline countdown*).
* **Unggah Bukti Pembayaran:** Formulir upload bukti transfer dengan pratinjau gambar langsung dan status verifikasi instan.
* **Salin Rekening & Kode Booking:** Fitur *one-click copy* untuk nomor rekening bank dan kode booking agar mempermudah tamu saat transfer via mobile banking.

### 3. Cek Status Reservasi & Reschedule (`/cek-booking`)
* **Lacak Status Real-Time:** Tamu dapat memeriksa perkembangan pemesanan menggunakan Kode Booking (contoh: `CA-YYYYMMDD-XXXX`) dan verifikasi nomor WhatsApp.
* **Indikator Progres 4 Tahap:**
  1. *Booking Dibuat* $\rightarrow$ 2. *Transfer Bank* $\rightarrow$ 3. *Verifikasi Admin* $\rightarrow$ 4. *Terkonfirmasi & Lunas*
* **Unduh Dokumen Invoice Resmi (PDF):** Tombol unduh langsung invoice resmi berformat PDF ketika pembayaran telah disetujui oleh admin.
* **Fitur Reschedule Jadwal Interaktif:**
  * Modal pemilihan tanggal menginap baru dengan validasi tanggal bentrok.
  * Validasi otomatis kebijakan villa: minimal 10 hari sebelum tanggal check-in (H-10) dan kuota maksimal 1 kali reschedule.

---

## 🛠️ Teknologi yang Digunakan

* **Framework:** Next.js (App Router, React 19)
* **Bahasa:** TypeScript
* **Styling:** Tailwind CSS (Custom Color Palette: Gold, Charcoal, Sand, Emerald)
* **Icons:** Lucide React & Phosphor Icons
* **API Communication:** Fetch API terhubung ke Backend REST API (Yii2)

---

## 📁 Struktur Direktori

```text
dashboard-utama/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout dengan typography & metadata SEO
│   │   ├── page.tsx           # Halaman beranda utama villa
│   │   ├── booking/           # Halaman instruksi pembayaran & upload bukti
│   │   │   └── page.tsx
│   │   └── cek-booking/       # Halaman cek status reservasi & reschedule
│   │       └── page.tsx
│   ├── components/
│   │   ├── booking/           # Modal & komponen form reservasi online
│   │   ├── home/              # Komponen galeri, fasilitas, testimoni, dan FAQ
│   │   ├── layout/            # Navbar mewah dan footer informasi kontak
│   │   └── ui/                # Komponen UI reusable (kalender kustom, tombol, modal)
│   ├── context/
│   │   └── VillaContext.tsx   # Global state untuk data profil villa & ketersediaan
│   └── lib/                   # Utility fungsi & helper API
├── public/                    # Aset statis gambar, logo, dan favicon
├── next.config.ts             # Konfigurasi Next.js (rewrites API ke backend)
└── tailwind.config.ts         # Konfigurasi token desain Tailwind
```

---

## 🚀 Menjalankan Project

### 1. Instalasi Dependensi
Pastikan Node.js (versi 18.x atau lebih baru) sudah terpasang di komputer Anda.

```bash
npm install
```

### 2. Konfigurasi Environment (`.env.local`)
Buat file `.env.local` pada root direktori `dashboard-utama/`:

```env
# URL server backend Yii2 (Laragon lokal atau server produksi)
SIPKK_BACKEND_BASE_URL=http://localhost/booking-app
NEXT_PUBLIC_SIPKK_BACKEND_BASE_URL=http://localhost/booking-app

# Prefix subfolder jika dideploy di cPanel (opsional)
NEXT_PUBLIC_BASE_PATH=
```

### 3. Jalankan Server Development

```bash
npm run dev
```

Buka peramban di `http://localhost:3000` untuk melihat aplikasi web.

### 4. Build untuk Produksi

```bash
npm run build
npm run start
```

---

## 📄 Lisensi
Hak Cipta © 2026 **Casa Anandefa Villa Management**. Seluruh hak cipta dilindungi.
