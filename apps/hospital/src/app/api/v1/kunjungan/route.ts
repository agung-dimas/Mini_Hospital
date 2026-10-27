import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { kunjunganSchema } from '@/lib/validation'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dokterId = searchParams.get('dokterId')
    const status = searchParams.get('status')

    const where: Record<string, any> = {}
    if (dokterId) {
      where.dokterId = dokterId
    }
    if (status) {
      where.status = status
    }

    const daftarKunjungan = await prisma.kunjungan.findMany({
      where,
      include: {
        pasien: true,
        dokter: true,
        pemeriksaan: true,
        resep: {
          include: {
            detailResep: true,
          },
        },
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, pasien_id, dokter_id, waktu_kunjungan, status } = body

    if (typeof id !== 'string' || !id) {
      return jsonError('ID kunjungan wajib diisi', 422)
    }

    if (
      (pasien_id !== undefined && typeof pasien_id !== 'string') ||
      (dokter_id !== undefined && typeof dokter_id !== 'string') ||
      (waktu_kunjungan !== undefined && typeof waktu_kunjungan !== 'string') ||
      (status !== undefined && !['menunggu', 'sedang_diperiksa', 'batal'].includes(status))
    ) {
      return jsonError('Data perubahan kunjungan tidak valid', 422)
    }

    const kunjungan = await prisma.kunjungan.findUnique({
      where: { id },
      include: { pemeriksaan: { select: { id: true } } },
    })

    if (!kunjungan) {
      return jsonError('Data kunjungan tidak ditemukan', 404)
    }

    if (kunjungan.status === 'selesai' || kunjungan.pemeriksaan.length > 0) {
      return jsonError('Kunjungan yang sudah diperiksa tidak dapat diedit', 409)
    }

    if (pasien_id) {
      const pasien = await prisma.pasien.findUnique({ where: { id: pasien_id }, select: { id: true } })
      if (!pasien) return jsonError('Pasien tidak ditemukan', 404)
    }

    if (dokter_id) {
      const dokter = await prisma.dokter.findUnique({ where: { id: dokter_id }, select: { id: true, aktif: true } })
      if (!dokter) return jsonError('Dokter tidak ditemukan', 404)
      if (!dokter.aktif) return jsonError('Dokter yang dipilih tidak aktif', 422)
    }

    const waktuKunjungan = waktu_kunjungan ? new Date(waktu_kunjungan) : undefined
    if (waktuKunjungan && Number.isNaN(waktuKunjungan.getTime())) {
      return jsonError('Waktu kunjungan tidak valid', 422)
    }

    const updated = await prisma.kunjungan.update({
      where: { id },
      data: {
        ...(pasien_id ? { pasienId: pasien_id } : {}),
        ...(dokter_id ? { dokterId: dokter_id } : {}),
        ...(waktuKunjungan ? { waktuKunjungan } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        pasien: true,
        dokter: true,
        pemeriksaan: true,
        resep: {
          include: {
            detailResep: true,
          },
        },
      },
    })

    return jsonSuccess(updated, 'Data kunjungan berhasil diperbarui')
  } catch (error) {
    console.error('Error PATCH /api/v1/kunjungan:', error)
    return jsonError('Gagal memperbarui data kunjungan', 500)
  }
}
