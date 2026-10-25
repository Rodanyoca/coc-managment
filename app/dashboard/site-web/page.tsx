import Link from "next/link"
import { ArrowUpRight, Building2, CalendarDays, FileText, GalleryHorizontalEnd, History, Images, Landmark, Megaphone, Newspaper, Tags, Trophy, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Header } from "@/components/dashboard/header"

type Section = { name: string; hint: string; slug: string; icon: LucideIcon; pending?: boolean }
const groups: { title: string; sections: Section[] }[] = [
  { title: "À publier", sections: [
    { name: "Sliders", hint: "À la une de l’accueil", slug: "sliders", icon: GalleryHorizontalEnd },
    { name: "Actualités", hint: "Articles et nouvelles", slug: "actualites", icon: Newspaper },
    { name: "Communiqués", hint: "La parole officielle", slug: "communiques", icon: Megaphone },
    { name: "Événements", hint: "Les prochains rendez-vous", slug: "evenements", icon: CalendarDays },
  ] },
  { title: "Vos ressources", sections: [
    { name: "Galeries", hint: "Albums et photographies", slug: "galeries", icon: Images },
    { name: "Documents", hint: "Publications et fichiers", slug: "documents", icon: FileText },
    { name: "Athlètes", hint: "Les visages du sport", slug: "athletes", icon: Users },
    { name: "Catégories d’actualités", hint: "Organiser les sujets", slug: "categories", icon: Tags },
  ] },
  { title: "Le Comité", sections: [
    { name: "Historique", hint: "L’histoire du COC", slug: "historique", icon: History, pending: true },
    { name: "Gouvernance", hint: "Instances et responsables", slug: "gouvernance", icon: Landmark, pending: true },
    { name: "Jeux", hint: "Les grands rendez-vous", slug: "jeux", icon: Trophy, pending: true },
    { name: "Entités", hint: "Fédérations et partenaires", slug: "entites", icon: Building2, pending: true },
  ] },
]

export default function SiteWebAdministrationPage() {
  return <div className="min-h-screen min-w-0">
    <Header title="Site Web" subtitle="Votre espace de publication" />
    <main className="min-w-0 space-y-8 p-4 sm:p-6" aria-label="Rubriques du site web">
      {groups.map(group => <section key={group.title} aria-label={group.title} className="space-y-3">
        <div className="flex items-center gap-4"><h2 className="shrink-0 text-xs font-medium uppercase tracking-widest text-muted-foreground">{group.title}</h2><span aria-hidden="true" className="h-px flex-1 bg-border/50" /></div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {group.sections.map(section => {
            const Icon = section.icon
            return <Link key={section.slug} href={`/dashboard/site-web/${section.slug}`} aria-label={`Ouvrir : ${section.name}`} className="group flex min-w-0 flex-col rounded-xl border border-border/60 bg-card/40 p-4 outline-none transition-colors hover:border-primary/40 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-2"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" /><ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-foreground" /></div>
              <h3 className="text-sm font-medium leading-5 text-foreground">{section.name}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.hint}</p>
              {section.pending && <span className="mt-3 text-[11px] text-muted-foreground/80">À configurer</span>}
            </Link>
          })}
        </div>
      </section>)}
    </main>
  </div>
}
