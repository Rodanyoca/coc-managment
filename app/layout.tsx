import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "COC — Système de gestion",
  description: "Système de gestion administrative du Comité Olympique Congolais",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className="font-sans antialiased">{children}<Analytics /></body></html>
}
