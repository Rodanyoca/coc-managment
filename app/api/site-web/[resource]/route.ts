import { contentGet, contentWrite } from "@/lib/site-web/http"
export const runtime = "nodejs"
export const maxDuration = 60
type Context = { params: Promise<{ resource: string }> }
export async function GET(request: Request, context: Context) { return contentGet(request, (await context.params).resource) }
export async function POST(request: Request, context: Context) { return contentWrite(request, (await context.params).resource) }
