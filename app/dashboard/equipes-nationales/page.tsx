import {canAccess} from "@/lib/auth"
import {getNationalTeamMembers,getNationalTeamReferences,getNationalTeams} from "@/lib/equipes-nationales/data"
import Client from "./teams-client"
export const runtime="nodejs"
export const dynamic="force-dynamic"
const emptyReferences={federations:[],sports:[],disciplines:[],ageCategories:[],sexes:[],seasons:[],roles:[],ageCategoriesAvailable:false,rolesReferentialAvailable:false}
export default async function Page({searchParams}:{searchParams:Promise<{nouveau?:string}>}){const{nouveau}=await searchParams,canEdit=await canAccess("AUT-SPT","WRITE");let props:React.ComponentProps<typeof Client>;try{const[teams,members,references]=await Promise.all([getNationalTeams(),getNationalTeamMembers(),getNationalTeamReferences()]);props={teams,members,references,canEdit,initialCreate:nouveau==="1"&&canEdit}}catch(error){console.error(error);props={teams:[],members:[],references:emptyReferences,canEdit:false,initialCreate:false,loadError:"Impossible de charger les équipes nationales."}}return <Client {...props}/>}
