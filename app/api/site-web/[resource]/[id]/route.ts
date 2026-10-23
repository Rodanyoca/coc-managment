import { contentWrite } from "@/lib/site-web/http"
export const runtime = "nodejs"
export const maxDuration = 60
export async function PUT(request: Request, context: { params: Promise<{ resource: string; id: string }> }) { const { resource, id } = await context.params; return contentWrite(request, resource, id) }
