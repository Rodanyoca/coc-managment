import { hasValidFederationLogoSignature, validateFederationLogo, type FederationLogoResult, type FederationLogoUploadInput } from "./logo.ts"

type HandlerDependencies = {
  canWrite: () => Promise<boolean>
  replace: (input: Omit<FederationLogoUploadInput, "folderId">) => Promise<FederationLogoResult>
}

export async function handleFederationLogoUpload(request: Request, federationId: string, dependencies: HandlerDependencies): Promise<Response> {
  if (!await dependencies.canWrite()) return Response.json({ error: "Vous n’êtes pas autorisé à modifier ce logo." }, { status: 403 })
  const formData = await request.formData()
  const file = formData.get("file")
  if (!(file instanceof File)) return Response.json({ error: "Aucun fichier fourni." }, { status: 400 })
  const validation = validateFederationLogo(file)
  if (!validation.ok) return Response.json({ error: validation.error }, { status: 400 })
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!hasValidFederationLogoSignature(buffer, file.type)) return Response.json({ error: "Le contenu du fichier ne correspond pas à une image autorisée." }, { status: 400 })
  try {
    const result = await dependencies.replace({
      federationId,
      fileName: file.name,
      mimeType: file.type,
      buffer,
    })
    return Response.json(result, { headers: { "Cache-Control": "no-store, max-age=0" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Le logo n’a pas pu être enregistré."
    if (message === "Fédération introuvable.") return Response.json({ error: message }, { status: 404 })
    return Response.json({ error: "Le logo n’a pas pu être enregistré." }, { status: 500 })
  }
}
