import { Skeleton } from "@/components/ui/skeleton"

export default function UserLoading() {
  return <div role="status" aria-live="polite" className="space-y-6 p-4 sm:p-6"><p className="text-sm text-muted-foreground">Chargement du compte et de ses autorisations…</p><Skeleton className="h-8 w-56" /><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /></div>
}
