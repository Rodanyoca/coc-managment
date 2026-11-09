import "server-only"
import { publicationStatuses, readContent } from "./content"
import type { SLIDER_HEADERS } from "./config"
export type Slider = Record<(typeof SLIDER_HEADERS)[number], string>
export type { PublicationStatus } from "./schema"
export const getPublicationStatuses = publicationStatuses
export async function getSliders(options: { fresh?: boolean } = {}): Promise<Slider[]> { return await readContent("sliders", options) as Slider[] }
