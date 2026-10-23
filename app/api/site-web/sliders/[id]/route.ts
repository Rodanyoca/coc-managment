import { contentWrite } from "@/lib/site-web/http"
export const runtime = "nodejs"
export const maxDuration = 60
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { return contentWrite(request, "sliders", (await context.params).id) }
