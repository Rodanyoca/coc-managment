"use client"

import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type ActorOption = { id: string; label: string }

export function ActorSearchSelect({ open: controlledOpen, onOpenChange, actors, options, value, onChange, onValueChange, disabled, loading }: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  actors?: ActorOption[]
  options?: ActorOption[]
  value: string
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const actorOptions = useMemo(() => actors ?? options ?? [], [actors, options])
  const [query, setQuery] = useState("")
  const selected = actorOptions.find((actor) => actor.id === value)
  const filteredActors = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr")
    if (!normalized) return actorOptions
    return actorOptions.filter((actor) => `${actor.label} ${actor.id}`.toLocaleLowerCase("fr").includes(normalized))
  }, [actorOptions, query])

  function setOpen(nextOpen: boolean) {
    if (!nextOpen) setQuery("")
    if (onOpenChange) onOpenChange(nextOpen)
    else setInternalOpen(nextOpen)
  }

  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
      <Button type="button" variant="outline" role="combobox" aria-expanded={open} disabled={disabled || loading} className="w-full justify-between font-normal">
        {loading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Chargement…</span> : selected?.label || value || "Rechercher un acteur…"}
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
      <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom ou identifiant…" className="mb-2" />
      <div className="max-h-72 overflow-y-auto">
        {!filteredActors.length ? <p className="px-2 py-6 text-center text-sm text-muted-foreground">Aucun acteur trouvé.</p> : filteredActors.map((actor) =>
          <button key={actor.id} type="button" className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent" onClick={() => { (onChange ?? onValueChange)?.(actor.id); setOpen(false) }}>
            <Check className={cn("h-4 w-4 shrink-0", value === actor.id ? "opacity-100" : "opacity-0")} />
            <span className="truncate">{actor.label}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{actor.id}</span>
          </button>
        )}
      </div>
    </PopoverContent>
  </Popover>
}
