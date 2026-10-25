import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const obat = await prisma.obat.findUnique({
      where: { id },
      include: {
        pergerakanStok: true,
      },
    })

    if (!obat) {
      return jsonError('Data obat tidak ditemukan', 404)
    }

    const stokSaatIni = obat.pergerakanStok.reduce(
      (sum, mutasi) => sum + mutasi.perubahanJumlah,
      0
    )

    return jsonSuccess(
      {
        obat_id: obat.id,
        kode_obat: obat.kodeObat,
        nama_obat: obat.namaObat,
        satuan: obat.satuan,
        stok_saat_ini: stokSaatIni,
        stok_minimum: obat.stokMinimum,
        stok_tersedia: stokSaatIni > 0,
      },
      'Informasi stok obat berhasil diambil'
    )
  } catch (error) {
    console.error('Error GET /api/v1/obat/[id]/stok:', error)
    return jsonError('Gagal memeriksa stok obat', 500)
  }
}
