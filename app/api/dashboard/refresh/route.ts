import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { TERRITORIAL_DASHBOARD_CACHE_TAG } from "@/lib/federations/dashboard"
import { ACTORS_DASHBOARD_CACHE_TAG } from "@/lib/acteurs/dashboard"
import { clearSheetCache } from "@/lib/google/sheets"

export const runtime = "nodejs"

export async function POST() {
  if (!(await getSession())) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  clearSheetCache()
  revalidateTag(TERRITORIAL_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidateTag(ACTORS_DASHBOARD_CACHE_TAG, { expire: 0 })
  revalidatePath("/dashboard")
  return NextResponse.json({ ok: true })
}
