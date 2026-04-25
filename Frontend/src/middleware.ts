import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('umurava_token')?.value
  const pathname = request.nextUrl.pathname

  // If no token and not on login, redirect to login
  if (!token && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If token exists and on login, redirect to dashboard
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/((?!_next|public).*)'],
}