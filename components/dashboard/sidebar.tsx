"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Trophy,
  Mail,
  Calendar,
  Building2,
  FileText,
  ChevronDown,
} from "lucide-react"
import { useState, useEffect } from "react"

const allNavigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["coc", "technique"],
  },
  {
    name: "Acteurs",
    href: "/dashboard/acteurs",
    icon: Users,
    roles: ["coc", "technique"],
    children: [
      { name: "Athlètes", href: "/dashboard/acteurs/athletes" },
      { name: "Officiels", href: "/dashboard/acteurs/officiels" },
      { name: "Entraîneurs", href: "/dashboard/acteurs/entraineurs" },
      { name: "Médecins", href: "/dashboard/acteurs/medecins" },
      { name: "Arbitres", href: "/dashboard/acteurs/arbitres" },
    ],
  },
  {
    name: "Compétitions",
    href: "/dashboard/competitions",
    icon: Trophy,
    roles: ["coc", "technique"],
    children: [
      { name: "Liste", href: "/dashboard/competitions" },
    ],
  },
  {
    name: "Courriers",
    href: "/dashboard/courriers",
    icon: Mail,
    roles: ["coc"],
    children: [
      { name: "Consultation", href: "/dashboard/courriers" },
    ],
  },
  {
    name: "Activités",
    href: "/dashboard/activites",
    icon: Calendar,
    roles: ["coc", "technique"],
    children: [
      { name: "Liste des activités", href: "/dashboard/activites" },
    ],
  },
  {
    name: "Patrimoine",
    href: "/dashboard/patrimoine",
    icon: Building2,
    roles: ["coc"],
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    roles: ["coc"],
    children: [
      { name: "Liste des fichiers", href: "/dashboard/documents" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Acteurs", "Compétitions", "Courriers", "Activités", "Documents"])
  const [role, setRole] = useState<string>("coc")

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setRole(d.user.role)
        }
      })
      .catch(() => {})
  }, [])

  const navigation = allNavigation.filter((item) => item.roles.includes(role))

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground shrink-0 h-screen">
      <div className="flex flex-col h-full">
        <div className="flex h-20 shrink-0 items-center justify-center border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <img
              src="/images/logo-coc.png"
              alt="COC Logo"
              width={50}
              height={60}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-sidebar-primary">Comité Olympique</span>
              <span className="text-xs font-medium text-sidebar-primary">Congolais</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname?.startsWith(item.href + "/")
              const isExpanded = expandedItems.includes(item.name)
              const hasChildren = item.children && item.children.length > 1

              return (
                <div key={item.name}>
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  {hasChildren && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-4">
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm transition-colors",
                              isChildActive
                                ? "text-sidebar-primary font-medium"
                                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                            )}
                          >
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>
        <div className="shrink-0 border-t border-sidebar-border px-3 py-2">
          <p className="text-center text-[11px] text-sidebar-foreground/60">
            propulse by DS Concept
          </p>
        </div>
      </div>
    </aside>
  )
}
