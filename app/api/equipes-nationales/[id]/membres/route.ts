import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { createNationalTeamMember, getNationalTeamMembers, updateNationalTeamMember } from "@/lib/equipes-nationales/data"
export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }
export async function GET(_: Request, { params }: Context) { const { id } = await params; try { return NextResponse.json({ rows: await getNationalTeamMembers(id) }) } catch (error) { console.error(error); return NextResponse.json({ error: "Impossible de charger les membres de l’équipe nationale." }, { status: 500 }) } }
async function write(request: Request, context: Context, update = false) { try { const [{ id }, body] = await Promise.all([context.params, request.json()]); const row = update ? await updateNationalTeamMember(id, String(body.id || ""), body.row || {}) : await createNationalTeamMember(id, body.row || {}); revalidatePath(`/dashboard/equipes-nationales/${id}`); revalidatePath("/dashboard/equipes-nationales"); revalidatePath("/dashboard"); revalidateTag("national-teams-dashboard", "max"); return NextResponse.json({ ok: true, row }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Enregistrement impossible." }, { status: 400 }) } }
export async function POST(request: Request, context: Context) { return write(request, context) }
export async function PATCH(request: Request, context: Context) { return write(request, context, true) }
