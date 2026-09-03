import { redirect } from "next/navigation"
import { canAccess } from "@/lib/auth"
import { loadOtherActors } from "@/lib/acteurs/autres-data"
import AutresClient from "./autres-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AutresPage() {
  if (!(await canAccess("AUT-SPT", "READ"))) redirect("/dashboard")
  const canWrite = await canAccess("AUT-SPT", "WRITE")
  let props: React.ComponentProps<typeof AutresClient>
  try { const data = await loadOtherActors(); props = { ...data, canWrite } }
  catch (error) { console.error("Chargement de la feuille AUTRES impossible.", error); props = { actors: [], references: { entities: [], federations: [], functions: [], sexes: [], statuses: ["ACTIF", "INACTIF"] }, canWrite, loadError: true } }
  return <AutresClient {...props} />
}
