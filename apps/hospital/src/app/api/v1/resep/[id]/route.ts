import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const resep = await prisma.resep.findUnique({
      where: { id },
      include: {
        pasien: true,
        dokter: true,
        detailResep: true,
      },
    })

    if (!resep) {
      return jsonError('Data resep tidak ditemukan', 404)
    }

    return jsonSuccess(resep, 'Detail resep berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/resep/[id]:', error)
    return jsonError('Gagal mengambil data resep', 500)
  }
}
