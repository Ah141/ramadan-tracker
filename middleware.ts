import { NextResponse } from 'next/server'
// Middleware is minimal - auth is handled via localStorage in the client
export function middleware() {
  return NextResponse.next()
}
