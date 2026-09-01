import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Building2, Mail, MapPin, Phone } from "lucide-react"
import { canAccess } from "@/lib/auth"
import { loadOtherActor } from "@/lib/acteurs/autres-data"
import { ActorDetailLayout } from "@/components/dashboard/actor-detail-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

const neutral = (value?: string) => value || "Non renseigné"
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AA"

export default async function OtherActorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await canAccess("AUT-SPT", "READ"))) redirect("/dashboard")
  const { id } = await params
  let data
  try { data = await loadOtherActor(decodeURIComponent(id)) } catch { notFound() }
  const { actor, references } = data
  if (!actor) notFound()
  const entity = references.entities.find((item) => item.id === actor.id_entite)
  const federation = references.federations.find((item) => item.entityId === actor.id_entite)
  const sex = references.sexes.find((item) => item.id === actor.id_sexe)?.label || actor.id_sexe
  const linkedInternationalEntity = Boolean(entity?.category && /(CONTINENTALE|INTERNATIONALE)/i.test(entity.category))
  const canWrite = await canAccess("AUT-SPT", "WRITE")

  return <ActorDetailLayout
    backHref="/dashboard/acteurs/autres"
    backLabel="Retour aux autres acteurs"
    title={neutral(actor.nom_complet)}
    subtitle={neutral(actor.type_autre_acteur)}
    avatarInitials={initials(actor.nom_complet)}
    avatarColorClass="bg-primary/10 text-primary"
    avatarUrl={actor.avatar_drive_url || null}
    urlPasseport={actor.passeport_drive_url || null}
    actorType="autres"
    actorId={actor.id_autre_acteur_coc}
    canManageMedia={false}
    actorDateNaissance={actor.date_de_naissance}
    actorSexe={sex}
    status={actor.statut ? (actor.statut.toUpperCase() === "ACTIF" ? "actif" : "inactif") : undefined}
    profileActions={canWrite ? <Button asChild><Link href={`/dashboard/acteurs/autres/${encodeURIComponent(actor.id_autre_acteur_coc)}/modifier`}>Modifier</Link></Button> : null}
    contactInfo={[
      { label: "Téléphone", value: neutral(actor.telephone), icon: <Phone className="h-4 w-4" /> },
      { label: "Adresse électronique", value: neutral(actor.email), icon: <Mail className="h-4 w-4" /> },
      { label: "Adresse", value: neutral(actor.adresse), icon: <MapPin className="h-4 w-4" /> },
    ]}
    mainInfo={[
      { label: "Fonction ou qualité", value: neutral(actor.type_autre_acteur) },
      { label: "Entité de rattachement", value: neutral(entity?.acronym || entity?.name) },
      { label: "Fédération concernée", value: neutral(federation?.acronym || federation?.name) },
      { label: "Catégorie d’entité", value: neutral(entity?.category) },
      { label: "Identifiant dans l’entité", value: neutral(actor.id_autre_acteur_entite) },
      { label: "Identifiant national", value: neutral(actor.id_national) },
      { label: "Identifiant international", value: neutral(actor.id_international) },
      { label: "Nationalité", value: neutral(actor.nationalite) },
      { label: "Lieu de naissance", value: neutral(actor.lieu_de_naissance) },
      { label: "Statut", value: neutral(actor.statut) },
      { label: "Observations", value: neutral(actor.observations) },
    ]}
  >
    {linkedInternationalEntity && <Card className="mt-6"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Building2 className="h-4 w-4" />Entité liée</CardTitle></CardHeader><CardContent className="grid gap-4 text-sm sm:grid-cols-2"><Info label="Nom" value={entity?.name} /><Info label="Sigle" value={entity?.acronym} /><Info label="Catégorie" value={entity?.category} /><Info label="Adresse" value={entity?.address} /><Info label="Téléphone" value={entity?.phone} /><Info label="E-mail" value={entity?.email} />{entity?.website && <div><p className="text-muted-foreground">Site web</p><a className="break-all text-primary underline" href={entity.website} target="_blank" rel="noreferrer">{entity.website}</a></div>}</CardContent></Card>}
  </ActorDetailLayout>
}

function Info({ label, value }: { label: string; value?: string }) { return <div><p className="text-muted-foreground">{label}</p><p className="break-words font-medium">{neutral(value)}</p></div> }
