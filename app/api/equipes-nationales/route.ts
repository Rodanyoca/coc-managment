import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { createNationalTeam, getNationalTeamMembers, getNationalTeamReferences, getNationalTeams, updateNationalTeam } from "@/lib/equipes-nationales/data"
export const runtime = "nodejs"
export async function GET() { try { return NextResponse.json({ rows: await getNationalTeams(), members: await getNationalTeamMembers(), references: await getNationalTeamReferences() }) } catch (error) { console.error("Chargement équipes nationales", error); return NextResponse.json({ error: "Impossible de charger les équipes nationales." }, { status: 500 }) } }
async function write(request: Request, update = false) { try { const body = await request.json(); const row = update ? await updateNationalTeam(String(body.id || ""), body.row || {}) : await createNationalTeam(body.row || {}); revalidatePath("/dashboard/equipes-nationales"); revalidatePath(`/dashboard/equipes-nationales/${row.id_equipe_nationale}`); revalidatePath("/dashboard"); revalidateTag("national-teams-dashboard", "max"); return NextResponse.json({ ok: true, row }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible." }, { status: 400 }) } }
export async function POST(request: Request) { return write(request) }
export async function PATCH(request: Request) { return write(request, true) }
