"use client"

import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function UsersError({ retry }: { retry: () => void }) {
  return <div className="min-h-screen"><Header title="Utilisateurs" subtitle="Gestion des comptes" /><div className="p-4 sm:p-6"><Card><CardContent className="space-y-4"><p role="alert" className="text-sm">Le compte ou la liste des utilisateurs n’a pas pu être chargé. Réessayez dans un instant.</p><Button onClick={retry}>Réessayer</Button></CardContent></Card></div></div>
}
