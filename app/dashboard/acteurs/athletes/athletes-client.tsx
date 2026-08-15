"use client"

import Link from "next/link"
import { Eye, FileText, ImageIcon, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Header } from "@/components/dashboard/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type AthleteListItem = {
  id: string
  idNational: string
  idFederal: string
  nomComplet: string
  sexe: string
  dateNaissance: string
  federation: string
  statut: string
  avatar: string | null
}

export type FederationOption = {
  id: string
  sigle: string
  nom: string
}

type AthleteForm = {
  id_national: string
  id_athlete_federation: string
  id_federation_internationale: string
  nom_complet: string
  date_de_naissance: string
  lieu_de_naissance: string
  id_federation: string
  id_sexe: string
  statut: string
  telephone: string
  email: string
  adresse: string
  numéro_passeport: string
  date_de_delivrance_passeport: string
  "date_expiration passeport": string
}

const emptyForm: AthleteForm = {
  id_national: "",
  id_athlete_federation: "",
  id_federation_internationale: "",
  nom_complet: "",
  date_de_naissance: "",
  lieu_de_naissance: "",
  id_federation: "",
  id_sexe: "",
  statut: "ACTIF",
  telephone: "",
  email: "",
  adresse: "",
  numéro_passeport: "",
  date_de_delivrance_passeport: "",
  "date_expiration passeport": "",
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function displaySexe(value: string) {
  const normalized = value.trim().toLowerCase()
  if (["m", "h", "homme", "masculin"].includes(normalized)) return "H"
  if (["f", "femme", "féminin", "feminin"].includes(normalized)) return "F"
  return value || "—"
}

export function AthletesClient({
  athletes,
  federations,
}: {
  athletes: AthleteListItem[]
  federations: FederationOption[]
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [editorOpen, setEditorOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<AthleteForm>(emptyForm)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [passportFile, setPassportFile] = useState<File | null>(null)

  const filteredAthletes = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("fr")
    if (!query) return athletes

    return athletes.filter((athlete) =>
      [
        athlete.idNational,
        athlete.idFederal,
        athlete.nomComplet,
        athlete.sexe,
        athlete.dateNaissance,
        athlete.federation,
        athlete.statut,
      ].some((value) => value.toLocaleLowerCase("fr").includes(query))
    )
  }, [athletes, searchQuery])

  function update<K extends keyof AthleteForm>(key: K, value: AthleteForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function closeEditor() {
    setEditorOpen(false)
    setForm(emptyForm)
    setAvatarFile(null)
    setPassportFile(null)
  }

  function selectFile(file: File | undefined, mediaType: "avatar" | "passeport") {
    if (!file) return
    const accepted = mediaType === "avatar"
      ? ["image/png", "image/jpeg", "image/jpg", "image/webp"]
      : ["application/pdf"]
    if (!accepted.includes(file.type)) {
      toast.error(mediaType === "avatar" ? "Utilisez une image PNG, JPG ou WebP." : "Le passeport doit être un PDF.")
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 4 Mo.")
      return
    }
    if (mediaType === "avatar") setAvatarFile(file)
    else setPassportFile(file)
  }

  async function uploadMedia(file: File, mediaType: "avatar" | "passeport", athleteId: string) {
    const data = new FormData()
    data.append("file", file)
    data.append("mediaType", mediaType)
    data.append("actorType", "athletes")
    data.append("actorId", athleteId)
    const response = await fetch("/api/upload-media", { method: "POST", body: data })
    const result = await response.json().catch(() => null)
    if (!response.ok) throw new Error(result?.error || (response.status === 413 ? "Le fichier dépasse 4 Mo." : `Échec de l'envoi du fichier ${mediaType} (${response.status})`))
  }

  async function save() {
    const required: Array<[keyof AthleteForm, string]> = [
      ["nom_complet", "Nom complet"],
      ["id_federation", "Fédération"],
      ["id_sexe", "Sexe"],
    ]
    const missing = required.find(([key]) => !form[key].trim())
    if (missing) {
      toast.error(`Le champ « ${missing[1]} » est obligatoire.`)
      return
    }

    setSaving(true)
    try {
      if (avatarFile || passportFile) {
        const healthResponse = await fetch("/api/upload-media", { cache: "no-store" })
        const health = await healthResponse.json()
        if (!healthResponse.ok) {
          throw new Error(health.error || "Google Drive n'est pas disponible")
        }
      }

      const response = await fetch("/api/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: form }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Création impossible")

      const athleteId = String(result.row?.id_athlete_coc || "")
      const uploads = [
        avatarFile ? uploadMedia(avatarFile, "avatar", athleteId) : null,
        passportFile ? uploadMedia(passportFile, "passeport", athleteId) : null,
      ].filter(Boolean) as Promise<void>[]
      const uploadResults = await Promise.allSettled(uploads)
      const failedUploads = uploadResults.filter((item) => item.status === "rejected")

      if (failedUploads.length) {
        toast.warning(`Athlète créé, mais ${failedUploads.length} fichier(s) n'ont pas pu être envoyé(s).`)
      } else {
        toast.success("Athlète ajouté avec succès.")
      }
      closeEditor()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header title="Athlètes" subtitle="Liste des athlètes enregistrés" />

      <div className="space-y-6 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un athlète..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setEditorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un athlète
          </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>ID national</TableHead>
                    <TableHead>ID fédéral</TableHead>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Sexe</TableHead>
                    <TableHead>Date de naissance</TableHead>
                    <TableHead>Fédération</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAthletes.map((athlete) => (
                    <TableRow key={athlete.id} className="hover:bg-muted/30">
                      <TableCell>{athlete.idNational || "—"}</TableCell>
                      <TableCell>{athlete.idFederal || "—"}</TableCell>
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={athlete.avatar || undefined} alt={athlete.nomComplet} />
                          <AvatarFallback className="bg-primary/10 text-sm text-primary">
                            {initials(athlete.nomComplet)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{athlete.nomComplet || "—"}</TableCell>
                      <TableCell>{displaySexe(athlete.sexe)}</TableCell>
                      <TableCell>{athlete.dateNaissance || "—"}</TableCell>
                      <TableCell>
                        {athlete.federation ? <Badge variant="outline">{athlete.federation}</Badge> : "—"}
                      </TableCell>
                      <TableCell>
                        {athlete.statut ? <Badge variant="secondary">{athlete.statut}</Badge> : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/acteurs/athletes/${athlete.id}`} prefetch={false}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Voir l'athlète">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAthletes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        Aucun athlète trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          Affichage de {filteredAthletes.length} sur {athletes.length} athlètes
        </p>
      </div>

      <Sheet open={editorOpen} onOpenChange={(open) => open ? setEditorOpen(true) : closeEditor()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Ajouter un athlète</SheetTitle>
            <SheetDescription>
              Renseignez l’identité, la fédération et les informations utiles à la fiche détaillée.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 px-4">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Identité</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="nom_complet">Nom complet *</Label>
                  <Input id="nom_complet" value={form.nom_complet} onChange={(event) => update("nom_complet", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_de_naissance">Date de naissance</Label>
                  <Input id="date_de_naissance" type="date" value={form.date_de_naissance} onChange={(event) => update("date_de_naissance", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lieu_de_naissance">Lieu de naissance</Label>
                  <Input id="lieu_de_naissance" value={form.lieu_de_naissance} onChange={(event) => update("lieu_de_naissance", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_sexe">Sexe *</Label>
                  <Select value={form.id_sexe} onValueChange={(value) => update("id_sexe", value)}>
                    <SelectTrigger id="id_sexe"><SelectValue placeholder="Sélectionner le sexe" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Homme</SelectItem>
                      <SelectItem value="F">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_federation">Fédération *</Label>
                  <Select value={form.id_federation} onValueChange={(value) => update("id_federation", value)}>
                    <SelectTrigger id="id_federation"><SelectValue placeholder="Sélectionner la fédération" /></SelectTrigger>
                    <SelectContent>
                      {federations.map((federation) => (
                        <SelectItem key={federation.id} value={federation.id}>
                          {federation.sigle ? `${federation.sigle} — ` : ""}{federation.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select value={form.statut} onValueChange={(value) => update("statut", value)}>
                    <SelectTrigger id="statut"><SelectValue placeholder="Sélectionner le statut" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIF">Actif</SelectItem>
                      <SelectItem value="INACTIF">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Identifiants</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="id_national">ID national</Label>
                  <Input id="id_national" value={form.id_national} onChange={(event) => update("id_national", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_athlete_federation">ID fédéral</Label>
                  <Input id="id_athlete_federation" value={form.id_athlete_federation} onChange={(event) => update("id_athlete_federation", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_federation_internationale">ID international</Label>
                  <Input id="id_federation_internationale" value={form.id_federation_internationale} onChange={(event) => update("id_federation_internationale", event.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Coordonnées</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" type="tel" value={form.telephone} onChange={(event) => update("telephone", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input id="adresse" value={form.adresse} onChange={(event) => update("adresse", event.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Passeport</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="numero_passeport">Numéro</Label>
                  <Input id="numero_passeport" value={form.numéro_passeport} onChange={(event) => update("numéro_passeport", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_delivrance">Délivré le</Label>
                  <Input id="date_delivrance" type="date" value={form.date_de_delivrance_passeport} onChange={(event) => update("date_de_delivrance_passeport", event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_expiration">Expire le</Label>
                  <Input id="date_expiration" type="date" value={form["date_expiration passeport"]} onChange={(event) => update("date_expiration passeport", event.target.value)} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Fichiers</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Les fichiers seront renommés automatiquement avec l’ID COC généré.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <Label htmlFor="avatar_file">Avatar</Label>
                  </div>
                  <Input
                    id="avatar_file"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(event) => selectFile(event.target.files?.[0], "avatar")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {avatarFile ? avatarFile.name : "PNG, JPG ou WebP — 4 Mo maximum"}
                  </p>
                </div>
                <div className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <Label htmlFor="passport_file">Passeport</Label>
                  </div>
                  <Input
                    id="passport_file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event) => selectFile(event.target.files?.[0], "passeport")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {passportFile ? passportFile.name : "PDF — 4 Mo maximum"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={closeEditor}>Annuler</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
