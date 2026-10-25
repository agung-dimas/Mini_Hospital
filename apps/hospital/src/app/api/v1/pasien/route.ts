import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pasienSchema } from '@/lib/validation'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cari = searchParams.get('cari') || ''

    const daftarPasien = await prisma.pasien.findMany({
      where: cari
        ? {
            OR: [
              { namaLengkap: { contains: cari, mode: 'insensitive' } },
              { nomorRekamMedis: { contains: cari, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { dibuatPada: 'desc' },
    })

    return jsonSuccess(daftarPasien, 'Daftar pasien berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/pasien:', error)
    return jsonError('Gagal mengambil daftar pasien', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validasi = pasienSchema.safeParse(body)

    if (!validasi.success) {
      return jsonError('Validasi data pasien gagal', 422, validasi.error.flatten().fieldErrors)
    }

    const { nomor_rekam_medis, nama_lengkap, tanggal_lahir, jenis_kelamin, alamat } = validasi.data

    const duplikat = await prisma.pasien.findUnique({
      where: { nomorRekamMedis: nomor_rekam_medis },
    })

    if (duplikat) {
      return jsonError('Nomor rekam medis sudah terdaftar', 409, {
        nomor_rekam_medis: ['Nomor rekam medis harus unik'],
      })
    }

    const pasienBaru = await prisma.pasien.create({
      data: {
        nomorRekamMedis: nomor_rekam_medis,
        namaLengkap: nama_lengkap,
        tanggalLahir: new Date(tanggal_lahir),
        jenisKelamin: jenis_kelamin,
        alamat,
      },
    })

    return jsonSuccess(pasienBaru, 'Pasien baru berhasil didaftarkan', 201)
  } catch (error) {
    console.error('Error POST /api/v1/pasien:', error)
    return jsonError('Gagal mendaftarkan pasien', 500)
  }
}
