import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const pasien = await prisma.pasien.findUnique({
      where: { id },
      include: {
        kunjungan: {
          include: {
            dokter: true,
            pemeriksaan: true,
            resep: true,
          },
          orderBy: { waktuKunjungan: 'desc' },
        },
      },
    })

    if (!pasien) {
      return jsonError('Data pasien tidak ditemukan', 404)
    }

    return jsonSuccess(pasien, 'Detail pasien berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/pasien/[id]:', error)
    return jsonError('Gagal mengambil data pasien', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const pasien = await prisma.pasien.findUnique({
      where: { id },
    })

    if (!pasien) {
      return jsonError('Data pasien tidak ditemukan', 404)
    }

    const dataUpdate: {
      namaLengkap?: string
      tanggalLahir?: Date
      jenisKelamin?: string
      alamat?: string
    } = {}

    if (body.nama_lengkap) dataUpdate.namaLengkap = body.nama_lengkap
    if (body.tanggal_lahir) dataUpdate.tanggalLahir = new Date(body.tanggal_lahir)
    if (body.jenis_kelamin) dataUpdate.jenisKelamin = body.jenis_kelamin
    if (body.alamat !== undefined) dataUpdate.alamat = body.alamat

    const updated = await prisma.pasien.update({
      where: { id },
      data: dataUpdate,
    })

    return jsonSuccess(updated, 'Data pasien berhasil diperbarui')
  } catch (error) {
    console.error('Error PATCH /api/v1/pasien/[id]:', error)
    return jsonError('Gagal memperbarui data pasien', 500)
  }
}
