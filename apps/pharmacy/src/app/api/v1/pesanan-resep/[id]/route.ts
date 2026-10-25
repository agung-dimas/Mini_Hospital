import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

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

    return jsonSuccess(
      {
        id: pesanan.id,
        resep_rumah_sakit_id: pesanan.resepRumahSakitId,
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
