import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { writeAudit } from "@/lib/audit/logger"
import { createGoogleUsersSheetsAdapter } from "@/lib/users/google-adapter"
import { getSystemSeasons, saveSystemSeason } from "@/lib/settings/data"
import { seasonContext } from "@/lib/settings/seasons"

export const runtime = "nodejs"
export async function GET() {
  const session = await getSession()
  if (!session || session.doitChangerMotDePasse || !session.estSuperAdmin || session.typeUser === "VIEWER") return NextResponse.json({ error: "Accès refusé." }, { status: session ? 403 : 401 })
  try { const seasons = await getSystemSeasons(); return NextResponse.json({ seasons, ...seasonContext(seasons) }, { headers: { "Cache-Control": "no-store" } }) }
  catch { return NextResponse.json({ error: "Le référentiel des saisons est indisponible." }, { status: 503 }) }
}

async function write(request: Request, update: boolean) {
  const session = await getSession()
  if (!session || session.doitChangerMotDePasse || !session.estSuperAdmin || session.typeUser === "VIEWER") return NextResponse.json({ error: "Accès refusé." }, { status: session ? 403 : 401 })
  const requestId = randomUUID(), adapter = createGoogleUsersSheetsAdapter()
  try {
    const body = await request.json()
    if (!body || typeof body !== "object" || Array.isArray(body) || (update && (typeof body.id_saison !== "string" || !body.id_saison.trim()))) return NextResponse.json({ error: "Saison invalide." }, { status: 400 })
    await writeAudit({ adapter, actorId: session.idUser, action: "PARAMETRAGE_SAISON_DEMANDE", typeObjet: "SAISON", objectId: update ? body.id_saison : null, result: "SUCCES", requestId })
    const season = await saveSystemSeason(body, update ? body.id_saison : undefined)
    await writeAudit({ adapter, actorId: session.idUser, action: "PARAMETRAGE_SAISON_TERMINE", typeObjet: "SAISON", objectId: season.id_saison, result: "SUCCES", requestId })
    revalidatePath("/dashboard/parametres")
    revalidatePath("/dashboard/equipes-nationales")
    return NextResponse.json({ ok: true, season })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible. Rechargez la liste avant de réessayer." }, { status: 400 }) }
}
export async function POST(request: Request) { return write(request, false) }
export async function PUT(request: Request) { return write(request, true) }
