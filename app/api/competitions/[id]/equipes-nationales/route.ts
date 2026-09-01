import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { createTeamParticipation, getTeamParticipations, updateTeamParticipation } from "@/lib/competitions/data"

export const runtime = "nodejs"
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; try { return NextResponse.json({ rows: await getTeamParticipations(id) }) } catch (error) { console.error("Chargement équipes compétition", error); return NextResponse.json({ error: "Impossible de charger les équipes nationales." }, { status: 500 }) } }

async function write(request: Request, context: { params: Promise<{ id: string }> }, update: boolean) {
  try {
    const [{ id: competitionId }, body] = await Promise.all([context.params, request.json()])
    const row = update ? await updateTeamParticipation(competitionId, String(body.id || ""), body.row || {}) : await createTeamParticipation(competitionId, body.row || {})
    revalidatePath(`/dashboard/competitions/${competitionId}`); revalidatePath("/dashboard/competitions"); revalidatePath("/dashboard"); revalidateTag("competitions-dashboard", "max")
    return NextResponse.json({ ok: true, row })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible." }, { status: 400 }) }
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { return write(request, context, false) }
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { return write(request, context, true) }
