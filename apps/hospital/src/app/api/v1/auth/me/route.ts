import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME, UserSession } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET() {
  const cookieStore = await cookies()
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!rawSession) {
    return jsonError('Belum ada sesi login aktif', 401)
  }

  try {
    const session: UserSession = JSON.parse(rawSession)

    // Pastikan dokterId terisi jika pengguna adalah dokter
    if (session.peran === 'dokter' && !session.dokterId) {
      const dokter = await prisma.dokter.findFirst({
        where: {
          OR: [
            { penggunaId: session.id },
            { namaLengkap: { equals: session.namaLengkap, mode: 'insensitive' } },
          ],
        },
      })
      if (dokter) {
        session.dokterId = dokter.id
        session.spesialisasi = dokter.spesialisasi
        cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        })
      }
    }

    return jsonSuccess(session, 'Sesi pengguna valid')
  } catch (error) {
    return jsonError('Format sesi tidak valid', 400)
  }
}
