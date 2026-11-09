import { DashboardAccessProvider } from "@/components/dashboard/access-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { getNavigationAccess, getSession } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  const access = session && !session.doitChangerMotDePasse ? await getNavigationAccess(session) : {}
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar initialAccess={access} initialIsSuperAdmin={session?.estSuperAdmin === true} />
      <main className="min-w-0 flex-1 overflow-y-auto no-scrollbar">
        <DashboardAccessProvider access={access}>{children}</DashboardAccessProvider>
      </main>
    </div>
  )
}
