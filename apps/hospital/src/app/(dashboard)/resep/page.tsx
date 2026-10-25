import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { FileText, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export default async function ResepPage() {
  let daftarResep: Array<{
    id: string
    status: string
    diterbitkanPada: Date | null
    pasien: { namaLengkap: string; nomorRekamMedis: string }
    dokter: { namaLengkap: string; spesialisasi: string }
    detailResep: Array<{
      id: string
      namaObatSaatResep: string
      jumlah: number
      instruksiPenggunaan: string
    }>
  }> = []

  try {
    daftarResep = await prisma.resep.findMany({
      include: {
        pasien: true,
        dokter: true,
        detailResep: true,
      },
      orderBy: { dibuatPada: 'desc' },
    })
  } catch (error) {
    console.warn('Gagal query resep:', error)
  }

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'diterbitkan':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'diterima':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'diproses':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200'
      case 'diserahkan':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'ditolak':
        return 'bg-rose-50 text-rose-800 border-rose-200'
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Manajemen Resep Medis" />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daftar Resep & Status Farmasi</h2>
            <p className="text-sm text-slate-500">
              Pelacakan status resep medis dari penerbitan hingga penyerahan obat oleh Farmasi.
            </p>
          </div>
          <Link
            href="/resep/baru"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Terbitkan Resep Baru
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {daftarResep.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              Belum ada resep medis yang diterbitkan.
            </div>
          ) : (
            daftarResep.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">ID: {r.id.slice(0, 8)}...</span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">{r.pasien.namaLengkap}</h3>
                    <p className="text-xs text-slate-500">
                      {r.pasien.nomorRekamMedis} &bull; Dokter: {r.dokter.namaLengkap}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${getBadgeStyle(
                      r.status
                    )}`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Daftar Obat ({r.detailResep.length} item)
                  </span>
                  <ul className="space-y-2">
                    {r.detailResep.map((item) => (
                      <li key={item.id} className="bg-slate-50 p-2.5 rounded-lg text-xs space-y-0.5">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{item.namaObatSaatResep}</span>
                          <span className="text-blue-600">{item.jumlah} satuan</span>
                        </div>
                        <p className="text-slate-500 text-[11px] italic">{item.instruksiPenggunaan}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span>Diterbitkan: {r.diterbitkanPada ? new Date(r.diterbitkanPada).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                  <span className="font-mono text-slate-400">REST API v1</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
