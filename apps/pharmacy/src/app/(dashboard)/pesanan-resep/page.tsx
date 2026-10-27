import Link from 'next/link'
import { PharmacyHeader } from '@/components/layout/header'
import { prisma } from '@/lib/prisma'
import { getHospitalResep } from '@/lib/integrations/hospital'
import { ArrowDownToLine, PackageCheck, AlertCircle } from 'lucide-react'

export default async function PesananResepPage() {
  let daftarPesanan: Array<{
    id: string
    resepRumahSakitId: string
    namaPasien: string | null
    nomorRekamMedis: string | null
    tanggalLahirPasien: Date | null
    jenisKelaminPasien: string | null
    namaDokter: string | null
    spesialisasiDokter: string | null
    diagnosis: string | null
    catatanKlinis: string | null
    diterbitkanPada: Date | null
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

  const pesananDenganDataHospital = await Promise.all(
    daftarPesanan.map(async (pesanan) => {
      try {
        const resep = await getHospitalResep(pesanan.resepRumahSakitId)
        const pemeriksaan = resep.kunjungan?.pemeriksaan?.[0]
        return {
          ...pesanan,
          namaPasien: resep.pasien?.namaLengkap ?? pesanan.namaPasien,
          nomorRekamMedis: resep.pasien?.nomorRekamMedis ?? pesanan.nomorRekamMedis,
          tanggalLahirPasien: resep.pasien?.tanggalLahir ?? pesanan.tanggalLahirPasien,
          jenisKelaminPasien: resep.pasien?.jenisKelamin ?? pesanan.jenisKelaminPasien,
          namaDokter: resep.dokter?.namaLengkap ?? pesanan.namaDokter,
          spesialisasiDokter: resep.dokter?.spesialisasi ?? pesanan.spesialisasiDokter,
          diagnosis: pemeriksaan?.diagnosis ?? pesanan.diagnosis,
          catatanKlinis: pemeriksaan?.catatan ?? pesanan.catatanKlinis,
          diterbitkanPada: resep.diterbitkanPada ?? pesanan.diterbitkanPada,
        }
      } catch (error) {
        console.warn(`Gagal mengambil resep ${pesanan.resepRumahSakitId} dari Hospital:`, error)
        return pesanan
      }
    })
  )

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
          {pesananDenganDataHospital.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <ArrowDownToLine className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              Belum ada pesanan resep masuk dari Rumah Sakit.
            </div>
          ) : (
            pesananDenganDataHospital.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 block break-all">ID Pesanan Farmasi: {p.id}</span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      Resep RS: <span className="font-mono text-emerald-700 break-all">{p.resepRumahSakitId}</span>
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

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Identitas & Informasi Klinis
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Pasien: </span>
                      <span className="font-semibold text-slate-800">{p.namaPasien || 'Tidak tersedia'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">No. RM: </span>
                      <span className="font-semibold text-slate-800">{p.nomorRekamMedis || 'Tidak tersedia'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Tanggal lahir: </span>
                      <span className="font-semibold text-slate-800">
                        {p.tanggalLahirPasien ? new Date(p.tanggalLahirPasien).toLocaleDateString('id-ID') : 'Tidak tersedia'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Dokter: </span>
                      <span className="font-semibold text-slate-800">{p.namaDokter || 'Tidak tersedia'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Jenis kelamin: </span>
                      <span className="font-semibold text-slate-800">{p.jenisKelaminPasien || 'Tidak tersedia'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Spesialisasi: </span>
                      <span className="font-semibold text-slate-800">{p.spesialisasiDokter || 'Tidak tersedia'}</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">Diagnosis: </span>
                    <span className="font-semibold text-slate-800">{p.diagnosis || 'Tidak dicantumkan'}</span>
                  </div>
                  {p.catatanKlinis && (
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      <span className="font-semibold text-slate-700">Catatan dokter: </span>
                      {p.catatanKlinis}
                    </p>
                  )}
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
