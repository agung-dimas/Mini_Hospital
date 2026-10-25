import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { Users, UserCheck, Calendar, FileText, PlusCircle, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react'

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
      <HospitalHeader title="Dashboard Pelayanan Rumah Sakit" />

      <main className="flex-1 p-8 space-y-8 max-w-7xl">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pasien</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalPasien}</p>
              <span className="text-xs text-blue-600 font-medium mt-1 inline-block">Terdaftar di sistem</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dokter Aktif</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalDokter}</p>
              <span className="text-xs text-indigo-600 font-medium mt-1 inline-block">Spesialis & Umum</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kunjungan</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalKunjungan}</p>
              <span className="text-xs text-cyan-600 font-medium mt-1 inline-block">Pemeriksaan medis</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resep Diterbitkan</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalResep}</p>
              <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Terintegrasi ke Farmasi</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Status Resep Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Status Pemrosesan Resep di Farmasi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
              <span className="text-xs font-semibold text-amber-800">Diterbitkan</span>
              <p className="text-2xl font-extrabold text-amber-900 mt-1">{resepStatusCounts.diterbitkan || 0}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
              <span className="text-xs font-semibold text-blue-800">Diterima Farmasi</span>
              <p className="text-2xl font-extrabold text-blue-900 mt-1">{resepStatusCounts.diterima || 0}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center">
              <span className="text-xs font-semibold text-indigo-800">Sedang Diracik</span>
              <p className="text-2xl font-extrabold text-indigo-900 mt-1">{resepStatusCounts.diproses || 0}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
              <span className="text-xs font-semibold text-emerald-800">Selesai Diserahkan</span>
              <p className="text-2xl font-extrabold text-emerald-900 mt-1">{resepStatusCounts.diserahkan || 0}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Visits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Aksi Cepat</h2>
            <div className="space-y-3">
              <Link
                href="/pasien"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-800">Pendaftaran Pasien Baru</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href="/kunjungan"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-800">Catat Kunjungan Dokter</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </Link>

              <Link
                href="/resep/baru"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-800">Terbitkan Resep Obat</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Recent Visits */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Kunjungan Medis Terbaru</h2>
              <Link href="/kunjungan" className="text-xs font-semibold text-blue-600 hover:underline">
                Lihat Semua
              </Link>
            </div>

            {kunjunganTerbaru.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Belum ada data kunjungan. Jalankan seed data atau catat kunjungan baru.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {kunjunganTerbaru.map((k) => (
                  <div key={k.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{k.pasien.namaLengkap}</p>
                      <p className="text-xs text-slate-500">
                        {k.pasien.nomorRekamMedis} &bull; Dokter: {k.dokter.namaLengkap}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {k.status}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
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
