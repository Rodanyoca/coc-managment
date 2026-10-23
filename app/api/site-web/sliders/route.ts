import { contentGet, contentWrite } from "@/lib/site-web/http"
export const runtime = "nodejs"
export const maxDuration = 60
export async function GET(request: Request) { return contentGet(request, "sliders") }
export async function POST(request: Request) { return contentWrite(request, "sliders") }
