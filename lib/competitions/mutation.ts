import "server-only"

import { createHash } from "node:crypto"
import { NextResponse } from "next/server"
import { canAccess, getSession } from "@/lib/auth"
import { writeAudit } from "@/lib/audit/logger"
import { createGoogleUsersSheetsAdapter } from "@/lib/users/google-adapter"
import { UsersRepository } from "@/lib/users/repository"

type MutationResult<T> = { row: T; objectId: string }
type SportMutationBody = Record<string, unknown> & { id?: unknown; row?: Record<string, unknown> }

export async function runSportMutation<T>(request: Request, meta: { action: string; typeObjet: string }, operation: (body: SportMutationBody) => Promise<MutationResult<T>>) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Authentification requise." }, { status: 401 })
  if (!(await canAccess("AUT-SPT", "WRITE"))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 })

  const suppliedRequestId = request.headers.get("x-request-id")?.trim() || ""
  if (suppliedRequestId && (suppliedRequestId.length < 8 || suppliedRequestId.length > 100)) return NextResponse.json({ error: "Identifiant de requête invalide." }, { status: 400 })
  const requestId = suppliedRequestId || createHash("sha256").update(`${session.idUser}|${request.method}|${request.url}|${await request.clone().text()}|${Math.floor(Date.now() / 30_000)}`).digest("hex")
  const adapter = createGoogleUsersSheetsAdapter()
  const processed = (await new UsersRepository(adapter).getAuditLog()).some((entry) => entry.requestId === requestId)
  if (processed) return NextResponse.json({ error: "Cette requête a déjà été traitée.", alreadyProcessed: true }, { status: 409 })

  try {
    const body = await request.json() as SportMutationBody
    const result = await operation(body)
    await writeAudit({ adapter, actorId: session.idUser, action: meta.action, typeObjet: meta.typeObjet, objectId: result.objectId, result: "SUCCES", requestId })
    return NextResponse.json({ ok: true, row: result.row, requestId })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enregistrement impossible."
    await writeAudit({ adapter, actorId: session.idUser, action: meta.action, typeObjet: meta.typeObjet, result: "ECHEC", requestId, details: { message } }).catch(() => undefined)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
