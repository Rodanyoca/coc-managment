import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { ACTOR_SHEETS } from "@/lib/acteurs/sheets"
import { getFederationOptions } from "@/lib/federations/options"
import { appendSheetRow, getSheetRows, updateSheetCells } from "@/lib/google/sheets"

export const runtime = "nodejs"

const SHEET_NAME = ACTOR_SHEETS.ATHLETE

function cleanRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()])
  )
}

function generateAthleteCocId(athletes: Record<string, string>[]) {
  const highestSequence = athletes.reduce((highest, athlete) => {
    const match = String(athlete.id_athlete_coc ?? "")
      .trim()
      .match(/^ATH\.(\d+)$/i)
    if (!match) return highest

    const sequence = Number.parseInt(match[1], 10)
    return Number.isSafeInteger(sequence) ? Math.max(highest, sequence) : highest
  }, 0)

  return `ATH.${String(highestSequence + 1).padStart(6, "0")}`
}

export async function POST(request: Request) {

  try {
    const body = await request.json() as { row?: Record<string, unknown> }
    const row = cleanRow(body.row ?? {})

    const required = [
      ["nom_complet", "Le nom"],
      ["id_federation", "La fédération"],
      ["id_sexe", "Le sexe"],
    ] as const

    const missing = required.find(([key]) => !row[key])
    if (missing) {
      return NextResponse.json({ error: `${missing[1]} est obligatoire.` }, { status: 400 })
    }

    const federations = await getFederationOptions()
    const federation = federations.find((item) => item.id === row.id_federation)
    if (!federation) {
      return NextResponse.json({ error: "Fédération inconnue." }, { status: 400 })
    }

    const spreadsheetId = getActeursSpreadsheetId()
    const athletes = await getSheetRows({
      sheetName: SHEET_NAME,
      spreadsheetId,
      bypassCache: true,
    })
    if (row.id_national && athletes.some((item) => item.id_national === row.id_national)) {
      return NextResponse.json({ error: "Cet ID national existe déjà." }, { status: 409 })
    }

    const athlete = {
      ...row,
      id_athlete_coc: generateAthleteCocId(athletes),
      numero_passeport: row.numero_passeport || row["numéro_passeport"],
      "date_expiration passeport": row["date_expiration passeport"] || row.date_expiration_passeport,
      sigle_federation: federation.sigle,
      nom_sexe: row.id_sexe === "F" ? "Femme" : "Homme",
    }

    await appendSheetRow({ sheetName: SHEET_NAME, row: athlete, spreadsheetId })
    revalidatePath("/dashboard/acteurs/athletes")
    return NextResponse.json({ ok: true, row: athlete })
  } catch (error) {
    console.error("POST /api/athletes:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {

  try {
    const body = await request.json() as { id?: unknown; row?: Record<string, unknown> }
    const id = String(body.id ?? "").trim()
    const row = cleanRow(body.row ?? {})
    if (!id) return NextResponse.json({ error: "Athlète introuvable." }, { status: 400 })

    const required = [
      ["nom_complet", "Le nom"],
      ["id_federation", "La fédération"],
      ["id_sexe", "Le sexe"],
    ] as const
    const missing = required.find(([key]) => !row[key])
    if (missing) {
      return NextResponse.json({ error: `${missing[1]} est obligatoire.` }, { status: 400 })
    }

    const [federations, athletes] = await Promise.all([
      getFederationOptions(),
      getSheetRows({
        sheetName: SHEET_NAME,
        spreadsheetId: getActeursSpreadsheetId(),
        bypassCache: true,
      }),
    ])
    const federation = federations.find((item) => item.id === row.id_federation)
    if (!federation) {
      return NextResponse.json({ error: "Fédération inconnue." }, { status: 400 })
    }
    if (
      row.id_national &&
      athletes.some((item) => item.id_national === row.id_national && item.id_athlete_coc !== id)
    ) {
      return NextResponse.json({ error: "Cet ID national existe déjà." }, { status: 409 })
    }

    const updatedRow = {
      ...row,
      numero_passeport: row.numero_passeport || row["numéro_passeport"],
      sigle_federation: federation.sigle,
      nom_sexe: row.id_sexe === "F" ? "Femme" : "Homme",
    }
    await updateSheetCells({
      sheetName: SHEET_NAME,
      spreadsheetId: getActeursSpreadsheetId(),
      idColumn: "id_athlete_coc",
      idValue: id,
      updates: Object.entries(updatedRow).map(([column, value]) => ({ column, value })),
    })
    revalidatePath("/dashboard/acteurs/athletes")
    revalidatePath(`/dashboard/acteurs/athletes/${id}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("PUT /api/athletes:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
