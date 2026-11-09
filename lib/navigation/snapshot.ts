import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { authorize } from "../auth/authorization.ts"
import type { User, UserAuthorization } from "../users/types.ts"

export const NAVIGATION_COOKIE_NAME = "coc_navigation"
const blocks = ["AUT-ADM", "AUT-SPT", "AUT-COM"] as const
const purpose = "coc-navigation-display-v1:"

type NavigationDisplay = { access: Record<string, boolean>; isSuperAdmin: boolean }
type Snapshot = { session: string; expires: number; readable: boolean[]; superAdmin: boolean }
const sessionKey = (token: string) => createHash("sha256").update(token).digest("hex")
const sign = (value: string, secret: string) => createHmac("sha256", secret).update(purpose + value).digest()

// Display only: never use this snapshot to authorize a page, API or mutation.
export function createNavigationSnapshot(input: {
  user: Pick<User, "idUser" | "typeUser" | "estSuperAdmin">
  authorizations: readonly UserAuthorization[]
  sessionToken: string
  expires: number
  secret: string
}) {
  const snapshot: Snapshot = {
    session: sessionKey(input.sessionToken), expires: input.expires,
    readable: blocks.map(block => authorize({ user: input.user, authorizations: input.authorizations, requirement: { scope: "BUSINESS", blocks: [block] }, action: "READ" }).allowed),
    superAdmin: input.user.estSuperAdmin && input.user.typeUser !== "VIEWER",
  }
  const value = Buffer.from(JSON.stringify(snapshot)).toString("base64url")
  return `${value}.${sign(value, input.secret).toString("base64url")}`
}

export function readNavigationSnapshot(input: { value?: string; sessionToken?: string; secret?: string; nowSeconds?: number }): NavigationDisplay | null {
  if (!input.value || !input.sessionToken || !input.secret || input.value.length > 1500) return null
  try {
    const [value, signature, extra] = input.value.split(".")
    if (!value || !signature || extra !== undefined) return null
    const actual = Buffer.from(signature, "base64url"), expected = sign(value, input.secret)
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
    const snapshot: Snapshot = JSON.parse(Buffer.from(value, "base64url").toString("utf8"))
    if (snapshot.session !== sessionKey(input.sessionToken) || !Number.isSafeInteger(snapshot.expires) || snapshot.expires <= (input.nowSeconds ?? Math.floor(Date.now() / 1000))) return null
    if (!Array.isArray(snapshot.readable) || snapshot.readable.length !== blocks.length || snapshot.readable.some(value => typeof value !== "boolean") || typeof snapshot.superAdmin !== "boolean") return null
    return {
      access: Object.fromEntries(blocks.flatMap((block, index) => [[`${block}:READ`, snapshot.readable[index]], [`${block}:WRITE`, false]])),
      isSuperAdmin: snapshot.superAdmin,
    }
  } catch { return null }
}

export function unavailableReturnPath(value?: unknown) {
  if (typeof value !== "string" || !value || value.length > 2048 || /[\\\r\n]/.test(value) || !/^\/dashboard(?:[/?]|$)/.test(value)) return "/dashboard"
  const parsed = new URL(value, "https://navigation.invalid")
  if (parsed.origin !== "https://navigation.invalid" || !/^\/dashboard(?:\/|$)/.test(parsed.pathname)) return "/dashboard"
  return parsed.pathname + parsed.search
}
