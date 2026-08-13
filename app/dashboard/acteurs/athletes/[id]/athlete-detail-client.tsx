"use client"

import { Mail, MapPin, Medal, Pencil, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { ActorActivities } from "@/components/dashboard/actor-activities"
import { ActorNationalTeams } from "@/components/dashboard/actor-national-teams"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { FederationOption } from "../athletes-client"

export type AthleteDetail = {
  id: string
  idFederation: string
  idNational: string
  idFederal: string
  idInternational: string
  nomComplet: string
  sexe: string
  dateNaissance: string
  lieuNaissance: string
  federation: string
  telephone: string
  email: string
  adresse: string
  statut?: "actif" | "inactif"
  avatarUrl: string | null
  urlPasseport: string | null
  numeroPasseport: string
  dateDelivrancePasseport: string
  dateExpirationPasseport: string
}
type EditForm = {
  id_national: string
  id_athlete_federation: string
  id_federation_internationale: string
  nom_complet: string
  date_de_naissance: string
  lieu_de_naissance: string
  id_federation: string
  id_sexe: string
  telephone: string
  email: string
  adresse: string
  numéro_passeport: string
  date_de_delivrance_passeport: string
  "date_expiration passeport": string
  statut: string
}

function sexId(value: string) {
  return ["f", "femme", "féminin", "feminin"].includes(value.trim().toLowerCase()) ? "F" : "M"
}

function getAgeFromDateString(dateString: string) {
  if (!dateString) return null
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const frenchMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  const parts = isoMatch
    ? [Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3])]
    : frenchMatch
      ? [Number(frenchMatch[3]), Number(frenchMatch[2]), Number(frenchMatch[1])]
      : null
  if (!parts) return null
  const birthDate = new Date(parts[0], parts[1] - 1, parts[2])
  if (Number.isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) age -= 1
  return age
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase()
}

export function AthleteDetailClient({
  athlete: initialAthlete,
  federations,
}: {
  athlete: AthleteDetail
  federations: FederationOption[]
}) {
  const router = useRouter()
  const [athlete, setAthlete] = useState(initialAthlete)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [form, setForm] = useState<EditForm>({
    id_national: athlete.idNational,
    id_athlete_federation: athlete.idFederal,
    id_federation_internationale: athlete.idInternational,
    nom_complet: athlete.nomComplet,
    date_de_naissance: athlete.dateNaissance,
    lieu_de_naissance: athlete.lieuNaissance,
    id_federation: athlete.idFederation,
    id_sexe: sexId(athlete.sexe),
    telephone: athlete.telephone,
    email: athlete.email,
    adresse: athlete.adresse,
    numéro_passeport: athlete.numeroPasseport,
    date_de_delivrance_passeport: athlete.dateDelivrancePasseport,
    "date_expiration passeport": athlete.dateExpirationPasseport,
    statut: athlete.statut === "inactif" ? "INACTIF" : "ACTIF",
  })

  const age = getAgeFromDateString(athlete.dateNaissance)
  const mainInfo = [
    { label: "ID national", value: athlete.idNational || "—" },
    { label: "ID fédéral", value: athlete.idFederal || "—" },
    { label: "ID international", value: athlete.idInternational || "—" },
    { label: "Nom complet", value: athlete.nomComplet || "—" },
    { label: "Sexe", value: sexId(athlete.sexe) === "F" ? "Femme" : "Homme" },
    { label: "Date de naissance", value: athlete.dateNaissance ? `${athlete.dateNaissance}${age === null ? "" : ` (${age} ans)`}` : "—" },
    { label: "Lieu de naissance", value: athlete.lieuNaissance || "—" },
    { label: "Fédération", value: athlete.federation ? <Badge variant="outline">{athlete.federation}</Badge> : "—" },
  ]
  const contactInfo = [
    athlete.telephone ? { label: "Téléphone", value: athlete.telephone, icon: <Phone className="h-4 w-4" /> } : null,
    athlete.email ? { label: "E-mail", value: athlete.email, icon: <Mail className="h-4 w-4" /> } : null,
    athlete.adresse ? { label: "Adresse", value: athlete.adresse, icon: <MapPin className="h-4 w-4" /> } : null,
  ].filter(Boolean) as { label: string; value: string; icon: React.JSX.Element }[]

  function update(key: keyof EditForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function selectFile(file: File | undefined, type: "avatar" | "passeport") {
    if (!file) return
    const accepted = type === "avatar"
      ? ["image/png", "image/jpeg", "image/jpg", "image/webp"]
      : ["application/pdf"]
    if (!accepted.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error(type === "avatar" ? "Avatar invalide ou supérieur à 5 Mo." : "Passeport PDF invalide ou supérieur à 5 Mo.")
      return
    }
    if (type === "avatar") setAvatarFile(file)
    else setPassportFile(file)
  }

  async function upload(file: File, mediaType: "avatar" | "passeport") {
    const data = new FormData()
    data.append("file", file)
    data.append("mediaType", mediaType)
    data.append("actorType", "athletes")
    data.append("actorId", athlete.id)
    const response = await fetch("/api/upload-media", { method: "POST", body: data })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error || "Échec du média")
    return result as { fileId: string; url: string }
  }

  async function save() {
    if (!form.nom_complet || !form.id_federation || !form.id_sexe) {
      toast.error("Nom, fédération et sexe sont obligatoires.")
      return
    }
    setSaving(true)
    try {
      if (avatarFile || passportFile) {
        const healthResponse = await fetch("/api/upload-media", { cache: "no-store" })
        const health = await healthResponse.json()
        if (!healthResponse.ok) throw new Error(health.error || "Google Drive indisponible")
      }
      const response = await fetch("/api/athletes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: athlete.id, row: form }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Modification impossible")

      const avatarResult = avatarFile ? await upload(avatarFile, "avatar") : null
      const passportResult = passportFile ? await upload(passportFile, "passeport") : null
      const selectedFederation = federations.find((item) => item.id === form.id_federation)

      setAthlete((current) => ({
        ...current,
        idFederation: form.id_federation,
        idNational: form.id_national,
        idFederal: form.id_athlete_federation,
        idInternational: form.id_federation_internationale,
        nomComplet: form.nom_complet,
        sexe: form.id_sexe === "F" ? "Femme" : "Homme",
        dateNaissance: form.date_de_naissance,
        lieuNaissance: form.lieu_de_naissance,
        federation: selectedFederation?.sigle || "",
        telephone: form.telephone,
        email: form.email,
        adresse: form.adresse,
        statut: form.statut === "INACTIF" ? "inactif" : "actif",
        avatarUrl: avatarResult?.url || current.avatarUrl,
        urlPasseport: passportResult?.url || current.urlPasseport,
        numeroPasseport: form.numéro_passeport,
        dateDelivrancePasseport: form.date_de_delivrance_passeport,
        dateExpirationPasseport: form["date_expiration passeport"],
      }))

      toast.success("Profil de l’athlète modifié.")
      setOpen(false)
      setAvatarFile(null)
      setPassportFile(null)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ActorDetailLayout
        backHref="/dashboard/acteurs/athletes"
        backLabel="Retour aux athlètes"
        title={athlete.nomComplet}
        subtitle={athlete.federation || undefined}
        avatarInitials={initials(athlete.nomComplet)}
        avatarColorClass="bg-primary/10 text-primary"
        avatarUrl={athlete.avatarUrl}
        urlPasseport={athlete.urlPasseport}
        passportInfo={[
          { label: "N° Passeport", value: athlete.numeroPasseport || "—" },
          { label: "Délivré le", value: athlete.dateDelivrancePasseport || "—" },
          { label: "Expire le", value: athlete.dateExpirationPasseport || "—" },
        ]}
        actorType="athletes"
        actorId={athlete.id}
        showActorId={false}
        actorDateNaissance={athlete.dateNaissance}
        actorSexe={athlete.sexe}
        status={athlete.statut}
        mainInfo={mainInfo}
        contactInfo={contactInfo}
        additionalSections={[
          { id: "equipes-nationales", label: "Équipes nationales", content: <ActorNationalTeams actorId={athlete.id} /> },
          {
            id: "selections",
            label: "Sélections",
            content: (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
                <Medal className="mb-4 h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">Sélections</h3>
                <p className="mt-1 text-sm text-muted-foreground">Bientôt disponible</p>
              </div>
            ),
          },
          {
            id: "activites",
            label: "Activités",
            content: <ActorActivities actorId={athlete.id} />,
          },
        ]}
        profileActions={<Button onClick={() => setOpen(true)}><Pencil className="mr-2 h-4 w-4" />Modifier</Button>}
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Modifier l’athlète</SheetTitle>
            <SheetDescription>Les nouveaux médias remplaceront les fichiers Drive existants.</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 px-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Nom complet *</Label><Input value={form.nom_complet} onChange={(e) => update("nom_complet", e.target.value)} /></div>
            <div className="space-y-2"><Label>Date de naissance</Label><Input type="date" value={form.date_de_naissance} onChange={(e) => update("date_de_naissance", e.target.value)} /></div>
            <div className="space-y-2"><Label>Lieu de naissance</Label><Input value={form.lieu_de_naissance} onChange={(e) => update("lieu_de_naissance", e.target.value)} /></div>
            <div className="space-y-2"><Label>Sexe *</Label><Select value={form.id_sexe} onValueChange={(v) => update("id_sexe", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="M">Homme</SelectItem><SelectItem value="F">Femme</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Fédération *</Label><Select value={form.id_federation} onValueChange={(v) => update("id_federation", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{federations.map((f) => <SelectItem key={f.id} value={f.id}>{f.sigle ? `${f.sigle} — ` : ""}{f.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(v) => update("statut", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>ID national</Label><Input value={form.id_national} onChange={(e) => update("id_national", e.target.value)} /></div>
            <div className="space-y-2"><Label>ID fédéral</Label><Input value={form.id_athlete_federation} onChange={(e) => update("id_athlete_federation", e.target.value)} /></div>
            <div className="space-y-2"><Label>ID international</Label><Input value={form.id_federation_internationale} onChange={(e) => update("id_federation_internationale", e.target.value)} /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input value={form.telephone} onChange={(e) => update("telephone", e.target.value)} /></div>
            <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => update("adresse", e.target.value)} /></div>
            <div className="space-y-2"><Label>N° passeport</Label><Input value={form.numéro_passeport} onChange={(e) => update("numéro_passeport", e.target.value)} /></div>
            <div className="space-y-2"><Label>Délivré le</Label><Input type="date" value={form.date_de_delivrance_passeport} onChange={(e) => update("date_de_delivrance_passeport", e.target.value)} /></div>
            <div className="space-y-2"><Label>Expire le</Label><Input type="date" value={form["date_expiration passeport"]} onChange={(e) => update("date_expiration passeport", e.target.value)} /></div>
            <div className="space-y-2"><Label>Remplacer l’avatar</Label><Input type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(e) => selectFile(e.target.files?.[0], "avatar")} /></div>
            <div className="space-y-2"><Label>Remplacer le passeport</Label><Input type="file" accept=".pdf,application/pdf" onChange={(e) => selectFile(e.target.files?.[0], "passeport")} /></div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
