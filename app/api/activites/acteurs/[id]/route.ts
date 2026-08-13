import { NextResponse } from "next/server"
import { getActivities, getActivityReferences, getParticipants } from "@/lib/activites/data"
export const runtime = "nodejs"
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params; const [activities, participants, references] = await Promise.all([getActivities(), getParticipants(undefined, id), getActivityReferences()]); const byId = new Map(activities.map((x) => [x.id_activite, x])); return NextResponse.json({ rows: participants.map((participation) => ({ participation, activity: byId.get(participation.id_activite) })).filter((x) => x.activity), references }) } catch { return NextResponse.json({ error: "Impossible de charger les activités." }, { status: 500 }) } }
