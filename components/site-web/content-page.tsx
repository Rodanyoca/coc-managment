import { notFound, redirect } from "next/navigation"
import { canAccess, getSession } from "@/lib/auth"
import { isResource } from "@/lib/site-web/schema"
import { publicationStatuses, readContent } from "@/lib/site-web/content"
import ContentManager from "./content-manager"

export async function ContentPage({ name }: { name: string }) {
  if (!isResource(name) || name === "photos") notFound()
  const session = await getSession()
  if (!session) redirect("/login")
  if (!(await canAccess("AUT-COM", "READ"))) redirect("/dashboard")
  const canEdit = await canAccess("AUT-COM", "WRITE")
  const result = await Promise.all([readContent(name), name === "categories" ? Promise.resolve([]) : publicationStatuses()])
    .then(([rows, statuses]) => ({ rows, statuses, failed: false }))
    .catch(() => ({ rows: [], statuses: [], failed: true }))
  return <ContentManager resource={name} initialRows={result.rows} initialStatuses={result.statuses} canEdit={canEdit} initialError={result.failed} />
}
