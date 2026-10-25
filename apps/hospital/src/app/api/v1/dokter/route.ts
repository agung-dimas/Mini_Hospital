import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET() {
  try {
    const daftarDokter = await prisma.dokter.findMany({
      where: { aktif: true },
      orderBy: { namaLengkap: 'asc' },
    })

    return jsonSuccess(daftarDokter, 'Daftar dokter berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/dokter:', error)
    return jsonError('Gagal mengambil daftar dokter', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama_lengkap, spesialisasi } = body

    if (!nama_lengkap || !spesialisasi) {
      return jsonError('Nama lengkap dan spesialisasi dokter wajib diisi', 422)
    }

    const dokterBaru = await prisma.dokter.create({
      data: {
        namaLengkap: nama_lengkap,
        spesialisasi,
        aktif: true,
      },
    })

    return jsonSuccess(dokterBaru, 'Dokter baru berhasil ditambahkan', 201)
  } catch (error) {
    console.error('Error POST /api/v1/dokter:', error)
    return jsonError('Gagal menambahkan data dokter', 500)
  }
}
