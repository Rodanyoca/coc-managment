import Link from "next/link"

export const metadata = { title: "Politique de confidentialité — COC" }

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-16 text-foreground">
      <article className="mx-auto max-w-3xl space-y-6">
        <p className="text-sm text-muted-foreground">Comité Olympique Congolais</p>
        <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
        <p>Le texte de la politique de confidentialité du COC sera publié prochainement.</p>
        <Link href="/login" className="inline-block rounded text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Retour à la connexion</Link>
      </article>
    </main>
  )
}
