import { PharmacyHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { Boxes, Search, Plus, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default async function ObatPage({
  searchParams,
}: {
  searchParams: Promise<{ cari?: string }>
}) {
  const { cari = '' } = await searchParams

  let daftarObat: Array<{
    id: string
    kodeObat: string
    namaObat: string
    bentukObat: string
    kekuatanObat: string
    satuan: string
    stokMinimum: number
    aktif: boolean
    pergerakanStok: Array<{ perubahanJumlah: number }>
  }> = []

  try {
    daftarObat = await prisma.obat.findMany({
      where: cari
        ? {
            OR: [
              { namaObat: { contains: cari, mode: 'insensitive' } },
              { kodeObat: { contains: cari, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        pergerakanStok: true,
      },
      orderBy: { namaObat: 'asc' },
    })
  } catch (error) {
    console.warn('Gagal query obat:', error)
  }

  return (
    <div className="flex-1 flex flex-col">
      <PharmacyHeader title="Katalog Master Obat & Stok Fisik" />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form method="GET" className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="cari"
              defaultValue={cari}
              placeholder="Cari nama atau kode obat..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
            />
          </form>

          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Obat Baru
          </button>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Kode Obat</th>
                  <th className="py-4 px-6">Nama Obat</th>
                  <th className="py-4 px-6">Bentuk & Kekuatan</th>
                  <th className="py-4 px-6">Satuan</th>
                  <th className="py-4 px-6">Stok Saat Ini</th>
                  <th className="py-4 px-6">Batas Min.</th>
                  <th className="py-4 px-6">Status Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftarObat.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Boxes className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      Tidak ada master obat yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  daftarObat.map((obat) => {
                    const totalStok = obat.pergerakanStok.reduce(
                      (sum, m) => sum + m.perubahanJumlah,
                      0
                    )
                    const isLow = totalStok <= obat.stokMinimum
                    return (
                      <tr key={obat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-mono font-semibold text-emerald-700">
                          {obat.kodeObat}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {obat.namaObat}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {obat.bentukObat} &bull; {obat.kekuatanObat}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {obat.satuan}
                        </td>
                        <td className="py-4 px-6 font-bold text-base text-slate-900">
                          {totalStok}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {obat.stokMinimum}
                        </td>
                        <td className="py-4 px-6">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                              Stok Rendah
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Stok Aman
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
