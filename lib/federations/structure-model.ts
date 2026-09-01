import type { FederationData } from "./types"

export type FederationStructureItem = { id: string; federalId: string; name: string; alias: string; secondary: string; phone: string; email: string; status: string }
export type FederationStructureSection = {
  key: "ligues" | "ententes" | "cercles" | "clubs" | "equipes"
  label: string
  configured: boolean
  items: FederationStructureItem[]
}
export type FederationStructure = { hierarchy: string[]; sections: FederationStructureSection[] }

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
const definitions = [
  { key: "ligues", label: "Ligues", matches: (value: string) => normalize(value).includes("ligue") },
  { key: "ententes", label: "Ententes", matches: (value: string) => normalize(value).includes("entente") },
  { key: "cercles", label: "Cercles", matches: (value: string) => normalize(value).includes("cercle") },
  { key: "clubs", label: "Clubs", matches: (value: string) => normalize(value).includes("club") },
  { key: "equipes", label: "Équipes", matches: (value: string) => normalize(value).includes("equipe") },
] as const

export function buildFederationStructure(data: FederationData, federationId: string): FederationStructure {
  const hierarchyRows = data.hierarchie.filter((row) => row.id_federation === federationId).sort((a, b) => Number(a.niveau) - Number(b.niveau))
  const configuredNames = hierarchyRows.map((row) => row.nom_structure).filter(Boolean)
  const declared = (key: FederationStructureSection["key"]) => {
    const definition = definitions.find((item) => item.key === key)
    return Boolean(definition && configuredNames.some(definition.matches))
  }
  const sections: FederationStructureSection[] = [
    { key: "ligues", label: "Ligues", configured: declared("ligues"), items: data.ligues.filter((row) => row.id_federation === federationId).map((row) => ({ id: row.id_ligue_coc, federalId: row.id_ligue_federation, name: row.nom_ligue, alias: row.pseudo_ligue, secondary: row.nom_province, phone: row.telephone_ligue, email: row.email_ligue, status: row.statut })) },
    { key: "ententes", label: "Ententes", configured: declared("ententes"), items: data.ententes.filter((row) => row.id_federation === federationId).map((row) => ({ id: row.id_entente_coc, federalId: row.id_entente_federation, name: row.nom_entente, alias: row.pseudo_entente, secondary: row.nom_ville || row.nom_ligue, phone: row.telephone_entente, email: row.email_entente, status: row.statut })) },
    { key: "cercles", label: "Cercles", configured: declared("cercles"), items: data.cercles.filter((row) => row.id_federation === federationId).map((row) => ({ id: row.id_cercle_coc, federalId: row.id_cercle_federation, name: row.nom_cercle, alias: row.sigle_cercle, secondary: "", phone: row.telephone_cercle, email: row.email_cercle, status: row.statut })) },
    { key: "clubs", label: "Clubs", configured: declared("clubs"), items: data.clubs.filter((row) => row.id_federation === federationId).map((row) => ({ id: row.id_club_coc, federalId: row.id_club_federation, name: row.nom_club, alias: row.sigle_club, secondary: row.nom_ville || row.nom_categorie, phone: row.telephone_club, email: row.email_club, status: row.statut })) },
    { key: "equipes", label: "Équipes", configured: declared("equipes"), items: data.equipes.filter((row) => row.id_federation === federationId).map((row) => ({ id: row.id_equipe_coc, federalId: row.id_equipe_federation, name: row.nom_equipe, alias: "", secondary: row.id_club_coc, phone: "", email: "", status: row.statut })) },
  ]
  for (const section of sections) {
    section.items.sort((a, b) => a.name.localeCompare(b.name, "fr"))
  }
  const declaredHierarchy = configuredNames.filter((name) => !normalize(name).includes("federation"))
  const hierarchy = ["Fédération", ...declaredHierarchy]
  for (const section of sections) {
    const definition = definitions.find((item) => item.key === section.key)
    if (section.configured && definition && !declaredHierarchy.some(definition.matches)) hierarchy.push(section.label)
  }
  return { hierarchy, sections }
}
