import {revalidatePath,revalidateTag} from "next/cache"
import {NextResponse} from "next/server"
import {canAccess,getSession} from "@/lib/auth"
import {correctCompetitionResult,createCompetitionResult,getCompetitionResults,getResultReferences} from "@/lib/competitions/data"
import {runSportMutation} from "@/lib/competitions/mutation"
type Context={params:Promise<{id:string}>}
export async function GET(_:Request,context:Context){if(!(await canAccess("AUT-SPT","READ")))return NextResponse.json({error:"Accès refusé."},{status:403});const{id}=await context.params;return NextResponse.json({rows:await getCompetitionResults(id),references:await getResultReferences()})}
async function write(request:Request,context:Context,correction:boolean){const{id:competitionId}=await context.params;return runSportMutation(request,{action:correction?"CORRECTION_RESULTAT":"CREATION_RESULTAT",typeObjet:"RESULTAT_COMPETITION"},async(body)=>{const session=await getSession(),status=String(body.row?.id_statut_validation_resultat||"");const row={...(body.row||{}),id_validateur_coc:["VALIDE_COC","HOMOLOGUE"].includes(status)?session?.idUser||"":""};const result=correction?await correctCompetitionResult(competitionId,String(body.id||""),row):await createCompetitionResult(competitionId,row);revalidatePath(`/dashboard/competitions/${competitionId}`);revalidateTag("competitions-dashboard","max");return{row:result,objectId:result.id_resultat}})}
export async function POST(request:Request,context:Context){return write(request,context,false)}
export async function PUT(request:Request,context:Context){return write(request,context,true)}
