"use client"

import { useRef, useState } from "react"
import { ArrowLeft, KeyRound, LogOut, Pencil, Plus, ShieldCheck, Trash2, UserRound } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { Header } from "@/components/dashboard/header"
import { DetailCard } from "@/components/dashboard/detail-card"
import { AccountAction, UserProfile, UserStatus } from "@/components/dashboard/user-account-ui"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { UserAuthorization, UserStatus as Status, UserType } from "@/lib/users/types"

type User = { id: string; nomComplet: string; email: string; typeUser: UserType; statut: Status; estSuperAdmin: boolean; doitChangerMotDePasse: boolean; dateCreation: string; derniereConnexion: string | null }
type Result = { ok?: boolean; error?: string; alreadyProcessed?: boolean; temporaryAccess?: string; authorization?: UserAuthorization }
const blocks = { "AUT-ADM": "Administration", "AUT-SPT": "Gestion sportive", "AUT-COM": "Communication" }
const dateFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Kinshasa", dateStyle: "medium" })
const instantFormat = new Intl.DateTimeFormat("fr-FR", { timeZone: "Africa/Kinshasa", dateStyle: "medium", timeStyle: "short" })
function date(value: string | null, instant = false) {
  if (!value) return "Non renseigné"
  const parsed = new Date(instant ? value : `${value}T12:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? "Non renseigné" : (instant ? instantFormat : dateFormat).format(parsed)
}

export default function UserDetailClient({ initial, initialAuthorizations, today }: { initial: User; initialAuthorizations: UserAuthorization[]; today: string }) {
  const [user, setUser] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [authorizations, setAuthorizations] = useState(initialAuthorizations)
  const [editing, setEditing] = useState(false)
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [block, setBlock] = useState("AUT-ADM")
  const [authorizationStart, setAuthorizationStart] = useState("")
  const [authorizationEnd, setAuthorizationEnd] = useState("")

  async function execute(path: string, method: string, body: Record<string, unknown>, success: string, update?: (result: Result) => void) {
    if (busy.current) return
    busy.current = true; setPending(true); setFeedback(null)
    try {
      const response = await apiFetch(`/api/users/${encodeURIComponent(user.id)}${path}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: crypto.randomUUID(), ...body }) })
      const result: Result = await response.json()
      if (!response.ok) throw new Error(result.error || "L’opération n’a pas pu être confirmée.")
      // An idempotent replay must not invent a new temporary secret or local state.
      if (result.alreadyProcessed) { setFeedback({ text: "Requête déjà traitée. Rechargez la fiche pour retrouver son état actuel.", error: false }); return }
      if (result.ok !== true || (path === "/authorizations" && !result.authorization)) throw new Error("Opération non confirmée. Rechargez la fiche avant de réessayer.")
      update?.(result)
      if (result.temporaryAccess) setSecret(result.temporaryAccess)
      setFeedback({ text: success, error: false })
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : "Impossible de confirmer l’opération. Rechargez la fiche avant de réessayer.", error: true })
    } finally { busy.current = false; setPending(false) }
  }
  async function patchUser(form: FormData) {
    if (!confirm("Cette modification peut révoquer les sessions. Continuer ?")) return
    const patch = { nomComplet: String(form.get("nomComplet") || ""), email: String(form.get("email") || ""), typeUser: draft.typeUser, statut: draft.statut, estSuperAdmin: draft.estSuperAdmin }
    await execute("", "PATCH", { patch }, "Compte mis à jour.", result => {
      setUser(current => ({ ...current, ...patch, doitChangerMotDePasse: current.doitChangerMotDePasse || Boolean(result.temporaryAccess) }))
      setEditing(false)
    })
  }
  async function addAuthorization(form: FormData) {
    await execute("/authorizations", "POST", { block, dateDebut: form.get("dateDebut"), dateFin: form.get("dateFin") }, "Autorisation attribuée.", result => {
      const authorization = result.authorization
      if (authorization) {
        setAuthorizations(current => [...current, authorization])
        setAuthorizationStart(""); setAuthorizationEnd("")
      }
    })
  }
  function closeAuthorization(id: string) {
    if (!confirm("Retirer cette autorisation ?")) return
    void execute("/authorizations", "DELETE", { id }, "Autorisation retirée.", result => {
      const authorization = result.authorization
      if (authorization) setAuthorizations(current => current.map(item => item.idUserAutorisation === id ? authorization : item))
    })
  }
  const initials = user.nomComplet.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase()
  return <TooltipProvider><div className="min-h-screen min-w-0"><Header title={user.nomComplet} subtitle="Compte utilisateur" />
    <div className="space-y-6 p-4 sm:p-6" aria-busy={pending}>
      <div className="flex flex-wrap items-center justify-between gap-3"><AccountAction icon={ArrowLeft} label="Retour aux utilisateurs" href="/dashboard/utilisateurs" />
        <div className="flex flex-wrap items-center gap-2">
          <AccountAction icon={Pencil} label="Modifier le compte" disabled={pending} onClick={() => { setDraft(user); setFeedback(null); setEditing(true) }} />
          <AccountAction icon={KeyRound} label="Réinitialiser l’accès" disabled={pending} onClick={() => { if (confirm("Réinitialiser l’accès et révoquer toutes les sessions ?")) void execute("/reset-access", "POST", {}, "Accès réinitialisé.", () => setUser(current => ({ ...current, doitChangerMotDePasse: true }))) }} />
          <AccountAction icon={LogOut} label="Révoquer toutes les sessions" disabled={pending} destructive onClick={() => { if (confirm("Déconnecter toutes les sessions de ce compte ?")) void execute("/revoke-sessions", "POST", {}, "Toutes les sessions sont révoquées.") }} />
        </div>
      </div>
      {feedback && !editing && <p role={feedback.error ? "alert" : "status"} className={`rounded-lg border p-3 text-sm ${feedback.error ? "border-destructive/50 text-destructive" : "border-border text-foreground"}`}>{feedback.text}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"><Card><CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-start">
        <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">{initials}</AvatarFallback></Avatar>
        <div className="min-w-0 space-y-2"><h2 className="break-words text-lg font-semibold">{user.nomComplet}</h2><p className="break-all text-sm text-muted-foreground">{user.email}</p><div className="flex flex-wrap items-center gap-2"><UserProfile type={user.typeUser} superAdmin={user.estSuperAdmin} /><UserStatus status={user.statut} /></div></div>
      </CardContent></Card>
      <DetailCard title="Informations du compte" icon={UserRound} fields={[
        { label: "Nom complet", value: user.nomComplet }, { label: "E-mail", value: user.email },
        { label: "Profil", value: user.typeUser === "VIEWER" ? "Lecture seule" : "Administrateur" },
        { label: "Super-administrateur", value: user.estSuperAdmin ? "Oui" : "Non" },
        { label: "Activation", value: user.doitChangerMotDePasse ? "Changement d’accès requis" : "Effectuée" },
        { label: "Création du compte", value: date(user.dateCreation, true) }, { label: "Dernière connexion", value: date(user.derniereConnexion, true) },
      ]} /></div>
      <Card className="min-w-0"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><ShieldCheck className="h-5 w-5 text-primary" />Autorisations par bloc</CardTitle><p className="text-sm text-muted-foreground">Dates inclusives, selon le calendrier de Kinshasa. Le profil Lecture seule n’autorise aucune écriture.</p></CardHeader>
        <CardContent className="space-y-5">
          <form action={addAuthorization}><fieldset disabled={pending} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end">
            <div className="space-y-2"><Label htmlFor="authorization-block">Bloc</Label><Select value={block} onValueChange={setBlock} disabled={pending}><SelectTrigger id="authorization-block" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(blocks).map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="authorization-start">Date de début</Label><Input id="authorization-start" name="dateDebut" type="date" value={authorizationStart} onChange={event => setAuthorizationStart(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="authorization-end">Date de fin (facultative)</Label><Input id="authorization-end" name="dateFin" type="date" value={authorizationEnd} onChange={event => setAuthorizationEnd(event.target.value)} /></div>
            <Button type="submit"><Plus className="mr-2 h-4 w-4" />Attribuer</Button>
          </fieldset></form>
          <Table className="min-w-[36rem]" aria-label="Autorisations du compte"><TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead>Bloc</TableHead><TableHead>Début</TableHead><TableHead>Fin</TableHead><TableHead>Validité</TableHead><TableHead className="w-20 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
            {authorizations.map(item => {
              const validity = item.statut !== "ACTIF" ? "Retirée" : item.dateDebut > today ? "À venir" : item.dateFin && item.dateFin < today ? "Expirée" : "Active"
              return <TableRow key={item.idUserAutorisation}><TableCell className="font-medium">{blocks[item.idBlocAutorisation]}</TableCell><TableCell className="tabular-nums">{date(item.dateDebut)}</TableCell><TableCell className="tabular-nums">{item.dateFin ? date(item.dateFin) : "Sans fin"}</TableCell><TableCell><Badge variant={validity === "Active" ? "secondary" : "outline"}>{validity}</Badge></TableCell><TableCell className="text-right">{item.statut === "ACTIF" && <AccountAction icon={Trash2} label={`Retirer l’autorisation ${blocks[item.idBlocAutorisation]} du ${date(item.dateDebut)}`} disabled={pending} destructive onClick={() => closeAuthorization(item.idUserAutorisation)} />}</TableCell></TableRow>
            })}
            {!authorizations.length && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucun bloc attribué à ce compte.</TableCell></TableRow>}
          </TableBody></Table>
        </CardContent>
      </Card>
    </div>
    <Sheet open={editing} onOpenChange={open => { if (!pending) setEditing(open) }}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>Modifier le compte</SheetTitle><SheetDescription>Les changements de profil ou d’accès peuvent révoquer les sessions en cours.</SheetDescription></SheetHeader>
      <form action={patchUser} className="space-y-5 px-4">{feedback?.error && <p role="alert" className="text-sm text-destructive">{feedback.text}</p>}<fieldset disabled={pending} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="account-name">Nom complet</Label><Input id="account-name" name="nomComplet" value={draft.nomComplet} onChange={event => setDraft(current => ({ ...current, nomComplet: event.target.value }))} required /></div>
        <div className="space-y-2"><Label htmlFor="account-email">E-mail</Label><Input id="account-email" name="email" type="email" value={draft.email} onChange={event => setDraft(current => ({ ...current, email: event.target.value }))} required /></div>
        <div className="space-y-2"><Label htmlFor="account-profile">Profil</Label><Select value={draft.typeUser} onValueChange={value => setDraft(current => ({ ...current, typeUser: value as UserType }))} disabled={pending}><SelectTrigger id="account-profile" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ADMIN">Administrateur</SelectItem><SelectItem value="VIEWER">Lecture seule</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="account-status">Statut</Label><Select value={draft.statut} onValueChange={value => setDraft(current => ({ ...current, statut: value as Status }))} disabled={pending}><SelectTrigger id="account-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem><SelectItem value="BLOQUE">Bloqué</SelectItem></SelectContent></Select></div>
        <div className="flex items-center gap-2 sm:col-span-2"><Checkbox id="account-super-admin" checked={draft.estSuperAdmin} onCheckedChange={value => setDraft(current => ({ ...current, estSuperAdmin: value === true }))} disabled={pending} /><Label htmlFor="account-super-admin">Super-administrateur</Label></div>
      </fieldset><SheetFooter className="px-0"><Button type="button" variant="outline" disabled={pending} onClick={() => setEditing(false)}>Annuler</Button><Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button></SheetFooter></form>
    </SheetContent></Sheet>
    <Dialog open={secret !== null} onOpenChange={open => { if (!open) setSecret(null) }}><DialogContent><DialogHeader><DialogTitle>Accès temporaire</DialogTitle><DialogDescription>Affichage unique : transmettez cet accès au titulaire par le canal prévu, puis fermez cette fenêtre.</DialogDescription></DialogHeader><code className="break-all rounded-md border p-3">{secret}</code><DialogFooter><Button onClick={() => setSecret(null)}>Fermer</Button></DialogFooter></DialogContent></Dialog>
  </div></TooltipProvider>
}
