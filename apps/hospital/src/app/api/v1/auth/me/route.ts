import { cookies } from 'next/headers'
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
    return jsonSuccess(session, 'Sesi pengguna valid')
  } catch (error) {
    return jsonError('Format sesi tidak valid', 400)
  }
}
