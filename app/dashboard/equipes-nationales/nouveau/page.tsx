import { redirect } from "next/navigation"
import { canAccess } from "@/lib/auth"
import { getNationalTeamReferences } from "@/lib/equipes-nationales/data"
import NewTeamClient from "./new-team-client"
export const dynamic = "force-dynamic"
export default async function Page() { if (!(await canAccess("AUT-SPT", "WRITE"))) redirect("/dashboard/equipes-nationales"); return <NewTeamClient references={await getNationalTeamReferences()} /> }
