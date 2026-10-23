import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return <div role="status" aria-live="polite" className="space-y-6 p-4 sm:p-6"><p className="text-sm text-muted-foreground">Chargement des comptes utilisateurs…</p><Skeleton className="h-8 w-56" /><div className="flex flex-wrap gap-3"><Skeleton className="h-9 w-72" /><Skeleton className="h-9 w-36" /></div><Skeleton className="h-64 w-full" /></div>
}
