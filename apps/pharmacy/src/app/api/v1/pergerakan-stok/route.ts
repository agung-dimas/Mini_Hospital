import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pergerakanStokSchema } from '@/lib/validation'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validasi = pergerakanStokSchema.safeParse(body)

    if (!validasi.success) {
      return jsonError('Validasi data pergerakan stok gagal', 422, validasi.error.flatten().fieldErrors)
    }

    const { obat_id, jenis_pergerakan, perubahan_jumlah, referensi_transaksi, alasan } = validasi.data

    const hasilMutasi = await prisma.$transaction(async (tx) => {
      // Periksa keberadaan obat
      const obat = await tx.obat.findUnique({
        where: { id: obat_id },
        include: { pergerakanStok: true },
      })

      if (!obat) {
        throw new Error('OBAT_NOT_FOUND')
      }

      const stokSaatIni = obat.pergerakanStok.reduce(
        (sum, m) => sum + m.perubahanJumlah,
        0
      )

      // Pastikan stok tidak menjadi negatif bila pengeluaran/penyesuaian minus
      if (stokSaatIni + perubahan_jumlah < 0) {
        throw new Error('STOK_INSUFFICIENT')
      }

      const mutasi = await tx.pergerakanStok.create({
        data: {
          obatId: obat_id,
          jenisPergerakan: jenis_pergerakan,
          perubahanJumlah: perubahan_jumlah,
          referensiTransaksi: referensi_transaksi,
          alasan,
        },
      })

      return {
        ...mutasi,
        stok_baru: stokSaatIni + perubahan_jumlah,
      }
    })

    return jsonSuccess(hasilMutasi, 'Mutasi stok obat berhasil dicatat', 201)
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'OBAT_NOT_FOUND') {
        return jsonError('Data obat tidak ditemukan', 404)
      }
      if (error.message === 'STOK_INSUFFICIENT') {
        return jsonError('Stok tidak mencukupi untuk pengurangan ini (mencegah stok negatif)', 400)
      }
    }
    console.error('Error POST /api/v1/pergerakan-stok:', error)
    return jsonError('Gagal mencatat mutasi stok', 500)
  }
}
