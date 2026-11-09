"use client"
import ContentManager from "@/components/site-web/content-manager"
import type { Slider, PublicationStatus } from "@/lib/site-web/sliders"
export default function SlidersClient({ initialSliders, statuses, canEdit, initialError }: { initialSliders: Slider[]; statuses: PublicationStatus[]; canEdit: boolean; initialError: boolean }) { return <ContentManager resource="sliders" initialRows={initialSliders} initialStatuses={statuses} canEdit={canEdit} initialError={initialError} /> }
