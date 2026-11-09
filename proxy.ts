import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie"
import { isPendingPasswordRouteAllowed } from "@/lib/auth/session-policy"
import { resolveSession } from "@/lib/auth/session-resolution"
import { authorizeWithSource } from "@/lib/auth/authorization"
import { routePolicy } from "@/lib/auth/route-policy"
import { getAuthorizationsForUser, getUserById } from "@/lib/users/data"
import { authenticationFailurePath } from "@/lib/auth/failure-navigation"
import { createNavigationSnapshot, NAVIGATION_COOKIE_NAME } from "@/lib/navigation/snapshot"
import type { UserAuthorization } from "@/lib/users/types"

function isPublicRoute(pathname: string, method = "GET") {
  return pathname === "/login" || pathname === "/service-indisponible" || pathname === "/api/auth/login" || (["GET", "HEAD"].includes(method) && /^\/api\/site-web\/media\/[a-z]+\/[^/]+\/[a-z_]+$/.test(pathname))
}

function isMinimalSessionRoute(pathname: string) {
  return pathname === "/activation" || pathname === "/api/auth/activate" || pathname === "/api/auth/session" || pathname === "/api/auth/logout"
}

function isAccountRoute(pathname: string) { return pathname === "/mon-compte" || pathname === "/api/auth/change-password" }

function deny(request: NextRequest, status = 401) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const error = status === 503 ? "Service d’authentification indisponible." : "Session invalide."
    return NextResponse.json({ error }, { status })
  }
  const destination = new URL(authenticationFailurePath(status), request.url)
  if (status === 503 && /^\/dashboard(?:\/|$)/.test(request.nextUrl.pathname)) {
    destination.searchParams.set("retour", request.nextUrl.pathname + request.nextUrl.search)
  }
  return NextResponse.redirect(destination)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (isPublicRoute(pathname, request.method)) return NextResponse.next()
  const secret = process.env.AUTH_SECRET
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!secret || !token) return deny(request)

  const resolution = await resolveSession({ token, secret, loadUser: getUserById })
  if (!resolution.ok) return deny(request, resolution.reason === "SOURCE_UNAVAILABLE" ? 503 : 401)
  if (resolution.requiresActivation && !isPendingPasswordRouteAllowed(pathname)) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Activation du compte requise." }, { status: 403 })
    return NextResponse.redirect(new URL("/activation", request.url))
  }
  if (isMinimalSessionRoute(pathname)) return NextResponse.next()
  if (isAccountRoute(pathname)) return NextResponse.next()

  const policy = routePolicy(pathname, request.method)
  if (!policy) return deny(request, 403)
  let authorizations: readonly UserAuthorization[] = []
  const decision = await authorizeWithSource({ user: resolution.user, requirement: policy, action: policy.action, loadAuthorizations: async () => {
    authorizations = await getAuthorizationsForUser(resolution.user.idUser)
    return authorizations
  } })
  if (!decision.allowed) return deny(request, decision.reason === "SOURCE_UNAVAILABLE" ? 503 : 403)
  const response = NextResponse.next()
  if (/^\/dashboard(?:\/|$)/.test(pathname)) {
    response.cookies.set(NAVIGATION_COOKIE_NAME, createNavigationSnapshot({ user: resolution.user, authorizations, sessionToken: token, expires: resolution.payload.exp, secret }), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
      maxAge: Math.max(0, resolution.payload.exp - Math.floor(Date.now() / 1000)),
    })
  }
  return response
}

export const config = { matcher: ["/dashboard/:path*", "/api/:path*", "/login", "/activation", "/mon-compte"] }
