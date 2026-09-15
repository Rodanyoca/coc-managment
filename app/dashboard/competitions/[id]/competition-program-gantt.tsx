"use client"

import { AlertTriangle, CalendarDays, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { addCalendarDays, calendarDaysBetween, inclusiveCalendarDays, programScheduleError, todayCalendarDate } from "@/lib/competitions/program-calendar"
import { formatDateFr } from "@/lib/competitions/format"
import type { Competition, CompetitionProgram } from "@/lib/competitions/types"

export type ProgramGanttRow = {
  program: CompetitionProgram
  eventName: string
  sport: string
  discipline: string
  age: string
  sex: string
  format: string
  resultType: string
}

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]

function shortDate(value: string) {
  const [, month, day] = value.split("-")
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`
}

function markerStyle(date: string, start: string, dayWidth: number) {
  return { left: `${(calendarDaysBetween(start, date) || 0) * dayWidth + dayWidth / 2}px` }
}

export function CompetitionProgramGantt({ competition, rows, canEdit, onEdit }: { competition: Competition; rows: ProgramGanttRow[]; canEdit: boolean; onEdit: (program: CompetitionProgram) => void }) {
  if (!competition.date_debut || !competition.date_fin) return <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950"><p className="font-medium">Chronologie indisponible</p><p className="mt-1">Les dates des cérémonies d’ouverture et de clôture doivent être renseignées avant d’afficher le programme.</p></div>
  if (competition.date_fin < competition.date_debut) return <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"><p className="font-medium">Calendrier de la compétition invalide</p><p className="mt-1">La cérémonie de clôture doit avoir lieu après ou le même jour que la cérémonie d’ouverture.</p></div>
  if (!rows.length) return null

  const validStarts = rows.map(({ program }) => program.date_debut).filter(Boolean)
  const timelineStart = [competition.date_debut, ...validStarts].sort()[0]
  const totalDays = inclusiveCalendarDays(timelineStart, competition.date_fin) || 1
  const dayWidth = totalDays <= 31 ? 38 : 20
  const timelineWidth = totalDays * dayWidth
  const days = Array.from({ length: totalDays }, (_, index) => addCalendarDays(timelineStart, index))
  const current = todayCalendarDate()
  const showToday = current >= timelineStart && current <= competition.date_fin
  const anomalies = rows.filter(({ program }) => programScheduleError(program, competition))

  return <div className="space-y-3">
    {anomalies.length > 0 && <div role="alert" className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive"/><div><p className="font-medium text-destructive">{anomalies.length} anomalie(s) de calendrier</p><p className="text-muted-foreground">Les lignes signalées doivent être corrigées. La chronologie ne dépasse jamais la cérémonie de clôture.</p></div></div>}
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Légende du diagramme">
      <span className="inline-flex items-center gap-2"><span className="h-2.5 w-7 rounded-sm bg-primary"/>Programme d’épreuve</span>
      <span className="inline-flex items-center gap-2"><span className="h-4 border-l-2 border-emerald-600"/>Cérémonie d’ouverture</span>
      <span className="inline-flex items-center gap-2"><span className="h-4 border-l-2 border-slate-700"/>Cérémonie de clôture</span>
      <span className="inline-flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive"/>Anomalie de calendrier</span>
    </div>
    <div className="max-w-full overflow-x-auto rounded-lg border" data-testid="program-gantt">
      <div style={{ minWidth: `${280 + timelineWidth}px` }}>
        <div className="grid border-b bg-muted/30" style={{ gridTemplateColumns: `280px ${timelineWidth}px` }}>
          <div className="sticky left-0 z-30 flex min-h-20 items-end border-r bg-muted px-4 py-3"><div><p className="text-sm font-semibold">Épreuve</p><p className="text-xs text-muted-foreground">Contexte et calendrier</p></div></div>
          <div className="relative min-h-20 overflow-hidden" aria-label={`Chronologie du ${formatDateFr(timelineStart)} au ${formatDateFr(competition.date_fin)}`}>
            <div className="absolute inset-x-0 top-0 flex h-7 border-b text-[11px] font-medium text-muted-foreground">{days.map((day, index) => { const monthChanged = index === 0 || day.slice(0, 7) !== days[index - 1].slice(0, 7); return monthChanged ? <span key={day} className="absolute px-1.5 pt-1" style={{ left: index * dayWidth }}>{MONTHS[Number(day.slice(5, 7)) - 1]} {day.slice(0, 4)}</span> : null })}</div>
            <div className="absolute inset-x-0 bottom-0 top-7 flex">{days.map((day, index) => <div key={day} className={`shrink-0 border-r ${totalDays > 31 && index % 7 !== 0 ? "border-border/30" : "border-border"}`} style={{ width: dayWidth }}><span className={`block pt-2 text-center text-[11px] tabular-nums text-muted-foreground ${totalDays > 31 && index % 7 !== 0 ? "sr-only" : ""}`}>{totalDays <= 31 ? day.slice(8, 10) : shortDate(day)}</span></div>)}</div>
            <Milestone date={competition.date_debut} start={timelineStart} dayWidth={dayWidth} tone="opening" label="Ouverture"/>
            <Milestone date={competition.date_fin} start={timelineStart} dayWidth={dayWidth} tone="closing" label="Clôture"/>
            {showToday && <div className="absolute bottom-0 top-7 z-20 border-l border-dashed border-primary/70" style={markerStyle(current, timelineStart, dayWidth)}><span className="absolute left-1 top-1 whitespace-nowrap rounded bg-background px-1 text-[10px] font-medium text-primary">Aujourd’hui</span></div>}
          </div>
        </div>
        <TooltipProvider delayDuration={150}>{rows.map((row) => {
          const { program } = row, error = programScheduleError(program, competition)
          const startOffset = calendarDaysBetween(timelineStart, program.date_debut) || 0
          const rawDuration = inclusiveCalendarDays(program.date_debut, program.date_fin) || 1
          const visibleStart = Math.min(Math.max(startOffset, 0), totalDays - 1)
          const visibleDuration = Math.max(1, Math.min(rawDuration, totalDays - visibleStart))
          const aria = `${row.eventName}, ${row.discipline || row.sport}, du ${formatDateFr(program.date_debut)} au ${formatDateFr(program.date_fin)}, durée ${rawDuration} jour${rawDuration > 1 ? "s" : ""}.`
          const details = [row.sport, row.discipline, row.age, row.sex].filter(Boolean)
          return <div key={program.id_programme_competition} className="grid min-h-24 border-b last:border-b-0" style={{ gridTemplateColumns: `280px ${timelineWidth}px` }}>
            <div className="sticky left-0 z-20 flex items-center gap-2 border-r bg-background px-3 py-3">
              <button type="button" disabled={!canEdit} onClick={() => onEdit(program)} className="min-w-0 flex-1 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default">
                <span className="block break-words text-sm font-medium leading-snug">{row.eventName}</span>
                <span className="mt-1 block break-words text-xs text-muted-foreground">{details.join(" · ") || "Contexte non renseigné"}</span>
                <span className="mt-1.5 block text-xs tabular-nums text-muted-foreground">{formatDateFr(program.date_debut)} — {formatDateFr(program.date_fin)}</span>
                {error && <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-destructive"><AlertTriangle className="h-3 w-3"/>{error}</span>}
              </button>
              {canEdit && <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => onEdit(program)} aria-label={`Modifier ${row.eventName}`}><Pencil className="h-4 w-4"/></Button>}
            </div>
            <div className="relative overflow-hidden bg-[linear-gradient(to_right,hsl(var(--border)/0.55)_1px,transparent_1px)]" style={{ backgroundSize: `${dayWidth}px 100%` }}>
              <RowMarker date={competition.date_debut} start={timelineStart} dayWidth={dayWidth} tone="opening"/>
              <RowMarker date={competition.date_fin} start={timelineStart} dayWidth={dayWidth} tone="closing"/>
              {showToday && <div className="absolute inset-y-0 z-10 border-l border-dashed border-primary/50" style={markerStyle(current, timelineStart, dayWidth)}/>} 
              <Tooltip><TooltipTrigger asChild><button type="button" onClick={() => { if (canEdit) onEdit(program) }} aria-label={aria} className={`absolute top-1/2 z-10 h-8 -translate-y-1/2 rounded-sm px-2 text-left text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring ${canEdit ? "cursor-pointer" : "cursor-default"} ${error ? "border border-destructive bg-destructive/10 text-destructive" : "bg-primary text-primary-foreground"}`} style={{ left: `${visibleStart * dayWidth + 3}px`, width: `${Math.max(visibleDuration * dayWidth - 6, 24)}px` }}><span className="block truncate">{error ? "Calendrier à corriger" : row.eventName}</span></button></TooltipTrigger><TooltipContent side="top" className="max-w-72 space-y-1"><p className="font-medium">{row.eventName}</p><p>{[row.sport, row.discipline].filter(Boolean).join(" · ")}</p><p>{formatDateFr(program.date_debut)} — {formatDateFr(program.date_fin)} · {rawDuration} jour{rawDuration > 1 ? "s" : ""}</p>{(row.age || row.sex) && <p>{[row.age, row.sex].filter(Boolean).join(" · ")}</p>}</TooltipContent></Tooltip>
            </div>
          </div>
        })}</TooltipProvider>
      </div>
    </div>
  </div>
}

function Milestone({ date, start, dayWidth, tone, label }: { date: string; start: string; dayWidth: number; tone: "opening" | "closing"; label: string }) {
  return <div className={`absolute inset-y-0 z-20 border-l-2 ${tone === "opening" ? "border-emerald-600" : "border-slate-700"}`} style={markerStyle(date, start, dayWidth)}><span className={`absolute bottom-1 left-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold ${tone === "opening" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-800"}`}>{label} · {shortDate(date)}</span></div>
}

function RowMarker({ date, start, dayWidth, tone }: { date: string; start: string; dayWidth: number; tone: "opening" | "closing" }) {
  return <div aria-hidden="true" className={`absolute inset-y-0 z-[5] border-l-2 ${tone === "opening" ? "border-emerald-600/70" : "border-slate-700/70"}`} style={markerStyle(date, start, dayWidth)}/>
}

export function UnscheduledPrograms({ rows, canEdit, onEdit }: { rows: ProgramGanttRow[]; canEdit: boolean; onEdit: (program: CompetitionProgram) => void }) {
  if (!rows.length) return null
  return <section className="space-y-3" aria-labelledby="unscheduled-programs-title"><div><h4 id="unscheduled-programs-title" className="font-semibold">Épreuves à planifier</h4><p className="text-sm text-muted-foreground">Complétez les dates manquantes pour positionner ces épreuves dans la chronologie.</p></div><div className="divide-y rounded-lg border">{rows.map(({ program, eventName, sport }) => <div key={program.id_programme_competition} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="break-words text-sm font-medium">{eventName}</p><p className="text-xs text-muted-foreground">{sport || "Sport non renseigné"} · {!program.date_debut && !program.date_fin ? "Dates de début et de fin manquantes" : !program.date_debut ? "Date de début manquante" : "Date de fin manquante"}</p></div>{canEdit && <Button type="button" variant="outline" size="sm" onClick={() => onEdit(program)}><CalendarDays className="mr-2 h-4 w-4"/>Planifier</Button>}</div>)}</div></section>
}
