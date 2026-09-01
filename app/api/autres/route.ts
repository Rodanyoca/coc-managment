import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { canAccess } from "@/lib/auth"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { ACTOR_SHEETS } from "@/lib/acteurs/sheets"
import { mapOtherActorRow, normalizeOtherActorName, OTHER_ACTOR_COLUMNS } from "@/lib/acteurs/autres-model"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { appendSheetRow, getSheetRows, updateSheetCells } from "@/lib/google/sheets"

export const runtime = "nodejs"
const ID_COLUMN = "id_autre_acteur_coc"
const clean = (input: Record<string, unknown>) => mapOtherActorRow(input)
const normalized = (value: string) => value.trim().toLocaleLowerCase("fr")

function generateId(rows: Record<string, string>[]) {
  const max = rows.reduce((highest, row) => Math.max(highest, Number(row[ID_COLUMN]?.match(/(\d+)$/)?.[1] ?? 0)), 0)
  return `AUT.${String(max + 1).padStart(6, "0")}`
}

export async function GET() {
  if (!(await canAccess("AUT-SPT", "READ"))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
  try {
    const rows = await getSheetRows({ sheetName: ACTOR_SHEETS.AUTRE, spreadsheetId: getActeursSpreadsheetId(), bypassCache: true })
    return NextResponse.json({ rows: rows.map(mapOtherActorRow) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

async function validate(row: ReturnType<typeof clean>, currentId = "") {
  row.nom_complet = normalizeOtherActorName(row.nom_complet)
  if (!row.nom_complet) throw new Error("Le nom complet est obligatoire.")
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) throw new Error("L’adresse électronique n’est pas valide.")
  if (row.telephone && !/^[+\d][\d\s().-]{5,24}$/.test(row.telephone)) throw new Error("Le numéro de téléphone n’est pas valide.")
  const [rows, entities] = await Promise.all([getSheetRows({ sheetName: ACTOR_SHEETS.AUTRE, spreadsheetId: getActeursSpreadsheetId(), bypassCache: true }), getSheetRows({ sheetName: "ENTITES", spreadsheetId: getReferentialSpreadsheetId() })])
  if (row.id_entite && !entities.some((entity) => entity.id_entite === row.id_entite)) throw new Error("L’entité sélectionnée est inconnue.")
  const others = rows.filter((item) => item[ID_COLUMN] !== currentId)
  if (row.id_national && others.some((item) => normalized(item.id_national) === normalized(row.id_national))) throw new Error("Cet identifiant national existe déjà.")
  if (row.email && others.some((item) => normalized(item.email) === normalized(row.email))) throw new Error("Cette adresse électronique existe déjà.")
  if (others.some((item) => normalized(item.nom_complet) === normalized(row.nom_complet) && item.id_entite === row.id_entite && normalized(item.type_autre_acteur) === normalized(row.type_autre_acteur))) throw new Error("Une personne portant ce nom, cette fonction et ce rattachement existe déjà.")
  return rows
}

export async function POST(request: Request) {
  if (!(await canAccess("AUT-SPT", "WRITE"))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
  try {
    const body = await request.json() as { row?: Record<string, unknown> }
    const row = clean(body.row ?? {})
    row.avatar_drive_id = ""; row.avatar_drive_url = ""; row.passeport_drive_id = ""; row.passeport_drive_url = ""
    const rows = await validate(row)
    row[ID_COLUMN] = generateId(rows)
    await appendSheetRow({ sheetName: ACTOR_SHEETS.AUTRE, spreadsheetId: getActeursSpreadsheetId(), row: Object.fromEntries(OTHER_ACTOR_COLUMNS.map((column) => [column, row[column]])) })
    revalidatePath("/dashboard/acteurs/autres")
    return NextResponse.json({ ok: true, row })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) }
}

export async function PUT(request: Request) {
  if (!(await canAccess("AUT-SPT", "WRITE"))) return NextResponse.json({ error: "Accès refusé." }, { status: 403 })
  try {
    const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
    const id = String(body.id ?? "").trim()
    if (!id) throw new Error("Acteur introuvable.")
    const row = clean(body.row ?? {})
    const rows = await validate(row, id)
    if (!rows.some((item) => item[ID_COLUMN] === id)) return NextResponse.json({ error: "Acteur introuvable." }, { status: 404 })
    await updateSheetCells({ sheetName: ACTOR_SHEETS.AUTRE, spreadsheetId: getActeursSpreadsheetId(), idColumn: ID_COLUMN, idValue: id, updates: OTHER_ACTOR_COLUMNS.filter((column) => column !== ID_COLUMN && !column.endsWith("_drive_id") && !column.endsWith("_drive_url")).map((column) => ({ column, value: row[column] })) })
    revalidatePath("/dashboard/acteurs/autres"); revalidatePath(`/dashboard/acteurs/autres/${id}`)
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) }
}
