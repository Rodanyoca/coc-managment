import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getFederationOptions } from "@/lib/federations/options"
import { appendSheetRow, getSheetRows, updateSheetCells } from "@/lib/google/sheets"

export const runtime = "nodejs"
const SHEET_NAME = "ARBITRES"
const ID_COLUMN = "id_arbitre_coc"
const clean = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]))

function generateId(rows: Record<string, string>[]) {
  const highest = rows.reduce((max, row) => { const match = String(row[ID_COLUMN] || "").match(/^ARB\.(\d+)$/i); return match ? Math.max(max, Number(match[1]) || 0) : max }, 0)
  return `ARB.${String(highest + 1).padStart(6, "0")}`
}

async function validate(row: Record<string, string>, currentId = "") {
  const required = [["nom_complet", "Le nom"], ["id_federation", "La fédération"], ["id_sexe", "Le sexe"]] as const
  const missing = required.find(([key]) => !row[key])
  if (missing) return { error: `${missing[1]} est obligatoire.`, status: 400 } as const
  const [federations, grades, arbitres] = await Promise.all([
    getFederationOptions(),
    getSheetRows({ sheetName: "GRADES_ARBITRE", spreadsheetId: getReferentialSpreadsheetId(), bypassCache: true }),
    getSheetRows({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), bypassCache: true }),
  ])
  const federation = federations.find((item) => item.id === row.id_federation)
  if (!federation) return { error: "Fédération inconnue.", status: 400 } as const
  const grade = row.id_grade ? grades.find((item) => item.id_grade_arbitre === row.id_grade) : undefined
  if (row.id_grade && !grade) return { error: "Grade inconnu.", status: 400 } as const
  if (row.id_national && arbitres.some((item) => item.id_national === row.id_national && item[ID_COLUMN] !== currentId)) return { error: "Cet ID national existe déjà.", status: 409 } as const
  return { federation, grade, arbitres }
}

function enrich(row: Record<string, string>, context: { federation: { nom: string }; grade?: Record<string, string> }) {
  const { id_grade, ...fields } = row
  return { ...fields, id_grade_arbitre: id_grade || row.id_grade_arbitre || "", nom_federation: context.federation.nom, nom_grade: context.grade?.nom_grade || "", nom_sexe: row.id_sexe === "F" ? "Femme" : "Homme" }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { row?: Record<string, unknown> }
    const row = clean(body.row ?? {})
    const checked = await validate(row)
    if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: checked.status })
    const arbitre = { ...enrich(row, checked), [ID_COLUMN]: generateId(checked.arbitres) }
    await appendSheetRow({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), row: arbitre })
    revalidatePath("/dashboard/acteurs/arbitres")
    return NextResponse.json({ ok: true, row: arbitre })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 }) }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
    const id = String(body.id ?? "").trim()
    const row = clean(body.row ?? {})
    if (!id) return NextResponse.json({ error: "Arbitre introuvable." }, { status: 400 })
    const checked = await validate(row, id)
    if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: checked.status })
    if (!checked.arbitres.some((item) => item[ID_COLUMN] === id)) return NextResponse.json({ error: "Arbitre introuvable." }, { status: 404 })
    const updated = enrich(row, checked)
    await updateSheetCells({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), idColumn: ID_COLUMN, idValue: id, updates: Object.entries(updated).map(([column, value]) => ({ column, value })) })
    revalidatePath("/dashboard/acteurs/arbitres")
    revalidatePath(`/dashboard/acteurs/arbitres/${id}`)
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 }) }
}
