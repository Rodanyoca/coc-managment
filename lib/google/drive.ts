import "server-only"

import { Readable } from "stream"
import { google } from "googleapis"
import { runGoogleRequest } from "./request"

function getDriveAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Variables OAuth2 Drive manquantes")
  }
  const auth = new google.auth.OAuth2(clientId, clientSecret)
  auth.setCredentials({ refresh_token: refreshToken })
  return auth
}

function driveError(error: unknown): Error {
  const candidate = error as {
    response?: { data?: { error?: string | { message?: string } } }
    message?: string
  }
  const responseError = candidate.response?.data?.error
  const message = typeof responseError === "string"
    ? responseError
    : responseError?.message || candidate.message || String(error)
  if (message.includes("invalid_grant")) {
    return new Error("Connexion Google Drive expirée : renouvelez GOOGLE_DRIVE_REFRESH_TOKEN")
  }
  return error instanceof Error ? error : new Error(message)
}

export type DriveUploadResult = {
  fileId: string
  url: string
}

const driveSizeCache = (globalThis as typeof globalThis & { __cocDriveSizeCache?: Map<string, { size: string; timestamp: number }> }).__cocDriveSizeCache ??= new Map()
const DRIVE_SIZE_CACHE_TTL_MS = 5 * 60 * 1000

export async function getDriveFileSize(fileId: string): Promise<string> {
  const cached = driveSizeCache.get(fileId)
  if (cached && Date.now() - cached.timestamp < DRIVE_SIZE_CACHE_TTL_MS) return cached.size
  try {
    const drive = google.drive({ version: "v3", auth: getDriveAuth() })
    const response = await runGoogleRequest(() => drive.files.get({ fileId, fields: "id,size" }))
    const size = String(response.data.size ?? "")
    if (size) driveSizeCache.set(fileId, { size, timestamp: Date.now() })
    return size
  } catch (error) {
    throw driveError(error)
  }
}

export async function uploadPrivateFileToDrive(params: { fileName: string; mimeType: string; buffer: Buffer; folderId: string }): Promise<DriveUploadResult> {
  try {
    const drive = google.drive({ version: "v3", auth: getDriveAuth() })
    const response = await runGoogleRequest(() => drive.files.create({ requestBody: { name: params.fileName, parents: [params.folderId] }, media: { mimeType: params.mimeType, body: Readable.from(params.buffer) }, fields: "id" }), { idempotent: false })
    const fileId = response.data.id
    if (!fileId) throw new Error("Upload Drive échoué : aucun ID retourné")
    return { fileId, url: `https://drive.google.com/file/d/${fileId}/view` }
  } catch (error) {
    throw driveError(error)
  }
}

export async function downloadDriveFile(fileId: string, verifiedMetadata?: { mimeType: string; name: string }): Promise<{ buffer: Buffer; mimeType: string; name: string }> {
  try {
    const drive = google.drive({ version: "v3", auth: getDriveAuth() })
    if (verifiedMetadata) {
      const content = await runGoogleRequest(() => drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" }))
      return { buffer: Buffer.from(content.data as ArrayBuffer), ...verifiedMetadata }
    }
    const [metadata, content] = await Promise.all([
      runGoogleRequest(() => drive.files.get({ fileId, fields: "name,mimeType" })),
      runGoogleRequest(() => drive.files.get({ fileId, alt: "media" }, { responseType: "arraybuffer" })),
    ])
    return { buffer: Buffer.from(content.data as ArrayBuffer), mimeType: metadata.data.mimeType || "application/pdf", name: metadata.data.name || "document.pdf" }
  } catch (error) {
    throw driveError(error)
  }
}

export async function verifyDriveFolderAccess(folderId: string): Promise<void> {
  try {
    const drive = google.drive({ version: "v3", auth: getDriveAuth() })
    const response = await runGoogleRequest(() => drive.files.get({
      fileId: folderId,
      fields: "id,mimeType,capabilities(canAddChildren)",
    }))
    if (
      response.data.mimeType !== "application/vnd.google-apps.folder" ||
      !response.data.capabilities?.canAddChildren
    ) {
      throw new Error("Le dossier Drive n'est pas accessible en écriture")
    }
  } catch (error) {
    throw driveError(error)
  }
}

export async function uploadFileToDrive(params: {
  fileName: string
  mimeType: string
  buffer: Buffer
  folderId: string
}): Promise<DriveUploadResult> {
  try {
    const drive = google.drive({ version: "v3", auth: getDriveAuth() })
    const response = await runGoogleRequest(() => drive.files.create({
      requestBody: {
        name: params.fileName,
        parents: [params.folderId],
      },
      media: {
        mimeType: params.mimeType,
        body: Readable.from(params.buffer),
      },
      fields: "id",
    }), { idempotent: false })

    const fileId = response.data.id
    if (!fileId) throw new Error("Upload Drive échoué : aucun ID retourné")

    await runGoogleRequest(() => drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    }), { idempotent: false })

    return {
      fileId,
      url: params.mimeType.startsWith("image/")
        ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400&v=${Date.now()}`
        : `https://drive.google.com/file/d/${fileId}/view`,
    }
  } catch (error) {
    throw driveError(error)
  }
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  try {
    const drive = google.drive({ version: "v3", auth: getDriveAuth() })
    await runGoogleRequest(() => drive.files.delete({ fileId }), { idempotent: false })
  } catch (error) {
    throw driveError(error)
  }
}

// Site Web uploads stay private. Do not use uploadFileToDrive (anyone permission).
export async function assertPrivateDriveFolder(folderId: string) {
  await verifyDriveFolderAccess(folderId)
  const drive = google.drive({ version: "v3", auth: getDriveAuth() })
  const permissions = await runGoogleRequest(() => drive.permissions.list({ fileId: folderId, fields: "permissions(type,role)", supportsAllDrives: true }))
  if ((permissions.data.permissions ?? []).some(permission => permission.type === "anyone" || permission.type === "domain")) throw new Error("Le dossier des médias Site Web doit rester privé dans Drive.")
}

export async function startPrivateDriveUpload(input: { folderId: string; name: string; mimeType: string; size: number }) {
  await assertPrivateDriveFolder(input.folderId)
  const result = await getDriveAuth().request({ url: "https://www.googleapis.com/upload/drive/v3/files", method: "POST", params: { uploadType: "resumable", fields: "id" }, headers: { "X-Upload-Content-Type": input.mimeType, "X-Upload-Content-Length": String(input.size) }, data: { name: input.name, parents: [input.folderId] } })
  const location = result.headers.get("location")
  if (!location || new URL(location).origin !== "https://www.googleapis.com") throw new Error("Session d’envoi Drive indisponible.")
  return location
}

export async function sendPrivateDriveChunk(input: { url: string; buffer: Buffer; start: number; total: number; mimeType: string }) {
  if (new URL(input.url).origin !== "https://www.googleapis.com") throw new Error("Session Drive invalide.")
  const result = await getDriveAuth().request<{ id?: string }>({ url: input.url, method: "PUT", headers: { "Content-Type": input.mimeType, "Content-Range": `bytes ${input.start}-${input.start + input.buffer.length - 1}/${input.total}` }, data: input.buffer, validateStatus: status => status === 308 || status === 200 || status === 201 })
  if (result.status === 308) return { next: Number(result.headers.get("range")?.match(/-(\d+)$/)?.[1] ?? -1) + 1 }
  return { next: input.total, fileId: result.data.id }
}

export async function verifyPrivateDriveUpload(fileId: string, folderId: string | string[], size: number | null, mimeType: string, maxSize = 25 * 1024 * 1024) {
  const drive = google.drive({ version: "v3", auth: getDriveAuth() })
  const file = await runGoogleRequest(() => drive.files.get({ fileId, fields: "id,size,mimeType,parents,permissions(type)", supportsAllDrives: true }))
  const folders = Array.isArray(folderId) ? folderId : [folderId]
  const actualSize = Number(file.data.size), actualMime = file.data.mimeType || ""
  const allowedMime = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"].includes(actualMime) && (mimeType.endsWith("/") ? actualMime.startsWith(mimeType) : actualMime === mimeType)
  if (!file.data.parents?.some(parent => folders.includes(parent)) || !Number.isSafeInteger(actualSize) || actualSize < 5 || actualSize > maxSize || size !== null && actualSize !== size || !allowedMime || file.data.permissions?.some(permission => ["anyone", "domain"].includes(permission.type || ""))) throw new Error("Le fichier envoyé n’est pas un média privé valide du Site Web.")
  return { size: actualSize, mimeType: actualMime }
}
