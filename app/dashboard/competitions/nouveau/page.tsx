"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { CompetitionForm, emptyCompetitionForm } from "@/components/dashboard/competition-form"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CompetitionOption } from "@/lib/competitions/types"

export default function NouvelleCompetitionPage() {
  const router = useRouter(); const [form, setForm] = useState(emptyCompetitionForm); const [types, setTypes] = useState<CompetitionOption[]>([]); const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true)
  useEffect(() => { fetch("/api/competitions").then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setTypes(result.references.types) }).catch((error) => toast.error(error instanceof Error ? error.message : String(error))).finally(() => setLoading(false)) }, [])
  async function save() { setSaving(true); try { const response = await fetch("/api/competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ row: form }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); toast.success("Compétition créée."); router.push(`/dashboard/competitions/${result.row.id_competition}`) } catch (error) { toast.error(error instanceof Error ? error.message : String(error)) } finally { setSaving(false) } }
  return <div className="min-h-screen"><Header title="Nouvelle compétition" subtitle="Enregistrer un événement sportif suivi par le COC" /><main className="p-4 md:p-6"><div className="mx-auto max-w-3xl space-y-4"><Button asChild variant="ghost"><Link href="/dashboard/competitions"><ArrowLeft className="mr-2 h-4 w-4" />Retour à la liste</Link></Button><Card><CardHeader><CardTitle>Informations de la compétition</CardTitle></CardHeader><CardContent>{loading ? <p className="text-sm text-muted-foreground">Chargement du référentiel…</p> : <CompetitionForm value={form} onChange={setForm} types={types} saving={saving} onSubmit={save} onCancel={() => router.push("/dashboard/competitions")} />}</CardContent></Card></div></main></div>
}
