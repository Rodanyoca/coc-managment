import { kinshasaCalendarDate } from "../auth/authorization.ts"

export const SEASON_HEADERS = ["id_saison", "nom_saison", "date_debut", "date_fin", "statut", "observation"] as const
export type Season = Record<(typeof SEASON_HEADERS)[number], string>

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value

export function validateSeason(input: Record<string, unknown>): Omit<Season, "id_saison"> {
  const row = Object.fromEntries(SEASON_HEADERS.filter(key => key !== "id_saison").map(key => [key, String(input[key] ?? "").trim()])) as Omit<Season, "id_saison">
  if (!row.nom_saison || row.nom_saison.length > 100) throw new Error("Le nom de la saison est obligatoire (100 caractères maximum).")
  if (!validDate(row.date_debut) || !validDate(row.date_fin) || row.date_debut > row.date_fin) throw new Error("Les dates de la saison sont invalides.")
  if (!["ACTIF", "INACTIF"].includes(row.statut)) throw new Error("Le statut doit être ACTIF ou INACTIF.")
  if (row.observation.length > 2000) throw new Error("L’observation est limitée à 2 000 caractères.")
  return row
}

export function seasonContext(seasons: readonly Season[], now = new Date()) {
  const date = kinshasaCalendarDate(now)
  const matching = seasons.filter(season => season.statut === "ACTIF" && validDate(season.date_debut) && validDate(season.date_fin) && season.date_debut <= date && date <= season.date_fin)
  return { date, year: Number(date.slice(0, 4)), currentSeason: matching.length === 1 ? matching[0] : null, ambiguous: matching.length > 1 }
}

export function assertSeasonCompatible(row: Omit<Season, "id_saison">, seasons: readonly Season[], id?: string) {
  if (seasons.some(season => season.id_saison !== id && season.nom_saison.toLocaleLowerCase("fr") === row.nom_saison.toLocaleLowerCase("fr"))) throw new Error("Une saison porte déjà ce nom.")
  if (row.statut === "ACTIF" && seasons.some(season => season.id_saison !== id && season.statut === "ACTIF" && season.date_debut <= row.date_fin && row.date_debut <= season.date_fin)) throw new Error("Deux saisons actives ne peuvent pas couvrir la même date.")
}
