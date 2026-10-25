import Link from 'next/link'
import { PharmacyHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { ArrowDownToLine, PackageCheck, AlertCircle } from 'lucide-react'

export default async function PesananResepPage() {
  let daftarPesanan: Array<{
    id: string
    resepRumahSakitId: string
    status: string
    diterimaPada: Date
    detailPesananResep: Array<{
      id: string
      namaObatSaatPesanan: string
      jumlahDiminta: number
      obat: {
        namaObat: string
        satuan: string
        pergerakanStok: Array<{ perubahanJumlah: number }>
      }
    }>
  }> = []

  try {
    daftarPesanan = await prisma.pesananResep.findMany({
      include: {
        detailPesananResep: {
          include: {
            obat: {
              include: {
                pergerakanStok: true,
              },
            },
          },
        },
      },
      orderBy: { diterimaPada: 'desc' },
    })
  } catch (error) {
    console.warn('Gagal query pesanan resep:', error)
  }

  return (
    <div className="flex-1 flex flex-col">
      <PharmacyHeader title="Pesanan Resep Masuk dari Rumah Sakit" />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Verifikasi Resep Medis</h2>
          <p className="text-sm text-slate-500">
            Resep yang diterbitkan dokter RS diambil secara aman melalui REST API untuk verifikasi stok dan penyerahan obat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {daftarPesanan.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <ArrowDownToLine className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              Belum ada pesanan resep masuk dari Rumah Sakit.
            </div>
          ) : (
            daftarPesanan.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">Pesanan: {p.id.slice(0, 8)}...</span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      Resep RS: <span className="font-mono text-emerald-700">{p.resepRumahSakitId.slice(0, 8)}...</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Diterima: {new Date(p.diterimaPada).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border capitalize bg-emerald-50 text-emerald-800 border-emerald-200">
                    {p.status}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Rincian Kebutuhan Obat ({p.detailPesananResep.length} item)
                  </span>
                  <ul className="space-y-2">
                    {p.detailPesananResep.map((item) => {
                      const stokSaatIni = item.obat.pergerakanStok.reduce(
                        (sum, m) => sum + m.perubahanJumlah,
                        0
                      )
                      const cukup = stokSaatIni >= item.jumlahDiminta
                      return (
                        <li key={item.id} className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{item.namaObatSaatPesanan}</span>
                            <span className="text-slate-900">{item.jumlahDiminta} {item.obat.satuan}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Stok fisik tersedia: {stokSaatIni}</span>
                            <span className={cukup ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                              {cukup ? 'Stok Mencukupi' : 'Stok Kurang!'}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                {p.status !== 'diserahkan' && (
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <Link
                      href={`/penyerahan?pesanan_id=${p.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      <PackageCheck className="h-4 w-4" />
                      Proses Penyerahan Obat
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
