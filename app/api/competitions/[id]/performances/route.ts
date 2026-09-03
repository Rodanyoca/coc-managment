import {revalidatePath,revalidateTag} from "next/cache"
import {NextResponse} from "next/server"
import {canAccess} from "@/lib/auth"
import {createIndividualPerformance,getIndividualPerformances,getPerformanceReferences,updateIndividualPerformance} from "@/lib/competitions/data"
import {runSportMutation} from "@/lib/competitions/mutation"
type Context={params:Promise<{id:string}>}
export async function GET(_:Request,context:Context){if(!(await canAccess("AUT-SPT","READ")))return NextResponse.json({error:"Accès refusé."},{status:403});const{id}=await context.params;return NextResponse.json({rows:await getIndividualPerformances(id),references:await getPerformanceReferences()})}
async function write(request:Request,context:Context,update:boolean){const{id:competitionId}=await context.params;return runSportMutation(request,{action:update?"MODIFICATION_PERFORMANCE":"CREATION_PERFORMANCE",typeObjet:"PERFORMANCE_INDIVIDUELLE"},async(body)=>{const row=update?await updateIndividualPerformance(competitionId,String(body.id||""),body.row||{}):await createIndividualPerformance(competitionId,body.row||{});revalidatePath(`/dashboard/competitions/${competitionId}`);revalidateTag("competitions-dashboard","max");return{row,objectId:row.id_performance}})}
export async function POST(request:Request,context:Context){return write(request,context,false)}
export async function PUT(request:Request,context:Context){return write(request,context,true)}
