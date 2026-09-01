"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Header } from "@/components/dashboard/header"
import { OtherActorForm, type OtherActorFormValue } from "@/components/dashboard/other-actor-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { OtherActorReferences } from "@/lib/acteurs/autres-model"

export function OtherActorEditor({ initialValue, references, actorId }: { initialValue: OtherActorFormValue; references: OtherActorReferences; actorId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const editing = Boolean(actorId)

  async function save() {
    if (!form.nom_complet.trim()) {
      toast.error("Le nom complet est obligatoire.")
      return
    }
    setSaving(true)
    try {
      const response = await fetch("/api/autres", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: actorId, row: form }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Enregistrement impossible.")
      const savedId = actorId || result.row?.id_autre_acteur_coc
      toast.success(editing ? "Acteur modifié." : "Autre acteur ajouté.")
      router.push(`/dashboard/acteurs/autres/${encodeURIComponent(savedId)}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  return <div className="min-h-screen min-w-0 overflow-x-hidden"><Header title={editing ? "Modifier un autre acteur" : "Ajouter un autre acteur"} subtitle="Identité, fonction et rattachement institutionnel" /><main className="p-4 md:p-6"><Card className="mx-auto max-w-4xl"><CardHeader><CardTitle>{editing ? "Informations modifiables" : "Nouvelle fiche"}</CardTitle></CardHeader><CardContent><OtherActorForm value={form} onChange={setForm} references={references} /></CardContent><CardFooter className="justify-end gap-2"><Button variant="outline" onClick={() => router.back()}>Annuler</Button><Button disabled={saving} onClick={save}>{saving ? "Enregistrement…" : "Enregistrer"}</Button></CardFooter></Card></main></div>
}
