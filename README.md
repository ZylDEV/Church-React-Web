# Web Gereja

Aplikasi web profil gereja yang dibangun dengan **React 19** dan **Tailwind CSS**, menggunakan **Firebase** dan **Supabase** sebagai backend services.

## Fitur

### Halaman Publik
- **Beranda** — Halaman utama dengan intro, info cards, foto rayon/kegiatan, dan media sosial
- **Ruang Informasi** — Informasi dan pengumuman gereja
- **Jadwal Ibadah** — Jadwal ibadah mingguan
- **Sidang Jemaat** — Data sidang jemaat
- **Informasi Keuangan** — Laporan keuangan gereja
- **Renungan Mingguan** — Renungan rohani mingguan
- **Dokumentasi** — Dokumentasi foto kegiatan
- **Halaman Detail** — Halaman dinamis untuk konten informasi detail (`/informasi/:slug`)

### Admin Dashboard (`/dashboard`)
Dashboard terproteksi untuk mengelola konten website, meliputi CRUD untuk:
- Informasi
- Jadwal Ibadah
- Sidang Jemaat
- Keuangan
- Renungan Mingguan
- Dokumentasi
- Foto Carousel
- Struktur Organisasi
- **Analisis Data** — Visualisasi data menggunakan Recharts

## Teknologi

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | React 19 |
| **Routing** | React Router 7 |
| **Styling** | Tailwind CSS 3, PostCSS, Autoprefixer |
| **Animasi** | Framer Motion, Swiper |
| **Backend** | Firebase (Auth, Hosting) |
| **Database** | Supabase (PostgreSQL) |
| **Charts** | Recharts |
| **Icons** | Lucide React, React Icons |
| **Export** | SheetJS (xlsx), FileSaver |
| **Date** | date-fns, react-datepicker |

## Prasyarat

- Node.js 18+ 
- npm 9+

## Instalasi

```bash
npm install
```

## Konfigurasi Environment

Buat file `.env` di root project:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

```bash
npm start        # Jalankan di mode development (http://localhost:3000)
npm run build    # Build untuk production ke folder build/
npm test         # Jalankan test runner
```

## Deployment

Project ini di-deploy menggunakan **Firebase Hosting**. Untuk deploy:

```bash
npm run build
firebase deploy
```

Konfigurasi hosting ada di `firebase.json` dan project default adalah `web-gereja-2249d`.

## Struktur Folder

```
src/
├── components/
│   ├── common/        # Komponen umum (CardSection, Modal)
│   ├── homepage/      # Komponen halaman beranda
│   └── TabelData/     # Komponen tabel & modal admin CRUD
├── config/
│   ├── firebaseConfig.jsx
│   └── supabaseClient.jsx
├── data/
│   ├── konten/        # Halaman konten publik
│   └── informasiDetailData.js
├── pages/
│   ├── HomePage.jsx
│   ├── AdminDashboard.jsx
│   └── InformasiDetail.jsx
├── routes/
│   └── ProtectedRoute.jsx
├── App.js
├── index.js
└── index.css
```
