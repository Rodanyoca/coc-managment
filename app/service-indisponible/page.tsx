import { cookies } from "next/headers"
import { ServiceUnavailable } from "@/components/dashboard/service-unavailable"
import { SESSION_COOKIE_NAME } from "@/lib/auth/session-cookie"
import { verifySessionToken } from "@/lib/auth/session-token"
import { NAVIGATION_COOKIE_NAME, readNavigationSnapshot, unavailableReturnPath } from "@/lib/navigation/snapshot"

export const dynamic = "force-dynamic"

export default async function ServiceUnavailablePage({ searchParams }: { searchParams: Promise<{ retour?: string }> }) {
  const { retour } = await searchParams
  const jar = await cookies(), sessionToken = jar.get(SESSION_COOKIE_NAME)?.value, secret = process.env.AUTH_SECRET
  // Display context only: no read of the failed source and no business authorization.
  const validToken = sessionToken && secret ? await verifySessionToken({ token: sessionToken, secret }) : null
  const navigation = validToken ? readNavigationSnapshot({ value: jar.get(NAVIGATION_COOKIE_NAME)?.value, sessionToken, secret }) : null
  return <ServiceUnavailable access={navigation?.access ?? {}} isSuperAdmin={navigation?.isSuperAdmin ?? false} returnTo={unavailableReturnPath(retour)} />
}
