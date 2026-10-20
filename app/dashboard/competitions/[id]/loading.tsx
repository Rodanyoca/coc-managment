import { Skeleton } from "@/components/ui/skeleton"

export default function CompetitionDetailLoading() {
  return <main className="min-h-screen space-y-5 p-4 sm:p-6" aria-label="Chargement de la compétition">
    <Skeleton className="h-9 w-64"/>
    <Skeleton className="h-9 w-48"/>
    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-10 w-full"/>)}</div>
    <div className="grid gap-5 lg:grid-cols-2">{Array.from({ length: 2 }, (_, index) => <div key={index} className="min-w-0 space-y-6 rounded-xl border p-6">
      <Skeleton className="h-5 w-48 max-w-full"/>
      <div className="space-y-3">{Array.from({ length: 6 }, (_, row) => <div key={row} className="flex justify-between gap-3"><Skeleton className="h-4 w-1/3"/><Skeleton className="h-4 w-1/2"/></div>)}</div>
    </div>)}</div>
  </main>
}
