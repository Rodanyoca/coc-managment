import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { deleteDriveFile, uploadFileToDrive, verifyDriveFolderAccess } from "@/lib/google/drive"
import { getSheetRows, updateSheetCells } from "@/lib/google/sheets"

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
const PDF_TYPES = ["application/pdf"]

type MediaType = "avatar" | "passeport" | "courrier" | "document"

const FOLDER_ENV: Record<MediaType, string> = {
  avatar: "GOOGLE_DRIVE_ACTEURS_AVATARS_FOLDER_ID",
  passeport: "GOOGLE_DRIVE_ACTEURS_PASSEPORTS_FOLDER_ID",
  courrier: "GOOGLE_DRIVE_COURRIERS_FOLDER_ID",
  document: "GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID",
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
  athletes: { sheetName: "ATHLETE", idColumn: "id_athlete_coc", fileLabel: "ATHLETE" },
  entraineurs: { sheetName: "COACHS", idColumn: "id_coach_coc", fileLabel: "COACH" },
  medecins: { sheetName: "MEDECINS", idColumn: "id_medecin_coc", fileLabel: "MEDECIN" },
  officiels: { sheetName: "OFFICIELS", idColumn: "id_officiel_coc", fileLabel: "OFFICIEL" },
  arbitres: { sheetName: "ARBITRES", idColumn: "id_arbitre_coc", fileLabel: "ARBITRE" },
}

const SHEET_COLUMNS: Record<MediaType, { urlColumn: string; driveIdColumn: string }> = {
  avatar: { urlColumn: "avatar_url", driveIdColumn: "avatar_drive_id" },
  passeport: { urlColumn: "url_passeport", driveIdColumn: "passeport_drive_id" },
  courrier: { urlColumn: "url_pdf", driveIdColumn: "courrier_drive_id" },
  document: { urlColumn: "url_drive_document", driveIdColumn: "id_drive_document" },
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

export async function GET() {
  try {
    const avatarFolder = process.env.GOOGLE_DRIVE_ACTEURS_AVATARS_FOLDER_ID
    const passportFolder = process.env.GOOGLE_DRIVE_ACTEURS_PASSEPORTS_FOLDER_ID
    if (!avatarFolder || !passportFolder) {
      return NextResponse.json({ error: "Dossiers Drive des acteurs non configurés" }, { status: 500 })
    }
    await Promise.all([
      verifyDriveFolderAccess(avatarFolder),
      verifyDriveFolderAccess(passportFolder),
    ])
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 503 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const mediaType = formData.get("mediaType") as MediaType | null
    const actorType = formData.get("actorType") as string | null
    const actorId = formData.get("actorId") as string | null
    const courrierCode = formData.get("courrierCode") as string | null
    const documentId = formData.get("documentId") as string | null

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
    if (mediaType === "document" && !documentId) {
      return NextResponse.json({ error: "ID document requis" }, { status: 400 })
    }

    const columns = SHEET_COLUMNS[mediaType]
    const actorConfig = actorType ? ACTOR_CONFIG[actorType] : undefined
    const actorSpreadsheetId = actorType === "athletes" || actorType === "officiels" || actorType === "entraineurs" || actorType === "medecins" || actorType === "arbitres"
      ? process.env.GOOGLE_SHEETS_ACTEURS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_SPREADSHEET_ID
      : undefined
    let existingFileId = ""

    if ((mediaType === "avatar" || mediaType === "passeport") && actorConfig) {
      const rows = await getSheetRows({
        sheetName: actorConfig.sheetName,
        spreadsheetId: actorSpreadsheetId,
        bypassCache: true,
      })
      const actor = rows.find((row) => row[actorConfig.idColumn] === actorId)
      if (!actor) {
        return NextResponse.json({ error: "Acteur introuvable" }, { status: 404 })
      }
      existingFileId = actor[columns.driveIdColumn] || ""
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

    if (mediaType === "avatar" || mediaType === "passeport") {
      try {
        await updateSheetCells({
          sheetName: actorConfig!.sheetName,
          idColumn: actorConfig!.idColumn,
          idValue: actorId!,
          spreadsheetId: actorSpreadsheetId,
          updates: [
            {
              column: mediaType === "avatar"
                ? "avatar_drive_url"
                : actorType === "entraineurs" || actorType === "medecins" || actorType === "arbitres"
                  ? "passeport_drive_url"
                  : "url_passeport",
              value: url,
            },
            { column: columns.driveIdColumn, value: fileId },
          ],
        })
      } catch (error) {
        await deleteDriveFile(fileId).catch(() => undefined)
        throw error
      }
      if (existingFileId && existingFileId !== fileId) {
        await deleteDriveFile(existingFileId).catch((error) => {
          console.error("Ancien média non supprimé :", error)
        })
      }
      if (actorType && actorId) {
        revalidatePath(`/dashboard/acteurs/${actorType}`)
        revalidatePath(`/dashboard/acteurs/${actorType}/${actorId}`)
      }
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
    } else if (mediaType === "document" && documentId) {
      await updateSheetCells({
        sheetName: "DOCUMENT",
        idColumn: "id_document",
        idValue: documentId,
        updates: [
          { column: columns.urlColumn, value: url },
          { column: columns.driveIdColumn, value: fileId },
        ],
      })
    }

    return NextResponse.json(
      { fileId, url },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Upload media error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
