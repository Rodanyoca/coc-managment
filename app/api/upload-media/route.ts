import { NextRequest, NextResponse } from "next/server"
import { uploadFileToDrive } from "@/lib/google/drive"
import { updateSheetCells } from "@/lib/google/sheets"

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const PDF_TYPES = ["application/pdf"]

type MediaType = "avatar" | "passeport" | "courrier" | "document"

const FOLDER_ENV: Record<MediaType, string> = {
  avatar: "GOOGLE_DRIVE_AVATAR_FOLDER_ID",
  passeport: "GOOGLE_DRIVE_PASSEPORT_FOLDER_ID",
  courrier: "GOOGLE_DRIVE_COURRIER_FOLDER_ID",
  document: "GOOGLE_DRIVE_DOCUMENT_FOLDER_ID",
}

const ACCEPTED_TYPES: Record<MediaType, string[]> = {
  avatar: IMAGE_TYPES,
  passeport: PDF_TYPES,
  courrier: PDF_TYPES,
  document: PDF_TYPES,
}

const ACTOR_CONFIG: Record<
  string,
  { sheetName: string; idColumn: string; fileLabel: string }
> = {
  athletes: { sheetName: "ATHLETES", idColumn: "id_athlete", fileLabel: "ATHLETE" },
  entraineurs: { sheetName: "COACHS", idColumn: "id_coach", fileLabel: "COACH" },
  medecins: { sheetName: "MEDECINS", idColumn: "id_medecin", fileLabel: "MEDECIN" },
  officiels: { sheetName: "OFFICIELS", idColumn: "id_officiel", fileLabel: "OFFICIEL" },
  arbitres: { sheetName: "ARBITRES", idColumn: "id_arbitre", fileLabel: "ARBITRE" },
}

const SHEET_COLUMNS: Record<MediaType, { urlColumn: string; driveIdColumn: string }> = {
  avatar: { urlColumn: "avatar_url", driveIdColumn: "avatar_drive_id" },
  passeport: { urlColumn: "url_passeport", driveIdColumn: "passeport_drive_id" },
  courrier: { urlColumn: "url_pdf", driveIdColumn: "courrier_drive_id" },
  document: { urlColumn: "url_document", driveIdColumn: "document_drive_id" },
}

function buildFileName(
  mediaType: MediaType,
  actorType: string | null,
  actorId: string | null,
  courrierCode: string | null,
  ext: string
): string {
  if (mediaType === "courrier" && courrierCode) {
    return `COURRIER_${courrierCode}.${ext}`
  }
  if (mediaType === "document") {
    return `DOCUMENT_${Date.now()}.${ext}`
  }
  const label = actorType
    ? ACTOR_CONFIG[actorType]?.fileLabel || actorType.toUpperCase()
    : "UNKNOWN"
  const id = actorId || "0"
  const prefix = mediaType === "avatar" ? "AVATAR" : "PASSEPORT"
  return `${prefix}_${label}_${id}.${ext}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const mediaType = formData.get("mediaType") as MediaType | null
    const actorType = formData.get("actorType") as string | null
    const actorId = formData.get("actorId") as string | null
    const courrierCode = formData.get("courrierCode") as string | null

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }
    if (!mediaType || !FOLDER_ENV[mediaType]) {
      return NextResponse.json({ error: "Type de média invalide" }, { status: 400 })
    }

    const acceptedTypes = ACCEPTED_TYPES[mediaType]
    if (!acceptedTypes.includes(file.type)) {
      const formats = mediaType === "avatar" ? "PNG, JPG ou WebP" : "PDF"
      return NextResponse.json(
        { error: `Format non supporté. Utilisez ${formats}.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Le fichier dépasse la taille maximale de 5 Mo." },
        { status: 400 }
      )
    }

    const folderId = process.env[FOLDER_ENV[mediaType]]
    if (!folderId) {
      return NextResponse.json(
        { error: `Variable d'environnement ${FOLDER_ENV[mediaType]} manquante` },
        { status: 500 }
      )
    }

    if ((mediaType === "avatar" || mediaType === "passeport") && (!actorType || !actorId)) {
      return NextResponse.json({ error: "Type d'acteur et ID requis" }, { status: 400 })
    }
    if ((mediaType === "avatar" || mediaType === "passeport") && actorType && !ACTOR_CONFIG[actorType]) {
      return NextResponse.json(
        { error: `Type d'acteur inconnu : ${actorType}` },
        { status: 400 }
      )
    }
    if (mediaType === "courrier" && !courrierCode) {
      return NextResponse.json({ error: "Code courrier requis" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop() || (mediaType === "avatar" ? "jpg" : "pdf")
    const fileName = buildFileName(mediaType, actorType, actorId, courrierCode, ext)

    const { fileId, url } = await uploadFileToDrive({
      fileName,
      mimeType: file.type,
      buffer,
      folderId,
    })

    const columns = SHEET_COLUMNS[mediaType]

    if (mediaType === "avatar" || mediaType === "passeport") {
      const config = ACTOR_CONFIG[actorType!]
      await updateSheetCells({
        sheetName: config.sheetName,
        idColumn: config.idColumn,
        idValue: actorId!,
        updates: [
          { column: columns.urlColumn, value: url },
          { column: columns.driveIdColumn, value: fileId },
        ],
      })
    } else if (mediaType === "courrier") {
      await updateSheetCells({
        sheetName: "COURRIERS",
        idColumn: "id_courrier",
        idValue: courrierCode!,
        updates: [
          { column: columns.urlColumn, value: url },
          { column: columns.driveIdColumn, value: fileId },
        ],
      })
    }

    return NextResponse.json({ fileId, url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Upload media error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
