"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export function ServiceUnavailable({ access, isSuperAdmin, returnTo }: { access: Record<string, boolean>; isSuperAdmin: boolean; returnTo: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="flex h-screen overflow-hidden bg-background">
    <div className="hidden lg:block"><Sidebar initialAccess={access} initialIsSuperAdmin={isSuperAdmin} fallbackHome disablePrefetch /></div>
    <main className="min-w-0 flex-1 overflow-y-auto no-scrollbar">
      <Header title="Service indisponible" onMenuClick={() => setMenuOpen(true)} />
      <div className="flex min-h-[calc(100%-4rem)] items-center justify-center p-4 sm:p-6">
        <Card role="status" className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle aria-hidden="true" className="mx-auto mb-2 h-10 w-10 text-amber-600" />
            <CardTitle>Service momentanément indisponible</CardTitle>
            <CardDescription>Réessayez dans quelques instants ou choisissez une autre rubrique dans la navigation.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild><Link href={returnTo} prefetch={false}><RefreshCw aria-hidden="true" className="mr-2 h-4 w-4" />Réessayer</Link></Button>
          </CardContent>
        </Card>
      </div>
    </main>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="left" className="w-64 border-0 p-0" onClick={event => { if (event.target instanceof Element && event.target.closest("a")) setMenuOpen(false) }}>
        <SheetHeader className="sr-only"><SheetTitle>Navigation</SheetTitle><SheetDescription>Choisissez une rubrique du tableau de bord.</SheetDescription></SheetHeader>
        <Sidebar initialAccess={access} initialIsSuperAdmin={isSuperAdmin} fallbackHome disablePrefetch />
      </SheetContent>
    </Sheet>
  </div>
}
