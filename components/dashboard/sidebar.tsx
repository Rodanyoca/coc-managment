"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, ChevronDown, FileText, Landmark, LayoutDashboard, Shield, Trophy, Users } from "lucide-react"
import { useState } from "react"
import { dashboardNavigation, visibleDashboardNavigation } from "@/lib/navigation/dashboard-navigation"
import { cn } from "@/lib/utils"

const icons = { dashboard: LayoutDashboard, landmark: Landmark, users: Users, trophy: Trophy, shield: Shield, calendar: Calendar, file: FileText }

export function Sidebar({ initialAccess, initialIsSuperAdmin }: { initialAccess: Record<string, boolean>; initialIsSuperAdmin: boolean }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>(["Acteurs"])
  const readableBlocks = ["AUT-ADM", "AUT-SPT", "AUT-COM"].filter((block) => initialAccess[`${block}:READ`] === true)
  const visible = visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: initialIsSuperAdmin, readableBlocks })
  return <aside className="h-screen w-64 shrink-0 bg-sidebar text-sidebar-foreground">
    <div className="flex h-full flex-col">
      <div className="flex h-20 shrink-0 items-center justify-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-3"><Image src="/images/logo-coc.png" alt="COC Logo" width={50} height={60} className="object-contain" /><div className="flex flex-col"><span className="text-xs font-medium text-sidebar-primary">Comité Olympique</span><span className="text-xs font-medium text-sidebar-primary">Congolais</span></div></Link>
      </div>
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-4"><div className="space-y-1">{visible.map((item) => {
        const active = item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
        const opened = expanded.includes(item.name), Icon = icons[item.icon]
        return <div key={item.name}>{item.children ? <div className={cn("flex items-center rounded-lg", active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent")}><Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-sm font-medium"><Icon className="h-5 w-5" />{item.name}</Link><button type="button" onClick={() => setExpanded((current) => current.includes(item.name) ? current.filter((name) => name !== item.name) : [...current, item.name])} className="p-2.5" aria-label={`${opened ? "Réduire" : "Développer"} ${item.name}`}><ChevronDown className={cn("h-4 w-4 transition-transform", opened && "rotate-180")} /></button></div> : <Link href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium", active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent")}><Icon className="h-5 w-5" />{item.name}</Link>}{item.children && opened && <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">{item.children.map((child) => <Link key={child.href} href={child.href} className={cn("block rounded-lg px-3 py-2 text-sm", pathname === child.href ? "font-medium text-sidebar-primary" : "text-sidebar-foreground/70")}>{child.name}</Link>)}</div>}</div>
      })}</div></nav>
      <div className="shrink-0 border-t border-sidebar-border px-3 py-2"><p className="text-center text-[11px] text-sidebar-foreground/60">propulse by DS Concept</p></div>
    </div>
  </aside>
}
