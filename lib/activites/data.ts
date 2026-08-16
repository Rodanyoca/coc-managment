import "server-only"
import { appendSheetRow, deleteSheetRow, getSheetHeaders, getSheetRows, updateSheetCells } from "@/lib/google/sheets"
import { getReferentialSpreadsheetId } from "@/lib/federations/config"
import { getActeursSpreadsheetId } from "@/lib/acteurs/config"
import { getActivitesSpreadsheetId } from "./config"
import { normalizeStatus } from "./format"
import { ACTIVITY_ENTITY_HEADERS, ACTIVITY_HEADERS, ACTOR_TYPES, PARTICIPANT_HEADERS, type Activity, type ActivityEntity, type ActivityParticipant, type ActivityReferences, type ActorType } from "./types"
const clean=(value:unknown)=>String(value??"").trim()
const map=(row:Record<string,string>,headers:readonly string[])=>Object.fromEntries(headers.map(key=>[key,clean(row[key])]))
const activity=(row:Record<string,string>)=>({...map(row,ACTIVITY_HEADERS),statut_normalise:normalizeStatus(row.statut)}) as Activity
const entity=(row:Record<string,string>)=>map(row,ACTIVITY_ENTITY_HEADERS) as ActivityEntity
const participant=(row:Record<string,string>)=>map(row,PARTICIPANT_HEADERS) as ActivityParticipant
async function assertHeaders(sheetName:string,expected:readonly string[]){const headers=await getSheetHeaders({sheetName,spreadsheetId:getActivitesSpreadsheetId()});const missing=expected.filter(key=>!headers.includes(key));if(missing.length)throw new Error(`En-têtes manquants dans ${sheetName} : ${missing.join(", ")}`)}
export async function getActivities(){await assertHeaders("ACTIVITES",ACTIVITY_HEADERS);return(await getSheetRows({sheetName:"ACTIVITES",spreadsheetId:getActivitesSpreadsheetId()})).map(activity)}
export async function getActivity(id:string){return(await getActivities()).find(x=>x.id_activite===id)}
export async function getActivityEntities(activityId?:string){await assertHeaders("ACTIVITES_ENTITES",ACTIVITY_ENTITY_HEADERS);return(await getSheetRows({sheetName:"ACTIVITES_ENTITES",spreadsheetId:getActivitesSpreadsheetId()})).map(entity).filter(x=>!activityId||x.id_activite===activityId)}
export async function getParticipants(activityId?:string,actorId?:string){await assertHeaders("ACTIVITES_PARTICIPANTS",PARTICIPANT_HEADERS);return(await getSheetRows({sheetName:"ACTIVITES_PARTICIPANTS",spreadsheetId:getActivitesSpreadsheetId()})).map(participant).filter(x=>(!activityId||x.id_activite===activityId)&&(!actorId||x.id_acteur_coc===actorId))}
export async function getActivityReferences():Promise<ActivityReferences>{const id=getReferentialSpreadsheetId();const[entites,types]=await Promise.all(["ENTITES","TYPES_ACTIVITE"].map(sheetName=>getSheetRows({sheetName,spreadsheetId:id})));return{entites:entites.filter(r=>r.id_entite).map(r=>({id:r.id_entite,label:r.nom_entite,secondary:r.sigle_entite})),types:types.filter(r=>r.id_type_activite).map(r=>({id:r.id_type_activite,label:r.nom_type_activite}))}}
const nextId=(rows:Record<string,string>[],column:string,prefix:string)=>`${prefix}${String(rows.reduce((max,row)=>{const match=clean(row[column]).match(new RegExp(`^${prefix}(\\d+)$`,"i"));return match?Math.max(max,Number(match[1])):max},0)+1).padStart(4,"0")}`
async function validateActivity(row:Record<string,string>){if(!row.nom_activite||!row.id_type_activite||!row.id_entite_organisatrice||!row.date_debut||!row.statut)throw new Error("Nom, type, entité organisatrice, date de début et statut sont obligatoires.");if(row.date_fin&&row.date_fin<row.date_debut)throw new Error("La date de fin doit être postérieure ou égale à la date de début.");const refs=await getActivityReferences();if(!refs.types.some(x=>x.id===row.id_type_activite))throw new Error("Type d’activité inconnu.");if(!refs.entites.some(x=>x.id===row.id_entite_organisatrice))throw new Error("Entité organisatrice inconnue.")}
export async function saveActivity(input:Record<string,unknown>,id?:string){const row=map(input as Record<string,string>,ACTIVITY_HEADERS.filter(x=>x!=="id_activite")) as Record<string,string>;await validateActivity(row);const rows=await getActivities();if(id){if(!rows.some(x=>x.id_activite===id))throw new Error("Activité introuvable.");await updateSheetCells({sheetName:"ACTIVITES",spreadsheetId:getActivitesSpreadsheetId(),idColumn:"id_activite",idValue:id,updates:Object.entries(row).map(([column,value])=>({column,value}))});return{...row,id_activite:id}}const created={...row,id_activite:nextId(rows,"id_activite","ACT")};await appendSheetRow({sheetName:"ACTIVITES",spreadsheetId:getActivitesSpreadsheetId(),row:created});return created}
export async function saveActivityEntity(input:Record<string,unknown>,id?:string){const row=map(input as Record<string,string>,ACTIVITY_ENTITY_HEADERS.filter(x=>x!=="id_activite_entite")) as Record<string,string>;if(!row.id_activite||!row.id_entite||!row.role_entite||!row.statut_participation)throw new Error("Activité, entité, rôle et statut sont obligatoires.");if(!(await getActivity(row.id_activite)))throw new Error("Activité introuvable.");if(!(await getActivityReferences()).entites.some(x=>x.id===row.id_entite))throw new Error("Entité inconnue.");const rows=await getActivityEntities();const existing=id?rows.find(x=>x.id_activite_entite===id):undefined;if(id&&!existing)throw new Error("Relation entité introuvable.");if(rows.some(x=>x.id_activite_entite!==id&&x.id_activite===row.id_activite&&x.id_entite===row.id_entite&&x.role_entite===row.role_entite))throw new Error("Cette entité possède déjà ce rôle dans l’activité.");if(id){const fixed:Record<string,string>={...row,id_activite:existing!.id_activite,id_entite:existing!.id_entite};await updateSheetCells({sheetName:"ACTIVITES_ENTITES",spreadsheetId:getActivitesSpreadsheetId(),idColumn:"id_activite_entite",idValue:id,updates:["role_entite","statut_participation","observations"].map(column=>({column,value:fixed[column]}))});return{...fixed,id_activite_entite:id}}const created={...row,id_activite_entite:nextId(rows,"id_activite_entite","AEN")} as ActivityEntity;await appendSheetRow({sheetName:"ACTIVITES_ENTITES",spreadsheetId:getActivitesSpreadsheetId(),row:created});return created}
export async function syncActivityEntities(activityId:string,entityIds:string[]){const unique=[...new Set(entityIds.filter(Boolean))];const refs=await getActivityReferences();if(unique.some(id=>!refs.entites.some(x=>x.id===id)))throw new Error("Une entité sélectionnée est inconnue.");const current=await getActivityEntities(activityId);const added:ActivityEntity[]=[];const failed:string[]=[];for(const id of unique.filter(id=>!current.some(x=>x.id_entite===id))){try{added.push((await saveActivityEntity({id_activite:activityId,id_entite:id,role_entite:"INVITEE",statut_participation:"INVITEE",observations:""})) as ActivityEntity)}catch{failed.push(id)}}for(const row of current.filter(x=>!unique.includes(x.id_entite))){try{await deleteSheetRow({sheetName:"ACTIVITES_ENTITES",spreadsheetId:getActivitesSpreadsheetId(),idColumn:"id_activite_entite",idValue:row.id_activite_entite})}catch{failed.push(row.id_entite)}}return{added,failed}}
const actorSheets: Record<ActorType, { sheetName: string; idKey: string }> = {
  ATHLETE: { sheetName: "ATHLETE", idKey: "id_athlete_coc" },
  COACH: { sheetName: "COACHS", idKey: "id_coach_coc" },
  OFFICIEL: { sheetName: "OFFICIELS", idKey: "id_officiel_coc" },
  MEDECIN: { sheetName: "MEDECINS", idKey: "id_medecin_coc" },
  ARBITRE: { sheetName: "ARBITRES", idKey: "id_arbitre_coc" },
}
const actorTypeAliases: Record<string, ActorType> = {
  ATHLETE: "ATHLETE", ATHLETES: "ATHLETE", COACH: "COACH", COACHS: "COACH", COACHES: "COACH",
  OFFICIEL: "OFFICIEL", OFFICIELS: "OFFICIEL", MEDECIN: "MEDECIN", MEDECINS: "MEDECIN",
  ARBITRE: "ARBITRE", ARBITRES: "ARBITRE",
}
function normalizeActorType(value: string): ActorType {
  const normalized = clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
  const type = actorTypeAliases[normalized]
  if (!type || !ACTOR_TYPES.includes(type)) throw new Error("Type d’acteur inconnu.")
  return type
}
export async function getActors(value: string) {
  const type = normalizeActorType(value)
  const { sheetName, idKey } = actorSheets[type]
  const rows = await getSheetRows({ sheetName, spreadsheetId: getActeursSpreadsheetId() })
  const actors = rows.map((row) => ({ id: clean(row[idKey]), label: clean(row.nom_complet) || clean(row[idKey]) })).filter((actor) => actor.id)
  if (!actors.length && rows.length) {
    const headers = await getSheetHeaders({ sheetName, spreadsheetId: getActeursSpreadsheetId() })
    const missing = [idKey, "nom_complet"].filter((header) => !headers.includes(header))
    if (missing.length) throw new Error(`Mapping acteurs invalide dans ${sheetName} : ${missing.join(", ")}`)
  }
  return [...new Map(actors.map((actor) => [actor.id, actor])).values()].sort((a, b) => a.label.localeCompare(b.label, "fr", { sensitivity: "base" }))
}
export async function saveParticipant(input:Record<string,unknown>,id?:string){const row=map(input as Record<string,string>,PARTICIPANT_HEADERS.filter(x=>x!=="id_participation")) as Record<string,string>;row.id_entite_representee="";if(!row.id_activite||!row.id_acteur_coc||!row.id_type_acteur||!row.role_activite||!row.statut_participation)throw new Error("Activité, type, acteur, rôle et statut sont obligatoires.");if(!(await getActivity(row.id_activite)))throw new Error("Activité introuvable.");if(!(await getActors(row.id_type_acteur)).some(x=>x.id===row.id_acteur_coc))throw new Error("Acteur introuvable ou type incohérent.");const rows=await getParticipants();const existing=id?rows.find(x=>x.id_participation===id):undefined;if(id&&!existing)throw new Error("Participation introuvable.");const fixed=id?{...row,id_activite:existing!.id_activite,id_acteur_coc:existing!.id_acteur_coc,id_type_acteur:existing!.id_type_acteur}:row;if(rows.some(x=>x.id_participation!==id&&x.id_activite===fixed.id_activite&&x.id_acteur_coc===fixed.id_acteur_coc&&x.role_activite.toLowerCase()===fixed.role_activite.toLowerCase()))throw new Error("Cette participation existe déjà pour ce rôle.");if(id){await updateSheetCells({sheetName:"ACTIVITES_PARTICIPANTS",spreadsheetId:getActivitesSpreadsheetId(),idColumn:"id_participation",idValue:id,updates:["id_entite_representee","role_activite","statut_participation"].map(column=>({column,value:fixed[column]}))});return{...fixed,id_participation:id}}const created={...fixed,id_participation:nextId(rows,"id_participation","PAR")};await appendSheetRow({sheetName:"ACTIVITES_PARTICIPANTS",spreadsheetId:getActivitesSpreadsheetId(),row:created});return created}
