import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getSession } from "@/lib/auth"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { appendSheetRow, getSheetRows, updateSheetCells } from "@/lib/google/sheets"

export const runtime = "nodejs"
const SHEET_NAME = "MEDECINS"
const ID_COLUMN = "id_medecin_coc"

const clean = (row: Record<string, unknown>) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]))

function normalize(row: Record<string, string>) {
  return {
    id_medecin_entite: row.id_medecin_entite || row.id_medecin_federation,
    id_entite: row.id_entite || row.id_federation,
    id_national: row.id_national,
    id_international: row.id_international,
    nom_complet: row.nom_complet,
    id_sexe: row.id_sexe,
    date_de_naissance: row.date_de_naissance,
    lieu_de_naissance: row.lieu_de_naissance,
    nationalite: row.nationalite,
    telephone: row.telephone,
    email: row.email,
    adresse: row.adresse,
    id_specialite: row.id_specialite,
    numero_passeport: row.numero_passeport,
    date_de_delivrance_passeport: row.date_de_delivrance_passeport,
    date_expiration_passeport: row.date_expiration_passeport,
    statut: row.statut,
  }
}

function generateId(rows: Record<string, string>[]) {
  const max = rows.reduce((highest, row) => {
    const match = String(row[ID_COLUMN] || "").match(/^MED\.(\d+)$/i)
    return match ? Math.max(highest, Number(match[1]) || 0) : highest
  }, 0)
  return `MED.${String(max + 1).padStart(6, "0")}`
}

async function validate(row: ReturnType<typeof normalize>) {
  const required = [["nom_complet", "Le nom"], ["id_entite", "L’organisation"], ["id_sexe", "Le sexe"]] as const
  const missing = required.find(([key]) => !row[key])
  if (missing) return { error: `${missing[1]} est obligatoire.`, status: 400 } as const
  const [entites, specialites, medecins] = await Promise.all([
    getSheetRows({ sheetName: "ENTITES", spreadsheetId: getReferentialSpreadsheetId() }),
    getSheetRows({ sheetName: "SPECIALITES_MEDECIN", spreadsheetId: getReferentialSpreadsheetId() }),
    getSheetRows({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), bypassCache: true }),
  ])
  const entite = entites.find((item) => item.id_entite === row.id_entite)
  if (!entite) return { error: "Organisation inconnue.", status: 400 } as const
  const specialite = row.id_specialite ? specialites.find((item) => item.id_specialite === row.id_specialite) : undefined
  if (row.id_specialite && !specialite) return { error: "Spécialité inconnue.", status: 400 } as const
  return { entite, specialite, medecins }
}

function enrich(row: ReturnType<typeof normalize>, context: { entite: Record<string, string>; specialite?: Record<string, string> }) {
  return { ...row, nom_entite: context.entite.nom_entite || "", nom_specialite: context.specialite?.nom_specialite || "", nom_sexe: row.id_sexe === "F" ? "Femme" : "Homme" }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  try {
    const body = await request.json() as { row?: Record<string, unknown> }
    const row = normalize(clean(body.row ?? {}))
    const checked = await validate(row)
    if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: checked.status })
    const medecin = { ...enrich(row, checked), [ID_COLUMN]: generateId(checked.medecins) }
    await appendSheetRow({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), row: medecin })
    revalidatePath("/dashboard/acteurs/medecins")
    return NextResponse.json({ ok: true, row: medecin })
  } catch (error) {
    console.error("POST /api/medecins:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getSession()
  if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
  try {
    const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
    const id = String(body.id ?? "").trim()
    const row = normalize(clean(body.row ?? {}))
    if (!id) return NextResponse.json({ error: "Médecin introuvable." }, { status: 400 })
    const checked = await validate(row)
    if ("error" in checked) return NextResponse.json({ error: checked.error }, { status: checked.status })
    if (!checked.medecins.some((item) => item[ID_COLUMN] === id)) return NextResponse.json({ error: "Médecin introuvable." }, { status: 404 })
    const updated = enrich(row, checked)
    await updateSheetCells({ sheetName: SHEET_NAME, spreadsheetId: getActeursSpreadsheetId(), idColumn: ID_COLUMN, idValue: id, updates: Object.entries(updated).map(([column, value]) => ({ column, value })) })
    revalidatePath("/dashboard/acteurs/medecins")
    revalidatePath(`/dashboard/acteurs/medecins/${id}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("PUT /api/medecins:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
