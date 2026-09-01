import { redirect } from "next/navigation"
import { canAccess } from "@/lib/auth"
import { loadOtherActors } from "@/lib/acteurs/autres-data"
import type { OtherActorFormValue } from "@/components/dashboard/other-actor-form"
import { OtherActorEditor } from "../other-actor-editor"

export const dynamic = "force-dynamic"

export default async function NewOtherActorPage() {
  if (!(await canAccess("AUT-SPT", "WRITE"))) redirect("/dashboard/acteurs/autres")
  const { references } = await loadOtherActors()
  const initialValue: OtherActorFormValue = { id_entite: "", id_autre_acteur_entite: "", id_national: "", id_international: "", nom_complet: "", id_sexe: "", date_de_naissance: "", lieu_de_naissance: "", nationalite: "", type_autre_acteur: "", telephone: "", email: "", adresse: "", numero_passeport: "", date_de_delivrance_passeport: "", date_expiration_passeport: "", statut: "ACTIF", observations: "" }
  return <OtherActorEditor initialValue={initialValue} references={references} />
}
