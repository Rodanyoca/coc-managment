"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { AuthorizationBlock } from "@/lib/users/types"

const AccessContext = createContext<Partial<Record<`${AuthorizationBlock}:WRITE`, boolean>>>({})

export function DashboardAccessProvider({ access, children }: { access: Partial<Record<`${AuthorizationBlock}:WRITE`, boolean>>; children: ReactNode }) {
  return <AccessContext.Provider value={access}>{children}</AccessContext.Provider>
}

export function useCanWrite(block: AuthorizationBlock) {
  return useContext(AccessContext)[`${block}:WRITE`] === true
}
