import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

const STATUS_VALID = [
  'draf',
  'diterbitkan',
  'diterima',
  'diproses',
  'diserahkan_sebagian',
  'diserahkan',
  'ditolak',
  'dibatalkan',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body
    const idempotencyKey = request.headers.get('Idempotency-Key')

    if (!status || !STATUS_VALID.includes(status)) {
      return jsonError('Nilai status resep tidak valid', 422, {
        status: [`Status harus salah satu dari: ${STATUS_VALID.join(', ')}`],
      })
    }

    const resep = await prisma.resep.findUnique({
      where: { id },
    })

    if (!resep) {
      return jsonError('Data resep tidak ditemukan', 404)
    }

    // Status diserahkan bersifat permanen
    if (resep.status === 'diserahkan') {
      return jsonError('Resep telah selesai diserahkan dan tidak dapat diubah kembali', 409)
    }

    const resepUpdated = await prisma.$transaction(async (tx) => {
      const updated = await tx.resep.update({
        where: { id },
        data: { status },
      })

      // Catat log integrasi
      await tx.peristiwaIntegrasi.create({
        data: {
          jenisPeristiwa: `pembaruan_status_${status}`,
          referensiData: id,
          kunciIdempotensi: idempotencyKey,
          statusPengiriman: 'berhasil',
        },
      })

      return updated
    })

    return jsonSuccess(resepUpdated, `Status resep berhasil diperbarui menjadi ${status}`)
  } catch (error) {
    console.error('Error PATCH /api/v1/resep/[id]/status:', error)
    return jsonError('Gagal memperbarui status resep', 500)
  }
}
