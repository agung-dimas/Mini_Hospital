# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# MINI HOSPITAL — Integrasi Sistem Informasi Pelayanan Pasien dan Farmasi

**Versi:** 1.2  
**Status:** Rancangan Final (Standarisasi Bahasa Indonesia, Endpoint REST API & Otomasi Database Prisma)  
**Platform:** Web  
**Bahasa:** TypeScript  
**Framework:** Next.js App Router  
**UI:** Tailwind CSS + shadcn/ui  
**Database:** Supabase PostgreSQL  
**ORM & Database Automation:** Prisma ORM (`@prisma/client`, `prisma`)  
**Arsitektur:** Monorepo, dua aplikasi independen, REST API

---

## 1. Ringkasan Proyek

Mini Hospital adalah sistem informasi yang mengintegrasikan pelayanan pasien di rumah sakit dengan pengelolaan resep dan persediaan obat di farmasi.

Sistem terdiri dari dua aplikasi Next.js yang disimpan dalam satu repository GitHub, tetapi memiliki kode aplikasi, tanggung jawab bisnis, konfigurasi, dan database Supabase masing-masing.

Kedua aplikasi berkomunikasi menggunakan REST API berbasis JSON melalui backend masing-masing. Aplikasi tidak boleh mengakses database milik aplikasi lainnya secara langsung.

Proyek ini dikembangkan untuk memenuhi kebutuhan mini project mata kuliah Enterprise Application Integration, dengan fokus pada pemisahan layanan, pertukaran data, konsistensi status resep, dan pengelolaan stok obat.

---

## 2. Tujuan Produk

1. Membangun aplikasi pelayanan rumah sakit untuk pengelolaan pasien, dokter, kunjungan, pemeriksaan, diagnosis, dan resep.
2. Membangun aplikasi farmasi untuk pengelolaan obat, stok, penerimaan resep, dan penyerahan obat.
3. Mengintegrasikan kedua aplikasi melalui REST API.
4. Memastikan setiap aplikasi memiliki database dan kewenangan data yang jelas.
5. Menerapkan otomasi migrasi dan akses database yang type-safe menggunakan Prisma ORM.
6. Menerapkan autentikasi, otorisasi berbasis peran, validasi input, dan pencatatan aktivitas.
7. Menghasilkan aplikasi yang modular, responsif, mudah dipelihara, dan dapat dikembangkan secara independen.

---

## 3. Keputusan Arsitektur

### 3.1 Monorepo

Gunakan satu repository GitHub bernama `Mini_Hospital`.

Repository berisi dua aplikasi Next.js:
- `apps/hospital`: Hospital Management System (Port 3000).
- `apps/pharmacy`: Pharmacy Management System (Port 3001).

Gunakan npm workspaces untuk mengelola kedua aplikasi dari root repository.

### 3.2 Database

Gunakan dua proyek Supabase terpisah:

**Supabase A — Hospital (`mini-hospital-db`)**
Menyimpan:
- Data profil pengguna & peran.
- Data pasien.
- Data dokter.
- Data kunjungan.
- Data pemeriksaan dan diagnosis.
- Data resep.
- Detail item resep.
- Log peristiwa integrasi dan audit.

**Supabase B — Pharmacy (`mini-pharmacy-db`)**
Menyimpan:
- Data profil pengguna & peran farmasi.
- Master data obat.
- Data pesanan resep yang diterima dari rumah sakit.
- Detail item pesanan resep.
- Data detail penyerahan obat.
- Riwayat pergerakan stok obat.
- Log integrasi dan audit.

Supabase menggunakan PostgreSQL. Jangan menggunakan MySQL untuk rancangan ini.

### 3.3 Komunikasi Antaraplikasi

Komunikasi dilakukan melalui REST API dengan format JSON dan HTTPS pada deployment.

- Hospital menyediakan API untuk mengambil data resep dan menerima pembaruan status resep.
- Pharmacy menyediakan API untuk katalog master obat, pemeriksaan stok, penerimaan resep, dan pemrosesan penyerahan obat.
- Semua komunikasi antarlayanan dilakukan melalui backend (*server-to-server*). Jangan melakukan pemanggilan API rahasia dari browser.

### 3.4 Teknologi

- Next.js App Router
- React
- TypeScript dengan strict mode
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL (Database hosting & Auth)
- Prisma ORM (`@prisma/client`, `prisma` CLI untuk pemodelan data, type-safe queries, dan migrasi otomatis)
- `@supabase/supabase-js` & `@supabase/ssr` untuk autentikasi SSR
- Zod untuk validasi input skema
- npm workspaces
- Git dan GitHub
- OpenAPI untuk dokumentasi API

---

## 4. Struktur Repository

Target struktur folder monorepo:

```text
Mini_Hospital/
├── apps/
│   ├── hospital/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (dashboard)/
│   │   │   │   └── api/
│   │   │   │       └── v1/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts
│   │   │   │   ├── supabase/
│   │   │   │   ├── validation/
│   │   │   │   └── integrations/
│   │   │   └── types/
│   │   ├── components/ui/
│   │   ├── public/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── ...
│   └── pharmacy/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   ├── (dashboard)/
│       │   │   └── api/
│       │   │       └── v1/
│       │   ├── components/
│       │   ├── lib/
│       │   │   ├── prisma.ts
│       │   │   ├── supabase/
│       │   │   ├── validation/
│       │   │   └── integrations/
│       │   └── types/
│       ├── components/ui/
│       ├── public/
│       ├── .env.example
│       ├── package.json
│       └── ...
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   └── api-spec.yaml
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

Tambahkan package bersama hanya jika diperlukan, misalnya untuk tipe data kontrak API bersama. Jangan mencampurkan logika bisnis Hospital dan Pharmacy.

---

## 5. Pengguna dan Hak Akses

### 5.1 Administrator
- Mengakses fitur administratif sesuai kewenangan.
- Mengelola akun dan peran pengguna.
- Melihat log aktivitas dan status integrasi.
- Tidak otomatis mendapatkan hak mengubah diagnosis medis atau menyerahkan obat.

### 5.2 Petugas Pendaftaran
- Mendaftarkan dan memperbarui data pasien.
- Mencari data pasien berdasarkan nama atau nomor rekam medis.
- Mencatat kunjungan pasien ke dokter.
- Melihat status antrean kunjungan.

### 5.3 Dokter
- Melihat daftar kunjungan pasien yang menjadi kewenangannya.
- Mencatat hasil pemeriksaan, catatan medis, dan diagnosis.
- Membuat resep dan item obat.
- Memantau status pemrosesan resep obat di farmasi.

### 5.4 Apoteker atau Petugas Farmasi
- Melihat daftar resep yang masuk dari rumah sakit.
- Memeriksa keabsahan resep dan ketersediaan stok obat.
- Memproses penyerahan obat ke pasien.
- Mengirim pembaruan status resep kembali ke rumah sakit.
- Melihat riwayat pergerakan stok.

### 5.5 Pengelola Farmasi
- Mengelola master obat (tambah, edit, atur batas minimum).
- Memantau kondisi stok obat dan peringatan stok menipis.
- Mencatat penerimaan stok baru dari pemasok dan penyesuaian stok manual.
- Melihat audit riwayat pergerakan stok.

Otorisasi harus divalidasi di server (Server Actions / Route Handlers / RLS Supabase), tidak hanya menyembunyikan tombol di frontend.

---

## 6. Modul Hospital Management System

Aplikasi Hospital menggunakan Next.js dan Supabase A.

### 6.1 Autentikasi
- Halaman masuk (login) & keluar (logout).
- Manajemen sesi berbasis cookie aman (SSR).
- Proteksi route dashboard dan penanganan sesi kedaluwarsa.

### 6.2 Dashboard Rumah Sakit
Menampilkan ringkasan data aktual:
- Total pasien terdaftar.
- Kunjungan hari ini.
- Jumlah dokter aktif.
- Jumlah resep yang diterbitkan hari ini.
- Status resep: draf, diterbitkan, diterima farmasi, diproses, selesai diserahkan, dan ditolak.

### 6.3 Manajemen Pasien
- Daftar pasien dengan pencarian nama & nomor rekam medis unik.
- Formulir pendaftaran pasien baru dan edit data pasien.
- Validasi data wajib (tanggal lahir, jenis kelamin, alamat).

### 6.4 Manajemen Dokter
- Daftar dokter aktif & spesialisasi.
- Penambahan dan pembaruan profil dokter.

### 6.5 Manajemen Kunjungan
- Pencatatan kunjungan baru (menghubungkan pasien, dokter, waktu kunjungan, dan status kunjungan).
- Riwayat kunjungan pasien.

### 6.6 Pemeriksaan dan Diagnosis
- Pencatatan hasil pemeriksaan fisik, diagnosis medis, dan catatan dokter.
- Relasi satu ke satu atau satu ke banyak dengan kunjungan.

### 6.7 Manajemen Resep
- Penerbitan resep dari kunjungan medis.
- Multi-item obat dengan jumlah dan instruksi/aturan pakai.
- Penyimpanan atomik antara resep dan detail item resep.
- Pelacakan status resep secara *real-time* dari Farmasi.
- Resep yang telah diterbitkan tidak dapat diubah sembarangan; pembatalan harus melalui prosedur resmi.

---

## 7. Modul Pharmacy Management System

Aplikasi Pharmacy menggunakan Next.js dan Supabase B.

### 7.1 Dashboard Farmasi
Menampilkan ringkasan data aktual:
- Jumlah master obat aktif.
- Jumlah resep masuk yang menunggu verifikasi.
- Resep yang sedang disiapkan/diproses.
- Resep selesai diserahkan hari ini.
- Peringatan stok obat yang berada di bawah stok minimum.
- Log penyerahan obat terbaru.

### 7.2 Master Obat
- Daftar katalog obat (kode obat, nama, bentuk obat, kekuatan, satuan, stok minimum, status aktif).
- Tambah & edit data obat.
- Penghapusan obat menggunakan *soft delete* (kolom `aktif = false`) untuk menjaga integritas riwayat transaksi.

### 7.3 Manajemen Stok
- Pemantauan jumlah stok obat terkini.
- Penerimaan stok baru dan penyesuaian stok dengan alasan tertulis.
- Riwayat pergerakan stok (`pergerakan_stok`).
- Validasi pencegahan stok negatif.
- Pemotongan stok dilakukan secara atomik menggunakan PostgreSQL RPC/transaksi aman konkurensi.

### 7.4 Penerimaan Resep
- Mengambil daftar resep dari API Hospital yang berstatus `diterbitkan`.
- Mengambil detail resep berdasarkan ID.
- Menyimpan salinan minimum ke tabel `pesanan_resep` dan `detail_pesanan_resep` di Supabase Farmasi.
- Mencegah penerimaan resep ganda melalui *unique constraint* pada `resep_rumah_sakit_id`.

### 7.5 Pemrosesan dan Penyerahan Obat
- Verifikasi ketersediaan stok terhadap jumlah yang diminta.
- Pencatatan penyerahan obat (`detail_penyerahan_obat`).
- Pemotongan stok secara atomik dan pencatatan pergerakan stok (`jenis_pergerakan = 'penyerahan'`).
- Pembaruan status pesanan resep menjadi `diserahkan` (atau `diserahkan_sebagian`).
- Pengiriman pembaruan status ke Hospital secara idempoten melalui API Hospital.

---

## 8. Rancangan Database

### 8.1 Aturan Penamaan Database

Seluruh objek database menggunakan bahasa Indonesia dengan ketentuan:
1. Nama tabel menggunakan bahasa Indonesia dalam bentuk jamak/tunggal yang lazim.
2. Nama kolom menggunakan bahasa Indonesia dengan format `snake_case`.
3. Nama tabel dan kolom menggunakan huruf kecil.
4. Istilah bisnis seragam antara kedua aplikasi.
5. Primary key bernama `id` dengan tipe data UUID (`gen_random_uuid()`).
6. Foreign key internal menggunakan format `[nama_entitas]_id`.
7. Kolom penanda waktu menggunakan akhiran `_pada` (misal: `dibuat_pada`, `diperbarui_pada`).
8. Kolom status menggunakan nama `status`.
9. Nama tabel, kolom, relasi, tipe data TypeScript, dan endpoint API harus selaras.

---

### 8.2 Database A — Rumah Sakit (`mini-hospital-db`)

#### Tabel `profil_pengguna`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key, terhubung ke `auth.users.id` Supabase Auth |
| `nama_lengkap` | TEXT | Nama lengkap pengguna |
| `peran` | TEXT | Peran pengguna (`admin`, `pendaftaran`, `dokter`) |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan data |
| `diperbarui_pada` | TIMESTAMPTZ | Waktu terakhir diperbarui |

#### Tabel `pasien`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `nomor_rekam_medis` | TEXT | Nomor rekam medis pasien, unik |
| `nama_lengkap` | TEXT | Nama lengkap pasien |
| `tanggal_lahir` | DATE | Tanggal lahir |
| `jenis_kelamin` | TEXT | Jenis kelamin (`laki-laki`, `perempuan`) |
| `alamat` | TEXT | Alamat tempat tinggal |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pendaftaran |
| `diperbarui_pada` | TIMESTAMPTZ | Waktu terakhir diperbarui |

#### Tabel `dokter`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `pengguna_id` | UUID | Referensi opsional ke `profil_pengguna.id` |
| `nama_lengkap` | TEXT | Nama lengkap dokter |
| `spesialisasi` | TEXT | Bidang keahlian spesialisasi |
| `aktif` | BOOLEAN | Status aktif dokter |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |

#### Tabel `kunjungan`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `pasien_id` | UUID | FK ke `pasien.id` |
| `dokter_id` | UUID | FK ke `dokter.id` |
| `waktu_kunjungan` | TIMESTAMPTZ | Waktu kunjungan berlangsung |
| `status` | TEXT | Status kunjungan (`menunggu`, `sedang_diperiksa`, `selesai`, `batal`) |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |

#### Tabel `pemeriksaan`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `kunjungan_id` | UUID | FK ke `kunjungan.id` |
| `diagnosis` | TEXT | Diagnosis penyakit dari dokter |
| `catatan` | TEXT | Catatan observasi klinis dokter |
| `dibuat_oleh` | UUID | ID dokter pembuat |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pemeriksaan |

#### Tabel `resep`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `kunjungan_id` | UUID | FK ke `kunjungan.id` |
| `pasien_id` | UUID | FK ke `pasien.id` |
| `dokter_id` | UUID | FK ke `dokter.id` |
| `status` | TEXT | Status resep (`draf`, `diterbitkan`, `diterima`, `diproses`, `diserahkan_sebagian`, `diserahkan`, `ditolak`, `dibatalkan`) |
| `diterbitkan_pada` | TIMESTAMPTZ | Waktu dokter menerbitkan resep |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |
| `diperbarui_pada` | TIMESTAMPTZ | Waktu status terakhir diperbarui |

#### Tabel `detail_resep`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `resep_id` | UUID | FK ke `resep.id` (ON DELETE CASCADE) |
| `obat_id` | UUID | ID referensi obat dari Farmasi (lintas layanan, bukan foreign key fisik) |
| `nama_obat_saat_resep` | TEXT | Salinan teks nama obat saat diresepkan |
| `jumlah` | INTEGER | Jumlah obat yang diresepkan |
| `instruksi_penggunaan` | TEXT | Petunjuk aturan minum/pemakaian obat |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |

#### Tabel `peristiwa_integrasi`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `jenis_peristiwa` | TEXT | Jenis peristiwa integrasi (misal: `kirim_resep`, `terima_status`) |
| `referensi_data` | UUID | ID objek yang berkaitan |
| `kunci_idempotensi` | TEXT | Kunci idempotensi permintaan unik |
| `status_pengiriman` | TEXT | Status (`tertunda`, `berhasil`, `gagal`) |
| `jumlah_percobaan` | INTEGER | Jumlah percobaan pengiriman |
| `kesalahan_terakhir` | TEXT | Pesan kesalahan terakhir |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |
| `diperbarui_pada` | TIMESTAMPTZ | Waktu pembaruan |

#### Tabel `log_audit`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `pengguna_id` | UUID | ID pengguna pelaku aksi |
| `aksi` | TEXT | Tindakan yang dilakukan (`BUAT`, `UBAH`, `STATUS`, `HAPUS`) |
| `jenis_data` | TEXT | Nama entitas data |
| `referensi_data` | UUID | ID entitas yang diubah |
| `dibuat_pada` | TIMESTAMPTZ | Waktu aktivitas dicatat |

---

### 8.3 Database B — Farmasi (`mini-pharmacy-db`)

#### Tabel `profil_pengguna`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key, terhubung ke `auth.users.id` Supabase Auth |
| `nama_lengkap` | TEXT | Nama pengguna |
| `peran` | TEXT | Peran pengguna (`admin`, `apoteker`, `pengelola_farmasi`) |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |
| `diperbarui_pada` | TIMESTAMPTZ | Waktu pembaruan |

#### Tabel `obat`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `kode_obat` | TEXT | Kode unik obat (misal: `OBT-001`), unik |
| `nama_obat` | TEXT | Nama dagang / generik obat |
| `bentuk_obat` | TEXT | Bentuk sediaan (`tablet`, `kapsul`, `sirup`, dll) |
| `kekuatan_obat` | TEXT | Konsentrasi / kekuatan (misal: `500 mg`, `125 mg/5 ml`) |
| `satuan` | TEXT | Satuan terkecil (`strip`, `botol`, `tablet`, dll) |
| `stok_minimum` | INTEGER | Batas peringatan stok minimum |
| `aktif` | BOOLEAN | Status aktif obat |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |
| `diperbarui_pada` | TIMESTAMPTZ | Waktu pembaruan |

#### Tabel `pesanan_resep`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `resep_rumah_sakit_id` | UUID | ID resep asli dari Hospital, unik (mencegah duplikasi penerimaan) |
| `status` | TEXT | Status pemrosesan di Farmasi (`diterima`, `diproses`, `diserahkan_sebagian`, `diserahkan`, `ditolak`) |
| `diterima_pada` | TIMESTAMPTZ | Waktu resep diterima farmasi |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pembuatan |
| `diperbarui_pada` | TIMESTAMPTZ | Waktu pembaruan |

#### Tabel `detail_pesanan_resep`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `pesanan_resep_id` | UUID | FK ke `pesanan_resep.id` (ON DELETE CASCADE) |
| `detail_resep_rumah_sakit_id` | UUID | ID baris detail resep dari Hospital |
| `obat_id` | UUID | FK ke `obat.id` |
| `nama_obat_saat_pesanan` | TEXT | Salinan teks nama obat |
| `jumlah_diminta` | INTEGER | Jumlah yang diresepkan oleh dokter |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pencatatan |

#### Tabel `detail_penyerahan_obat`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `pesanan_resep_id` | UUID | FK ke `pesanan_resep.id` |
| `obat_id` | UUID | FK ke `obat.id` |
| `jumlah_diserahkan` | INTEGER | Jumlah aktual obat yang diserahkan |
| `diserahkan_oleh` | UUID | ID petugas apoteker yang menyerahkan |
| `diserahkan_pada` | TIMESTAMPTZ | Waktu penyerahan |

#### Tabel `pergerakan_stok`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `obat_id` | UUID | FK ke `obat.id` |
| `jenis_pergerakan` | TEXT | Jenis mutasi (`penerimaan`, `penyerahan`, `penyesuaian`) |
| `perubahan_jumlah` | INTEGER | Nilai perubahan stok (positif untuk masuk, negatif untuk keluar) |
| `referensi_transaksi` | UUID | Referensi ID transaksi terkait (misal: `pesanan_resep_id`) |
| `alasan` | TEXT | Keterangan alasan mutasi |
| `dibuat_oleh` | UUID | ID pengguna pelaksana transaksi |
| `dibuat_pada` | TIMESTAMPTZ | Waktu mutasi terjadi |

#### Tabel `log_integrasi`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `arah_integrasi` | TEXT | Arah komunikasi (`keluar_ke_hospital`, `masuk_dari_hospital`) |
| `referensi_data` | UUID | ID data terkait |
| `endpoint` | TEXT | URL / rute endpoint yang dipanggil |
| `kode_status_http` | INTEGER | Status kode HTTP yang diterima |
| `jumlah_percobaan` | INTEGER | Jumlah upaya pemanggilan |
| `pesan_kesalahan` | TEXT | Keterangan galat jika gagal |
| `dibuat_pada` | TIMESTAMPTZ | Waktu pencatatan |

#### Tabel `log_audit`
| Kolom | Tipe PostgreSQL | Keterangan |
|---|---|---|
| `id` | UUID | Primary key |
| `pengguna_id` | UUID | ID pengguna pelaku aktivitas |
| `aksi` | TEXT | Tindakan (`TAMBAH_STOK`, `PENYESUAIAN_STOK`, `PENYERAHAN_OBAT`) |
| `jenis_data` | TEXT | Entitas yang diubah |
| `referensi_data` | UUID | ID entitas yang diubah |
| `dibuat_pada` | TIMESTAMPTZ | Waktu aktivitas |

---

### 8.4 Aturan Integritas, Otomasi Prisma & Ketentuan Database

1. **Otomasi Skema & Migrasi via Prisma:**
   - Gunakan berkas `prisma/schema.prisma` di masing-masing aplikasi (`apps/hospital` dan `apps/pharmacy`) sebagai acuan tunggal (*single source of truth*) struktur database.
   - Gunakan perintah `npx prisma migrate dev` untuk otomatisasi pembuatan migrasi SQL dan sinkronisasi skema ke Supabase PostgreSQL.
   - Model Prisma menggunakan penamaan PascalCase dengan anotasi pemetaan eksplisit ke tabel bahasa Indonesia menggunakan `@@map("nama_tabel")` dan pemetaan kolom dengan `@map("nama_kolom")` (contoh: model `Pasien` dipetakan ke tabel `pasien`).
2. **Koneksi Database Prisma ke Supabase:**
   - Gunakan `DATABASE_URL` (koneksi pooler Supabase transaction mode port 6543) untuk query runtime aplikasi.
   - Gunakan `DIRECT_URL` (koneksi direct PostgreSQL port 5432) khusus untuk proses migrasi Prisma CLI (`prisma migrate`).
3. **Integritas Kunci & UUID:**
   - Gunakan UUID v4 (`@default(dbgenerated("gen_random_uuid()"))` atau `@default(uuid())`) untuk seluruh primary key (`id`).
   - Jangan pernah membuat *foreign key* fisik lintas proyek Supabase.
4. **Unique Constraint & Indeks:**
   - Terapkan `@unique` pada `nomor_rekam_medis` (Hospital), `kode_obat` (Pharmacy), dan `resep_rumah_sakit_id` (Pharmacy).
   - Terapkan indeks (`@@index`) pada kolom *foreign key*, kolom status, dan kolom pencarian yang sering diakses.
5. **Transaksi Atomik via Prisma:**
   - Gunakan transaksi interaktif Prisma (`prisma.$transaction()`) untuk operasi mutasi multi-tabel (misal: penyimpanan resep bersama detail item resep, atau pemrosesan penyerahan obat beserta pemotongan stok dan riwayat pergerakan stok).
6. **Validasi Kuantitas & Waktu:**
   - Terapkan validasi agar nilai kuantitas/jumlah tidak bernilai negatif atau nol.
   - Seluruh waktu disimpan dalam format UTC (`DateTime` / `TIMESTAMPTZ`) dan dikonversi ke zona waktu lokal (WIB) pada antarmuka pengguna.
7. **Keamanan & Data:**
   - Aktifkan Row Level Security (RLS) pada tabel di Supabase.
   - Jangan memasukkan data medis pasien nyata ke dalam seed database.

---

## 9. Status Resep (Standardisasi Bahasa Indonesia)

Status resep menggunakan istilah bahasa Indonesia yang konsisten di database, API, dan antarmuka pengguna:

- `draf`: Resep masih dalam penyusunan oleh dokter dan belum selesai.
- `diterbitkan`: Resep resmi diterbitkan oleh dokter dan siap diproses oleh farmasi.
- `diterima`: Resep telah diterima dan dicatat ke dalam antrean sistem farmasi.
- `diproses`: Resep sedang diverifikasi ketersediaannya dan disiapkan oleh apoteker.
- `diserahkan_sebagian`: Sebagian obat telah diserahkan (jika stok farmasi terbatas).
- `diserahkan`: Seluruh obat telah selesai diserahkan kepada pasien.
- `ditolak`: Resep ditolak oleh farmasi dengan alasan yang tercatat.
- `dibatalkan`: Resep dibatalkan oleh dokter/rumah sakit melalui prosedur yang diizinkan.

### Aturan Transisi Status:
- `draf` → `diterbitkan`
- `diterbitkan` → `diterima`
- `diterima` → `diproses`
- `diproses` → `diserahkan_sebagian` atau `diserahkan`
- `ditolak` hanya dapat dilakukan sebelum obat diserahkan.
- `dibatalkan` hanya diizinkan jika obat belum diserahkan.
- Status `diserahkan` bersifat permanen dan tidak dapat diubah kembali.

---

## 10. REST API (Bahasa Indonesia)

Seluruh endpoint menggunakan prefix `/api/v1` dengan bahasa Indonesia dan kaidah RESTful (kebab-case untuk penamaan path entitas majemuk).

### 10.1 Endpoint Hospital (`apps/hospital`) — Port 3000

| Method | Endpoint | Deskripsi Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/pasien` | Mengambil daftar pasien (dukung pagination & filter nama/nomor RM) | Internal UI |
| `POST` | `/api/v1/pasien` | Mendaftarkan pasien baru | Internal UI |
| `GET` | `/api/v1/pasien/{id}` | Mengambil detail profil pasien | Internal UI |
| `PATCH` | `/api/v1/pasien/{id}` | Memperbarui data pasien | Internal UI |
| `GET` | `/api/v1/dokter` | Mengambil daftar dokter aktif | Internal UI |
| `POST` | `/api/v1/dokter` | Mendaftarkan dokter baru (admin) | Internal UI |
| `GET` | `/api/v1/kunjungan` | Mengambil riwayat kunjungan pasien | Internal UI |
| `POST` | `/api/v1/kunjungan` | Membuat data kunjungan baru pasien ke dokter | Internal UI |
| `GET` | `/api/v1/kunjungan/{id}` | Mengambil detail data kunjungan | Internal UI |
| `POST` | `/api/v1/pemeriksaan` | Menyimpan catatan pemeriksaan medis dan diagnosis dokter | Internal UI |
| `POST` | `/api/v1/resep` | Menerbitkan resep baru beserta rincian item obat | Internal UI |
| `GET` | `/api/v1/resep` | Mengambil daftar resep (filter status resep, tanggal) | Internal UI & Farmasi |
| `GET` | `/api/v1/resep/{id}` | Mengambil detail lengkap resep beserta rincian item obat | Farmasi (Antarlayanan) |
| `PATCH` | `/api/v1/resep/{id}/status` | Memperbarui status resep dari Farmasi (`diterima`, `diserahkan`, dll) | Farmasi (Antarlayanan) |

### 10.2 Endpoint Pharmacy (`apps/pharmacy`) — Port 3001

| Method | Endpoint | Deskripsi Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/obat` | Mengambil daftar katalog master obat (pencarian kode, nama, status) | Internal UI & Hospital |
| `POST` | `/api/v1/obat` | Menambahkan data master obat baru | Internal UI |
| `GET` | `/api/v1/obat/{id}` | Mengambil detail master obat | Internal UI |
| `PATCH` | `/api/v1/obat/{id}` | Memperbarui data master obat | Internal UI |
| `GET` | `/api/v1/obat/{id}/stok` | Memeriksa ketersediaan stok fisik obat saat ini | Internal UI & Hospital |
| `POST` | `/api/v1/pergerakan-stok` | Mencatat penerimaan stok baru atau penyesuaian stok manual | Internal UI |
| `GET` | `/api/v1/pesanan-resep` | Mengambil daftar resep yang masuk dari Hospital | Internal UI |
| `POST` | `/api/v1/pesanan-resep` | Menerima resep dari Hospital (salinan data minimum ke DB Farmasi) | Internal / Integrasi |
| `GET` | `/api/v1/pesanan-resep/{id}` | Mengambil detail pesanan resep dan item yang diminta | Internal UI |
| `POST` | `/api/v1/pesanan-resep/{id}/penyerahan` | Memproses penyerahan obat, memotong stok atomik, & update status | Internal UI |

### 10.3 Standar Format JSON Response

Semua respons API menggunakan struktur JSON yang konsisten dalam bahasa Indonesia:

#### Format Sukses (HTTP 200 / 201):
```json
{
  "sukses": true,
  "pesan": "Resep berhasil diterbitkan",
  "data": {
    "id": "e9b2c892-...",
    "status": "diterbitkan",
    "diterbitkan_pada": "2026-10-25T15:00:00Z"
  }
}
```

#### Format Error Validasi (HTTP 400 / 422):
```json
{
  "sukses": false,
  "pesan": "Validasi input gagal",
  "kesalahan": {
    "jumlah": ["Jumlah obat harus lebih besar dari nol"],
    "obat_id": ["ID obat wajib disertakan"]
  }
}
```

Kode status HTTP yang digunakan:
- `200`: Sukses memproses permintaan.
- `201`: Sumber daya baru berhasil dibuat.
- `400`: Format request tidak valid.
- `401`: Belum terautentikasi atau token tidak valid.
- `403`: Tidak memiliki hak akses (role tidak sesuai).
- `404`: Data tidak ditemukan.
- `409`: Terjadi konflik data (duplikasi data unik).
- `422`: Validasi data schema Zod gagal.
- `500`: Kesalahan internal pada server.

### 10.4 Keamanan Komunikasi Antarlayanan
- Komunikasi antarlayanan dilakukan *backend-to-backend* melalui rute API internal.
- Dilindungi menggunakan header `Authorization: Bearer <TOKEN>` atau `x-api-key: <TOKEN>`.
- Token antarlayanan disimpan hanya di environment variable server (`HOSPITAL_API_TOKEN`, `PHARMACY_API_TOKEN`). Dilarang keras mengekspos token ini di sisi browser (`NEXT_PUBLIC_*`).
- Setiap transaksi penyerahan obat dan pengubahan status wajib menyertakan header `Idempotency-Key` (UUID) untuk mencegah eksekusi berulang jika terjadi *retry* jaringan.

---

## 11. Desain UI/UX

Gunakan Tailwind CSS dan komponen shadcn/ui.

### 11.1 Gaya Visual
- Antarmuka dashboard profesional, bersih, dan modern.
- Tema terang sebagai default, dengan dukungan tema gelap.
- Aksen warna biru medis untuk Hospital dan aksen hijau/teal untuk Farmasi.
- Sidebar navigasi desktop responsif dan header informatif.
- Kartu ringkasan metrik statistik ringkas.
- Tabel dengan fungsionalitas pencarian, filter status, pagination, dan aksi baris yang jelas.
- Dialog konfirmasi untuk aksi destruktif atau mutasi penting.
- Notifikasi toast untuk hasil setiap aksi pengguna.
- Loading skeleton saat mengambil data dan empty state yang informatif.

### 11.2 Halaman Aplikasi Hospital
- `/login`: Halaman autentikasi masuk.
- `/dashboard`: Ringkasan metrik dan aktivitas pasien/resep.
- `/pasien`: Tabel daftar pasien.
- `/pasien/baru`: Formulir pendaftaran pasien baru.
- `/pasien/[id]`: Detail profil pasien dan riwayat kunjungan medis.
- `/dokter`: Manajemen data dokter.
- `/kunjungan`: Manajemen kunjungan dan pendaftaran rawat jalan.
- `/pemeriksaan`: Pencatatan hasil pemeriksaan dokter.
- `/resep`: Daftar resep dan status pemrosesan farmasi.
- `/resep/baru`: Formulir pembuatan resep obat multi-item.
- `/resep/[id]`: Rincian resep obat.
- `/pengaturan`: Pengaturan akun pengguna.

### 11.3 Halaman Aplikasi Pharmacy
- `/login`: Halaman autentikasi masuk apoteker/pengelola.
- `/dashboard`: Metrik stok obat, antrean resep, dan aktivitas penyerahan.
- `/obat`: Katalog master obat.
- `/obat/baru`: Formulir penambahan master obat baru.
- `/obat/[id]`: Rincian data obat dan kartu stok fisik.
- `/pesanan-resep`: Daftar resep yang masuk dari rumah sakit.
- `/pesanan-resep/[id]`: Verifikasi resep dan ketersediaan stok obat.
- `/penyerahan`: Pemrosesan penyerahan obat ke pasien.
- `/pergerakan-stok`: Riwayat mutasi stok dan penyesuaian stok manual.
- `/pengaturan`: Pengaturan akun pengguna.

---

## 12. Autentikasi dan Keamanan Supabase

1. Menggunakan Supabase Auth untuk otentikasi pengguna berbasis email dan kata sandi.
2. Menggunakan `@supabase/ssr` untuk pertukaran cookie sesi SSR yang aman.
3. Mengaktifkan Row Level Security (RLS) pada seluruh tabel di Supabase A dan Supabase B.
4. Memvalidasi peran pengguna di sisi server; jangan hanya mengandalkan penyembunyian tombol di antarmuka.
5. Kredensial rahasia (*service role key*) hanya digunakan pada rute backend terisolasi dan tidak boleh bocor ke bundle browser.
6. Mencegah akses langsung antardatabase secara arsitektural.

---

## 13. Environment Variables

Setiap aplikasi memiliki file `.env.local` dan `.env.example` masing-masing:

### Hospital (`apps/hospital/.env.local`)
```dotenv
# Prisma Connection Strings (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[project-a-id].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-a-id].supabase.co:5432/postgres"

# Supabase Auth & Client
NEXT_PUBLIC_SUPABASE_URL=https://[project-a-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[supabase-a-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[supabase-a-service-role-key]

# Antarlayanan Integrasi
PHARMACY_API_BASE_URL=http://localhost:3001/api/v1
PHARMACY_API_TOKEN=[internal-shared-secret-token]
HOSPITAL_INTERNAL_API_TOKEN=[internal-shared-secret-token]
```

### Pharmacy (`apps/pharmacy/.env.local`)
```dotenv
# Prisma Connection Strings (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[password]@db.[project-b-id].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-b-id].supabase.co:5432/postgres"

# Supabase Auth & Client
NEXT_PUBLIC_SUPABASE_URL=https://[project-b-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[supabase-b-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[supabase-b-service-role-key]

# Antarlayanan Integrasi
HOSPITAL_API_BASE_URL=http://localhost:3000/api/v1
HOSPITAL_API_TOKEN=[internal-shared-secret-token]
PHARMACY_INTERNAL_API_TOKEN=[internal-shared-secret-token]
```

---

## 14. Pengujian

### 14.1 Pengujian Lingkungan Monorepo
- Kedua aplikasi dapat dijalankan bersamaan (`hospital` pada port 3000, `pharmacy` pada port 3001).
- Masing-masing aplikasi terhubung ke proyek Supabase yang berbeda.
- Tidak ada kebocoran kredensial rahasia.

### 14.2 Pengujian Basis Data & Bisnis
- Otomasi skema database berhasil dieksekusi melalui Prisma Migrate.
- Pendaftaran pasien berhasil, penolakan jika nomor rekam medis duplikat.
- Penerbitan resep beserta item obat tersimpan secara atomik (`prisma.$transaction`).
- Penambahan master obat berhasil, kode obat unik terverifikasi.
- Pengurangan stok tervalidasi; stok tidak dapat bernilai negatif.
- Seluruh mutasi stok tercatat dalam `pergerakan_stok`.

### 14.3 Pengujian Integrasi Antarlayanan
- Pharmacy dapat membaca detail resep melalui endpoint Hospital.
- Mencegah penerimaan pesanan resep ganda di Pharmacy.
- Penyerahan obat memotong stok dan mengubah status resep di Hospital secara otomatis.
- Mekanisme idempotensi teruji jika terjadi panggilan ulang (*retry*).

---

## 15. Tahapan Implementasi

1. **Fase 1 — Fondasi Monorepo:** Inisialisasi npm workspaces, instalasi Next.js App Router pada `apps/hospital` dan `apps/pharmacy`, konfigurasi Tailwind CSS, instalasi komponen dasar shadcn/ui, dan verifikasi build.
2. **Fase 2 — Database Supabase & Otomasi Prisma:** Pembuatan proyek Supabase A & B, setup berkas `prisma/schema.prisma` di masing-masing aplikasi, pemetaan model tabel bahasa Indonesia, otomasi migrasi via `npx prisma migrate dev`, generate Prisma Client (`prisma.ts`), konfigurasi constraint, dan seed data sintetis.
3. **Fase 3 — Autentikasi & Layout:** Implementasi Supabase Auth SSR, halaman login, proteksi route, dan komponen tata letak dashboard.
4. **Fase 4 — Modul Hospital:** Implementasi fitur pasien, dokter, kunjungan, pemeriksaan, dan penerbitan resep berbasis Prisma Client.
5. **Fase 5 — Modul Pharmacy:** Implementasi fitur master obat, manajemen mutasi stok, dan antrean resep masuk berbasis Prisma Client.
6. **Fase 6 — Integrasi REST API:** Implementasi rute API v1 bahasa Indonesia, proteksi token antarlayanan, sinkronisasi status resep, dan penyerahan obat.
7. **Fase 7 — Pengujian & Dokumentasi:** Audit integrasi, pengujian idempotensi, dan pembaruan README panduan instalasi.

---

## 16. Kriteria Penerimaan

Proyek dinyatakan berhasil apabila:
1. Satu repository monorepo mengelola kedua aplikasi dengan npm workspaces.
2. Masing-masing aplikasi beroperasi pada port yang ditentukan (Hospital: 3000, Pharmacy: 3001).
3. Menggunakan dua database Supabase terpisah tanpa query langsung lintas database.
4. Akses dan otomasi database menggunakan Prisma ORM (`@prisma/client` & `prisma migrate`) dengan model yang type-safe.
5. Seluruh tabel, kolom, status, dan endpoint REST API menggunakan bahasa Indonesia secara konsisten.
6. Alur integrasi resep berjalan tuntas dari pembuatan resep oleh dokter, penerimaan di farmasi, validasi stok obat, penyerahan obat, hingga pembaruan status resep kembali ke rumah sakit.
7. Kunci idempotensi mencegah pemotongan stok ganda.

---

## 17. Instruksi untuk AI Coding Agent

1. Ikuti urutan pengerjaan mulai dari **Fase 1 — Fondasi Monorepo**.
2. Gunakan TypeScript strict mode, Prisma Client type-safe, dan validasi schema Zod pada setiap input dan respons endpoint.
3. Jangan pernah melakukan *hardcode* kunci rahasia atau kredensial database.
4. Lakukan verifikasi build dan pengujian fungsi setelah setiap fase sebelum melangkah ke fase berikutnya.
5. Laporkan setiap perkembangan tahapan, berkas yang dibuat, dan hasil pengujian dengan jelas.
