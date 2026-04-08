import { getSheetRows } from "@/lib/google/sheets"
import { MedecinDetailClient, type MedecinDetail } from "./medecin-detail-client"

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

export default async function MedecinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const medecinId = (id || "").trim()

  let rows: Record<string, string>[] = []
  let loadError: string | null = null

  try {
    rows = await getSheetRows({ sheetName: "MEDECINS" })
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

  const found = rows.find((r: Record<string, string>) => (r["id_medecin"] || "").trim() === medecinId)
  const r = found ?? null

  if (!r) {
    const sampleIds = rows
      .map((row: Record<string, string>) => (row["id_medecin"] || "").trim())
      .filter(Boolean)
      .slice(0, 15)

    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-destructive">
          Médecin introuvable dans l'onglet MEDECINS pour id_medecin="{medecinId || id}".
        </p>
        {sampleIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Exemples de id_medecin trouvés :</p>
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

  const medecin: MedecinDetail = {
    id: (r["id_medecin"] || "").trim(),
    nomComplet: r["nom_complet"] || `${prenom} ${nom}`.trim() || (r["id_medecin"] || "").trim(),
    prenom,
    nom,
    sexe: normalizeGender(r["genre"]),
    dateNaissance: r["date_de_naissance"] || undefined,
    specialite: r["specialite"] || undefined,
    grade: r["grade"] || undefined,
    telephone: r["telephone"] || undefined,
    email: r["email"] || undefined,
    adresse: r["adresse"] || undefined,
    numeroOrdre: r["numero_ordre"] || undefined,
    etablissement: r["etablissement"] || undefined,
    dateAffiliation: r["date_affiliation"] || undefined,
    urlPasseport: r["url_passeport"] || null,
    numeroPasseport: r["numéro_passeport"] || "",
    dateDelivrancePasseport: r["date_de_delivrance_passeport"] || "",
    dateExpirationPasseport: r["date_expiration passeport"] || "",
    statut,
    avatarUrl: r["avatar_url"] || null,
  }

  return <MedecinDetailClient medecin={medecin} />
}
