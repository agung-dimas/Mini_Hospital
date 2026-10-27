import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'
import { getHospitalResep } from '@/lib/integrations/hospital'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pesanan = await prisma.pesananResep.findUnique({
      where: { id },
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
        detailPenyerahanObat: true,
      },
    })

    if (!pesanan) {
      return jsonError('Data pesanan resep tidak ditemukan', 404)
    }

    // Tambahkan info stok fisik terkini untuk setiap item resep
    const itemsDenganStok = pesanan.detailPesananResep.map((item) => {
      const totalStok = item.obat.pergerakanStok.reduce(
        (sum, m) => sum + m.perubahanJumlah,
        0
      )
      return {
        id: item.id,
        obat_id: item.obatId,
        nama_obat: item.namaObatSaatPesanan,
        jumlah_diminta: item.jumlahDiminta,
        stok_tersedia: totalStok,
        mencukupi: totalStok >= item.jumlahDiminta,
      }
    })

    let dataHospital: Awaited<ReturnType<typeof getHospitalResep>> | null = null
    try {
      dataHospital = await getHospitalResep(pesanan.resepRumahSakitId)
    } catch (error) {
      console.warn(`Gagal mengambil detail resep ${pesanan.resepRumahSakitId} dari Hospital:`, error)
    }

    const pemeriksaan = dataHospital?.kunjungan?.pemeriksaan?.[0]

    return jsonSuccess(
      {
        id: pesanan.id,
        resep_rumah_sakit_id: pesanan.resepRumahSakitId,
        pasien: {
          nama_lengkap: dataHospital?.pasien?.namaLengkap ?? pesanan.namaPasien,
          nomor_rekam_medis: dataHospital?.pasien?.nomorRekamMedis ?? pesanan.nomorRekamMedis,
          tanggal_lahir: dataHospital?.pasien?.tanggalLahir ?? pesanan.tanggalLahirPasien,
          jenis_kelamin: dataHospital?.pasien?.jenisKelamin ?? pesanan.jenisKelaminPasien,
        },
        dokter: {
          nama_lengkap: dataHospital?.dokter?.namaLengkap ?? pesanan.namaDokter,
          spesialisasi: dataHospital?.dokter?.spesialisasi ?? pesanan.spesialisasiDokter,
        },
        diagnosis: pemeriksaan?.diagnosis ?? pesanan.diagnosis,
        catatan_klinis: pemeriksaan?.catatan ?? pesanan.catatanKlinis,
        diterbitkan_pada: dataHospital?.diterbitkanPada ?? pesanan.diterbitkanPada,
        status: pesanan.status,
        diterima_pada: pesanan.diterimaPada,
        items: itemsDenganStok,
        penyerahan: pesanan.detailPenyerahanObat,
      },
      'Detail pesanan resep berhasil diambil'
    )
  } catch (error) {
    console.error('Error GET /api/v1/pesanan-resep/[id]:', error)
    return jsonError('Gagal mengambil data pesanan resep', 500)
  }
}
