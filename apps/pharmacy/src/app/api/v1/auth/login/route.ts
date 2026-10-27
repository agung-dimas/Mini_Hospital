import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return jsonError('Email dan kata sandi wajib diisi', 422)
    }

    const pengguna = await prisma.profilPengguna.findUnique({
      where: { email },
    })

    if (!pengguna || pengguna.kataSandi !== password) {
      return jsonError('Email atau kata sandi Pharmacy tidak sesuai', 401)
    }

    return jsonSuccess(
      {
        id: pengguna.id,
        namaLengkap: pengguna.namaLengkap,
        peran: pengguna.peran,
        email: pengguna.email,
      },
      'Login Pharmacy berhasil'
    )
  } catch (error) {
    console.error('Error POST /api/v1/auth/login (pharmacy):', error)
    return jsonError('Gagal menghubungi layanan autentikasi Pharmacy', 500)
  }
}
