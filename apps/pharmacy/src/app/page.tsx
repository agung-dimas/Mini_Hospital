import Link from 'next/link'
import { Pill, Boxes, ArrowDownToLine, PackageCheck, ArrowRight, ShieldCheck, Database, RefreshCcw } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900">Mini Pharmacy</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Pharmacy App (Port 3001)
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
              className="text-sm font-medium bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Masuk Sistem
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full space-y-12">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            Enterprise Application Integration (EAI)
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Sistem Informasi Pengelolaan Resep & Farmasi
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Aplikasi pengelolaan persediaan obat, verifikasi antrean resep masuk dari Rumah Sakit, validasi ketersediaan stok fisik, serta pemrosesan penyerahan obat yang terintegrasi secara atomik.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Boxes className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Master Data Obat</h3>
            <p className="text-sm text-slate-500">Katalog obat, kode obat unik, satuan, bentuk sediaan, dan batas peringatan stok minimum.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <RefreshCcw className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Manajemen Stok</h3>
            <p className="text-sm text-slate-500">Pencatatan mutasi masuk/keluar, penyesuaian stok, dan pencegahan stok negatif.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Penerimaan Resep RS</h3>
            <p className="text-sm text-slate-500">Pengambilan data resep dokter secara aman via REST API tanpa akses database langsung.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900">Penyerahan Obat</h3>
            <p className="text-sm text-slate-500">Pemotongan stok atomik dan pengiriman konfirmasi status kembali ke Rumah Sakit.</p>
          </div>
        </div>

        {/* Integration Status Box */}
        <div className="bg-gradient-to-r from-emerald-950 to-teal-900 text-white rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-teal-800 pb-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                Arsitektur Terdistribusi & Otomasi Prisma
              </h2>
              <p className="text-sm text-teal-200">
                Supabase B (mini-pharmacy-db) memiliki database mandiri dan aman.
              </p>
            </div>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-emerald-950 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
            >
              Buka Aplikasi Hospital (Port 3000)
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-700/50 space-y-1">
              <span className="text-xs text-emerald-300 font-medium">ORM & Database</span>
              <p className="font-semibold text-white">Prisma 6 + Supabase PostgreSQL</p>
            </div>
            <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-700/50 space-y-1">
              <span className="text-xs text-emerald-300 font-medium">Kontrak Integrasi</span>
              <p className="font-semibold text-white">REST API v1 (Bahasa Indonesia)</p>
            </div>
            <div className="bg-emerald-900/40 p-4 rounded-xl border border-emerald-700/50 space-y-1">
              <span className="text-xs text-emerald-300 font-medium">Keamanan Antarlayanan</span>
              <p className="font-semibold text-white">Bearer Token + Idempotency Key</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        Mini Pharmacy — Enterprise Application Integration System &copy; 2026
      </footer>
    </div>
  )
}
