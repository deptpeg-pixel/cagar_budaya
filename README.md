# Cagar Budaya GPIB — Inventarisasi & Peta Sebaran

Aplikasi web modern berbasis **Next.js 15/16 + React 19 + Tailwind CSS + Supabase + Vercel** untuk inventarisasi 35 bangunan cagar budaya bersejarah Gereja Protestan di Indonesia bagian Barat (GPIB).

---

## Fitur Utama

### 1. Ranah Publik (Read-Only)
* **Dual View Experience**:
  * **Mode Deck Slide Klasik**: Tampilan presentasi sinematik dengan lengkungan arsitektur (*arch frame*), transisi halus, narasi sejarah, dan navigasi slide keyboard (`←` / `→` / `Spasi`).
  * **Mode Katalog Grid**: Tampilan kartu modern dengan pencarian instan (*live search*), filter status penetapan (*Nasional, Provinsi, Kota, Kabupaten*), dan sortir.
* **Peta Sebaran Interaktif (Leaflet + OpenStreetMap)**: Titik koordinat seluruh gereja dengan pin warna status penetapan, popup foto preview, dan tombol lompat ke detail gedung.
* **Galeri Foto & Lightbox**: Pratinjau foto resolusi tinggi, caption keterangan foto, dan dukungan toggle *fit* (`contain` / `cover`).
* **Rekapitulasi Data**: Visualisasi pembagian status cagar budaya dan filter cepat.
* **Cetak Dokumen & PDF**: Dukungan *print-ready* CSS.

### 2. Ranah Admin (CRUD Sederhana & Aman)
* **Login Admin Sederhana** (`/admin/login`): Autentikasi menggunakan Supabase Auth (atau password demo `admin123` untuk pengujian lokal).
* **Dashboard Kelola Data** (`/admin`):
  * **Create**: Tambah bangunan cagar budaya baru.
  * **Read**: Ringkasan statistik, filter, dan tabel data lengkap.
  * **Update**: Edit teks narasi, nomor SK, tanggal penetapan, dan alamat.
  * **Geocoding Otomatis**: Tombol *⌖ Cari Titik* dari alamat menggunakan Nominatim OpenStreetMap untuk mengisi koordinat lintang & bujur secara otomatis.
  * **Kelola & Unggah Foto**: Upload langsung file foto ke **Supabase Storage** (bucket `cagar-budaya-photos`).
  * **Delete**: Hapus foto atau data bangunan dengan konfirmasi keamanan.
  * **Cadangan Data (Backup)**: Ekspor seluruh data dalam 1 klik ke format JSON.

---

## Panduan Setup Supabase

1. Buat proyek baru di [Supabase](https://supabase.com).
2. Masuk ke menu **SQL Editor**:
   * Buka dan jalankan script file [`supabase/schema.sql`](supabase/schema.sql) untuk membuat tabel `bangunan_cagar_budaya`, `bangunan_fotos`, dan storage bucket.
   * Buka dan jalankan script file [`supabase/seed.sql`](supabase/seed.sql) untuk mengunggah otomatis ke-35 data awal bangunan GPIB.
3. Masuk ke menu **Authentication -> Users** di Supabase, lalu buat 1 akun kurator (misal: `admin@gpib.or.id`).
4. Salin URL dan Anon Key dari menu **Project Settings -> API**:
   Buat file `.env.local` di folder proyek ini:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

> **Catatan**: Jika environment Supabase belum diisi, aplikasi akan tetap berjalan dengan aman menggunakan data bawaan (`src/data/initialData.ts`) dan penyimpanan peramban lokal.

---

## Menjalankan di Komputer Lokal

```bash
# Jalankan server pengembangan
npm run dev

# Buka http://localhost:3000 di peramban Anda
```

Untuk masuk ke panel admin lokal, kunjungi `http://localhost:3000/admin/login` (Gunakan password demo: `admin123`).

---

## Panduan Deploy ke Vercel

1. Push folder proyek ini ke repositori GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: inisialisasi Cagar Budaya GPIB Next.js + Supabase"
   git push origin main
   ```
2. Buka [Vercel](https://vercel.com) dan pilih **Add New Project** -> Impor repositori GitHub tersebut.
3. Pada bagian **Environment Variables** di Vercel, tambahkan:
   * `NEXT_PUBLIC_SUPABASE_URL` = (URL Supabase Anda)
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Anon Key Supabase Anda)
4. Klik **Deploy**! Proyek akan otomatis online dalam waktu kurang dari 2 menit.
