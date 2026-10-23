import { kinshasaCalendarDate } from "@/lib/auth/authorization"
import { notFound } from "next/navigation"
import { createGoogleUsersSheetsAdapter } from "@/lib/users/google-adapter"
import { UsersRepository } from "@/lib/users/repository"
import UserDetailClient from "./user-detail-client"

export const dynamic = "force-dynamic"
export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const repository = new UsersRepository(createGoogleUsersSheetsAdapter())
  const user = await repository.getUserById(id)
  if (!user) notFound()
  const authorizations = await repository.getAuthorizationsForUser(id)
  return <UserDetailClient initial={{ id: user.idUser, nomComplet: user.nomComplet, email: user.email, typeUser: user.typeUser, statut: user.statut, estSuperAdmin: user.estSuperAdmin, doitChangerMotDePasse: user.doitChangerMotDePasse, dateCreation: user.dateCreation, derniereConnexion: user.derniereConnexion }} initialAuthorizations={authorizations} today={kinshasaCalendarDate()} />
}
