import type { AuthorizationBlock } from "../users/types.ts"

export type DashboardNavigationItem = {
  name: string
  href?: string
  icon: "dashboard" | "landmark" | "users" | "trophy" | "shield" | "calendar" | "file" | "globe"
  blocks: readonly AuthorizationBlock[]
  superOnly?: boolean
  children?: readonly { name: string; href: string }[]
}

export const dashboardNavigation: readonly DashboardNavigationItem[] = [
  { name: "Tableau de bord", href: "/dashboard", icon: "dashboard", blocks: ["AUT-ADM", "AUT-SPT", "AUT-COM"] },
  { name: "Entités", href: "/dashboard/federations", icon: "landmark", blocks: ["AUT-SPT"] },
  { name: "Acteurs", href: "/dashboard/acteurs", icon: "users", blocks: ["AUT-SPT"], children: [
    { name: "Athlètes", href: "/dashboard/acteurs/athletes" }, { name: "Officiels", href: "/dashboard/acteurs/officiels" },
    { name: "Entraîneurs", href: "/dashboard/acteurs/entraineurs" }, { name: "Médecins", href: "/dashboard/acteurs/medecins" },
    { name: "Arbitres", href: "/dashboard/acteurs/arbitres" },
    { name: "Autres", href: "/dashboard/acteurs/autres" },
  ] },
  { name: "Compétitions", href: "/dashboard/competitions", icon: "trophy", blocks: ["AUT-SPT"] },
  { name: "Équipes nationales", href: "/dashboard/equipes-nationales", icon: "shield", blocks: ["AUT-SPT"] },
  { name: "Activités", href: "/dashboard/activites", icon: "calendar", blocks: ["AUT-ADM"] },
  { name: "Documents", href: "/dashboard/documents", icon: "file", blocks: ["AUT-ADM"] },
  { name: "Site web", icon: "globe", blocks: ["AUT-COM"], children: [
    { name: "Sliders", href: "/dashboard/site-web/sliders" },
    { name: "Communiqués", href: "/dashboard/site-web/communiques" },
    { name: "Actualités", href: "/dashboard/site-web/actualites" },
    { name: "Galeries", href: "/dashboard/site-web/galeries" },
    { name: "Historique", href: "/dashboard/site-web/historique" },
    { name: "Gouvernance", href: "/dashboard/site-web/gouvernance" },
    { name: "Jeux", href: "/dashboard/site-web/jeux" },
    { name: "Athlètes", href: "/dashboard/site-web/athletes" },
    { name: "Entités", href: "/dashboard/site-web/entites" },
    { name: "Événements", href: "/dashboard/site-web/evenements" },
    { name: "Documents site web", href: "/dashboard/site-web/documents" },
  ] },
  { name: "Utilisateurs", href: "/dashboard/utilisateurs", icon: "users", blocks: [], superOnly: true },
]

export function visibleDashboardNavigation(
  items: readonly DashboardNavigationItem[],
  access: { isSuperAdmin: boolean; readableBlocks: readonly string[] },
) {
  if (access.isSuperAdmin) return items
  return items.filter((item) => !item.superOnly && item.blocks.some((block) => access.readableBlocks.includes(block)))
}
