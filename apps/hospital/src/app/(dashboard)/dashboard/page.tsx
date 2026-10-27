import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

export default async function DashboardPage() {
  let totalPasien = 0
  let totalDokter = 0
  let totalKunjungan = 0
  let totalResep = 0
  let resepStatusCounts: Record<string, number> = {
    diterbitkan: 0,
    diterima: 0,
    diproses: 0,
    diserahkan: 0,
  }
  let kunjunganTerbaru: Array<{
    id: string
    waktuKunjungan: Date
    status: string
    pasien: { namaLengkap: string; nomorRekamMedis: string }
    dokter: { namaLengkap: string }
  }> = []

  try {
    const [pasienCount, dokterCount, kunjunganCount, resepList, kunjunganList] = await Promise.all([
      prisma.pasien.count(),
      prisma.dokter.count({ where: { aktif: true } }),
      prisma.kunjungan.count(),
      prisma.resep.findMany({ select: { status: true } }),
      prisma.kunjungan.findMany({
        take: 5,
        orderBy: { waktuKunjungan: 'desc' },
        include: {
          pasien: { select: { namaLengkap: true, nomorRekamMedis: true } },
          dokter: { select: { namaLengkap: true } },
        },
      }),
    ])

    totalPasien = pasienCount
    totalDokter = dokterCount
    totalKunjungan = kunjunganCount
    totalResep = resepList.length

    resepList.forEach((r) => {
      resepStatusCounts[r.status] = (resepStatusCounts[r.status] || 0) + 1
    })
    kunjunganTerbaru = kunjunganList
  } catch (error) {
    console.warn('Database belum terhubung atau belum di-seed:', error)
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Dashboard Operasional Pelayanan" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
        {/* Banner Hero SIMRS Modern */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0c5f92] via-[#084c75] to-[#043353] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-sky-200 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Terpadu SIMRS &bull; RME Aktif
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Pelayanan Medis & Preskripsi Digital
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/85 leading-relaxed">
              Pusat kendali operasional poliklinik, pendaftaran pasien baru, pencatatan rekam medis elektronik terstandar, dan peresepan obat langsung terhubung ke instalasi farmasi.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <span>Standar SATUSEHAT Kemenkes RI</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-100">
              <ShieldCheck className="h-4 w-4 text-sky-300" />
              <span>Klinik & Farmasi Terpadu (Port 3001)</span>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pasien</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalPasien}</p>
              <span className="text-xs text-sky-600 font-semibold mt-1 inline-block">Terdaftar di master RM</span>
            </div>
            <div className="h-13 w-13 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dokter Aktif</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalDokter}</p>
              <span className="text-xs text-indigo-600 font-semibold mt-1 inline-block">Spesialis Rawat Jalan</span>
            </div>
            <div className="h-13 w-13 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kunjungan</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalKunjungan}</p>
              <span className="text-xs text-teal-600 font-semibold mt-1 inline-block">Antrean pemeriksaan</span>
            </div>
            <div className="h-13 w-13 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resep Diterbitkan</span>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalResep}</p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">Tersinkronisasi otomatis</span>
            </div>
            <div className="h-13 w-13 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Status Resep Bar */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Status Pemrosesan Resep di Farmasi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantauan status live penyiapan dan penyerahan obat kepada pasien rawat jalan
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              Real-time Sync
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Diterbitkan</span>
              <p className="text-2xl font-black text-amber-900 mt-1">{resepStatusCounts.diterbitkan || 0}</p>
              <span className="text-[10px] text-amber-700 font-medium">Menunggu Apotek</span>
            </div>
            <div className="bg-sky-50/80 border border-sky-200/80 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wide">Diterima Farmasi</span>
              <p className="text-2xl font-black text-sky-900 mt-1">{resepStatusCounts.diterima || 0}</p>
              <span className="text-[10px] text-sky-700 font-medium">Masuk Antrean Resep</span>
            </div>
            <div className="bg-indigo-50/80 border border-indigo-200/80 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Sedang Diracik</span>
              <p className="text-2xl font-black text-indigo-900 mt-1">{resepStatusCounts.diproses || 0}</p>
              <span className="text-[10px] text-indigo-700 font-medium">Penyiapan & Pelabelan</span>
            </div>
            <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Selesai Diserahkan</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{resepStatusCounts.diserahkan || 0}</p>
              <span className="text-[10px] text-emerald-700 font-medium">Obat Telah Diberikan</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Visits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Aksi Cepat Layanan</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pintas menuju alur kerja utama</p>
            </div>

            <div className="space-y-3 pt-1">
              <Link
                href="/pasien"
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:border-sky-400 hover:bg-sky-50/40 transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Pendaftaran Pasien Baru</span>
                    <span className="text-[10px] text-slate-500">Master No. RM & kontak</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>

              <Link
                href="/kunjungan"
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:border-teal-400 hover:bg-teal-50/40 transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-105 transition-transform">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Catat Kunjungan Dokter</span>
                    <span className="text-[10px] text-slate-500">Antrean poliklinik aktif</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>

              <Link
                href="/resep/baru"
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                    <PlusCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Terbitkan Resep Obat</span>
                    <span className="text-[10px] text-slate-500">Sinkron langsung ke farmasi</span>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Recent Visits */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Kunjungan Medis Terbaru</h2>
                <p className="text-xs text-slate-500 mt-0.5">Daftar pemeriksaan pasien terkini</p>
              </div>
              <Link
                href="/kunjungan"
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {kunjunganTerbaru.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Belum ada data kunjungan terbaru yang tercatat di database.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {kunjunganTerbaru.map((k) => (
                  <div key={k.id} className="py-3.5 flex items-center justify-between first:pt-1 last:pb-1">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-slate-900">{k.pasien.namaLengkap}</p>
                      <p className="text-[11px] text-slate-500">
                        <span className="font-mono text-sky-700 font-semibold">{k.pasien.nomorRekamMedis}</span> &bull; dr. {k.dokter.namaLengkap}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                        {k.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(k.waktuKunjungan).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
