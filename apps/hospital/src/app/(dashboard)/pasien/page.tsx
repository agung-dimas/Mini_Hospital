import { HospitalHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { Users, Search, Plus, Calendar, MapPin } from 'lucide-react'

export default async function PasienPage({
  searchParams,
}: {
  searchParams: Promise<{ cari?: string }>
}) {
  const { cari = '' } = await searchParams

  let daftarPasien: Array<{
    id: string
    nomorRekamMedis: string
    namaLengkap: string
    tanggalLahir: Date
    jenisKelamin: string
    alamat: string | null
    dibuatPada: Date
  }> = []

  try {
    daftarPasien = await prisma.pasien.findMany({
      where: cari
        ? {
            OR: [
              { namaLengkap: { contains: cari, mode: 'insensitive' } },
              { nomorRekamMedis: { contains: cari, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { dibuatPada: 'desc' },
    })
  } catch (error) {
    console.warn('Gagal query pasien:', error)
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Manajemen Data Pasien" />

      <main className="flex-1 p-8 space-y-6 max-w-7xl">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form method="GET" className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="cari"
              defaultValue={cari}
              placeholder="Cari nama atau No. Rekam Medis..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />
          </form>

          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Pasien Baru
          </button>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">No. Rekam Medis</th>
                  <th className="py-4 px-6">Nama Lengkap</th>
                  <th className="py-4 px-6">Tanggal Lahir</th>
                  <th className="py-4 px-6">Jenis Kelamin</th>
                  <th className="py-4 px-6">Alamat</th>
                  <th className="py-4 px-6">Terdaftar Pada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftarPasien.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      Tidak ada data pasien yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  daftarPasien.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-semibold text-blue-600">
                        {p.nomorRekamMedis}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {p.namaLengkap}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(p.tanggalLahir).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-6 capitalize">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.jenisKelamin === 'laki-laki'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {p.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                        {p.alamat || '-'}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs">
                        {new Date(p.dibuatPada).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
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
