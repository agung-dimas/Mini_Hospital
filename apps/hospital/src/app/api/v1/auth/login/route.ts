import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { DEMO_USERS, SESSION_COOKIE_NAME, UserSession } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username) {
      return jsonError('Username atau email wajib diisi', 422)
    }

    // Cari user berdasarkan username atau email
    const userKey = Object.keys(DEMO_USERS).find((key) => {
      const u = DEMO_USERS[key]
      return u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    })

    if (!userKey) {
      return jsonError('Akun pengguna tidak ditemukan di sistem', 401)
    }

    const matchedUser = DEMO_USERS[userKey]

    // Validasi kata sandi sederhana (demo / mini hospital)
    if (password && password !== matchedUser.kataSandi) {
      return jsonError('Kata sandi yang Anda masukkan salah', 401)
    }

    const sessionData: UserSession = {
      id: matchedUser.id,
      username: matchedUser.username,
      namaLengkap: matchedUser.namaLengkap,
      peran: matchedUser.peran,
      email: matchedUser.email,
      spesialisasi: matchedUser.spesialisasi,
    }

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
      httpOnly: false, // agar dapat dibaca di SSR maupun Client Context
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })

    return jsonSuccess(sessionData, `Berhasil masuk sebagai ${matchedUser.namaLengkap}`)
  } catch (error) {
    console.error('Error POST /api/v1/auth/login:', error)
    return jsonError('Terjadi kesalahan server saat login', 500)
  }
}
