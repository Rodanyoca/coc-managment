"use client"

import { apiFetch } from "@/lib/api/client"

import { useRouter } from "next/navigation"
import { LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface HeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  onMenuClick?: () => void
}

export function Header({ title, subtitle, actions, onMenuClick }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-border/80 bg-background/90 px-4 py-3 shadow-[0_10px_30px_rgba(2,12,23,0.18)] backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Menu" onClick={onMenuClick} className="lg:hidden border border-border/70 bg-background/60 text-foreground hover:bg-sidebar-accent hover:text-sidebar-primary">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 border-l-2 border-primary pl-3">
          <h1 className="break-words text-xl font-bold tracking-[-0.02em] text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm break-words text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {actions}
        <Button
          variant="outline"
          className="gap-2 border-white/15 bg-white/[0.04] hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          onClick={async () => {
            await apiFetch("/api/auth/logout", { method: "POST" })
            router.push("/login")
          }}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </Button>
      </div>
    </header>
  )
}
