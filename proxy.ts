import { NextResponse, type NextRequest } from "next/server"

const COOKIE_NAME = "coc_session"
const TECHNIQUE_ALLOWED = ["/dashboard", "/dashboard/acteurs", "/dashboard/competitions", "/dashboard/activites"]

function isPublicRoute(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/api/auth/")
}

async function getKey(secret: string) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"])
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

async function verifyToken(token: string, secret: string): Promise<{ role: string; exp: number } | null> {
  try {
    const [dataB64, sigB64] = token.split(".")
    if (!dataB64 || !sigB64) return null
    const dataBytes = base64UrlToBytes(dataB64)
    const valid = await crypto.subtle.verify("HMAC", await getKey(secret), base64UrlToBytes(sigB64), dataBytes)
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(dataBytes)) as { role: string; exp: number }
    return payload.exp >= Date.now() / 1000 ? payload : null
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isPublicRoute(pathname)) return NextResponse.next()

  const secret = process.env.AUTH_SECRET
  if (!secret) return new NextResponse("AUTH_SECRET not configured", { status: 500 })

  const token = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await verifyToken(token, secret) : null
  if (!session) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: token ? "Session expirée" : "Non authentifié" }, { status: 401 })
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname.startsWith("/dashboard") && session.role === "technique") {
    const allowed = TECHNIQUE_ALLOWED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    if (!allowed) return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/login"],
}
