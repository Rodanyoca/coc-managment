import "server-only"

import { google } from "googleapis"

function getPrivateKey() {
  const key = process.env.GOOGLE_PRIVATE_KEY
  if (!key) return ""
  return key.replace(/\\n/g, "\n")
}

function getDriveAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = getPrivateKey()

  if (!clientEmail) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL")
  if (!privateKey) throw new Error("Missing GOOGLE_PRIVATE_KEY")

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  })
}

export type DriveUploadResult = {
  fileId: string
  url: string
}

export async function uploadFileToDrive(params: {
  fileName: string
  mimeType: string
  buffer: Buffer
  folderId: string
}): Promise<DriveUploadResult> {
  const auth = getDriveAuth()
  const drive = google.drive({ version: "v3", auth })

  const res = await drive.files.create({
    requestBody: {
      name: params.fileName,
      parents: [params.folderId],
    },
    media: {
      mimeType: params.mimeType,
      body: require("stream").Readable.from(params.buffer),
    },
    fields: "id",
  } as any)

  const fileId = (res as any).data?.id
  if (!fileId) throw new Error("Upload Drive échoué : aucun ID retourné")

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  } as any)

  const url = `https://drive.google.com/uc?export=view&id=${fileId}`
  return { fileId, url }
}
