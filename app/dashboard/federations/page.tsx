import { loadFederationData } from "@/lib/federations/data"
import { getSession } from "@/lib/auth"
import FederationsClient from "./federations-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default async function FederationsPage() {
  let props: React.ComponentProps<typeof FederationsClient>
  try {
    const data = await loadFederationData()
    const session = await getSession()
    props = { initialData: data, canConfigure: session?.role === "coc" }
  } catch (error) {
    props = {
      initialData: { federations: [], typesStructure: [], provinces: [], villes: [], categoriesClub: [], ligues: [], ententes: [], clubs: [], hierarchie: [] },
      loadError: error instanceof Error ? error.message : String(error),
    }
  }
  return <FederationsClient {...props} />
}
