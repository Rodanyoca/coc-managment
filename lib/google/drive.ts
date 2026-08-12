import "server-only"

import { Readable } from "stream"
import { google } from "googleapis"

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

export async function verifyDriveFolderAccess(folderId: string): Promise<void> {
  try {
    const drive = google.drive({ version: "v3", auth: getDriveAuth() })
    const response = await drive.files.get({
      fileId: folderId,
      fields: "id,mimeType,capabilities(canAddChildren)",
    })
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
    const response = await drive.files.create({
      requestBody: {
        name: params.fileName,
        parents: [params.folderId],
      },
      media: {
        mimeType: params.mimeType,
        body: Readable.from(params.buffer),
      },
      fields: "id",
    })

    const fileId = response.data.id
    if (!fileId) throw new Error("Upload Drive échoué : aucun ID retourné")

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    })

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
    await drive.files.delete({ fileId })
  } catch (error) {
    throw driveError(error)
  }
}
