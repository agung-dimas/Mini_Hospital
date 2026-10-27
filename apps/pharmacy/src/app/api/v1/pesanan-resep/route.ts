import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'
import { updateHospitalResepStatus } from '@/lib/integrations/hospital'

export async function GET() {
  try {
    const daftarPesanan = await prisma.pesananResep.findMany({
      include: {
        detailPesananResep: {
          include: { obat: true },
        },
        detailPenyerahanObat: true,
      },
      orderBy: { diterimaPada: 'desc' },
    })

    return jsonSuccess(daftarPesanan, 'Daftar pesanan resep berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/pesanan-resep:', error)
    return jsonError('Gagal mengambil daftar pesanan resep', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      resep_rumah_sakit_id,
      pasien,
      dokter,
      diagnosis,
      catatan_klinis,
      diterbitkan_pada,
      items,
    } = body

    if (
      !resep_rumah_sakit_id ||
      !pasien?.nama_lengkap ||
      !pasien?.nomor_rekam_medis ||
      !dokter?.nama_lengkap ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return jsonError('Identitas pasien, dokter, ID resep, dan daftar item obat wajib disertakan', 422)
    }

    // Mencegah penerimaan resep ganda
    const duplikat = await prisma.pesananResep.findUnique({
      where: { resepRumahSakitId: resep_rumah_sakit_id },
    })

    if (duplikat) {
      return jsonError('Resep ini sudah pernah diterima oleh farmasi sebelumnya', 409)
    }

    const pesananBaru = await prisma.$transaction(async (tx) => {
      const pesanan = await tx.pesananResep.create({
        data: {
          resepRumahSakitId: resep_rumah_sakit_id,
          namaPasien: pasien.nama_lengkap,
          nomorRekamMedis: pasien.nomor_rekam_medis,
          tanggalLahirPasien: pasien.tanggal_lahir ? new Date(pasien.tanggal_lahir) : null,
          jenisKelaminPasien: pasien.jenis_kelamin || null,
          namaDokter: dokter.nama_lengkap,
          spesialisasiDokter: dokter.spesialisasi || null,
          diagnosis: diagnosis || null,
          catatanKlinis: catatan_klinis || null,
          diterbitkanPada: diterbitkan_pada ? new Date(diterbitkan_pada) : null,
          status: 'diterima',
          detailPesananResep: {
            create: items.map((item: {
              detail_resep_rumah_sakit_id?: string
              obat_id: string
              nama_obat_saat_pesanan: string
              jumlah_diminta: number
            }) => ({
              detailResepRumahSakitId: item.detail_resep_rumah_sakit_id,
              obatId: item.obat_id,
              namaObatSaatPesanan: item.nama_obat_saat_pesanan,
              jumlahDiminta: item.jumlah_diminta,
            })),
          },
        },
        include: {
          detailPesananResep: true,
        },
      })

      // Catat log integrasi
      await tx.logIntegrasi.create({
        data: {
          arahIntegrasi: 'masuk_dari_hospital',
          referensiData: pesanan.id,
          endpoint: '/api/v1/pesanan-resep',
          kodeStatusHttp: 201,
          pesanKesalahan: null,
        },
      })

      return pesanan
    })

    // Beritahukan pembaruan status ke Hospital secara non-blocking
    updateHospitalResepStatus(resep_rumah_sakit_id, 'diterima').catch((err) => {
      console.warn('Gagal sinkronisasi status diterima ke Hospital:', err)
    })

    return jsonSuccess(pesananBaru, 'Resep berhasil diterima oleh Farmasi', 201)
  } catch (error) {
    console.error('Error POST /api/v1/pesanan-resep:', error)
    return jsonError('Gagal menerima pesanan resep', 500)
  }
}
