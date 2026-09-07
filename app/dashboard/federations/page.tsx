import { loadFederations } from "@/lib/federations/data"
import { getFederationCreationReferences } from "@/lib/federations/creation"
import { canAccess } from "@/lib/auth"
import FederationsClient from "./federations-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function FederationsPage() {
  let props: React.ComponentProps<typeof FederationsClient>
  try {
    const [federations, references, canWrite] = await Promise.all([loadFederations(), getFederationCreationReferences(), canAccess("AUT-SPT", "WRITE")])
    props = { initialFederations: federations, references, canWrite }
  } catch (error) {
    props = { initialFederations: [], references: { categories: [], sports: [], entities: [] }, canWrite: false, loadError: error instanceof Error ? error.message : String(error) }
  }
  return <FederationsClient {...props} />
}
