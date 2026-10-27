import Link from 'next/link'
import { PharmacyHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { Boxes, AlertTriangle, ArrowDownToLine, PackageCheck, ArrowUpRight } from 'lucide-react'

export default async function PharmacyDashboardPage() {
  let totalObat = 0
  let stokRendahCount = 0
  let totalPesanan = 0
  let totalPenyerahan = 0
  let pesananTerbaru: Array<{
    id: string
    resepRumahSakitId: string
    status: string
    diterimaPada: Date
    detailPesananResep: Array<{
      id: string
      namaObatSaatPesanan: string
      jumlahDiminta: number
    }>
  }> = []

  try {
    const [obatList, pesananList, penyerahanCount] = await Promise.all([
      prisma.obat.findMany({
        where: { aktif: true },
        include: { pergerakanStok: true },
      }),
      prisma.pesananResep.findMany({
        take: 5,
        orderBy: { diterimaPada: 'desc' },
        include: { detailPesananResep: true },
      }),
      prisma.detailPenyerahanObat.count(),
    ])

    totalObat = obatList.length
    totalPesanan = await prisma.pesananResep.count()
    totalPenyerahan = penyerahanCount
    pesananTerbaru = pesananList

    stokRendahCount = obatList.filter((obat) => {
      const stok = obat.pergerakanStok.reduce(
        (sum, m) => sum + m.perubahanJumlah,
        0
      )
      return stok <= obat.stokMinimum
    }).length
  } catch (error) {
    console.warn('Database Pharmacy belum terhubung atau belum di-seed:', error)
  }

  return (
    <div className="flex-1 flex flex-col">
      <PharmacyHeader title="Dashboard Manajemen Farmasi & Resep" />

      <main className="flex-1 p-8 space-y-8 max-w-7xl">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Katalog Obat Aktif</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalObat}</p>
              <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">Tersedia di gudang</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Boxes className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Peringatan Stok Rendah</span>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{stokRendahCount}</p>
              <span className="text-xs text-amber-600 font-medium mt-1 inline-block">&le; Batas minimum</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resep Masuk RS</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalPesanan}</p>
              <span className="text-xs text-cyan-600 font-medium mt-1 inline-block">Melalui REST API v1</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <ArrowDownToLine className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai Diserahkan</span>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalPenyerahan}</p>
              <span className="text-xs text-blue-600 font-medium mt-1 inline-block">Transaksi penyerahan</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Aksi Cepat Farmasi</h2>
            <div className="space-y-3">
              <Link
                href="/obat"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Boxes className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-800">Katalog Master Obat</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </Link>

              <Link
                href="/pesanan-resep"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ArrowDownToLine className="h-5 w-5 text-cyan-600" />
                  <span className="text-sm font-medium text-slate-800">Verifikasi Resep Masuk</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </Link>

              <Link
                href="/pergerakan-stok"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <PackageCheck className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium text-slate-800">Catat Mutasi Stok Masuk</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Recent Prescription Orders */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Pesanan Resep Masuk Terbaru</h2>
              <Link href="/pesanan-resep" className="text-xs font-semibold text-emerald-600 hover:underline">
                Lihat Semua
              </Link>
            </div>

            {pesananTerbaru.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Belum ada pesanan resep masuk dari Rumah Sakit.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pesananTerbaru.map((p) => (
                  <div key={p.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">
                        Resep RS: <span className="font-mono text-emerald-700 break-all">{p.resepRumahSakitId}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.detailPesananResep.length} macam obat &bull; Diterima:{' '}
                        {new Date(p.diterimaPada).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {p.status}
                      </span>
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
