import { NextRequest, NextResponse } from "next/server"
import { uploadFileToDrive } from "@/lib/google/drive"
import { updateSheetCell } from "@/lib/google/sheets"

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const ACTOR_CONFIG: Record<string, { sheetName: string; idColumn: string }> = {
  athletes: { sheetName: "ATHLETES", idColumn: "id_athlete" },
  entraineurs: { sheetName: "COACHS", idColumn: "id_coach" },
  medecins: { sheetName: "MEDECINS", idColumn: "id_medecin" },
  officiels: { sheetName: "OFFICIELS", idColumn: "id_officiel" },
  arbitres: { sheetName: "ARBITRES", idColumn: "id_arbitre" },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const actorType = formData.get("actorType") as string | null
    const actorId = formData.get("actorId") as string | null

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }
    if (!actorType || !actorId) {
      return NextResponse.json({ error: "Type d'acteur ou ID manquant" }, { status: 400 })
    }

    const config = ACTOR_CONFIG[actorType]
    if (!config) {
      return NextResponse.json({ error: `Type d'acteur inconnu : ${actorType}` }, { status: 400 })
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez PNG, JPG ou WebP." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale de 2 Mo." },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `${actorType}_${actorId}_${Date.now()}.${ext}`

    const url = await uploadFileToDrive({
      fileName,
      mimeType: file.type,
      buffer,
    })

    await updateSheetCell({
      sheetName: config.sheetName,
      idColumn: config.idColumn,
      idValue: actorId,
      targetColumn: "avatar_url",
      value: url,
    })

    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Upload photo error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
