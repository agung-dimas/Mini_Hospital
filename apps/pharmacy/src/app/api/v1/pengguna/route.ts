import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

function normalizePeranFarmasi(rawPeran: string) {
  const value = (rawPeran || '').trim().toLowerCase()
  if (value === 'pengelola_farmasi' || value === 'pengelola') return 'pengelola_farmasi'
  return 'apoteker'
}

export async function GET() {
  try {
    const users = await prisma.profilPengguna.findMany({
      orderBy: { dibuatPada: 'desc' },
    })

    const data = users.map((u) => ({
      id: u.id,
      namaLengkap: u.namaLengkap,
      email: null,
      peran: u.peran,
      dibuatPada: u.dibuatPada,
      source: 'farmasi',
    }))

    return jsonSuccess(data, 'Daftar pengguna farmasi berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/pengguna (farmasi):', error)
    return jsonError('Gagal mengambil daftar pengguna farmasi', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const namaLengkap = (body.nama_lengkap || body.namaLengkap || '').trim()
    const rawPeran = String(body.peran || 'apoteker')

    if (!namaLengkap) {
      return jsonError('Nama lengkap wajib diisi', 422)
    }

    const peran = normalizePeranFarmasi(rawPeran)

    const existing = await prisma.profilPengguna.findFirst({
      where: {
        namaLengkap: { equals: namaLengkap, mode: 'insensitive' },
      },
    })

    if (existing) {
      return jsonError('Akun farmasi dengan nama yang sama sudah terdaftar', 409)
    }

    const penggunaBaru = await prisma.profilPengguna.create({
      data: {
        namaLengkap,
        peran,
      },
    })

    return jsonSuccess(
      {
        id: penggunaBaru.id,
        namaLengkap: penggunaBaru.namaLengkap,
        email: null,
        peran: penggunaBaru.peran,
        dibuatPada: penggunaBaru.dibuatPada,
        source: 'farmasi',
      },
      `Akun farmasi ${peran} berhasil dibuat untuk ${penggunaBaru.namaLengkap}!`,
      201
    )
  } catch (error) {
    console.error('Error POST /api/v1/pengguna (farmasi):', error)
    return jsonError('Gagal membuat akun pengguna farmasi', 500)
  }
}
