import {revalidatePath,revalidateTag} from "next/cache"
import {NextResponse} from "next/server"
import {canAccess} from "@/lib/auth"
import {createAthleteParticipation,getAthleteParticipations,getParticipationReferences,updateAthleteParticipation} from "@/lib/competitions/data"
import {runSportMutation} from "@/lib/competitions/mutation"
type Context={params:Promise<{id:string}>}
export async function GET(_:Request,context:Context){if(!(await canAccess("AUT-SPT","READ")))return NextResponse.json({error:"Accès refusé."},{status:403});const{id}=await context.params;return NextResponse.json({rows:await getAthleteParticipations({competitionId:id}),references:await getParticipationReferences()})}
async function write(request:Request,context:Context,update:boolean){const{id:competitionId}=await context.params;return runSportMutation(request,{action:update?"MODIFICATION_PARTICIPATION_ATHLETE":"CREATION_PARTICIPATION_ATHLETE",typeObjet:"PARTICIPATION_ATHLETE"},async(body)=>{const row=update?await updateAthleteParticipation(competitionId,String(body.id||""),body.row||{}):await createAthleteParticipation(competitionId,body.row||{});revalidatePath(`/dashboard/competitions/${competitionId}`);revalidateTag("competitions-dashboard","max");return{row,objectId:row.id_participation_athlete}})}
export async function POST(request:Request,context:Context){return write(request,context,false)}
export async function PUT(request:Request,context:Context){return write(request,context,true)}
