"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, BadgeCheck, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FileText, Flag, Globe2, Landmark, LayoutDashboard, Stethoscope, Trophy, UserCog, Users, type LucideIcon } from "lucide-react"
import { useState } from "react"
import { dashboardNavigation, visibleDashboardNavigation } from "@/lib/navigation/dashboard-navigation"
import { cn } from "@/lib/utils"

const icons = { dashboard: LayoutDashboard, landmark: Landmark, users: Users, trophy: Trophy, shield: Flag, calendar: Activity, file: FileText, globe: Globe2 }
const actorIcons: Record<string, LucideIcon> = { athletes: Users, entraineurs: UserCog, arbitres: Flag, officiels: BadgeCheck, medecins: Stethoscope, autres: Users }
type NavigationItem = { name: string; href: string; icon: LucideIcon }

function NavigationLink({ item, collapsed, pathname }: { item: NavigationItem; collapsed: boolean; pathname: string }) {
  const exact = item.href === "/dashboard" || item.href === "/dashboard/acteurs"
  const active = exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
  return <Link
    href={item.href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground",
    )}
    title={collapsed ? item.name : undefined}
    aria-label={collapsed ? item.name : undefined}
    aria-current={active ? "page" : undefined}
  >
    <item.icon className="h-5 w-5 flex-shrink-0" />
    {!collapsed && <span>{item.name}</span>}
  </Link>
}

function NavigationGroup({ title, href, items, open, onToggle, collapsed, pathname }: {
  title: string; href?: string; items: NavigationItem[]; open: boolean
  onToggle: () => void; collapsed: boolean; pathname: string
}) {
  if (collapsed) return <>
    {href && <NavigationLink item={{ name: title, href, icon: Users }} collapsed pathname={pathname} />}
    {items.map(item => <NavigationLink key={item.href} item={item} collapsed pathname={pathname} />)}
  </>

  return <div className="space-y-1">
    {href ? <div className="flex w-full items-center justify-between rounded-lg text-xs font-semibold text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground">
      <Link href={href} className="min-w-0 flex-1 rounded-lg px-3 py-2 uppercase tracking-wide" aria-current={pathname === href ? "page" : undefined}>{title}</Link>
      <button type="button" onClick={onToggle} className="rounded-lg px-3 py-2" aria-label={`${open ? "Réduire" : "Développer"} ${title}`} aria-expanded={open}>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
    </div> : <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
      aria-expanded={open}
    >
      <span className="uppercase tracking-wide">{title}</span>
      {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>}
    {open && <div className="pl-2 space-y-1">
      {items.map(item => <NavigationLink key={item.href} item={item} collapsed={false} pathname={pathname} />)}
    </div>}
  </div>
}

export function Sidebar({ initialAccess, initialIsSuperAdmin }: { initialAccess: Record<string, boolean>; initialIsSuperAdmin: boolean }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [closedGroups, setClosedGroups] = useState<string[]>([])
  const readableBlocks = ["AUT-ADM", "AUT-SPT", "AUT-COM"].filter(block => initialAccess[`${block}:READ`] === true)
  const visible = visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: initialIsSuperAdmin, readableBlocks })
  const linksFor = (...routes: string[]): NavigationItem[] => visible
    .filter(item => item.href && routes.includes(item.href))
    .map(item => ({ name: item.name, href: item.href!, icon: icons[item.icon] }))
  const actors = visible.find(item => item.href === "/dashboard/acteurs")
  const groups = [
    { title: "Structure territoriale", items: linksFor("/dashboard/federations") },
    { title: "Acteurs", href: actors?.href, items: (actors?.children ?? []).map(item => ({ ...item, icon: actorIcons[item.href.split("/").pop()!] ?? Users })) },
    { title: "Compétitions", items: linksFor("/dashboard/competitions") },
    { title: "Équipes nationales", items: linksFor("/dashboard/equipes-nationales") },
    { title: "Administration", items: linksFor("/dashboard/activites", "/dashboard/documents", "/dashboard/site-web", "/dashboard/utilisateurs", "/dashboard/parametres") },
  ].filter(group => group.items.length > 0)
  const toggle = (title: string) => setClosedGroups(current => current.includes(title) ? current.filter(item => item !== title) : [...current, title])

  return <aside className={cn(
    "relative z-40 h-screen shrink-0 border-r border-sidebar-border bg-sidebar shadow-[16px_0_40px_rgba(1,10,20,0.22)] transition-all duration-300",
    collapsed ? "w-16" : "w-64",
  )}>
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-[#1188c7] after:via-[#f6c515] after:to-[#e23b52]">
        <Link href="/dashboard" aria-label="Comité Olympique Congolais" title="Comité Olympique Congolais" className={cn("flex items-center gap-3", collapsed && "mx-auto")}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
            <Image src="/images/logo-coc.png" alt="Logo COC" width={45} height={52} className="h-full w-full object-contain" />
          </span>
          {!collapsed && <span className="text-lg font-black tracking-[0.12em] text-sidebar-foreground">COC</span>}
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed(current => !current)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-muted shadow-md transition-colors hover:border-primary/60 hover:bg-sidebar-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        aria-label={collapsed ? "Déployer la navigation" : "Réduire la navigation"}
        aria-expanded={!collapsed}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <nav aria-label="Navigation principale" className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-2 [&_:focus-visible]:outline-sidebar-ring">
        {linksFor("/dashboard").map(item => <NavigationLink key={item.href} item={item} collapsed={collapsed} pathname={pathname} />)}
        {groups.map(group => <NavigationGroup key={group.title} {...group} open={!closedGroups.includes(group.title)} onToggle={() => toggle(group.title)} collapsed={collapsed} pathname={pathname} />)}
      </nav>
    </div>
  </aside>
}
