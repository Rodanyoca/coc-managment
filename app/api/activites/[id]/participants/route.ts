import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { getActors, getParticipants, saveParticipant } from "@/lib/activites/data"
export const runtime = "nodejs"
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params; const type = new URL(request.url).searchParams.get("type"); return NextResponse.json(type ? { actors: await getActors(type) } : { rows: await getParticipants(id) }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) } }
async function write(request: Request, params: Promise<{ id: string }>, update = false) { const session = await getSession(); if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 }); try { const { id: activityId } = await params; const body = await request.json(); const row = await saveParticipant({ ...(body.row ?? {}), id_activite: activityId }, update ? String(body.id ?? "") : undefined); revalidatePath(`/dashboard/activites/${activityId}`); return NextResponse.json({ ok: true, row }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) } }
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { return write(request, params) }
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) { return write(request, params, true) }
