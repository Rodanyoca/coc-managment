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
  Settings,
  LogOut,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Acteurs",
    href: "/dashboard/acteurs",
    icon: Users,
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
    children: [
      { name: "Liste", href: "/dashboard/competitions" },
      { name: "Nouvelle", href: "/dashboard/competitions/nouveau" },
    ],
  },
  {
    name: "Courriers",
    href: "/dashboard/courriers",
    icon: Mail,
    children: [
      { name: "Consultation", href: "/dashboard/courriers" },
      { name: "Nouveau courrier", href: "/dashboard/courriers/nouveau" },
    ],
  },
  {
    name: "Activités",
    href: "/dashboard/activites",
    icon: Calendar,
    children: [
      { name: "Liste des activités", href: "/dashboard/activites" },
      { name: "Diagramme de Gantt", href: "/dashboard/activites/gantt" },
    ],
  },
  {
    name: "Patrimoine",
    href: "/dashboard/patrimoine",
    icon: Building2,
  },
  {
    name: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    children: [
      { name: "Liste des fichiers", href: "/dashboard/documents" },
      { name: "Ajouter un fichier", href: "/dashboard/documents/nouveau" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(["Acteurs", "Compétitions", "Courriers", "Activités", "Documents"])

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground shrink-0">
      <div className="flex flex-col min-h-full">
        <div className="flex h-20 items-center justify-center border-b border-sidebar-border px-4">
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
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
              const isExpanded = expandedItems.includes(item.name)
              const hasChildren = item.children && item.children.length > 0

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
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin COC</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">admin@coc.cd</p>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </button>
            <button className="flex items-center justify-center rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
