import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth"
import { getActivities, getActivityReferences, saveActivity, syncActivityEntities } from "@/lib/activites/data"

export const runtime = "nodejs"
export async function GET() { try { return NextResponse.json({ rows: await getActivities(), references: await getActivityReferences() }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 }) } }
async function write(request: Request, update = false) { const session = await getSession(); if (session?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 }); try { const body = await request.json(); const row = await saveActivity(body.row ?? {}, update ? String(body.id ?? "") : undefined); const sync = await syncActivityEntities(row.id_activite, Array.isArray(body.entityIds) ? body.entityIds.map(String) : []); revalidatePath("/dashboard/activites"); if (update) revalidatePath(`/dashboard/activites/${body.id}`); return NextResponse.json({ ok: true, row, partialError: sync.failed.length ? `Activité enregistrée, mais ${sync.failed.length} relation(s) entité n’ont pas pu être mises à jour.` : null }) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 }) } }
export async function POST(request: Request) { return write(request) }
export async function PUT(request: Request) { return write(request, true) }
