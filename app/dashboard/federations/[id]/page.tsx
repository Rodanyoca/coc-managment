import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Building2, ExternalLink, Mail, Pencil, Phone } from "lucide-react"
import { Header } from "@/components/dashboard/header"
import { FederationLogoManager } from "@/components/dashboard/federation-logo-manager"
import { EntityContactsSection } from "@/components/dashboard/entity-contacts-section"
import { FederationHierarchySummary, FederationStructureTables } from "@/components/dashboard/federation-structure-section"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { loadFederationDetail } from "@/lib/federations/detail"
import { loadFederationStructure } from "@/lib/federations/structure"
import type { FederationStructure } from "@/lib/federations/structure-model"
import type { FederationLinkedEntity } from "@/lib/federations/detail-mappers"
import { canAccess } from "@/lib/auth"

export const dynamic = "force-dynamic"

const missing = "Non renseigné"
const shown = (value?: string) => value || missing
const readable = (value?: string) => value ? value.replaceAll("_", " ").toLocaleLowerCase("fr").replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("fr")) : missing
const initials = (name: string, sigle: string) => sigle.slice(0, 3).toUpperCase() || name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "FD"
const websiteUrl = (value: string) => /^https?:\/\//i.test(value) ? value : `https://${value}`

function Field({ label, value, children, className = "" }: { label: string; value?: string; children?: ReactNode; className?: string }) {
  return <dl className={`grid min-w-0 content-start gap-1.5 ${className}`}><dt className="break-words text-sm text-muted-foreground">{label}</dt><dd className="min-w-0 break-words text-sm font-medium leading-6 text-foreground">{children ?? shown(value)}</dd></dl>
}

function FederationInfoBlock({ id, title, children, wide = false }: { id: string; title: string; children: ReactNode; wide?: boolean }) {
  return <Card className={wide ? "min-w-0 lg:col-span-2" : "min-w-0"} aria-labelledby={id}><CardHeader className="pb-3"><CardTitle><h2 id={id} className="text-lg">{title}</h2></CardTitle></CardHeader><CardContent className="space-y-3">{children}</CardContent></Card>
}

function TechnicalStatus({ value }: { value: string }) {
  return <Badge variant="secondary" className={!value ? "text-muted-foreground" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}>{readable(value)}</Badge>
}

function MinistryStatus({ value }: { value: string }) {
  return <Badge variant="secondary" className={!value ? "text-muted-foreground" : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"}>{readable(value)}</Badge>
}

function CocStatus({ value }: { value: string }) {
  return <Badge variant="secondary" className={!value ? "text-muted-foreground" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"}>{readable(value)}</Badge>
}

function LinkedEntityDetails({ entity, linked, dateLabel, date, emptyLabel }: {
  entity?: FederationLinkedEntity; linked: boolean; dateLabel: string; date: string; contactsAvailable?: boolean; emptyLabel: string
}) {
  if (!linked) return <Empty className="min-h-64"><EmptyHeader><EmptyMedia variant="icon"><Building2 /></EmptyMedia><EmptyTitle>{emptyLabel}</EmptyTitle><EmptyDescription>Aucune entité n’est liée à cette fédération dans le référentiel.</EmptyDescription></EmptyHeader></Empty>
  if (!entity) return <Empty className="min-h-64"><EmptyHeader><EmptyMedia variant="icon"><Building2 /></EmptyMedia><EmptyTitle>Entité liée introuvable</EmptyTitle><EmptyDescription>La référence existe dans FEDERATIONS mais ne correspond à aucune ligne de ENTITES.</EmptyDescription></EmptyHeader></Empty>

  return <div className="space-y-6">
    <section aria-labelledby={`${entity.id_entite}-organisation`} className="space-y-4">
      <h3 id={`${entity.id_entite}-organisation`} className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Organisation</h3>
      <div className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2">
        <Field label="Nom officiel" value={entity.nom_entite} />
        <Field label="Sigle" value={entity.sigle_entite} />
        <Field label={dateLabel} value={date} />
        <Field label="Adresse du siège" value={entity.adresse_siege} />
        <Field label="Téléphone">{entity.telephone ? <a className="text-primary hover:underline" href={`tel:${entity.telephone}`}><Phone className="mr-1 inline h-4 w-4" aria-hidden="true" />{entity.telephone}</a> : missing}</Field>
        <Field label="E-mail">{entity.email ? <a className="break-all text-primary hover:underline" href={`mailto:${entity.email}`}><Mail className="mr-1 inline h-4 w-4" aria-hidden="true" />{entity.email}</a> : missing}</Field>
        <Field label="Site web" className="md:col-span-2">{entity.site_web ? <a className="break-all text-primary hover:underline" href={websiteUrl(entity.site_web)} target="_blank" rel="noopener noreferrer">{entity.site_web}<ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (ouvre un nouvel onglet)</span></a> : missing}</Field>
      </div>
    </section>
  </div>
}

function NationalCoordinates({ entity }: { entity?: FederationLinkedEntity }) {
  if (!entity) return <p className="text-sm text-muted-foreground">Aucune coordonnée nationale n’est disponible.</p>
  return <div className="grid min-w-0 gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-4 [&>dl]:row-span-2 [&>dl]:grid-rows-subgrid"><Field label="Adresse du siège" value={entity.adresse_siege} /><Field label="Téléphone">{entity.telephone ? <a className="break-all text-primary hover:underline" href={`tel:${entity.telephone}`}><Phone className="mr-1 inline h-4 w-4" aria-hidden="true" />{entity.telephone}</a> : missing}</Field><Field label="E-mail">{entity.email ? <a className="break-all text-primary hover:underline" href={`mailto:${entity.email}`}><Mail className="mr-1 inline h-4 w-4" aria-hidden="true" />{entity.email}</a> : missing}</Field><Field label="Site web">{entity.site_web ? <a className="break-all text-primary hover:underline" href={websiteUrl(entity.site_web)} target="_blank" rel="noopener noreferrer">{entity.site_web}<ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" /></a> : missing}</Field></div>
}

export default async function FederationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let detail
  let canEditLogo = false
  try { [detail, canEditLogo] = await Promise.all([loadFederationDetail(id), canAccess("AUT-SPT", "WRITE")]) } catch {
    return <div className="min-h-screen"><Header title="Fédération" subtitle="Fiche détaillée" /><main className="space-y-5 p-4 md:p-6"><Button asChild variant="ghost"><Link href="/dashboard/federations"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux fédérations</Link></Button><Alert variant="destructive"><AlertTitle>Impossible de charger la fédération</AlertTitle><AlertDescription>Les données sont temporairement indisponibles. Réessayez plus tard.</AlertDescription></Alert></main></div>
  }
  if (!detail) return <div className="min-h-screen"><Header title="Fédération introuvable" subtitle={id} /><main className="space-y-5 p-4 md:p-6"><Button asChild variant="ghost"><Link href="/dashboard/federations"><ArrowLeft className="mr-2 h-4 w-4" />Retour aux fédérations</Link></Button><Empty className="min-h-64"><EmptyHeader><EmptyMedia variant="icon"><Building2 /></EmptyMedia><EmptyTitle>Fédération indisponible</EmptyTitle><EmptyDescription>Aucune fédération ne correspond à cet identifiant.</EmptyDescription></EmptyHeader></Empty></main></div>

  const federation = detail.federation
  const title = federation.nom_federation || "Fédération"
  let structure: FederationStructure | undefined
  let structureLoadError = false
  try { structure = await loadFederationStructure(id) } catch { structureLoadError = true }
  return <div className="min-h-screen">
    <Header title={title} subtitle={[federation.sigle_federation, federation.nom_sport].filter(Boolean).join(" · ") || undefined} />
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="ghost" size="sm" className="gap-2"><Link href="/dashboard/federations"><ArrowLeft className="h-4 w-4" />Retour aux fédérations</Link></Button>{canEditLogo && <Button asChild size="sm" variant="outline"><Link href={`/dashboard/federations/${encodeURIComponent(id)}/parametres`}><Pencil className="h-4 w-4" />Modifier</Link></Button>}</div>
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <FederationInfoBlock id="federation-general-title" title="Informations générales" wide>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4"><div className="shrink-0 [&_[data-slot=avatar]]:size-16"><FederationLogoManager federationId={federation.id_federation} federationName={title} initials={initials(title, federation.sigle_federation)} initialUrl={federation.logo_drive_url} canEdit={false} /></div><div className="min-w-0"><p className="break-words text-lg font-semibold leading-6">{shown(federation.nom_federation)}</p><p className="mt-1 text-sm text-muted-foreground">{shown(federation.sigle_federation)}</p></div></div>
              <TechnicalStatus value={federation.statut} />
            </div>
            <div className="grid min-w-0 gap-x-8 gap-y-3 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Sport" value={federation.nom_sport} className="row-span-2 grid-rows-subgrid" />
              <Field label="Reconnaissance ministérielle" className="row-span-2 grid-rows-subgrid"><MinistryStatus value={federation.statut_reconnaissance_ministere} /></Field>
              <Field label="Affiliation au COC" className="row-span-2 grid-rows-subgrid"><CocStatus value={federation.statut_affiliation_coc} /></Field>
              <Field label="Catégorie" value={federation.categorie_entite} className="row-span-2 grid-rows-subgrid" />
              <Field label="Date de reconnaissance nationale" value={federation.date_reconnaissance_nationale} className="row-span-2 grid-rows-subgrid" />
              <Field label="Date d’affiliation au COC" value={federation.date_affiliation_coc} className="row-span-2 grid-rows-subgrid" />
            </div>
            <div className="border-t border-border pt-4"><Field label="Observations" value={federation.observations} /></div>
          </div>
        </FederationInfoBlock>
        <FederationInfoBlock id="federation-contacts-title" title="Coordonnées et contacts" wide>
          <NationalCoordinates entity={detail.national} />
          <div className="border-t border-border pt-4"><EntityContactsSection entityId={federation.id_entite} canWrite={false} /></div>
        </FederationInfoBlock>
        <FederationInfoBlock id="continental-entity-title" title="Rattachement continental">
          <LinkedEntityDetails entity={detail.continental} linked={Boolean(federation.id_entite_continentale)} dateLabel="Date d’affiliation continentale" date={federation.date_affiliation_continentale} contactsAvailable={detail.contactsAvailable} emptyLabel="Aucune confédération continentale liée" />
        </FederationInfoBlock>
        <FederationInfoBlock id="international-entity-title" title="Rattachement international">
          <LinkedEntityDetails entity={detail.international} linked={Boolean(federation.id_entite_internationale)} dateLabel="Date d’affiliation internationale" date={federation.date_affiliation_internationale} contactsAvailable={detail.contactsAvailable} emptyLabel="Aucune fédération internationale liée" />
        </FederationInfoBlock>
      </div>
      <section className="min-w-0 space-y-6" aria-labelledby="territorial-structure-title">
        <h2 id="territorial-structure-title" className="text-lg font-semibold">Structure territoriale</h2>
        <FederationHierarchySummary structure={structure} loadError={structureLoadError} />
        <FederationStructureTables structure={structure} loadError={structureLoadError} />
      </section>
    </main>
  </div>
}
