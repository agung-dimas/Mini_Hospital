import { PharmacyHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { RefreshCcw, ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from 'lucide-react'

export default async function PergerakanStokPage() {
  let mutasiList: Array<{
    id: string
    jenisPergerakan: string
    perubahanJumlah: number
    alasan: string | null
    dibuatPada: Date
    obat: {
      kodeObat: string
      namaObat: string
      satuan: string
    }
  }> = []

  try {
    mutasiList = await prisma.pergerakanStok.findMany({
      include: {
        obat: true,
      },
      orderBy: { dibuatPada: 'desc' },
      take: 50,
    })
  } catch (error) {
    console.warn('Gagal query pergerakan stok:', error)
  }

  const getJenisBadge = (jenis: string, jumlah: number) => {
    if (jenis === 'penerimaan') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
          Penerimaan (+{jumlah})
        </span>
      )
    }
    if (jenis === 'penyerahan') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          <ArrowUpRight className="h-3 w-3 text-blue-600" />
          Penyerahan ({jumlah})
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        <SlidersHorizontal className="h-3 w-3 text-amber-600" />
        Penyesuaian ({jumlah > 0 ? `+${jumlah}` : jumlah})
      </span>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <PharmacyHeader title="Riwayat Mutasi & Audit Pergerakan Stok" />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Log Audit Pergerakan Stok Fisik</h2>
          <p className="text-sm text-slate-500">
            Setiap perubahan stok obat (penerimaan gudang, pengurangan penyerahan resep, atau penyesuaian) tercatat secara permanen.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Waktu Mutasi</th>
                  <th className="py-4 px-6">Kode & Nama Obat</th>
                  <th className="py-4 px-6">Jenis Mutasi</th>
                  <th className="py-4 px-6">Perubahan Jumlah</th>
                  <th className="py-4 px-6">Alasan / Referensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mutasiList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <RefreshCcw className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      Belum ada riwayat pergerakan stok.
                    </td>
                  </tr>
                ) : (
                  mutasiList.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(m.dibuatPada).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 block">{m.obat.namaObat}</span>
                        <span className="font-mono text-xs text-slate-400">{m.obat.kodeObat}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getJenisBadge(m.jenisPergerakan, m.perubahanJumlah)}
                      </td>
                      <td className="py-4 px-6 font-bold text-sm">
                        <span className={m.perubahanJumlah > 0 ? 'text-emerald-700' : 'text-slate-900'}>
                          {m.perubahanJumlah > 0 ? `+${m.perubahanJumlah}` : m.perubahanJumlah} {m.obat.satuan}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {m.alasan || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
