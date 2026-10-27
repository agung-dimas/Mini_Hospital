# Panduan Arah Desain & Standar Visual (DESIGN.md)
**Proyek:** Mini Hospital & Mini Pharmacy (Sistem Informasi Layanan Medis & Resep Farmasi)  
**Versi:** 1.0.0  
**Tanggal:** 2026-10-25  
**Filter Kualitas:** Anti-Slop Core (R-01 s/d R-38)

---

## 1. Identitas & Kepribadian Merek

- **Tujuan Sistem:** Memfasilitasi alur pelayanan rumah sakit (pendaftaran, antrean, pemeriksaan klinis, resep medis) dan pengelolaan farmasi (validasi resep, penyiapan obat, pengurangan stok fisik) secara aman, presisi, dan terintegrasi.
- **Audiens Utama:** Dokter Spesialis/Umum, Petugas Pendaftaran Loket, Apoteker/Petugas Farmasi, dan Administrator RS.
- **Karakter Visual:** 
  - **Tenang & Berwibawa:** Mencerminkan lingkungan medis yang steril, dapat dipercaya, dan minim distraksi.
  - **Fungsional & Padat Informasi:** Prioritas pada kejelasan data rekam medis pasien, dosis obat, dan status alur resep.
  - **Bebas AI Gimmick:** Menghindari dekorasi visual yang tidak memiliki nilai klinis (tidak ada orbs glow berlebihan, tidak ada sparkle AI, tidak ada klaim marketing klise).

---

## 2. Pengaturan Dials (Anti-Slop Parameters)

| Parameter | Nilai (Skala 1-5) | Rincian Karakteristik |
| :--- | :---: | :--- |
| **ENERGY** | **2** | Suasana klinis yang tenang dan meyakinkan. Warna aksen digunakan secara hemat hanya untuk menandakan status klinis dan tombol aksi utama. |
| **RHYTHM** | **2** | Tata letak terstruktur, simetris, dan dapat diprediksi (*predictable grid*). Menggunakan tabel data yang rapi dan kartu resep modular dengan hierarki informasi yang konsisten. |
| **MOTION** | **1** | Animasi seminimal mungkin dan berorientasi fungsi: transisi warna tombol 150ms, fade-in dropdown, slide drawer mobile 200ms. Tidak ada bouncing atau efek mengambang dekoratif. |

---

## 3. Palet Warna Resmi & Standar Aksesibilitas (WCAG AA)

Seluruh pasangan teks dan latar belakang wajib memenuhi standar kontras minimum WCAG AA (**4.5:1** untuk teks reguler, **3.0:1** untuk teks besar/komponen grafis).

### Palet Hospital (Port 3000)
- **Primary Clinical Blue:**
  - `#2563eb` (`bg-blue-600`) — Tombol aksi utama, aksen aktif sidebar, ikon utama.
  - `#1d4ed8` (`bg-blue-700`) — Hover state tombol aksi.
  - `#eff6ff` (`bg-blue-50`) & `#bfdbfe` (`border-blue-200`) — Aksen badge dan info banner.
- **Latar & Netral (Hospital):**
  - `#0f172a` (`bg-slate-900`) — Sidebar desktop & mobile drawer.
  - `#f8fafc` (`bg-slate-50`) — Latar belakang dashboard utama.
  - `#ffffff` (`bg-white`) — Permukaan kartu modul, tabel data, dan modal.
  - `#0f172a` (`text-slate-900`) — Judul utama & data penting (kontras 18.5:1).
  - `#475569` (`text-slate-600`) — Label sekunder & teks deskripsi (kontras 7.0:1).
  - `#64748b` (`text-slate-500`) — Timestamp, empty state, & teks bantuan (kontras 4.6:1, LULUS WCAG AA).

### Palet Pharmacy (Port 3001)
- **Primary Pharmacy Emerald:**
  - `#059669` (`bg-emerald-600`) — Aksi penerimaan & penyerahan resep.
  - `#047857` (`bg-emerald-700`) — Hover state farmasi.
  - `#ecfdf5` (`bg-emerald-50`) & `#a7f3d0` (`border-emerald-200`) — Badge farmasi.

### Indikator Status Klinis & Alur Resep
- **Diterbitkan (Menunggu Verifikasi):** Kuning/Amber (`bg-amber-50 text-amber-800 border-amber-200`)
- **Diterima Farmasi:** Biru Muda (`bg-blue-50 text-blue-800 border-blue-200`)
- **Diproses (Peracikan):** Indigo (`bg-indigo-50 text-indigo-800 border-indigo-200`)
- **Selesai / Obat Diserahkan:** Hijau Emerald (`bg-emerald-50 text-emerald-800 border-emerald-200`)
- **Batal / Error Server:** Merah Rose (`bg-rose-50 text-rose-800 border-rose-200`)

---

## 4. Tipografi & Hierarki Teks

- **Keluarga Font:** Font sans-serif sistem modern (`Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).
- **Font Kode / Angka:** Font monospasi (`font-mono`) untuk Nomor Rekam Medis (RM), ID Resep, dan Kunci Idempotensi.
- **Skala Ukuran Teks:**
  - **H1 Halaman:** `text-xl font-bold tracking-tight text-slate-900`
  - **H2 Modul:** `text-base font-bold text-slate-900`
  - **H3 Kartu:** `text-sm font-semibold text-slate-900`
  - **Body / Konten Tabel:** `text-xs font-normal text-slate-700`
  - **Sub-label / Meta:** `text-[11px] font-medium text-slate-500`
  - **Badge / Tag:** `text-[10px] font-bold uppercase tracking-wider`

---

## 5. Standar Kerajinan (*Craftsmanship Standards*)

- **C-1: Tiga Status Lengkap (R-27):** Setiap modul pemanggil API (kunjungan, pemeriksaan, resep) wajib memiliki *Loading State* (indikator memuat), *Empty State* (ilustrasi & petunjuk saat data kosong), dan *Error State* (pesan kesalahan eksplisit beserta tombol "Coba Lagi").
- **C-2: Responsivitas Mobile (R-03):** Navigasi sidebar harus berubah menjadi drawer slide-over yang dapat dibuka melalui tombol hamburger dan ditutup dengan tombol silang atau overlay klik pada layar seluler (< 768px).
- **C-3: Aksesibilitas Keyboard (R-32):** Seluruh dialog modal, menu dropdown, dan drawer wajib dapat ditutup menggunakan tombol `Escape`.
- **C-4: Kerapian Bahasa & Copy (R-02 & R-16):** Menggunakan bahasa Indonesia baku, lugas, dan operasional. Dilarang menggunakan karakter em dash (`—`) pada copy teks dan dilarang menggunakan jargon AI seperti "Enterprise Application Integration" secara klise.
- **C-5: Kebersihan Visual (R-01 & R-04):** Dilarang menyertakan orbs glow blur yang menumpuk di latar belakang, gradien ungu-biru fantasi, atau ikon bintang AI (`Sparkles`) tanpa fungsi medis konkret.
