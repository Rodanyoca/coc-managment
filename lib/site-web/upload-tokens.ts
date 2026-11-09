import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import type { Resource } from "./schema"
export type UploadClaim = { kind: "session" | "asset"; actor: string; resource: Resource; id: string; field: string; mime: string; size: number; expires: number; url?: string; folder?: string; fileId?: string; uploadId?: string }
const secret = () => { if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET manquant."); return process.env.AUTH_SECRET }
export function signUpload(claim: UploadClaim) { const payload = Buffer.from(JSON.stringify(claim)).toString("base64url"); return `${payload}.${createHmac("sha256", secret()).update(payload).digest("base64url")}` }
export function verifyUpload(token: string, actor: string, kind: UploadClaim["kind"]): UploadClaim {
  if (token.length > 8000) throw new Error("Autorisation de fichier invalide.")
  const [payload, signature, extra] = token.split(".")
  const expected = createHmac("sha256", secret()).update(payload || "").digest()
  const supplied = Buffer.from(signature || "", "base64url")
  if (extra || expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) throw new Error("Autorisation de fichier invalide.")
  const claim = JSON.parse(Buffer.from(payload, "base64url").toString()) as UploadClaim
  if (claim.actor !== actor || claim.kind !== kind || !Number.isFinite(claim.expires) || claim.expires < Date.now()) throw new Error("Autorisation de fichier expirée ou invalide.")
  return claim
}
