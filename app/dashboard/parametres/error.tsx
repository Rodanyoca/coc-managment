"use client"
import { Button } from "@/components/ui/button"
export default function SettingsError({ reset }: { reset: () => void }) { return <div role="alert" className="space-y-4 p-6"><p>Les paramètres sont indisponibles. Aucune saison par défaut n’a été inventée.</p><Button onClick={reset}>Réessayer</Button></div> }
