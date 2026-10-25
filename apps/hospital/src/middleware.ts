import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME } from './lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value

  // Rute publik yang bebas diakses
  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/' ||
    pathname.startsWith('/api/v1/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')

  // Jika mengakses rute terlindungi tanpa sesi login, arahkan ke /login
  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Jika sudah login dan membuka /login, arahkan langsung ke /dashboard
  if (sessionCookie && pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
