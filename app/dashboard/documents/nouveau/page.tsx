import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { DocumentForm } from "@/components/dashboard/document-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getDocumentReferences } from "@/lib/documents/data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function NewDocumentPage() {
  const result = await getDocumentReferences().then((references) => ({ references, error: false as const })).catch((error) => { console.error("New document page error", error); return { references: null, error: true as const } })
  if (result.error) return <div className="p-6 text-destructive">Impossible de préparer le formulaire document.</div>
  return <div className="min-h-screen"><Header title="Nouveau document" subtitle="Créer une fiche documentaire" /><main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6"><Button asChild variant="ghost"><Link href="/dashboard/documents"><ArrowLeft className="h-4 w-4" />Retour</Link></Button><Card><CardContent className="p-6"><DocumentForm references={result.references} /></CardContent></Card></main></div>
}
