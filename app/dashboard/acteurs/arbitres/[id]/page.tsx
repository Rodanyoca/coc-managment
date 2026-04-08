import { getSheetRows } from "@/lib/google/sheets"
import { ArbitreDetailClient, type ArbitreDetail } from "./arbitre-detail-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function splitNomComplet(nomComplet: string) {
  const trimmed = (nomComplet || "").trim()
  if (!trimmed) return { prenom: "", nom: "" }

  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return { prenom: parts[0], nom: "" }

  return {
    prenom: parts.slice(0, -1).join(" "),
    nom: parts[parts.length - 1],
  }
}

function normalizeGender(value: string): "M" | "F" {
  const v = (value || "").trim().toLowerCase()
  if (v === "m" || v === "h" || v === "homme" || v === "masculin") return "M"
  return "F"
}

function normalizeStatus(value: string): "actif" | "inactif" {
  const v = (value || "").trim().toLowerCase()
  if (v === "inactif" || v === "inactive" || v === "0" || v === "non") return "inactif"
  return "actif"
}

export default async function ArbitreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const arbitreId = (id || "").trim()

  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "ARBITRES" })
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e)
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">{loadError}</p>
      </div>
    )
  }

  const found = rows.find((r: Record<string, string>) => (r["id_arbitre"] || "").trim() === arbitreId)
  const r = found ?? null

  if (!r) {
    const sampleIds = rows
      .map((row: Record<string, string>) => (row["id_arbitre"] || "").trim())
      .filter(Boolean)
      .slice(0, 15)

    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-destructive">
          Arbitre introuvable dans l'onglet ARBITRES pour id_arbitre="{arbitreId || id}".
        </p>
        {sampleIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Exemples de id_arbitre trouvés :</p>
            <pre className="whitespace-pre-wrap break-words rounded-md border border-border/50 bg-muted/30 p-3">
              {sampleIds.join("\n")}
            </pre>
          </div>
        )}
      </div>
    )
  }

  const { prenom, nom } = splitNomComplet(r["nom_complet"])
  const statut = normalizeStatus(r["statut"])

  const arbitre: ArbitreDetail = {
    id: (r["id_arbitre"] || "").trim(),
    nomComplet: r["nom_complet"] || `${prenom} ${nom}`.trim() || (r["id_arbitre"] || "").trim(),
    prenom,
    nom,
    sexe: normalizeGender(r["genre"]),
    dateNaissance: r["date_de_naissance"] || undefined,
    grade: r["grade"] || undefined,
    sport: r["nom_sport"] || undefined,
    federation: r["sigle_federation"] || undefined,
    telephone: r["telephone"] || undefined,
    email: r["email"] || undefined,
    adresse: r["adresse"] || undefined,
    urlPasseport: r["url_passeport"] || null,
    numeroPasseport: r["numéro_passeport"] || "",
    dateDelivrancePasseport: r["date_de_delivrance_passeport"] || "",
    dateExpirationPasseport: r["date_expiration passeport"] || "",
    statut,
    avatarUrl: r["avatar_url"] || null,
  }

  return <ArbitreDetailClient arbitre={arbitre} />
}
