import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { canAccess } from "@/lib/auth"
import { createParticipatingUnit, getParticipatingUnits, updateParticipatingUnit } from "@/lib/competitions/data"
import { runSportMutation } from "@/lib/competitions/mutation"
import { apiErrorPayload } from "@/lib/api/errors"
import { randomUUID } from "node:crypto"

type Context={params:Promise<{id:string}>}
export async function GET(_:Request,context:Context){if(!(await canAccess("AUT-SPT","READ")))return NextResponse.json({error:"Accès refusé."},{status:403});const{id}=await context.params;try{return NextResponse.json({rows:await getParticipatingUnits(id)})}catch(error){console.error("Chargement unités participantes",error);const failure=apiErrorPayload(error,randomUUID());return NextResponse.json(failure.payload,{status:failure.status})}}
export async function POST(request:Request,context:Context){const{id}=await context.params;return runSportMutation(request,{action:"CREATION_UNITE_PARTICIPANTE",typeObjet:"UNITE_PARTICIPANTE"},async(body)=>{const row=await createParticipatingUnit(id,body.row||{});revalidatePath(`/dashboard/competitions/${id}`);revalidateTag("competitions-dashboard","max");return{row,objectId:row.id_unite_participante}})}
export async function PUT(request:Request,context:Context){const{id}=await context.params;return runSportMutation(request,{action:"MODIFICATION_UNITE_PARTICIPANTE",typeObjet:"UNITE_PARTICIPANTE"},async(body)=>{const row=await updateParticipatingUnit(id,String(body.id||""),body.row||{});revalidatePath(`/dashboard/competitions/${id}`);revalidateTag("competitions-dashboard","max");return{row,objectId:row.id_unite_participante}})}
