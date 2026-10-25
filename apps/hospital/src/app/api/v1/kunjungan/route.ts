import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kunjunganSchema } from '@/lib/validation'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET() {
  try {
    const daftarKunjungan = await prisma.kunjungan.findMany({
      include: {
        pasien: true,
        dokter: true,
        pemeriksaan: true,
        resep: true,
      },
      orderBy: { waktuKunjungan: 'desc' },
    })

    return jsonSuccess(daftarKunjungan, 'Daftar kunjungan berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/kunjungan:', error)
    return jsonError('Gagal mengambil daftar kunjungan', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validasi = kunjunganSchema.safeParse(body)

    if (!validasi.success) {
      return jsonError('Validasi data kunjungan gagal', 422, validasi.error.flatten().fieldErrors)
    }

    const { pasien_id, dokter_id, waktu_kunjungan } = validasi.data

    const kunjunganBaru = await prisma.kunjungan.create({
      data: {
        pasienId: pasien_id,
        dokterId: dokter_id,
        waktuKunjungan: waktu_kunjungan ? new Date(waktu_kunjungan) : new Date(),
        status: 'menunggu',
      },
      include: {
        pasien: true,
        dokter: true,
      },
    })

    return jsonSuccess(kunjunganBaru, 'Kunjungan pasien berhasil dicatat', 201)
  } catch (error) {
    console.error('Error POST /api/v1/kunjungan:', error)
    return jsonError('Gagal mencatat kunjungan', 500)
  }
}
