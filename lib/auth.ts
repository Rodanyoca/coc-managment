import "server-only"

import { cookies } from "next/headers"

// ── Types ──────────────────────────────────────────────────────────────
export type UserRole = "coc" | "technique"

export interface SessionPayload {
  id: string
  nom: string
  email: string
  role: UserRole
  exp: number
}

const COOKIE_NAME = "coc_session"
const SESSION_TTL = 60 * 60 * 8 // 8 hours in seconds

// ── Helpers crypto (Web Crypto API, zero deps) ─────────────────────────
function getSecret(): string {
  const s = process.env.AUTH_SECRET
  if (!s) throw new Error("AUTH_SECRET is not defined in environment variables")
  return s
}

async function getKey() {
  const enc = new TextEncoder()
  return crypto.subtle.importKey("raw", enc.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

async function signPayload(payload: object): Promise<string> {
  const key = await getKey()
  const data = JSON.stringify(payload)
  const enc = new TextEncoder()
  const dataBytes = enc.encode(data)
  const sig = await crypto.subtle.sign("HMAC", key, dataBytes)
  return `${bytesToBase64Url(dataBytes)}.${bytesToBase64Url(new Uint8Array(sig))}`
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const [dataB64, sigB64] = token.split(".")
    if (!dataB64 || !sigB64) return null
    const dataBytes = base64UrlToBytes(dataB64)
    const data = new TextDecoder().decode(dataBytes)
    const sig = base64UrlToBytes(sigB64)
    const key = await getKey()
    const valid = await crypto.subtle.verify("HMAC", key, sig, dataBytes)
    if (!valid) return null
    const payload = JSON.parse(data) as SessionPayload
    if (payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

// ── Public API ─────────────────────────────────────────────────────────

export async function createSession(user: { id: string; nom: string; email: string; role: UserRole }) {
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL,
  }
  const token = await signPayload(payload)
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  })
}

export async function destroySession() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// ── Role access map ────────────────────────────────────────────────────
const TECHNIQUE_ALLOWED = ["/dashboard", "/dashboard/acteurs", "/dashboard/competitions", "/dashboard/equipes-nationales", "/dashboard/activites"]

export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  if (role === "coc") return true
  // technique: check whitelist
  for (const prefix of TECHNIQUE_ALLOWED) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return true
  }
  return false
}
