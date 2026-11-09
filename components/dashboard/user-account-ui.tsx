"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function UserProfile({ type, superAdmin }: { type: string; superAdmin: boolean }) {
  return <div className="flex flex-wrap gap-2"><Badge variant="secondary">{type === "VIEWER" ? "Lecture seule" : "Administrateur"}</Badge>{superAdmin && <Badge variant="outline">Super-administrateur</Badge>}</div>
}
export function UserStatus({ status }: { status: string }) {
  return <Badge variant={status === "BLOQUE" ? "destructive" : status === "ACTIF" ? "secondary" : "outline"}>{status === "ACTIF" ? "Actif" : status === "INACTIF" ? "Inactif" : "Bloqué"}</Badge>
}
export function AccountAction({ label, icon: Icon, href, onClick, disabled = false, destructive = false }: {
  label: string; icon: LucideIcon; href?: string; onClick?: () => void; disabled?: boolean; destructive?: boolean
}) {
  return <Tooltip><TooltipTrigger asChild>{href
    ? <Button asChild variant="ghost" size="icon"><Link href={href} aria-label={label}><Icon className="h-4 w-4" /></Link></Button>
    : <Button type="button" variant="ghost" size="icon" aria-label={label} disabled={disabled} onClick={onClick} className={destructive ? "text-destructive hover:text-destructive" : undefined}><Icon className="h-4 w-4" /></Button>
  }</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
}
