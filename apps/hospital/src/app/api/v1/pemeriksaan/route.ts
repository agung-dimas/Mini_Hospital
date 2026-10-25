import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kunjungan_id, diagnosis, catatan, dibuat_oleh } = body

    if (!kunjungan_id || !diagnosis) {
      return jsonError('ID kunjungan dan diagnosis dokter wajib diisi', 422)
    }

    const hasilPemeriksaan = await prisma.$transaction(async (tx) => {
      const pemeriksaan = await tx.pemeriksaan.create({
        data: {
          kunjunganId: kunjungan_id,
          diagnosis,
          catatan,
          dibuatOleh: dibuat_oleh,
        },
      })

      await tx.kunjungan.update({
        where: { id: kunjungan_id },
        data: { status: 'sedang_diperiksa' },
      })

      return pemeriksaan
    })

    return jsonSuccess(hasilPemeriksaan, 'Catatan pemeriksaan berhasil disimpan', 201)
  } catch (error) {
    console.error('Error POST /api/v1/pemeriksaan:', error)
    return jsonError('Gagal menyimpan catatan pemeriksaan', 500)
  }
}
