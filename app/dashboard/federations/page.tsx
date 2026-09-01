import { loadFederations } from "@/lib/federations/data"
import FederationsClient from "./federations-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function FederationsPage() {
  let props: React.ComponentProps<typeof FederationsClient>
  try {
    const federations = await loadFederations()
    props = { initialFederations: federations }
  } catch (error) {
    props = { initialFederations: [], loadError: error instanceof Error ? error.message : String(error) }
  }
  return <FederationsClient {...props} />
}
