"use client"

import { apiFetch } from "@/lib/api/client"
import Link from "next/link"
import {useState} from "react"
import {useRouter} from "next/navigation"
import {ArrowLeft,MapPin,Pencil,Trophy} from "lucide-react"
import {toast} from "sonner"
import {CompetitionForm,competitionToForm} from "@/components/dashboard/competition-form"
import {CompetitionPrograms} from "./competition-programs"
import {CampaignEngagements} from "@/components/dashboard/campaign-engagements"
import {CompetitionParticipants} from "@/components/dashboard/competition-participants"
import {CompetitionResults} from "@/components/dashboard/competition-results"
import {CompetitionMedals} from "@/components/dashboard/competition-medals"
import {ParticipatingUnits} from "@/components/dashboard/participating-units"
import {Header} from "@/components/dashboard/header"
import {DataQualitySummary} from "@/components/dashboard/data-quality-summary"
import {DetailCard} from "@/components/dashboard/detail-card"
import {Button} from "@/components/ui/button"
import {Card,CardContent} from "@/components/ui/card"
import {Sheet,SheetContent,SheetDescription,SheetHeader,SheetTitle} from "@/components/ui/sheet"
import {Tabs,TabsContent,TabsList,TabsTrigger} from "@/components/ui/tabs"
import {competitionStatusLabels} from "@/lib/competitions/format"
import type {CampaignEngagement,Competition,CompetitionMedal,CompetitionParticipant,CompetitionProgram,CompetitionReferences,CompetitionResult} from "@/lib/competitions/types"
import type {AthleteSelection} from "@/lib/equipes-nationales/types"
import type {DocumentRecord} from "@/lib/documents/types"
import type {DataQualityReport} from "@/lib/competitions/quality"

type EngagementRefs={campaigns:{id:string;label:string;teamId:string;teamName:string;federationId:string;dateStart:string;dateEnd:string;status:string}[];statuses:{id:string;label:string}[];federations:{id:string;label:string}[]}
type ResultRefs={synthetics:{id:string;label:string}[];units:{id:string;label:string;type?:string}[];decisions:{id:string;label:string;federationId?:string;sportId?:string;disciplineId?:string}[];statuses:{id:string;label:string}[];federations:{id:string;label:string}[]}
const shown=(value?:string)=>value||"Non renseigné"
const label=(rows:{id:string;label:string}[],id?:string)=>rows.find((row)=>row.id===id)?.label||shown(id)

export default function CompetitionDetailClient({competition:initial,qualityReport,references,programs,programsError,engagements,engagementReferences,engagementsError,athleteParticipations,participationReferences,participationsError,results,resultReferences,resultsError,medals,medalReferences,medalsError,canEdit}:{competition:Competition;qualityReport:DataQualityReport;references:CompetitionReferences;programs:CompetitionProgram[];programsError?:string;engagements:CampaignEngagement[];engagementReferences:EngagementRefs;engagementsError?:string;athleteParticipations:CompetitionParticipant[];participationReferences:{statuses:{id:string;label:string}[];selections:AthleteSelection[]};participationsError?:string;results:CompetitionResult[];resultReferences:ResultRefs;resultsError?:string;medals:CompetitionMedal[];medalReferences:{id:string;label:string}[];medalsError?:string;documents?:DocumentRecord[];documentsError?:string;canEdit:boolean}){
 const[competition,setCompetition]=useState(initial),[editOpen,setEditOpen]=useState(false),[form,setForm]=useState(competitionToForm(initial)),[saving,setSaving]=useState(false)
 async function saveCompetition(){setSaving(true);try{const response=await apiFetch("/api/competitions",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:competition.id_competition,row:form})}),result=await response.json();if(!response.ok)throw new Error(result.message||result.error);setCompetition(result.row);setEditOpen(false);toast.success("Compétition modifiée.")}catch(error){toast.error(error instanceof Error?error.message:String(error))}finally{setSaving(false)}}
 const openEdit=()=>{setForm(competitionToForm(competition));setEditOpen(true)}
 const generalFields=[
  {label:"Référence",value:competition.id_competition},
  {label:"Nom",value:competition.nom_competition},
  {label:"Édition",value:competition.edition},
  {label:"Type",value:label(references.types,competition.id_type_competition)},
  {label:"Niveau",value:label(references.levels||[],competition.niveau_competition)},
  {label:"Caractère",value:competition.est_multisport==="OUI"?"Multisport":"Monosport"},
  {label:"Statut",value:competitionStatusLabels[competition.statut_normalise]},
 ]
 const organisationFields=[
  {label:"Début",value:competition.date_debut},
  {label:"Fin",value:competition.date_fin},
  {label:"Pays",value:competition.pays},
  {label:"Ville",value:competition.ville},
  {label:"Lieu",value:competition.lieu},
  {label:"Observations",value:competition.observations},
 ]
 return <div className="min-h-screen min-w-0 overflow-x-hidden"><Header title={competition.nom_competition} subtitle={competition.edition}/><main className="min-w-0 space-y-5 p-4 sm:p-6">
  <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="outline"><Link href="/dashboard/competitions"><ArrowLeft className="h-4 w-4"/>Retour aux compétitions</Link></Button></div>
  <Tabs defaultValue="general" className="min-w-0 w-full"><TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-3 lg:grid-cols-5">
   <TabsTrigger value="general" className="min-w-0 whitespace-normal py-2">Général</TabsTrigger><TabsTrigger value="programs" className="min-w-0 whitespace-normal py-2">Programmes</TabsTrigger><TabsTrigger value="teams" className="min-w-0 whitespace-normal py-2">Équipes / unités</TabsTrigger><TabsTrigger value="participants" className="min-w-0 whitespace-normal py-2">Participants</TabsTrigger><TabsTrigger value="results" className="min-w-0 whitespace-normal py-2">Résultats</TabsTrigger>
  </TabsList>
   <TabsContent value="general" className="min-w-0 space-y-4">
    {canEdit&&<div className="flex justify-end"><Button onClick={openEdit}><Pencil className="h-4 w-4"/>Modifier</Button></div>}
    <div className="grid min-w-0 gap-5 lg:grid-cols-2"><DetailCard title="Informations générales" icon={Trophy} fields={generalFields}/><DetailCard title="Organisation" icon={MapPin} fields={organisationFields}/></div>
    <dl className="grid gap-3 sm:grid-cols-3">{[
     {label:"Programmes",value:programs.length},
     {label:"Engagements",value:engagements.length},
     {label:"Participants",value:athleteParticipations.filter(item=>item.id_statut_participation==="PARTICIPANT").length},
    ].map(metric=><div key={metric.label} className="min-w-0 rounded-lg border border-border/80 px-4 py-3"><dt className="text-sm text-muted-foreground">{metric.label}</dt><dd className="text-lg font-semibold tabular-nums">{metric.value}</dd></div>)}</dl>
    <DataQualitySummary report={qualityReport}/>
   </TabsContent>
   <TabsContent value="programs" className="mt-0 space-y-4">{programsError?<SectionError message={programsError}/>:<CompetitionPrograms competition={competition} initialRows={programs} references={references} canEdit={canEdit}/>}</TabsContent>
   <TabsContent value="participants" className="mt-0 space-y-4">{participationsError?<SectionError message={participationsError}/>:<CompetitionParticipants competitionId={competition.id_competition} initialRows={athleteParticipations} engagements={engagements} programs={programs} references={references} participationReferences={participationReferences} federations={engagementReferences.federations} canEdit={canEdit}/>}</TabsContent>
   <TabsContent value="teams" className="mt-0 space-y-4">{engagementsError?<SectionError message={engagementsError}/>:<CampaignEngagements competitionId={competition.id_competition} programs={programs} initialRows={engagements} references={engagementReferences} competitionReferences={references} canEdit={canEdit}/>} {!engagementsError&&!participationsError&&<ParticipatingUnits competitionId={competition.id_competition} engagements={engagements} participants={athleteParticipations.filter(row=>row.id_type_acteur==="ATHLETE")} programs={programs} references={references} canEdit={canEdit}/>}</TabsContent>
   <TabsContent value="results" className="mt-0 space-y-8"><SectionTitle title="Résultats" action={canEdit?"Ajouter ou modifier un résultat":undefined}/>{resultsError?<SectionError message={resultsError}/>:<CompetitionResults competitionId={competition.id_competition} engagements={engagements} programs={programs} competitionReferences={references} initialRows={results} references={resultReferences} canEdit={canEdit}/>}<div className="border-t pt-6">{medalsError?<SectionError message={medalsError}/>:<CompetitionMedals competitionId={competition.id_competition} initialRows={medals} results={results} programs={programs} competitionReferences={references} distinctions={medalReferences} canEdit={canEdit}/>}</div></TabsContent>
  </Tabs>
  <Sheet open={editOpen} onOpenChange={setEditOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>Modifier la compétition</SheetTitle><SheetDescription>L’identifiant {competition.id_competition} reste immuable.</SheetDescription></SheetHeader><div className="px-4"><CompetitionForm value={form} onChange={setForm} types={references.types} levels={references.levels} statuses={references.statuses} saving={saving} submitLabel="Enregistrer les modifications" onSubmit={saveCompetition} onCancel={()=>setEditOpen(false)}/></div></SheetContent></Sheet>
 </main></div>
}
function SectionTitle({title,action}:{title:string;action?:string}){return <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-lg font-semibold">{title}</h2>{action&&<p className="text-sm text-muted-foreground">{action}</p>}</div>}
function SectionError({message}:{message:string}){const router=useRouter();return <Card><CardContent role="alert" className="flex flex-wrap items-center justify-between gap-3 p-6 text-destructive"><span>{message} Les autres sections restent disponibles.</span><Button type="button" variant="outline" size="sm" onClick={()=>router.refresh()}>Réessayer</Button></CardContent></Card>}
