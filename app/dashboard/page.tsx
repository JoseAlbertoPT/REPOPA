"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, Users, AlertCircle, Factory } from "lucide-react"
import { useApp } from "@/lib/context/app-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const { entities } = useApp()
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeOrganisms: 0,
    activeTrusts: 0,
    activeEPEM: 0,
  })

  useEffect(() => {
    const organisms = entities.filter((e) => e.type === "Organismo").length
    const trusts = entities.filter((e) => e.type === "Fideicomiso").length
    const epem = entities.filter((e) => e.type === "EPEM").length

    setStats({
      totalEntities: entities.length,
      activeOrganisms: organisms,
      activeTrusts: trusts,
      activeEPEM: epem,
    })
  }, [entities])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Panel Principal</h1>
        <p className="text-muted-foreground mt-2">
          Sistema de Registro Público de Organismos Públicos Auxiliares (REPOPA)
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Sistema de uso exclusivamente interno, sin efectos jurídicos externos.</AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntities}</div>
            <p className="text-xs text-muted-foreground mt-1">Registros en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organismos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrganisms}</div>
            <p className="text-xs text-muted-foreground mt-1">Organismos descentralizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fideicomisos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrusts}</div>
            <p className="text-xs text-muted-foreground mt-1">Fideicomisos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPEM</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEPEM}</div>
            <p className="text-xs text-muted-foreground mt-1">Empresas Part. Estatal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registros Recientes</CardTitle>
            <CardDescription>Últimos entes registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entities.slice(0, 5).map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-start gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      entity.type === "Organismo"
                        ? "bg-primary/10 text-primary"
                        : entity.type === "Fideicomiso"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-accent/10 text-accent-foreground"
                    }`}
                  >
                    {entity.type === "EPEM" ? <Factory className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">{entity.folio}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Entes</CardTitle>
            <CardDescription>Estadísticas por tipo de ente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Organismos Públicos Descentralizados</span>
                <span className="text-sm font-bold">{stats.activeOrganisms}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fideicomisos</span>
                <span className="text-sm font-bold">{stats.activeTrusts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Empresas Participación Estatal</span>
                <span className="text-sm font-bold">{stats.activeEPEM}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-sm font-bold">{stats.totalEntities}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
