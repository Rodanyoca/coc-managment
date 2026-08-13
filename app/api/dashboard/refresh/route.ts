import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { TERRITORIAL_DASHBOARD_CACHE_TAG } from "@/lib/federations/dashboard"
import { ACTORS_DASHBOARD_CACHE_TAG } from "@/lib/acteurs/dashboard"
import { ACTIVITIES_DASHBOARD_CACHE_TAG } from "@/lib/activites/dashboard"
import { DOCUMENTS_DASHBOARD_CACHE_TAG } from "@/lib/documents/dashboard"
import { COMPETITIONS_DASHBOARD_CACHE_TAG } from "@/lib/competitions/dashboard"
import { NATIONAL_TEAMS_DASHBOARD_CACHE_TAG } from "@/lib/equipes-nationales/dashboard"
import { clearSheetCache } from "@/lib/google/sheets"

export const runtime = "nodejs"

export async function POST() {
  if (!(await getSession())) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  clearSheetCache()
  revalidateTag(TERRITORIAL_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidateTag(ACTORS_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidateTag(ACTIVITIES_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidateTag(DOCUMENTS_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidateTag(COMPETITIONS_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidateTag(NATIONAL_TEAMS_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidatePath("/dashboard")
  return NextResponse.json({ ok: true })
}
