import { NextResponse } from "next/server"
import { createSession, type UserRole } from "@/lib/auth"
import { getUsers } from "@/lib/users/data"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let credentials: { email?: unknown; password?: unknown }
  try {
    credentials = await req.json()
  } catch {
    return NextResponse.json({ error: "Requête de connexion invalide." }, { status: 400 })
  }

  const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : ""
  const password = typeof credentials.password === "string" ? credentials.password : ""
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 })
  }

  try {
    const rows = await getUsers()

    const user = rows.find((r) => {
      const e = (r.email || "").trim().toLowerCase()
      const p = (r.password || "").trim()
      const s = (r.statut || "").trim().toUpperCase()
      return e === email && p === password && s === "ACTIF"
    })

    if (!user) {
      return NextResponse.json({ error: "Identifiants incorrects ou compte inactif." }, { status: 401 })
    }

    const role = (user.role || "").trim().toLowerCase() as UserRole
    if (role !== "coc" && role !== "technique") {
      return NextResponse.json({ error: "Rôle non reconnu." }, { status: 403 })
    }

    await createSession({
      id: (user.id_user || "").trim(),
      nom: (user.nom_complet || "").trim(),
      email: (user.email || "").trim(),
      role,
    })

    return NextResponse.json({ ok: true, nom: (user.nom_complet || "").trim(), role })
  } catch (error) {
    console.error("Échec du service d’authentification", error)
    return NextResponse.json({ error: "Le service de connexion est momentanément indisponible." }, { status: 500 })
  }
}
