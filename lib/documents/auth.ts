import "server-only"
import { getSession } from "@/lib/auth"

export async function canReadDocuments() {
  return (await getSession())?.role === "coc"
}

export async function canWriteDocuments() {
  return (await getSession())?.role === "coc"
}
