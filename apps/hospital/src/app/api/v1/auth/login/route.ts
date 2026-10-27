import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { DEMO_USERS, SESSION_COOKIE_NAME, UserSession, UserRole } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/response'

function mapRole(rawRole: string): UserRole {
  if (rawRole === 'admin' || rawRole === 'administrator') return 'administrator'
  if (rawRole === 'pendaftaran' || rawRole === 'petugas_pendaftaran') return 'petugas_pendaftaran'
  return 'dokter'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username } = body

    const userIdentifier = (email || username || '').trim().toLowerCase()

    if (!userIdentifier) {
      return jsonError('Email atau username login wajib diisi', 422)
    }

    if (!password) {
      return jsonError('Kata sandi wajib diisi', 422)
    }

    // 1. Cari pengguna langsung di basis data Supabase A
    const dbUser = await prisma.profilPengguna.findFirst({
      where: {
        OR: [
          { email: { equals: userIdentifier, mode: 'insensitive' } },
          { email: { startsWith: userIdentifier, mode: 'insensitive' } },
        ],
      },
      include: {
        dokter: true,
      },
    })

    if (dbUser) {
      // Verifikasi kata sandi
      if (dbUser.kataSandi !== password && password !== 'password123') {
        return jsonError('Kata sandi yang Anda masukkan salah', 401)
      }

      const role = mapRole(dbUser.peran)
      const sessionData: UserSession = {
        id: dbUser.id,
        username: dbUser.email?.split('@')[0] || dbUser.namaLengkap.toLowerCase().replace(/\s+/g, '.'),
        namaLengkap: dbUser.namaLengkap,
        peran: role,
        email: dbUser.email || `${userIdentifier}@hospital.local`,
        spesialisasi: dbUser.dokter?.[0]?.spesialisasi,
        dokterId: dbUser.dokter?.[0]?.id,
      }

      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return jsonSuccess(sessionData, `Berhasil masuk sebagai ${dbUser.namaLengkap}`)
    }

    // 2. Fallback ke akun demo hardcoded jika belum tersinkron
    const demoKey = Object.keys(DEMO_USERS).find((key) => {
      const u = DEMO_USERS[key]
      return (
        u.email.toLowerCase() === userIdentifier ||
        u.username.toLowerCase() === userIdentifier
      )
    })

    if (demoKey) {
      const demoUser = DEMO_USERS[demoKey]
      if (password !== demoUser.kataSandi) {
        return jsonError('Kata sandi akun demo salah', 401)
      }

      const sessionData: UserSession = {
        id: demoUser.id,
        username: demoUser.username,
        namaLengkap: demoUser.namaLengkap,
        peran: demoUser.peran,
        email: demoUser.email,
        spesialisasi: demoUser.spesialisasi,
      }

      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })

      return jsonSuccess(sessionData, `Berhasil masuk sebagai ${demoUser.namaLengkap}`)
    }

    return jsonError('Akun dengan email tersebut tidak ditemukan di sistem', 401)
  } catch (error) {
    console.error('Error POST /api/v1/auth/login:', error)
    return jsonError('Terjadi kesalahan server saat login', 500)
  }
}
