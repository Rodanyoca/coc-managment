import { ContentPage } from "@/components/site-web/content-page"
export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export default async function Page({ params }: { params: Promise<{ resource: string }> }) { return <ContentPage name={(await params).resource} /> }
