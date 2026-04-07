import "server-only"

import { google } from "googleapis"
import { Readable } from "stream"

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY
  if (!key) return ""
  return key.replace(/\\n/g, "\n")
}

export async function uploadFileToDrive(params: {
  fileName: string
  mimeType: string
  buffer: Buffer
}): Promise<string> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = getPrivateKey()
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined

  if (!clientEmail) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL")
  if (!privateKey) throw new Error("Missing GOOGLE_PRIVATE_KEY")

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  })

  const drive = google.drive({ version: "v3", auth })

  const fileMetadata: Record<string, unknown> = {
    name: params.fileName,
  }
  if (folderId) {
    fileMetadata.parents = [folderId]
  }

  const media = {
    mimeType: params.mimeType,
    body: Readable.from(params.buffer),
  }

  const res = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  } as any)

  const fileId = (res as any).data?.id
  if (!fileId) throw new Error("Failed to upload file to Google Drive")

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  } as any)

  return `https://drive.google.com/uc?export=view&id=${fileId}`
}
