import { notFound, redirect } from "next/navigation"
import { canAccess } from "@/lib/auth"
import { loadFederationData } from "@/lib/federations/data"
import ParametresClient from "./parametres-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ParametresPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await canAccess("AUT-SPT", "WRITE"))) redirect("/dashboard/federations")
  const id = decodeURIComponent((await params).id)
  const data = await loadFederationData()
  if (!data.federations.some((item) => item.id_federation === id)) notFound()
  return <ParametresClient data={data} federationId={id} />
}
