import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { deleteDriveFile, uploadFileToDrive, uploadPrivateFileToDrive, verifyDriveFolderAccess } from "@/lib/google/drive"
import { getSheetRows, updateSheetCells } from "@/lib/google/sheets"
import { getSession } from "@/lib/auth"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"

// Keep enough headroom for multipart metadata under Vercel's 4.5 MB
// function request-body limit.
const MAX_SIZE_BYTES = 4 * 1024 * 1024
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
type MediaType = "avatar" | "passeport"

const FOLDER_ENV: Record<MediaType, string> = { avatar: "GOOGLE_DRIVE_ACTEURS_AVATARS_FOLDER_ID", passeport: "GOOGLE_DRIVE_ACTEURS_PASSEPORTS_FOLDER_ID" }
const ACCEPTED_TYPES: Record<MediaType, string[]> = { avatar: IMAGE_TYPES, passeport: ["application/pdf"] }
const ACTOR_CONFIG: Record<string, { sheetName: string; idColumn: string; fileLabel: string }> = {
  athletes: { sheetName: "ATHLETE", idColumn: "id_athlete_coc", fileLabel: "ATHLETE" },
  entraineurs: { sheetName: "COACHS", idColumn: "id_coach_coc", fileLabel: "COACH" },
  medecins: { sheetName: "MEDECINS", idColumn: "id_medecin_coc", fileLabel: "MEDECIN" },
  officiels: { sheetName: "OFFICIELS", idColumn: "id_officiel_coc", fileLabel: "OFFICIEL" },
  arbitres: { sheetName: "ARBITRES", idColumn: "id_arbitre_coc", fileLabel: "ARBITRE" },
}

export async function GET() {
  try {
    const avatarFolder = process.env.GOOGLE_DRIVE_ACTEURS_AVATARS_FOLDER_ID
    const passportFolder = process.env.GOOGLE_DRIVE_ACTEURS_PASSEPORTS_FOLDER_ID
    if (!avatarFolder || !passportFolder) return NextResponse.json({ error: "Dossiers Drive des acteurs non configurés" }, { status: 500 })
    await Promise.all([verifyDriveFolderAccess(avatarFolder), verifyDriveFolderAccess(passportFolder)])
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 503 }) }
}

export async function POST(request: NextRequest) {
  if ((await getSession())?.role !== "coc") return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 })
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const mediaType = String(formData.get("mediaType") || "") as MediaType
    const actorType = String(formData.get("actorType") || "")
    const actorId = String(formData.get("actorId") || "")
    if (!(file instanceof File)) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    if (!FOLDER_ENV[mediaType]) return NextResponse.json({ error: "Type de média invalide" }, { status: 400 })
    if (!actorType || !actorId || !ACTOR_CONFIG[actorType]) return NextResponse.json({ error: "Type d’acteur ou identifiant invalide" }, { status: 400 })
    if (!ACCEPTED_TYPES[mediaType].includes(file.type)) return NextResponse.json({ error: `Format non supporté. Utilisez ${mediaType === "avatar" ? "PNG, JPG ou WebP" : "PDF"}.` }, { status: 400 })
    if (file.size > MAX_SIZE_BYTES) return NextResponse.json({ error: "Le fichier dépasse la taille maximale de 4 Mo." }, { status: 400 })
    const folderId = process.env[FOLDER_ENV[mediaType]]
    if (!folderId) return NextResponse.json({ error: `Variable ${FOLDER_ENV[mediaType]} manquante` }, { status: 500 })

    const actorConfig = ACTOR_CONFIG[actorType]
    const spreadsheetId = getActeursSpreadsheetId()
    const rows = await getSheetRows({ sheetName: actorConfig.sheetName, spreadsheetId, bypassCache: true })
    const actor = rows.find((row) => row[actorConfig.idColumn] === actorId)
    if (!actor) return NextResponse.json({ error: "Acteur introuvable" }, { status: 404 })
    const driveIdColumn = mediaType === "avatar" ? "avatar_drive_id" : "passeport_drive_id"
    const existingFileId = actor[driveIdColumn] || ""
    const ext = file.name.split(".").pop() || (mediaType === "avatar" ? "jpg" : "pdf")
    const fileName = `${mediaType === "avatar" ? "AVATAR" : "PASSEPORT"}_${actorConfig.fileLabel}_${actorId}.${ext}`
    const upload = mediaType === "passeport" ? uploadPrivateFileToDrive : uploadFileToDrive
    const uploaded = await upload({ fileName, mimeType: file.type, buffer: Buffer.from(await file.arrayBuffer()), folderId })

    try {
      await updateSheetCells({ sheetName: actorConfig.sheetName, idColumn: actorConfig.idColumn, idValue: actorId, spreadsheetId, updates: [
        { column: mediaType === "avatar" ? "avatar_drive_url" : ["entraineurs", "medecins", "arbitres"].includes(actorType) ? "passeport_drive_url" : "url_passeport", value: uploaded.url },
        { column: driveIdColumn, value: uploaded.fileId },
      ] })
    } catch (error) { await deleteDriveFile(uploaded.fileId).catch(() => undefined); throw error }
    if (existingFileId && existingFileId !== uploaded.fileId) await deleteDriveFile(existingFileId).catch((error) => console.error("Ancien média non supprimé", error))
    revalidatePath(`/dashboard/acteurs/${actorType}`); revalidatePath(`/dashboard/acteurs/${actorType}/${actorId}`)
    return NextResponse.json(uploaded, { headers: { "Cache-Control": "no-store, max-age=0" } })
  } catch (error) { console.error("Upload media error", error); return NextResponse.json({ error: "Le fichier n’a pas pu être enregistré." }, { status: 500 }) }
}
