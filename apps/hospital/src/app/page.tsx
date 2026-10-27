import Link from 'next/link'
import {
  Activity,
  Users,
  UserCheck,
  Calendar,
  FileText,
  ArrowRight,
  ShieldCheck,
  Database,
  Plus,
  Lock,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 flex flex-col justify-between font-sans selection:bg-sky-500 selection:text-white">
      {/* Bar Atas */}
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0c5f92] to-[#043353] flex items-center justify-center text-white shadow-md shadow-sky-900/20">
              <div className="relative flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
                <Plus className="h-2.5 w-2.5 text-sky-200 absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                Mini Hospital
              </span>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                Sistem Pelayanan Rumah Sakit (Port 3000)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Layanan Terpadu SIMRS
            </span>
            <Link
              href="/login"
              className="text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center gap-1.5"
            >
              <span>Masuk Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-10">
        <div className="rounded-3xl bg-gradient-to-br from-[#0c5f92] via-[#084c75] to-[#043353] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 border border-white/10">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-sky-200 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SIMRS Modular & Integrasi Farmasi
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Pelayanan Pasien & Rekam Medis Elektronik
            </h1>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              Platform operasional rumah sakit modern dengan tata kelola rekam medis elektronik (RME), manajemen antrean poliklinik terstruktur, dan preskripsi resep digital yang tersinkronisasi otomatis dengan instalasi farmasi.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950/30 transition-all inline-flex items-center gap-2"
              >
                <span>Masuk ke Dashboard Hospital</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-white/15 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 backdrop-blur-md"
              >
                <span>Aplikasi Farmasi (Port 3001)</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="relative z-10 space-y-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">Standar Pelayanan</span>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Standar SATUSEHAT Kemenkes RI
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">Kerahasiaan Medis</span>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-sky-300" />
                Role-Based Access Control (RBAC)
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 group">
            <div className="h-11 w-11 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Pasien</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pendaftaran pasien baru, validasi nomor rekam medis unik, pencatatan nomor telepon WhatsApp, dan pencarian riwayat pasien.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 group">
            <div className="h-11 w-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Manajemen Dokter</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Katalog master dokter aktif, bidang spesialisasi klinis, dan alokasi antrean kunjungan poliklinik rawat jalan.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 group">
            <div className="h-11 w-11 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Kunjungan & Pemeriksaan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pencatatan klinis fisik pasien, keluhan utama, diagnosis medis terstandar, dan antrean real-time per dokter.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 group">
            <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Penerbitan Resep Medis</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pembuatan e-resep multi-item dan transmisi otomatis ke antrean apotek rawat jalan tanpa antrean manual.
            </p>
          </div>
        </div>

        {/* Integration Status Box */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-sky-600" />
                <span>Arsitektur Sistem Terdistribusi Mini Hospital</span>
              </h2>
              <p className="text-xs text-slate-500">
                Pemisahan database Supabase A (Hospital) dan Supabase B (Pharmacy) dengan kontrak API REST v1.
              </p>
            </div>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-4 py-2.5 rounded-xl hover:bg-sky-100 transition-colors shadow-2xs self-start md:self-auto"
            >
              <span>Akses Portal Farmasi (Port 3001)</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ORM & Database</span>
              <p className="font-bold text-slate-900">Prisma 6 + Supabase PostgreSQL</p>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kontrak Integrasi</span>
              <p className="font-bold text-slate-900">REST API v1 (Bahasa Indonesia)</p>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Keamanan & Audit</span>
              <p className="font-bold text-slate-900">Cookie JWT + Audit Log Trail</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Mini Hospital &bull; Sistem Manajemen Rumah Sakit &copy; 2026</span>
          <span className="text-slate-400">Fondasi Fase 1 &bull; Port 3000</span>
        </div>
      </footer>
    </div>
  )
}
