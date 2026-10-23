import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
const target=path.resolve('.cache/users-ui/validation')
for(const file of ['app/dashboard/utilisateurs/users-client.tsx','app/dashboard/utilisateurs/[id]/page.tsx','app/dashboard/utilisateurs/[id]/user-detail-client.tsx','app/dashboard/utilisateurs/loading.tsx','app/dashboard/utilisateurs/[id]/loading.tsx','app/dashboard/utilisateurs/error.tsx','components/dashboard/user-account-ui.tsx','app/api/users/[id]/route.ts'])copyFileSync(file,path.join(target,file))
execFileSync('git',['init'],{cwd:target,stdio:'ignore'})
const fixture=path.join(target,'app/users-ui-preview')
mkdirSync(fixture,{recursive:true})
for(const [name,file] of [['before-list','app/dashboard/utilisateurs/users-client.tsx'],['before-detail','app/dashboard/utilisateurs/[id]/user-detail-client.tsx']])writeFileSync(path.join(fixture,`${name}.tsx`),execFileSync('git',['show',`c1488d33b6fcd2953d2bf0becc25a83055e13e2f:${file}`]))
writeFileSync(path.join(fixture,'error-preview.tsx'),`"use client"
import {useState} from 'react'
import UsersError from '../dashboard/utilisateurs/error'
export default function ErrorPreview(){const [retried,setRetried]=useState(false);return retried?<p role="status">Reprise simulée effectuée.</p>:<UsersError retry={()=>setRetried(true)}/>}
`)
writeFileSync(path.join(fixture,'page.tsx'),`import UsersClient from '../dashboard/utilisateurs/users-client'
import UserDetailClient from '../dashboard/utilisateurs/[id]/user-detail-client'
import BeforeList from './before-list'
import BeforeDetail from './before-detail'
import ErrorPreview from './error-preview'
import UsersLoading from '../dashboard/utilisateurs/loading'
import UserLoading from '../dashboard/utilisateurs/[id]/loading'
const initial={id:'USR-DEMO',nomComplet:'Aline Démo',email:'aline@example.invalid',typeUser:'ADMIN' as const,statut:'ACTIF' as const,estSuperAdmin:false,doitChangerMotDePasse:false,dateCreation:'2026-10-01T10:30:00Z',derniereConnexion:'2026-10-22T09:00:00Z',sessionVersion:1}
const users=[{id:'USR-DEMO',nom:'Aline Démo',email:'aline@example.invalid',type:'ADMIN',statut:'ACTIF',superAdmin:false},{id:'USR-VIEWER',nom:'Victor Démo',email:'victor@example.invalid',type:'VIEWER',statut:'INACTIF',superAdmin:false},{id:'USR-ROOT',nom:'Compte Super Démo',email:'super@example.invalid',type:'ADMIN',statut:'BLOQUE',superAdmin:true}]
const grants=[{idUserAutorisation:'UA-1',idUser:'USR-DEMO',idBlocAutorisation:'AUT-SPT' as const,statut:'ACTIF' as const,dateDebut:'2026-01-01',dateFin:null},{idUserAutorisation:'UA-2',idUser:'USR-DEMO',idBlocAutorisation:'AUT-COM' as const,statut:'ACTIF' as const,dateDebut:'2027-01-01',dateFin:null},{idUserAutorisation:'UA-3',idUser:'USR-DEMO',idBlocAutorisation:'AUT-ADM' as const,statut:'ACTIF' as const,dateDebut:'2020-01-01',dateFin:'2020-12-31'}]
export default async function Preview({searchParams}:{searchParams:Promise<{view?:string}>}){const {view}=await searchParams;return view==='detail'?<UserDetailClient initial={initial} initialAuthorizations={grants} today="2026-10-23"/>:view==='before-detail'?<BeforeDetail initial={initial} initialAuthorizations={grants} audit={[]}/>:view==='before-list'?<BeforeList initialUsers={users}/>:view==='empty'?<UsersClient initialUsers={[]}/>:view==='loading'?<UsersLoading/>:view==='detail-loading'?<UserLoading/>:view==='error'?<ErrorPreview/>:<UsersClient initialUsers={users}/>}
`)
console.log('Synthetic preview only in the disposable validation copy; no user session and no Google data.')
