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
import type { EntityOption, SpecialtyOption } from "../medecins-client"
export type MedecinDetail = { id: string; idFederation: string; idNational: string; idFederal: string; idInternational: string; nomComplet: string; sexe: string; dateNaissance: string; lieuNaissance: string; nationalite: string; federation: string; idSpecialite: string; specialite: string; telephone: string; email: string; adresse: string; observations?: string; numeroPasseport: string; dateDelivrancePasseport: string; dateExpirationPasseport: string; statut: "actif" | "inactif"; avatarUrl: string | null; urlPasseport: string | null }
type Form = { id_medecin_entite: string; id_entite: string; id_national: string; id_international: string; nom_complet: string; id_sexe: string; date_de_naissance: string; lieu_de_naissance: string; nationalite: string; telephone: string; email: string; adresse: string; id_specialite: string; numero_passeport: string; date_de_delivrance_passeport: string; date_expiration_passeport: string; statut: string }
const sexId = (v: string) => ["f", "femme", "féminin", "feminin"].includes(v.toLowerCase()) ? "F" : "M"; const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()
export function MedecinDetailClient({ medecin: initial, organisations, specialites }: { medecin: MedecinDetail; organisations: EntityOption[]; specialites: SpecialtyOption[] }) {
 const canWrite = useCanWrite("AUT-SPT")
 const router = useRouter(); const [medecin, setMedecin] = useState(initial); const [open, setOpen] = useState(false); const [saving, setSaving] = useState(false); const [avatar, setAvatar] = useState<File | null>(null); const [passport, setPassport] = useState<File | null>(null); const [form, setForm] = useState<Form>({ id_medecin_entite: initial.idFederal, id_entite: initial.idFederation, id_national: initial.idNational, id_international: initial.idInternational, nom_complet: initial.nomComplet, id_sexe: sexId(initial.sexe), date_de_naissance: initial.dateNaissance, lieu_de_naissance: initial.lieuNaissance, nationalite: initial.nationalite, telephone: initial.telephone, email: initial.email, adresse: initial.adresse, id_specialite: initial.idSpecialite, numero_passeport: initial.numeroPasseport, date_de_delivrance_passeport: initial.dateDelivrancePasseport, date_expiration_passeport: initial.dateExpirationPasseport, statut: initial.statut === "inactif" ? "INACTIF" : "ACTIF" })
 function update<K extends keyof Form>(k: K, v: Form[K]) { setForm((f) => ({ ...f, [k]: v })) }
 function pick(file: File | undefined, type: "avatar" | "passeport") { if (!file) return; const ok = type === "avatar" ? ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type) : file.type === "application/pdf"; if (!ok || file.size > 5 * 1024 * 1024) return toast.error("Fichier invalide ou supérieur à 5 Mo."); if (type === "avatar") setAvatar(file); else setPassport(file) }
 async function upload(file: File, type: "avatar" | "passeport") { const data = new FormData(); data.append("file", file); data.append("mediaType", type); data.append("actorType", "medecins"); data.append("actorId", medecin.id); const res = await apiFetch("/api/upload-media", { method: "POST", body: data }); const out = await res.json(); if (!res.ok) throw new Error(out.error || "Échec du média"); return out as { url: string } }
 async function save() { if (!form.nom_complet || !form.id_entite || !form.id_sexe) return toast.error("Nom, organisation et sexe sont obligatoires."); setSaving(true); try { const res = await apiFetch("/api/medecins", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: medecin.id, row: form }) }); const out = await res.json(); if (!res.ok) throw new Error(out.error || "Modification impossible"); const av = avatar ? await upload(avatar, "avatar") : null; const pp = passport ? await upload(passport, "passeport") : null; const entity = organisations.find((item) => item.id === form.id_entite); const specialty = specialites.find((item) => item.id === form.id_specialite); setMedecin((m) => ({ ...m, idFederation: form.id_entite, idNational: form.id_national, idFederal: form.id_medecin_entite, idInternational: form.id_international, nomComplet: form.nom_complet, sexe: form.id_sexe === "F" ? "Femme" : "Homme", dateNaissance: form.date_de_naissance, lieuNaissance: form.lieu_de_naissance, nationalite: form.nationalite, federation: entity?.nom || "", idSpecialite: form.id_specialite, specialite: specialty?.nom || "", telephone: form.telephone, email: form.email, adresse: form.adresse, numeroPasseport: form.numero_passeport, dateDelivrancePasseport: form.date_de_delivrance_passeport, dateExpirationPasseport: form.date_expiration_passeport, statut: form.statut === "INACTIF" ? "inactif" : "actif", avatarUrl: av?.url || m.avatarUrl, urlPasseport: pp?.url || m.urlPasseport })); toast.success("Médecin modifié."); setOpen(false); setAvatar(null); setPassport(null); router.refresh() } catch (e) { toast.error(e instanceof Error ? e.message : String(e)) } finally { setSaving(false) } }
  const age = getAthleteAge(medecin.dateNaissance)
  const identityFields = [
    { label: "Nom", value: medecin.nomComplet },
    { label: "Date de naissance", value: medecin.dateNaissance },
    { label: "Sexe", value: medecin.sexe },
  ]
  return <><ActorRecordLayout
    backHref="/dashboard/acteurs/medecins" backLabel="Retour aux médecins"
    title={medecin.nomComplet} subtitle={medecin.federation || undefined}
    avatarInitials={initials(medecin.nomComplet)} avatarUrl={medecin.avatarUrl} status={medecin.statut}
    onEdit={() => setOpen(true)}
    generalContent={<div className="grid gap-6 md:grid-cols-2">
      <ActorInfoCard title="Identité" icon={User} fields={[
        { label: "Nom complet", value: medecin.nomComplet },
        { label: "Sexe", value: medecin.sexe },
        { label: "Date de naissance", value: medecin.dateNaissance },
        { label: "Âge", value: age === null ? "—" : `${age} ans` },
        { label: "Lieu de naissance", value: medecin.lieuNaissance },
        { label: "Nationalité", value: medecin.nationalite },
        { label: "Spécialité", value: medecin.specialite },
      ]} />
      <ActorInfoCard title="Contact" icon={Contact} fields={[
        { label: "Téléphone", value: medecin.telephone },
        { label: "E-mail", value: medecin.email },
        { label: "Adresse", value: medecin.adresse },
      ]} />
      <ActorInfoCard title="Identifiants" icon={Fingerprint} fields={[
        { label: "ID national", value: medecin.idNational },
        { label: "ID organisation", value: medecin.idFederal },
        { label: "ID international", value: medecin.idInternational },
        { label: "Organisation", value: medecin.federation },
      ]} />
      <ActorInfoCard title="Observations" icon={Info} fields={[{ label: "Remarques", value: medecin.observations || "Aucune observation enregistrée." }]} />
    </div>}
    documents={<ActorPassportCard actorType="medecins" actorId={medecin.id} number={medecin.numeroPasseport} issued={medecin.dateDelivrancePasseport} expires={medecin.dateExpirationPasseport} url={medecin.urlPasseport} identityFields={identityFields} onUploaded={(url) => { setMedecin(current => ({ ...current, urlPasseport: url })); router.refresh() }} />}
    additionalSections={activitySections(medecin.id)}
  />
    <Sheet open={canWrite && open} onOpenChange={setOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>Modifier le médecin</SheetTitle><SheetDescription>Les nouveaux médias remplaceront les fichiers Drive existants.</SheetDescription></SheetHeader><div className="grid gap-4 px-4 sm:grid-cols-2">
 <div className="space-y-2 sm:col-span-2"><Label>Nom complet *</Label><Input value={form.nom_complet} onChange={(e) => update("nom_complet", e.target.value)} /></div><div className="space-y-2"><Label>Date de naissance</Label><Input type="date" value={form.date_de_naissance} onChange={(e) => update("date_de_naissance", e.target.value)} /></div><div className="space-y-2"><Label>Lieu de naissance</Label><Input value={form.lieu_de_naissance} onChange={(e) => update("lieu_de_naissance", e.target.value)} /></div><div className="space-y-2"><Label>Sexe *</Label><Select value={form.id_sexe} onValueChange={(v) => update("id_sexe", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="M">Homme</SelectItem><SelectItem value="F">Femme</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Organisation *</Label><Select value={form.id_entite} onValueChange={(v) => update("id_entite", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{organisations.map((item) => <SelectItem key={item.id} value={item.id}>{item.sigle ? `${item.sigle} — ` : ""}{item.nom}</SelectItem>)}</SelectContent></Select></div>
 <div className="space-y-2"><Label>Spécialité</Label><Select value={form.id_specialite} onValueChange={(v) => update("id_specialite", v)}><SelectTrigger><SelectValue placeholder="Sélectionner une spécialité" /></SelectTrigger><SelectContent>{specialites.map((item) => <SelectItem key={item.id} value={item.id}>{item.nom}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(e) => update("nationalite", e.target.value)} /></div><div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(v) => update("statut", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>ID national</Label><Input value={form.id_national} onChange={(e) => update("id_national", e.target.value)} /></div><div className="space-y-2"><Label>ID dans l’organisation</Label><Input value={form.id_medecin_entite} onChange={(e) => update("id_medecin_entite", e.target.value)} /></div><div className="space-y-2"><Label>ID international</Label><Input value={form.id_international} onChange={(e) => update("id_international", e.target.value)} /></div><div className="space-y-2"><Label>Téléphone</Label><Input value={form.telephone} onChange={(e) => update("telephone", e.target.value)} /></div><div className="space-y-2"><Label>E-mail</Label><Input value={form.email} onChange={(e) => update("email", e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => update("adresse", e.target.value)} /></div><div className="space-y-2"><Label>N° passeport</Label><Input value={form.numero_passeport} onChange={(e) => update("numero_passeport", e.target.value)} /></div><div className="space-y-2"><Label>Délivré le</Label><Input type="date" value={form.date_de_delivrance_passeport} onChange={(e) => update("date_de_delivrance_passeport", e.target.value)} /></div><div className="space-y-2"><Label>Expiration passeport</Label><Input type="date" value={form.date_expiration_passeport} onChange={(e) => update("date_expiration_passeport", e.target.value)} /></div><div className="space-y-2"><Label>Remplacer l’avatar</Label><Input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => pick(e.target.files?.[0], "avatar")} /></div><div className="space-y-2"><Label>Remplacer le passeport</Label><Input type="file" accept=".pdf,application/pdf" onChange={(e) => pick(e.target.files?.[0], "passeport")} /></div>
 </div><SheetFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button disabled={saving} onClick={save}>{saving ? "Enregistrement..." : "Enregistrer"}</Button></SheetFooter></SheetContent></Sheet></>
}

const activitySections = (actorId: string) => [
 { id: "equipes-nationales", label: "Équipes nationales", content: <ActorNationalTeams actorId={actorId} /> },
 { id: "activites", label: "Activités", content: <ActorActivities actorId={actorId} /> },
]
