import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { canAccess } from "@/lib/auth"
import { createFederation } from "@/lib/federations/creation"
import { FederationCreationError } from "@/lib/federations/creation-model"

export const runtime = "nodejs"
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id")?.trim() || randomUUID()
  if (!(await canAccess("AUT-SPT", "WRITE"))) return NextResponse.json({ error: "Accès refusé.", request_id: requestId }, { status: 403 })
  try { const form = await request.formData(), raw = JSON.parse(String(form.get("data") || "{}")), file = form.get("logo"), federation = await createFederation(raw, requestId, file instanceof File && file.size ? file : undefined); revalidatePath("/dashboard/federations"); return NextResponse.json({ ok: true, federation, request_id: requestId }, { status: 201 }) }
  catch (error) { const known = error instanceof FederationCreationError; return NextResponse.json({ error: known ? error.message : "La fédération n’a pas pu être enregistrée.", field: known ? error.field : undefined, request_id: requestId }, { status: known ? 400 : 500 }) }
}
