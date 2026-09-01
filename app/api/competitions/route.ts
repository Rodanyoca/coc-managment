import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { createCompetition, getCompetitionReferences, getCompetitions, updateCompetition } from "@/lib/competitions/data"

export const runtime = "nodejs"

export async function GET() {
  try { return NextResponse.json({ rows: await getCompetitions(), references: await getCompetitionReferences() }) }
  catch (error) { console.error("Chargement compétitions", error); return NextResponse.json({ error: "Impossible de charger les compétitions." }, { status: 500 }) }
}

async function write(request: Request, update: boolean) {
  try {
    const body = await request.json()
    const row = update ? await updateCompetition(String(body.id || ""), body.row || {}) : await createCompetition(body.row || {})
    revalidatePath("/dashboard/competitions")
    revalidatePath(`/dashboard/competitions/${row.id_competition}`)
    revalidatePath("/dashboard")
    revalidateTag("competitions-dashboard", "max")
    return NextResponse.json({ ok: true, row })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible." }, { status: 400 }) }
}

export async function POST(request: Request) { return write(request, false) }
export async function PUT(request: Request) { return write(request, true) }
