import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME } from '@/lib/auth'
import { jsonSuccess } from '@/lib/response'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  return jsonSuccess(null, 'Berhasil keluar dari sistem (logout)')
}
