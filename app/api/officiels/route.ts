import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getSession } from "@/lib/auth"
import { appendSheetRow, getSheetRows, updateSheetCells } from "@/lib/google/sheets"

export const runtime = "nodejs"

const SHEET_NAME = "OFFICIELS"
const ID_COLUMN = "id_officiel_coc"

function cleanRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()])
  )
}

function normalize(row: Record<string, string>) {
  return {
    id_national: row.id_national,
    id_officiel_entite: row.id_officiel_entite || row.id_officiel_federation,
    id_international: row.id_international || row.id_federation_international,
    nom_complet: row.nom_complet,
    id_sexe: row.id_sexe,
    date_de_naissance: row.date_de_naissance,
    lieu_de_naissance: row.lieu_de_naissance,
    nationalite: row.nationalite,
    telephone: row.telephone,
    email: row.email,
    adresse: row.adresse,
    numero_passeport: row.numero_passeport || row["numéro_passeport"],
    date_de_delivrance_passeport: row.date_de_delivrance_passeport,
    "date_expiration passeport": row["date_expiration passeport"] || row.date_expiration_passeport,
    statut: row.statut,
  }
}

function generateId(rows: Record<string, string>[]) {
  const highest = rows.reduce((max, row) => {
    const match = String(row[ID_COLUMN] || "").match(/^OFF\.(\d+)$/i)
    return match ? Math.max(max, Number.parseInt(match[1], 10) || 0) : max
  }, 0)
  return `OFF.${String(highest + 1).padStart(6, "0")}`
}

function validate(row: Record<string, string>) {
  const required = [["nom_complet", "Le nom"], ["id_sexe", "Le sexe"]] as const
  const missing = required.find(([key]) => !row[key])
  return missing ? `${missing[1]} est obligatoire.` : ""
}

async function loadContext() {
  return getSheetRows({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), bypassCache: true })
}

function toSheetRow(row: ReturnType<typeof normalize>) {
  return {
    ...row,
    nom_sexe: row.id_sexe === "F" ? "Femme" : "Homme",
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  try {
    const body = await request.json() as { row?: Record<string, unknown> }
    const row = normalize(cleanRow(body.row ?? {}))
    const error = validate(row)
    if (error) return NextResponse.json({ error }, { status: 400 })
    const officiels = await loadContext()
    if (row.id_national && officiels.some((item) => item.id_national === row.id_national)) {
      return NextResponse.json({ error: "Cet ID national existe déjà." }, { status: 409 })
    }
    const officiel = { ...toSheetRow(row), [ID_COLUMN]: generateId(officiels) }
    await appendSheetRow({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), row: officiel })
    revalidatePath("/dashboard/acteurs/officiels")
    return NextResponse.json({ ok: true, row: officiel })
  } catch (error) {
    console.error("POST /api/officiels:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  try {
    const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
    const id = String(body.id ?? "").trim()
    const row = normalize(cleanRow(body.row ?? {}))
    if (!id) return NextResponse.json({ error: "Officiel introuvable." }, { status: 400 })
    const error = validate(row)
    if (error) return NextResponse.json({ error }, { status: 400 })
    const officiels = await loadContext()
    if (!officiels.some((item) => item[ID_COLUMN] === id)) return NextResponse.json({ error: "Officiel introuvable." }, { status: 404 })
    if (row.id_national && officiels.some((item) => item.id_national === row.id_national && item[ID_COLUMN] !== id)) {
      return NextResponse.json({ error: "Cet ID national existe déjà." }, { status: 409 })
    }
    const updated = toSheetRow(row)
    await updateSheetCells({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), idColumn: ID_COLUMN, idValue: id, updates: Object.entries(updated).map(([column, value]) => ({ column, value })) })
    revalidatePath("/dashboard/acteurs/officiels")
    revalidatePath(`/dashboard/acteurs/officiels/${id}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("PUT /api/officiels:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
