import "server-only"

import { google } from "googleapis"

function getDriveAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Variables OAuth2 manquantes : GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN"
    )
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
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

  const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
  return { fileId, url }
}
