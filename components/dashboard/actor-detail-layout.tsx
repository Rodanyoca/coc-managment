"use client"

import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash2, FileText, Mail, Phone, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

interface InfoField {
  label: string
  value: string | ReactNode
  icon?: ReactNode
}

interface ActorDetailLayoutProps {
  backHref: string
  backLabel: string
  title: string
  subtitle?: string
  avatarInitials: string
  avatarColorClass: string
  status: "actif" | "inactif"
  mainInfo: InfoField[]
  contactInfo?: InfoField[]
  additionalSections?: {
    id: string
    label: string
    content: ReactNode
  }[]
  documents?: {
    name: string
    type: string
    date: string
  }[]
  children?: ReactNode
}

export function ActorDetailLayout({
  backHref,
  backLabel,
  title,
  subtitle,
  avatarInitials,
  avatarColorClass,
  status,
  mainInfo,
  contactInfo,
  additionalSections = [],
  documents = [],
  children,
}: ActorDetailLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header title={title} subtitle={subtitle} />

      <div className="p-6 space-y-6">
        {/* Back button */}
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Card - Profile */}
          <Card className="lg:col-span-1 border-border/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className={`${avatarColorClass} text-2xl`}>
                    {avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{title}</h2>
                {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                <Badge
                  variant="secondary"
                  className={`mt-3 ${
                    status === "actif"
                      ? "bg-coc-green/10 text-coc-green"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status === "actif" ? "Actif" : "Inactif"}
                </Badge>

                <div className="flex gap-2 mt-6 w-full">
                  <Button variant="outline" className="flex-1 gap-2">
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Button>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contact Info */}
              {contactInfo && contactInfo.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      {info.icon && <span className="text-muted-foreground">{info.icon}</span>}
                      <div>
                        <p className="text-muted-foreground text-xs">{info.label}</p>
                        <p className="font-medium">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Tabs */}
          <Card className="lg:col-span-2 border-border/50">
            <Tabs defaultValue="infos" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="infos">Informations</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  {additionalSections.length > 0 && (
                    <TabsTrigger value={additionalSections[0].id}>
                      {additionalSections[0].label}
                    </TabsTrigger>
                  )}
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="infos" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mainInfo.map((info, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm text-muted-foreground">{info.label}</p>
                        <p className="font-medium">{info.value}</p>
                      </div>
                    ))}
                  </div>
                  {children}
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.type} - {doc.date}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Aucun document disponible</p>
                    </div>
                  )}
                </TabsContent>

                {additionalSections.map((section) => (
                  <TabsContent key={section.id} value={section.id} className="mt-0">
                    {section.content}
                  </TabsContent>
                ))}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  )
}
