"use client"

import type { ReactNode } from "react"
import { Contact, Fingerprint, Info, User } from "lucide-react"
import { ActorInfoCard, ActorPassportCard, ActorRecordLayout } from "@/components/dashboard/actor-record-layout"
import { getAthleteAge } from "@/lib/athletes/presentation"
import type { OtherActor } from "@/lib/acteurs/autres-model"

export function OtherActorDetailClient({ actor, sex, subtitle, initials, identifierFields, actions, linkedEntity }: {
  actor: OtherActor; sex: string; subtitle: string; initials: string
  identifierFields: { label: string; value: string }[]; actions: ReactNode; linkedEntity: ReactNode
}) {
  const age = getAthleteAge(actor.date_de_naissance)
  return <ActorRecordLayout backHref="/dashboard/acteurs/autres" backLabel="Retour aux autres acteurs"
    title={actor.nom_complet || "Non renseigné"} subtitle={subtitle} avatarInitials={initials}
    avatarUrl={actor.avatar_drive_url || null} actions={actions}
    status={actor.statut ? (actor.statut.toUpperCase() === "ACTIF" ? "actif" : "inactif") : undefined}
    generalContent={<><div className="grid gap-6 md:grid-cols-2">
      <ActorInfoCard title="Identité" icon={User} fields={[
        { label: "Nom complet", value: actor.nom_complet }, { label: "Sexe", value: sex },
        { label: "Date de naissance", value: actor.date_de_naissance }, { label: "Âge", value: age === null ? "—" : `${age} ans` },
        { label: "Lieu de naissance", value: actor.lieu_de_naissance }, { label: "Nationalité", value: actor.nationalite },
        { label: "Fonction ou qualité", value: actor.type_autre_acteur },
      ]} />
      <ActorInfoCard title="Contact" icon={Contact} fields={[
        { label: "Téléphone", value: actor.telephone }, { label: "Adresse électronique", value: actor.email }, { label: "Adresse", value: actor.adresse },
      ]} />
      <ActorInfoCard title="Identifiants" icon={Fingerprint} fields={identifierFields} />
      <ActorInfoCard title="Observations" icon={Info} fields={[{ label: "Remarques", value: actor.observations || "Aucune observation enregistrée." }]} />
    </div>{linkedEntity}</>}
    documents={<ActorPassportCard actorType="autres" actorId={actor.id_autre_acteur_coc} number={actor.numero_passeport}
      issued={actor.date_de_delivrance_passeport} expires={actor.date_expiration_passeport} url={actor.passeport_drive_url || null}
      identityFields={[]} canManageMedia={false} />}
    additionalSections={[]}
  />
}
