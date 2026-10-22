"use client"

import { useCanWrite } from "@/components/dashboard/access-context"

import { apiFetch } from "@/lib/api/client"

import { Contact, Fingerprint, Info, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { ActorInfoCard, ActorPassportCard, ActorRecordLayout } from "@/components/dashboard/actor-record-layout"
import { getAthleteAge } from "@/lib/athletes/presentation"
import { ActorActivities } from "@/components/dashboard/actor-activities"
import { ActorNationalTeams } from "@/components/dashboard/actor-national-teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export type FederationOption = { id: string; sigle: string; nom: string }
export type CoachDetail = { id: string; idFederation: string; idNational: string; idFederal: string; idInternational: string; nomComplet: string; sexe: string; dateNaissance: string; lieuNaissance: string; nationalite: string; federation: string; telephone: string; email: string; adresse: string; observations?: string; statut: "actif" | "inactif"; avatarUrl: string | null; urlPasseport: string | null; numeroPasseport: string; dateDelivrancePasseport: string; dateExpirationPasseport: string }
type Form = { id_coach_federation: string; id_federation: string; id_national: string; id_international: string; nom_complet: string; id_sexe: string; date_de_naissance: string; lieu_de_naissance: string; nationalite: string; telephone: string; email: string; adresse: string; numero_passeport: string; date_de_delivrance_passeport: string; date_expiration_passeport: string; statut: string }
const sexId = (v: string) => ["f", "femme", "féminin", "feminin"].includes(v.toLowerCase()) ? "F" : "M"
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()

export function EntraineurDetailClient({ coach: initial, federations }: { coach: CoachDetail; federations: FederationOption[] }) {
  const canWrite = useCanWrite("AUT-SPT")
  const router = useRouter(); const [coach, setCoach] = useState(initial); const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false); const [avatar, setAvatar] = useState<File | null>(null); const [passport, setPassport] = useState<File | null>(null)
  const [form, setForm] = useState<Form>({ id_coach_federation: initial.idFederal, id_federation: initial.idFederation, id_national: initial.idNational, id_international: initial.idInternational, nom_complet: initial.nomComplet, id_sexe: sexId(initial.sexe), date_de_naissance: initial.dateNaissance, lieu_de_naissance: initial.lieuNaissance, nationalite: initial.nationalite, telephone: initial.telephone, email: initial.email, adresse: initial.adresse, numero_passeport: initial.numeroPasseport, date_de_delivrance_passeport: initial.dateDelivrancePasseport, date_expiration_passeport: initial.dateExpirationPasseport, statut: initial.statut === "inactif" ? "INACTIF" : "ACTIF" })
  function update<K extends keyof Form>(key: K, value: Form[K]) { setForm((f) => ({ ...f, [key]: value })) }
  function pick(file: File | undefined, type: "avatar" | "passeport") { if (!file) return; const ok = type === "avatar" ? ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type) : file.type === "application/pdf"; if (!ok || file.size > 5 * 1024 * 1024) return toast.error("Fichier invalide ou supérieur à 5 Mo."); if (type === "avatar") setAvatar(file); else setPassport(file) }
  async function upload(file: File, type: "avatar" | "passeport") { const data = new FormData(); data.append("file", file); data.append("mediaType", type); data.append("actorType", "entraineurs"); data.append("actorId", coach.id); const res = await apiFetch("/api/upload-media", { method: "POST", body: data }); const result = await res.json(); if (!res.ok) throw new Error(result.error || "Échec du média"); return result as { url: string } }
  async function save() {
    if (!form.nom_complet || !form.id_federation || !form.id_sexe) return toast.error("Nom, fédération et sexe sont obligatoires.")
    setSaving(true); try { const res = await apiFetch("/api/coachs", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: coach.id, row: form }) }); const result = await res.json(); if (!res.ok) throw new Error(result.error || "Modification impossible"); const av = avatar ? await upload(avatar, "avatar") : null; const pp = passport ? await upload(passport, "passeport") : null; const fed = federations.find((f) => f.id === form.id_federation); setCoach((c) => ({ ...c, idFederation: form.id_federation, idNational: form.id_national, idFederal: form.id_coach_federation, idInternational: form.id_international, nomComplet: form.nom_complet, sexe: form.id_sexe === "F" ? "Femme" : "Homme", dateNaissance: form.date_de_naissance, lieuNaissance: form.lieu_de_naissance, nationalite: form.nationalite, federation: fed?.nom || "", telephone: form.telephone, email: form.email, adresse: form.adresse, statut: form.statut === "INACTIF" ? "inactif" : "actif", avatarUrl: av?.url || c.avatarUrl, urlPasseport: pp?.url || c.urlPasseport, numeroPasseport: form.numero_passeport, dateDelivrancePasseport: form.date_de_delivrance_passeport, dateExpirationPasseport: form.date_expiration_passeport })); toast.success("Coach modifié."); setOpen(false); setAvatar(null); setPassport(null); router.refresh() } catch (e) { toast.error(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) }
  }
  const age = getAthleteAge(coach.dateNaissance)
  const identityFields = [
    { label: "Nom", value: coach.nomComplet },
    { label: "Date de naissance", value: coach.dateNaissance },
    { label: "Sexe", value: coach.sexe },
  ]
  return <><ActorRecordLayout
    backHref="/dashboard/acteurs/entraineurs" backLabel="Retour aux entraîneurs"
    title={coach.nomComplet} subtitle={coach.federation || undefined}
    avatarInitials={initials(coach.nomComplet)} avatarUrl={coach.avatarUrl} status={coach.statut}
    onEdit={() => setOpen(true)}
    generalContent={<div className="grid gap-6 md:grid-cols-2">
      <ActorInfoCard title="Identité" icon={User} fields={[
        { label: "Nom complet", value: coach.nomComplet },
        { label: "Sexe", value: coach.sexe },
        { label: "Date de naissance", value: coach.dateNaissance },
        { label: "Âge", value: age === null ? "—" : `${age} ans` },
        { label: "Lieu de naissance", value: coach.lieuNaissance },
        { label: "Nationalité", value: coach.nationalite },
      ]} />
      <ActorInfoCard title="Contact" icon={Contact} fields={[
        { label: "Téléphone", value: coach.telephone },
        { label: "E-mail", value: coach.email },
        { label: "Adresse", value: coach.adresse },
      ]} />
      <ActorInfoCard title="Identifiants" icon={Fingerprint} fields={[
        { label: "ID national", value: coach.idNational },
        { label: "ID fédéral", value: coach.idFederal },
        { label: "ID international", value: coach.idInternational },
        { label: "Fédération", value: coach.federation },
      ]} />
      <ActorInfoCard title="Observations" icon={Info} fields={[{ label: "Remarques", value: coach.observations || "Aucune observation enregistrée." }]} />
    </div>}
    documents={<ActorPassportCard actorType="entraineurs" actorId={coach.id} number={coach.numeroPasseport} issued={coach.dateDelivrancePasseport} expires={coach.dateExpirationPasseport} url={coach.urlPasseport} identityFields={identityFields} onUploaded={(url) => { setCoach(current => ({ ...current, urlPasseport: url })); router.refresh() }} />}
    additionalSections={activitySections(coach.id)}
  />
    <Sheet open={canWrite && open} onOpenChange={setOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>Modifier le coach</SheetTitle><SheetDescription>Les nouveaux médias remplaceront les fichiers Drive existants.</SheetDescription></SheetHeader><div className="grid gap-4 px-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2"><Label>Nom complet *</Label><Input value={form.nom_complet} onChange={(e) => update("nom_complet", e.target.value)} /></div><div className="space-y-2"><Label>Date de naissance</Label><Input type="date" value={form.date_de_naissance} onChange={(e) => update("date_de_naissance", e.target.value)} /></div><div className="space-y-2"><Label>Lieu de naissance</Label><Input value={form.lieu_de_naissance} onChange={(e) => update("lieu_de_naissance", e.target.value)} /></div><div className="space-y-2"><Label>Sexe *</Label><Select value={form.id_sexe} onValueChange={(v) => update("id_sexe", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="M">Homme</SelectItem><SelectItem value="F">Femme</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Fédération *</Label><Select value={form.id_federation} onValueChange={(v) => update("id_federation", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{federations.map((f) => <SelectItem key={f.id} value={f.id}>{f.sigle ? `${f.sigle} — ` : ""}{f.nom}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(e) => update("nationalite", e.target.value)} /></div><div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(v) => update("statut", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>ID national</Label><Input value={form.id_national} onChange={(e) => update("id_national", e.target.value)} /></div><div className="space-y-2"><Label>ID fédéral</Label><Input value={form.id_coach_federation} onChange={(e) => update("id_coach_federation", e.target.value)} /></div><div className="space-y-2"><Label>ID international</Label><Input value={form.id_international} onChange={(e) => update("id_international", e.target.value)} /></div><div className="space-y-2"><Label>Téléphone</Label><Input value={form.telephone} onChange={(e) => update("telephone", e.target.value)} /></div><div className="space-y-2"><Label>E-mail</Label><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => update("adresse", e.target.value)} /></div><div className="space-y-2"><Label>N° passeport</Label><Input value={form.numero_passeport} onChange={(e) => update("numero_passeport", e.target.value)} /></div><div className="space-y-2"><Label>Délivré le</Label><Input type="date" value={form.date_de_delivrance_passeport} onChange={(e) => update("date_de_delivrance_passeport", e.target.value)} /></div><div className="space-y-2"><Label>Expiration passeport</Label><Input type="date" value={form.date_expiration_passeport} onChange={(e) => update("date_expiration_passeport", e.target.value)} /></div><div className="space-y-2"><Label htmlFor="coach-avatar-file">{coach.avatarUrl ? "Remplacer la photo" : "Ajouter une photo"}</Label><Input id="coach-avatar-file" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => pick(e.target.files?.[0], "avatar")} /></div><div className="space-y-2"><Label>Remplacer le passeport</Label><Input type="file" accept=".pdf,application/pdf" onChange={(e) => pick(e.target.files?.[0], "passeport")} /></div>
    </div><SheetFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button disabled={saving} onClick={save}>{saving ? "Enregistrement..." : "Enregistrer"}</Button></SheetFooter></SheetContent></Sheet></>
}

const activitySections = (actorId: string) => [
  { id: "equipes-nationales", label: "Équipes nationales", content: <ActorNationalTeams actorId={actorId} /> },
  { id: "activites", label: "Activités", content: <ActorActivities actorId={actorId} /> },
]
