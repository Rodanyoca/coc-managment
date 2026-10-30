"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ListPaginationProps = {
  total: number
  pageSize: number
  currentPage: number
  pageCount: number
  pageSizeLabel: string
  onPageSizeChange: (size: number) => void
  onPageChange: (page: number) => void
}

// Pied de liste partagé, extrait de la liste des fédérations.
export function ListPagination({ total, pageSize, currentPage, pageCount, pageSizeLabel, onPageSizeChange, onPageChange }: ListPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>Afficher</span>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-[70px]" aria-label={pageSizeLabel}><SelectValue /></SelectTrigger>
          <SelectContent>{[10, 25, 50, 100].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
        </Select>
        <span>sur {total} résultat{total > 1 ? "s" : ""}</span>
      </div>
      <div className="flex items-center gap-2"><Button variant="outline" size="sm" aria-label="Page précédente" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-sm text-muted-foreground">Page {currentPage} sur {pageCount}</span><Button variant="outline" size="sm" aria-label="Page suivante" disabled={currentPage === pageCount} onClick={() => onPageChange(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button></div>
    </div>
  )
}
