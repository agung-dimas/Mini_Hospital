# Mini Hospital — Integrasi Sistem Informasi Pelayanan Pasien dan Farmasi

Repositori ini merupakan implementasi sistem informasi berbasis **Monorepo** yang mengintegrasikan pelayanan pasien rumah sakit dan pengelolaan resep di farmasi untuk tugas mini project mata kuliah *Enterprise Application Integration (EAI)*.

---

## 🏗 Arsitektur Sistem

- **Arsitektur:** Monorepo (npm workspaces) dengan 2 aplikasi Next.js independen.
- **Database:** Supabase PostgreSQL ganda terisolasi (`mini-hospital-db` dan `mini-pharmacy-db`).
- **ORM & Migrasi Otomatis:** Prisma ORM (`@prisma/client` & `prisma migrate`).
- **Komunikasi Antarlayanan:** REST API berbasis JSON (Bahasa Indonesia) *server-to-server* dengan token rahasia & Idempotency Key.
- **UI Framework:** Tailwind CSS v4 + shadcn/ui.

| Aplikasi | Path Folder | Port Default | Supabase Proyek | Tanggung Jawab Bisnis |
|---|---|---|---|---|
| **Hospital** | `apps/hospital` | `3000` | Supabase A (`mini-hospital-db`) | Pasien, Dokter, Kunjungan, Pemeriksaan, Resep Dokter |
| **Pharmacy** | `apps/pharmacy` | `3001` | Supabase B (`mini-pharmacy-db`) | Master Obat, Stok, Penerimaan Resep, Penyerahan Obat |

---

## 🚀 Panduan Memulai Cepat

### 1. Prasyarat
- Node.js >= 20
- npm >= 10

### 2. Konfigurasi Environment Variables
Salin berkas contoh konfigurasi di masing-masing aplikasi:

```bash
# Pada apps/hospital
cp apps/hospital/.env.example apps/hospital/.env.local

# Pada apps/pharmacy
cp apps/pharmacy/.env.example apps/pharmacy/.env.local
```

Isi variabel `DATABASE_URL`, `DIRECT_URL`, dan kredensial Supabase Anda di masing-masing `.env.local`.

### 3. Menjalankan Aplikasi Development

Dari root repositori:

```bash
# Menjalankan kedua aplikasi secara bersamaan
npm run dev

# Atau jalankan salah satu aplikasi:
npm run dev:hospital    # Hospital berjalan di http://localhost:3000
npm run dev:pharmacy    # Pharmacy berjalan di http://localhost:3001
```

### 4. Build & Linting

```bash
# Build kedua aplikasi
npm run build

# Linting kode
npm run lint
```

---

## 📦 Struktur Repositori

```text
Mini_Hospital/
├── apps/
│   ├── hospital/                     # Next.js App Router (Port 3000)
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Skema Database Supabase A
│   │   ├── src/
│   │   │   ├── app/                  # Halaman & Rute API v1
│   │   │   ├── components/ui/        # Komponen shadcn/ui
│   │   │   └── lib/
│   │   │       ├── prisma.ts         # Singleton PrismaClient
│   │   │       ├── supabase/         # Client & Server SSR Supabase
│   │   │       ├── validation/       # Validasi Zod schema
│   │   │       └── integrations/     # Klien HTTP antarlayanan
│   │   └── package.json
│   └── pharmacy/                     # Next.js App Router (Port 3001)
│       ├── prisma/
│       │   └── schema.prisma         # Skema Database Supabase B
│       ├── src/
│       │   ├── app/                  # Halaman & Rute API v1
│       │   ├── components/ui/        # Komponen shadcn/ui
│       │   └── lib/
│       │       ├── prisma.ts         # Singleton PrismaClient
│       │       ├── supabase/         # Client & Server SSR Supabase
│       │       ├── validation/       # Validasi Zod schema
│       │       └── integrations/     # Klien HTTP antarlayanan
│       └── package.json
├── docs/
│   └── PRD.md                        # Product Requirements Document
├── package.json                      # Root npm workspaces
└── README.md
```

---

## 📄 Dokumen Spesifikasi
Spesifikasi lengkap kontrak API, aturan status resep, dan skema database dapat dilihat pada [PRD.MD](PRD.MD).
