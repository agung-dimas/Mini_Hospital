import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

async function fetchFarmasiUsers() {
  try {
    const res = await fetch('http://localhost:3001/api/v1/pengguna', {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const json = await res.json()
    if (!json?.sukses) return []
    return Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const penggunaList = await prisma.profilPengguna.findMany({
      include: {
        dokter: true,
      },
      orderBy: { dibuatPada: 'desc' },
    })

    const sanitasi = penggunaList.map((u) => ({
      id: u.id,
      namaLengkap: u.namaLengkap,
      email: u.email,
      peran: u.peran,
      dibuatPada: u.dibuatPada,
      source: 'simrs',
      dokter: u.dokter?.[0]
        ? {
            id: u.dokter[0].id,
            spesialisasi: u.dokter[0].spesialisasi,
            aktif: u.dokter[0].aktif,
          }
        : null,
    }))

    const farmasiUsers = await fetchFarmasiUsers()
    const hasil = [
      ...sanitasi,
      ...farmasiUsers.map((u: any) => ({
        ...u,
        source: 'farmasi',
        email: u.email ?? null,
        dokter: null,
      })),
    ]

    return jsonSuccess(hasil, 'Daftar pengguna berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/pengguna:', error)
    return jsonError('Gagal mengambil daftar pengguna', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama_lengkap, email, kata_sandi, peran, spesialisasi, sumber = 'simrs' } = body

    if (sumber === 'farmasi') {
      const res = await fetch('http://localhost:3001/api/v1/pengguna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_lengkap: nama_lengkap || body.namaLengkap,
          peran,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.sukses) {
        return jsonError(json?.pesan || 'Gagal membuat akun farmasi', res.status || 500)
      }

      return jsonSuccess(json.data, `Akun farmasi ${peran} berhasil dibuat`, 201)
    }

    if (!nama_lengkap || !email || !kata_sandi || !peran) {
      return jsonError('Nama lengkap, email, kata sandi, dan peran wajib diisi', 422)
    }

    const emailTrimmed = email.trim().toLowerCase()

    const duplikat = await prisma.profilPengguna.findUnique({
      where: { email: emailTrimmed },
    })

    if (duplikat) {
      return jsonError('Email pengguna sudah terdaftar di sistem', 409)
    }

    let dbPeran = 'pendaftaran'
    if (peran === 'administrator' || peran === 'admin') dbPeran = 'admin'
    if (peran === 'dokter') dbPeran = 'dokter'

    const hasil = await prisma.$transaction(async (tx) => {
      const penggunaBaru = await tx.profilPengguna.create({
        data: {
          namaLengkap: nama_lengkap,
          email: emailTrimmed,
          kataSandi: kata_sandi,
          peran: dbPeran,
        },
      })

      let dokterBaru = null
      if (dbPeran === 'dokter') {
        dokterBaru = await tx.dokter.create({
          data: {
            penggunaId: penggunaBaru.id,
            namaLengkap: nama_lengkap,
            spesialisasi: spesialisasi || 'Spesialis Umum',
            aktif: true,
          },
        })
      }

      await tx.logAudit.create({
        data: {
          penggunaId: penggunaBaru.id,
          aksi: 'BUAT_AKUN_PENGGUNA',
          jenisData: 'autentikasi',
          referensiData: penggunaBaru.id,
        },
      })

      return { pengguna: penggunaBaru, dokter: dokterBaru }
    })

    return jsonSuccess(
      {
        id: hasil.pengguna.id,
        namaLengkap: hasil.pengguna.namaLengkap,
        email: hasil.pengguna.email,
        peran: hasil.pengguna.peran,
        dokter: hasil.dokter,
      },
      `Akun ${hasil.pengguna.peran} berhasil dibuat untuk ${hasil.pengguna.namaLengkap}!`,
      201
    )
  } catch (error) {
    console.error('Error POST /api/v1/pengguna:', error)
    return jsonError('Gagal membuat akun pengguna baru', 500)
  }
}
