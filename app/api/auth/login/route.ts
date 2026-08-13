import { NextResponse } from "next/server"
import { getSheetRows } from "@/lib/google/sheets"
import { createSession, type UserRole } from "@/lib/auth"
import { getUsersSpreadsheetId } from "@/lib/users/config"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const rows = await getSheetRows({ sheetName: "USERS", spreadsheetId: getUsersSpreadsheetId(), bypassCache: true })

    const user = rows.find((r) => {
      const e = (r.email || "").trim().toLowerCase()
      const p = (r.password || "").trim()
      const s = (r.statut || "").trim().toUpperCase()
      return e === email.trim().toLowerCase() && p === password && s === "ACTIF"
    })

    if (!user) {
      return NextResponse.json({ error: "Identifiants incorrects ou compte inactif" }, { status: 401 })
    }

    const role = (user.role || "").trim().toLowerCase() as UserRole
    if (role !== "coc" && role !== "technique") {
      return NextResponse.json({ error: "Rôle non reconnu" }, { status: 403 })
    }

    await createSession({
      id: (user.id_user || "").trim(),
      nom: (user.nom_complet || "").trim(),
      email: (user.email || "").trim(),
      role,
    })

    return NextResponse.json({ ok: true, nom: (user.nom_complet || "").trim(), role })
  } catch (error) {
    console.error("Échec de connexion", error)
    return NextResponse.json({ error: "Le service de connexion est momentanément indisponible." }, { status: 500 })
  }
}
