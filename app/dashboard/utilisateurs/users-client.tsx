"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Eye, Plus, Search } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { AccountAction, UserProfile, UserStatus } from "@/components/dashboard/user-account-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"

type Item = { id: string; nom: string; email: string; type: string; statut: string; superAdmin: boolean }
export default function UsersClient({ initialUsers }: { initialUsers: Item[] }) {
  const [query, setQuery] = useState("")
  const [type, setType] = useState("TOUS")
  const [status, setStatus] = useState("TOUS")
  const [superOnly, setSuperOnly] = useState(false)
  const rows = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("fr")
    return initialUsers.filter(user => (!search || `${user.nom} ${user.email}`.toLocaleLowerCase("fr").includes(search))
      && (type === "TOUS" || user.type === type) && (status === "TOUS" || user.statut === status) && (!superOnly || user.superAdmin))
  }, [initialUsers, query, type, status, superOnly])
  return <div className="min-h-screen min-w-0"><Header title="Utilisateurs" subtitle="Comptes, profils et autorisations" />
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Rechercher un utilisateur" placeholder="Nom ou e-mail…" className="pl-9" value={query} onChange={event => setQuery(event.target.value)} /></div>
          <Select value={type} onValueChange={setType}><SelectTrigger className="w-full sm:w-44" aria-label="Filtrer par profil"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TOUS">Tous les profils</SelectItem><SelectItem value="ADMIN">Administrateur</SelectItem><SelectItem value="VIEWER">Lecture seule</SelectItem></SelectContent></Select>
          <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full sm:w-40" aria-label="Filtrer par statut"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TOUS">Tous les statuts</SelectItem><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem><SelectItem value="BLOQUE">Bloqué</SelectItem></SelectContent></Select>
          <div className="flex items-center gap-2"><Checkbox id="super-admin-filter" checked={superOnly} onCheckedChange={value => setSuperOnly(value === true)} /><Label htmlFor="super-admin-filter">Super-administrateurs</Label></div>
        </div>
        <Button asChild className="shrink-0"><Link href="/dashboard/utilisateurs/nouveau"><Plus className="mr-2 h-4 w-4" />Créer un utilisateur</Link></Button>
      </div>
      <TooltipProvider><Card className="min-w-0"><CardContent className="p-0"><Table className="min-w-[42rem]" aria-label="Comptes utilisateurs">
        <TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead>Nom</TableHead><TableHead>E-mail</TableHead><TableHead>Profil</TableHead><TableHead>Statut</TableHead><TableHead className="w-20 text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{rows.map(user => <TableRow key={user.id}>
          <TableCell className="font-medium"><Link className="hover:underline" href={`/dashboard/utilisateurs/${user.id}`}>{user.nom}</Link></TableCell>
          <TableCell className="text-muted-foreground">{user.email}</TableCell><TableCell><UserProfile type={user.type} superAdmin={user.superAdmin} /></TableCell><TableCell><UserStatus status={user.statut} /></TableCell>
          <TableCell className="text-right"><AccountAction icon={Eye} label={`Voir le compte de ${user.nom}`} href={`/dashboard/utilisateurs/${user.id}`} /></TableCell>
        </TableRow>)}{!rows.length && <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">{initialUsers.length ? "Aucun utilisateur ne correspond aux filtres." : "Aucun utilisateur enregistré."}</TableCell></TableRow>}</TableBody>
      </Table></CardContent></Card></TooltipProvider>
      <p role="status" className="text-xs text-muted-foreground">{rows.length} utilisateur{rows.length > 1 ? "s" : ""} sur {initialUsers.length}</p>
    </div>
  </div>
}
