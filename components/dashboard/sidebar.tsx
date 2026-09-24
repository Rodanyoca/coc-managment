"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, ChevronDown, FileText, Globe2, Landmark, LayoutDashboard, Shield, Trophy, Users } from "lucide-react"
import { useState } from "react"
import { dashboardNavigation, visibleDashboardNavigation } from "@/lib/navigation/dashboard-navigation"
import { cn } from "@/lib/utils"

const icons = {
  dashboard: LayoutDashboard,
  landmark: Landmark,
  users: Users,
  trophy: Trophy,
  shield: Shield,
  calendar: Calendar,
  file: FileText,
  globe: Globe2,
}
export function Sidebar({ initialAccess, initialIsSuperAdmin }: { initialAccess: Record<string, boolean>; initialIsSuperAdmin: boolean }) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>(["Acteurs", "Structure territoriale", "Compétitions"])

  const readableBlocks = ["AUT-ADM", "AUT-SPT", "AUT-COM"].filter((block) => initialAccess[`${block}:READ`] === true)
  const visible = visibleDashboardNavigation(dashboardNavigation, { isSuperAdmin: initialIsSuperAdmin, readableBlocks })

  const toggle = (name: string) => {
    setExpanded((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  return (
    <aside className="relative h-screen w-64 shrink-0 overflow-hidden bg-sidebar text-sidebar-foreground shadow-[8px_0_30px_rgba(4,18,42,.12)] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-gradient-to-b after:from-primary/70 after:via-sidebar-border after:to-transparent">
      <div className="flex h-full flex-col">
        <div className="flex h-24 shrink-0 items-center border-b border-sidebar-border/80 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/95 shadow-sm ring-1 ring-primary/25">
              <Image src="/images/logo-coc.png" alt="Logo COC" width={45} height={52} className="h-12 w-auto object-contain" />
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-bold uppercase tracking-[.14em] text-sidebar-primary">Comité Olympique</span>
              <span className="mt-1 text-sm font-semibold text-white">Congolais</span>
            </div>
          </Link>
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/40">Navigation</p>
          <div className="space-y-1">
            {visible.map((item) => {
              const active = item.children
                ? item.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`))
                : item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

              const opened = expanded.includes(item.name)
              const Icon = icons[item.icon]

              return (
                <div key={item.name}>
                  {item.children ? (
                    <div className={cn("rounded-lg", active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent") }>
                      {item.href ? (
                        <div className="flex items-center">
                          <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-sm font-medium">
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                          <button type="button" onClick={() => toggle(item.name)} className="p-2.5 text-current" aria-label={`${opened ? "Réduire" : "Développer"} ${item.name}`} aria-expanded={opened}>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", opened && "rotate-180")} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => toggle(item.name)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium" aria-expanded={opened}>
                          <Icon className="h-5 w-5" />
                          <span className="min-w-0 flex-1">{item.name}</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", opened && "rotate-180")} />
                        </button>
                      )}

                      {opened && item.children && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4 pb-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "block rounded-lg px-3 py-2 text-sm transition-colors",
                                pathname === child.href ? "font-medium text-sidebar-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t border-sidebar-border/80 px-4 py-3">
          <p className="text-center text-[10px] tracking-[0.18em] text-sidebar-foreground/45 uppercase">
            DS <span className="font-semibold text-sidebar-foreground/70">Concept</span>
          </p>
        </div>
      </div>
    </aside>
  )
}

