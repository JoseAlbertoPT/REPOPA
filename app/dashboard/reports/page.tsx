"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Building2, Users, TrendingUp, FileDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { entities, governingBodies, directors, powers, regulatoryDocs } = useApp()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [reportType, setReportType] = useState<string>("general")
  const [filterType, setFilterType] = useState<"Todos" | "Organismo" | "Fideicomiso" | "EPEM">("Todos")
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [showEntitySelector, setShowEntitySelector] = useState(false)

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const filteredEntities = entities.filter((e) => filterType === "Todos" || e.type === filterType)

  const toggleEntitySelection = (entityId: string) => {
    setSelectedEntities((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId],
    )
  }

  const toggleSelectAll = () => {
    if (selectedEntities.length === entities.length) {
      setSelectedEntities([])
    } else {
      setSelectedEntities(entities.map((e) => e.id))
    }
  }

  const getChangeHistoryData = () => {
    const selectedEntityData = entities.filter((e) => selectedEntities.includes(e.id))

    return selectedEntityData.map((entity) => {
      const entityDocs = regulatoryDocs.filter((d) => d.entityId === entity.id)
      const entityBodies = governingBodies.filter((b) => b.entityId === entity.id)
      const entityDirectors = directors.filter((d) => d.entityId === entity.id)
      const entityPowers = powers.filter((p) => p.entityId === entity.id)

      return {
        entity,
        docs: entityDocs,
        bodies: entityBodies,
        directors: entityDirectors,
        powers: entityPowers,
      }
    })
  }

  const handleExportExcel = () => {
    if (selectedEntities.length === 0) {
      toast({
        title: "Seleccione entes",
        description: "Debe seleccionar al menos un ente para exportar",
        variant: "destructive",
      })
      return
    }

    const historyData = getChangeHistoryData()

    let csvContent = "REPORTE DE HISTORIAL - REPOPA\n"
    csvContent += `Fecha de generación:,${new Date().toLocaleDateString("es-MX")}\n`
    csvContent += `Entes seleccionados:,${selectedEntities.length}\n\n`

    historyData.forEach((data) => {
      csvContent += `\n=== ${data.entity.name} ===\n`
      csvContent += `Folio:,${data.entity.folio}\n`
      csvContent += `Tipo:,${data.entity.type}\n`
      csvContent += `Estatus:,${data.entity.status}\n`
      csvContent += `Fecha de Creación:,${data.entity.creationDate || "N/A"}\n\n`

      // Documentos
      csvContent += "DOCUMENTOS NORMATIVOS\n"
      csvContent += "Nombre,Tipo,Fecha de Publicación\n"
      data.docs.forEach((doc) => {
        csvContent += `"${doc.documentName}","${doc.documentType}","${doc.publicationDate || "N/A"}"\n`
      })
      csvContent += "\n"

      // Integrantes
      csvContent += "INTEGRANTES\n"
      csvContent += "Nombre,Cargo,Nombramiento,Estatus\n"
      data.bodies.forEach((body) => {
        csvContent += `"${body.memberName}","${body.position}","${body.appointmentDate || "N/A"}","${body.status}"\n`
      })
      csvContent += "\n"

      // Directores
      csvContent += "DIRECTORES\n"
      csvContent += "Nombre,Cargo,Fecha de Inicio,Fecha de Conclusión\n"
      data.directors.forEach((dir) => {
        csvContent += `"${dir.name}","${dir.position}","${dir.startDate || "N/A"}","${dir.endDate || "Vigente"}"\n`
      })
      csvContent += "\n"

      // Poderes
      csvContent += "PODERES Y FACULTADES\n"
      csvContent += "Tipo de Poder,Apoderados,Fecha de Otorgamiento,Revocación\n"
      data.powers.forEach((power) => {
        csvContent += `"${power.powerType}","${power.attorneys.join("; ")}","${power.grantDate || "N/A"}","${power.revocation || "No"}"\n`
      })
      csvContent += "\n\n"
    })

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `REPOPA-Historial-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Reporte exportado",
      description: "El reporte Excel (CSV) se ha generado correctamente",
    })
  }

  const handleExportPDF = () => {
    if (selectedEntities.length === 0) {
      toast({
        title: "Seleccione entes",
        description: "Debe seleccionar al menos un ente para exportar",
        variant: "destructive",
      })
      return
    }

    const historyData = getChangeHistoryData()

    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte REPOPA</title>
        <style>
          @page { margin: 2cm; }
          body {
            font-family: Arial, sans-serif;
            color: #2E3B2B;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #7C4A36;
          }
          .logo {
            max-width: 400px;
            margin: 0 auto 20px;
          }
          .title {
            color: #2E3B2B;
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
          }
          .subtitle {
            color: #71785b;
            font-size: 16px;
            margin: 5px 0;
          }
          .meta-info {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #7C4A36;
            margin: 20px 0;
          }
          .entity-section {
            margin: 30px 0;
            page-break-inside: avoid;
          }
          .entity-header {
            background: #2E3B2B;
            color: white;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .entity-info {
            background: #f9f9f9;
            padding: 15px;
            margin-bottom: 20px;
            border-left: 4px solid #bc9b73;
          }
          .section-title {
            color: #7C4A36;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #bc9b73;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th {
            background: #71785b;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #7C4A36;
            text-align: center;
            font-size: 12px;
            color: #71785b;
          }
          .no-data {
            color: #999;
            font-style: italic;
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/images/logo-20finanzas.png" alt="FINANZAS" class="logo">
          <div class="title">REPORTE DE HISTORIAL DE CAMBIOS</div>
          <div class="subtitle">REPOPA - Registro Público de Organismos Públicos Auxiliares</div>
          <div class="subtitle">Secretaría de Administración y Finanzas</div>
        </div>

        <div class="meta-info">
          <strong>Fecha de generación:</strong> ${new Date().toLocaleDateString("es-MX", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}<br>
          <strong>Entes incluidos:</strong> ${selectedEntities.length}<br>
          <strong>Total de registros:</strong> ${entities.length}
        </div>
    `

    historyData.forEach((data) => {
      htmlContent += `
        <div class="entity-section">
          <div class="entity-header">${data.entity.name}</div>
          <div class="entity-info">
            <strong>Folio:</strong> ${data.entity.folio}<br>
            <strong>Tipo:</strong> ${data.entity.type}<br>
            <strong>Estatus:</strong> ${data.entity.status}<br>
            <strong>Fecha de Creación:</strong> ${data.entity.creationDate || "N/A"}
          </div>

          <div class="section-title">Documentos Normativos</div>
          ${
            data.docs.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Nombre del Documento</th>
                  <th>Tipo</th>
                  <th>Fecha de Publicación</th>
                </tr>
              </thead>
              <tbody>
                ${data.docs
                  .map(
                    (doc) => `
                  <tr>
                    <td>${doc.documentName}</td>
                    <td>${doc.documentType}</td>
                    <td>${doc.publicationDate || "N/A"}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : '<div class="no-data">No hay documentos normativos registrados</div>'
          }

          <div class="section-title">Integrantes</div>
          ${
            data.bodies.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Fecha de Nombramiento</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                ${data.bodies
                  .map(
                    (body) => `
                  <tr>
                    <td>${body.memberName}</td>
                    <td>${body.position}</td>
                    <td>${body.appointmentDate || "N/A"}</td>
                    <td>${body.status}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : '<div class="no-data">No hay integrantes registrados</div>'
          }

          <div class="section-title">Directores</div>
          ${
            data.directors.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Fecha de Inicio</th>
                  <th>Fecha de Conclusión</th>
                </tr>
              </thead>
              <tbody>
                ${data.directors
                  .map(
                    (dir) => `
                  <tr>
                    <td>${dir.name}</td>
                    <td>${dir.position}</td>
                    <td>${dir.startDate || "N/A"}</td>
                    <td>${dir.endDate || "Vigente"}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : '<div class="no-data">No hay directores registrados</div>'
          }

          <div class="section-title">Poderes y Facultades</div>
          ${
            data.powers.length > 0
              ? `
            <table>
              <thead>
                <tr>
                  <th>Tipo de Poder</th>
                  <th>Apoderados</th>
                  <th>Fecha de Otorgamiento</th>
                  <th>Revocación</th>
                </tr>
              </thead>
              <tbody>
                ${data.powers
                  .map(
                    (power) => `
                  <tr>
                    <td>${power.powerType}</td>
                    <td>${power.attorneys.join(", ")}</td>
                    <td>${power.grantDate || "N/A"}</td>
                    <td>${power.revocation || "No"}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          `
              : '<div class="no-data">No hay poderes registrados</div>'
          }
        </div>
      `
    })

    htmlContent += `
        <div class="footer">
          <p><strong>REPOPA - Registro Público de Organismos Públicos Auxiliares</strong></p>
          <p>Procuraduría Fiscal del Gobierno del Estado de Morelos</p>
          <p>Este documento es un registro oficial generado por el sistema REPOPA</p>
        </div>
      </body>
      </html>
    `

    // Create and download
    const blob = new Blob([htmlContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `REPOPA-Historial-${new Date().toISOString().split("T")[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Reporte exportado",
      description: "El reporte PDF se ha generado. Ábralo en su navegador y use 'Imprimir > Guardar como PDF'",
    })
  }

  const stats = {
    totalEntities: entities.length,
    organisms: entities.filter((e) => e.type === "Organismo").length,
    trusts: entities.filter((e) => e.type === "Fideicomiso").length,
    epems: entities.filter((e) => e.type === "EPEM").length,
    activeEntities: entities.filter((e) => e.status === "Activo").length,
    totalGoverningMembers: governingBodies.length,
    activeGoverningMembers: governingBodies.filter((g) => g.status === "Activo").length,
    totalDirectors: directors.length,
    activePowers: powers.filter((p) => !p.revocation).length,
    regulatoryDocs: regulatoryDocs.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Reportes y Seguimiento</h1>
          <p className="text-muted-foreground mt-2">Visualización y exportación de información del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEntitySelector(!showEntitySelector)}>
            <Building2 className="w-4 h-4 mr-2" />
            Seleccionar Entes ({selectedEntities.length})
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {showEntitySelector && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Seleccionar Entes para Exportar</CardTitle>
                <CardDescription>Elija los entes que desea incluir en el reporte</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                {selectedEntities.length === entities.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {entities.map((entity) => (
                <div key={entity.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <Checkbox
                    checked={selectedEntities.includes(entity.id)}
                    onCheckedChange={() => toggleEntitySelection(entity.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{entity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entity.folio} • {entity.type}
                    </p>
                  </div>
                  <Badge variant={entity.status === "Activo" ? "default" : "outline"}>{entity.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.organisms} organismos, {stats.trusts} fideicomisos, {stats.epems} EPEMs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entes Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEntities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.activeEntities / stats.totalEntities) * 100).toFixed(0)}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGoverningMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.activeGoverningMembers} integrantes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Normativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regulatoryDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tipo de Reporte</CardTitle>
              <CardDescription>Seleccione el tipo de información a visualizar</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Reporte General</SelectItem>
                  <SelectItem value="entities">Listado de Entes</SelectItem>
                  <SelectItem value="governing">Integrantes</SelectItem>
                  <SelectItem value="directors">Dirección</SelectItem>
                  <SelectItem value="powers">Poderes</SelectItem>
                </SelectContent>
              </Select>
              {reportType === "entities" && (
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos</SelectItem>
                    <SelectItem value="Organismo">Organismos</SelectItem>
                    <SelectItem value="Fideicomiso">Fideicomisos</SelectItem>
                    <SelectItem value="EPEM">EPEMs</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {reportType === "general" && (
        <Card>
          <CardHeader>
            <CardTitle>Reporte General del Sistema</CardTitle>
            <CardDescription>Resumen consolidado de todos los módulos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Estadísticas Generales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Entes Registrados</p>
                    <p className="text-2xl font-bold">{stats.totalEntities}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.organisms} organismos • {stats.trusts} fideicomisos • {stats.epems} EPEMs
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Documentos Normativos</p>
                    <p className="text-2xl font-bold">{stats.regulatoryDocs}</p>
                    <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Integrantes de Órganos</p>
                    <p className="text-2xl font-bold">{stats.totalGoverningMembers}</p>
                    <p className="text-xs text-muted-foreground">{stats.activeGoverningMembers} activos</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Responsables</p>
                    <p className="text-2xl font-bold">{stats.totalDirectors}</p>
                    <p className="text-xs text-muted-foreground">Directores y coordinadores</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Poderes Vigentes</p>
                    <p className="text-2xl font-bold">{stats.activePowers}</p>
                    <p className="text-xs text-muted-foreground">De {powers.length} registrados</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Distribución por Tipo</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Organismos Descentralizados</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(stats.organisms / stats.totalEntities) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{stats.organisms}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fideicomisos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{ width: `${(stats.trusts / stats.totalEntities) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{stats.trusts}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">EPEMs</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${(stats.epems / stats.totalEntities) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{stats.epems}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "entities" && (
        <Card>
          <CardHeader>
            <CardTitle>Listado de Entes Registrados</CardTitle>
            <CardDescription>{filteredEntities.length} registros</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Estatus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell className="font-medium">{entity.folio}</TableCell>
                    <TableCell>{entity.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entity.type === "Organismo"
                            ? "default"
                            : entity.type === "Fideicomiso"
                              ? "secondary"
                              : "accent"
                        }
                      >
                        {entity.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{entity.creationDate || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={entity.status === "Activo" ? "default" : "outline"}>{entity.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "governing" && (
        <Card>
          <CardHeader>
            <CardTitle>Integrantes</CardTitle>
            <CardDescription>{governingBodies.length} integrantes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Ente</TableHead>
                  <TableHead>Nombramiento</TableHead>
                  <TableHead>Estatus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {governingBodies.map((body) => {
                  const entity = entities.find((e) => e.id === body.entityId)
                  return (
                    <TableRow key={body.id}>
                      <TableCell className="font-medium">{body.memberName}</TableCell>
                      <TableCell>{body.position}</TableCell>
                      <TableCell>{entity?.name || "N/A"}</TableCell>
                      <TableCell>{body.appointmentDate || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={body.status === "Activo" ? "default" : "outline"}>{body.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "directors" && (
        <Card>
          <CardHeader>
            <CardTitle>Dirección y Representación</CardTitle>
            <CardDescription>{directors.length} responsables registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Ente</TableHead>
                  <TableHead>Inicio</TableHead>
                  <TableHead>Estatus</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directors.map((director) => {
                  const entity = entities.find((e) => e.id === director.entityId)
                  const isActive = !director.endDate || new Date(director.endDate) > new Date()
                  return (
                    <TableRow key={director.id}>
                      <TableCell className="font-medium">{director.name}</TableCell>
                      <TableCell>{director.position}</TableCell>
                      <TableCell>{entity?.name || "N/A"}</TableCell>
                      <TableCell>{director.startDate || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Vigente" : "Concluido"}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {reportType === "powers" && (
        <Card>
          <CardHeader>
            <CardTitle>Poderes y Facultades</CardTitle>
            <CardDescription>{powers.length} poderes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Poder</TableHead>
                  <TableHead>Titular</TableHead>
                  <TableHead>Ente</TableHead>
                  <TableHead>Otorgamiento</TableHead>
                  <TableHead>Vigencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {powers.map((power) => {
                  const entity = entities.find((e) => e.id === power.entityId)
                  const isActive = !power.revocation && (!power.validity || new Date(power.validity) > new Date())
                  return (
                    <TableRow key={power.id}>
                      <TableCell className="font-medium">{power.powerType}</TableCell>
                      <TableCell>{power.holder}</TableCell>
                      <TableCell>{entity?.name || "N/A"}</TableCell>
                      <TableCell>{power.grantDate || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Vigente" : "No Vigente"}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
