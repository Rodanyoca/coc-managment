import { canAccess } from "@/lib/auth"
import { getNationalTeamMembers, getNationalTeamReferences, getNationalTeams } from "@/lib/equipes-nationales/data"
import Client from "./teams-client"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export default async function Page() { const canEdit = await canAccess("AUT-SPT", "WRITE"); let props: React.ComponentProps<typeof Client>; try { const [teams, members, references] = await Promise.all([getNationalTeams(), getNationalTeamMembers(), getNationalTeamReferences()]); props = { teams, members, references, canEdit } } catch (error) { console.error(error); props = { teams: [], members: [], references: { federations: [], sports: [], disciplines: [], ageCategories: [], sexes: [], roles: [], ageCategoriesAvailable: false, rolesReferentialAvailable: false }, canEdit: false, loadError: "Impossible de charger les équipes nationales." } } return <Client {...props} /> }
