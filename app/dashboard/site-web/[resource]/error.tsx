"use client"
import { Button } from "@/components/ui/button"
export default function ErrorPage({ reset }: { reset: () => void }) { return <div role="alert" className="space-y-3 p-6"><p>Cette rubrique est temporairement indisponible.</p><Button onClick={reset}>Réessayer</Button></div> }
