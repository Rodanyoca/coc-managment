import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getSession } from "@/lib/auth"
import { getFederationOptions } from "@/lib/federations/options"
import { appendSheetRow, getSheetRows, updateSheetCells } from "@/lib/google/sheets"

export const runtime = "nodejs"
const SHEET_NAME = "COACHS"

function cleanRow(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]))
}

function generateId(rows: Record<string, string>[]) {
  const highest = rows.reduce((max, row) => {
    const match = String(row.id_coach_coc || "").trim().match(/^COA\.(\d+)$/i)
    return match ? Math.max(max, Number.parseInt(match[1], 10) || 0) : max
  }, 0)
  return `COA.${String(highest + 1).padStart(6, "0")}`
}

async function validate(row: Record<string, string>, currentId = "") {
  const required = [["nom_complet", "Le nom"], ["id_federation", "La fédération"], ["id_sexe", "Le sexe"]] as const
  const missing = required.find(([key]) => !row[key])
  if (missing) return { error: `${missing[1]} est obligatoire.`, status: 400 } as const
  const [federations, coaches] = await Promise.all([
    getFederationOptions(),
    getSheetRows({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), bypassCache: true }),
  ])
  const federation = federations.find((item) => item.id === row.id_federation)
  if (!federation) return { error: "Fédération inconnue.", status: 400 } as const
  if (row.id_national && coaches.some((item) => item.id_national === row.id_national && item.id_coach_coc !== currentId)) {
    return { error: "Cet ID national existe déjà.", status: 409 } as const
  }
  return { federation, coaches }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  try {
    const body = await request.json() as { row?: Record<string, unknown> }
    const row = cleanRow(body.row ?? {})
    const checked = await validate(row)
    if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: checked.status })
    const coach = { ...row, id_coach_coc: generateId(checked.coaches), nom_federation: checked.federation.nom, nom_sexe: row.id_sexe === "F" ? "Femme" : "Homme" }
    await appendSheetRow({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), row: coach })
    revalidatePath("/dashboard/acteurs/entraineurs")
    return NextResponse.json({ ok: true, row: coach })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  try {
    const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
    const id = String(body.id ?? "").trim()
    const row = cleanRow(body.row ?? {})
    if (!id) return NextResponse.json({ error: "Coach introuvable." }, { status: 400 })
    const checked = await validate(row, id)
    if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: checked.status })
    if (!checked.coaches.some((item) => item.id_coach_coc === id)) return NextResponse.json({ error: "Coach introuvable." }, { status: 404 })
    const updated = { ...row, nom_federation: checked.federation.nom, nom_sexe: row.id_sexe === "F" ? "Femme" : "Homme" }
    await updateSheetCells({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), idColumn: "id_coach_coc", idValue: id, updates: Object.entries(updated).map(([column, value]) => ({ column, value })) })
    revalidatePath("/dashboard/acteurs/entraineurs")
    revalidatePath(`/dashboard/acteurs/entraineurs/${id}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
