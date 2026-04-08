import { NextResponse, type NextRequest } from "next/server"

// Lightweight session check in middleware (cannot import server-only lib/auth.ts)
// We duplicate the minimal verify logic here using Web Crypto API.

const COOKIE_NAME = "coc_session"

const TECHNIQUE_ALLOWED = ["/dashboard", "/dashboard/acteurs", "/dashboard/competitions", "/dashboard/activites"]

function isPublicRoute(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/api/auth/")
}

async function getKey(secret: string) {
  const enc = new TextEncoder()
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

async function verifyToken(token: string, secret: string): Promise<{ role: string; exp: number } | null> {
  try {
    const [dataB64, sigB64] = token.split(".")
    if (!dataB64 || !sigB64) return null
    const data = atob(dataB64)
    const sig = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0))
    const key = await getKey(secret)
    const enc = new TextEncoder()
    const valid = await crypto.subtle.verify("HMAC", key, sig, enc.encode(data))
    if (!valid) return null
    const payload = JSON.parse(data)
    if (payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Let public routes through
  if (isPublicRoute(pathname)) return NextResponse.next()

  // Only protect /dashboard routes and API routes (except auth)
  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const secret = process.env.AUTH_SECRET
  if (!secret) {
    return new NextResponse("AUTH_SECRET not configured", { status: 500 })
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const session = await verifyToken(token, secret)
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Session expirée" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access for /dashboard routes
  if (pathname.startsWith("/dashboard") && session.role === "technique") {
    const allowed = TECHNIQUE_ALLOWED.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
    )
    if (!allowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/login"],
}
