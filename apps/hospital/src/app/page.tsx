import Link from 'next/link'
import { Activity, Users, UserCheck, Calendar, FileText, ArrowRight, ShieldCheck, Database } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Mini Hospital</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                Hospital App (Port 3000)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Fondasi Fase 1 Aktif
            </span>
            <Link
              href="/login"
              className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Masuk Sistem
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-12">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            Enterprise Application Integration (EAI)
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Sistem Informasi Pelayanan Pasien Rumah Sakit
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Aplikasi manajemen rumah sakit modular yang mengintegrasikan pendaftaran pasien, pencatatan kunjungan, diagnosis pemeriksaan dokter, serta penerbitan resep medis yang terhubung langsung ke sistem farmasi melalui REST API.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Manajemen Pasien</h3>
            <p className="text-sm text-slate-500">Pendaftaran pasien, validasi nomor rekam medis unik, dan pencarian riwayat medis.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Manajemen Dokter</h3>
            <p className="text-sm text-slate-500">Katalog dokter aktif, bidang spesialisasi, dan alokasi antrean kunjungan.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Kunjungan & Pemeriksaan</h3>
            <p className="text-sm text-slate-500">Pencatatan hasil pemeriksaan fisik, diagnosis penyakit, dan catatan klinis.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Penerbitan Resep</h3>
            <p className="text-sm text-slate-500">Pembuatan resep multi-item dan sinkronisasi status otomatis dengan Farmasi.</p>
          </div>
        </div>

        {/* Integration Status Box */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-blue-800 pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                Arsitektur Terdistribusi & Otomasi Prisma
              </h2>
              <p className="text-sm text-blue-200">
                Supabase A (mini-hospital-db) terisolasi sepenuhnya dari database Farmasi.
              </p>
            </div>
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-blue-900 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
            >
              Buka Aplikasi Pharmacy (Port 3001)
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-700/50 space-y-1">
              <span className="text-xs text-blue-300 font-medium">ORM & Database</span>
              <p className="font-semibold text-white">Prisma 6 + Supabase PostgreSQL</p>
            </div>
            <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-700/50 space-y-1">
              <span className="text-xs text-blue-300 font-medium">Kontrak Integrasi</span>
              <p className="font-semibold text-white">REST API v1 (Bahasa Indonesia)</p>
            </div>
            <div className="bg-blue-800/40 p-4 rounded-xl border border-blue-700/50 space-y-1">
              <span className="text-xs text-blue-300 font-medium">Keamanan Antarlayanan</span>
              <p className="font-semibold text-white">Bearer Token + Idempotency Key</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        Mini Hospital — Enterprise Application Integration System &copy; 2026
      </footer>
    </div>
  )
}
