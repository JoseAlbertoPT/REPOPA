"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { useApp } from "@/lib/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, FileSearch } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function RequestsPage() {
  const { entities, requests, addRequest, updateRequest, deleteRequest } = useApp()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEntity, setFilterEntity] = useState<string>("Todos")
  const [filterStatus, setFilterStatus] = useState<string>("Todos")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    entityId: "",
    requestDate: new Date().toISOString().split("T")[0],
    requester: "",
    description: "",
    status: "Pendiente" as "Pendiente" | "En Proceso" | "Completada",
    responseDate: "",
  })

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const filteredRequests = requests.filter((request) => {
    const entity = entities.find((e) => e.id === request.entityId)
    const matchesSearch =
      request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEntity = filterEntity === "Todos" || request.entityId === filterEntity
    const matchesStatus = filterStatus === "Todos" || request.status === filterStatus
    return matchesSearch && matchesEntity && matchesStatus
  })

  const handleAdd = () => {
    if (!formData.entityId || !formData.requester || !formData.description) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos",
        variant: "destructive",
      })
      return
    }

    addRequest(formData)
    toast({
      title: "Solicitud registrada",
      description: "La solicitud de información ha sido registrada",
    })
    setIsAddDialogOpen(false)
    setFormData({
      entityId: "",
      requestDate: new Date().toISOString().split("T")[0],
      requester: "",
      description: "",
      status: "Pendiente",
      responseDate: "",
    })
  }

  const handleEdit = () => {
    if (selectedRequest) {
      updateRequest(selectedRequest, formData)
      toast({
        title: "Actualizado",
        description: "La solicitud ha sido actualizada correctamente",
      })
      setIsEditDialogOpen(false)
      setSelectedRequest(null)
    }
  }

  const handleDelete = (id: string) => {
    if (currentUser?.role !== "Administrador") {
      toast({
        title: "Sin permisos",
        description: "Solo los administradores pueden eliminar registros",
        variant: "destructive",
      })
      return
    }

    if (confirm("¿Está seguro de eliminar esta solicitud?")) {
      deleteRequest(id)
      toast({
        title: "Eliminado",
        description: "La solicitud ha sido eliminada",
      })
    }
  }

  const openEditDialog = (id: string) => {
    const request = requests.find((r) => r.id === id)
    if (request) {
      setFormData(request)
      setSelectedRequest(id)
      setIsEditDialogOpen(true)
    }
  }

  const canEdit = currentUser?.role === "Administrador" || currentUser?.role === "Editor"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "default"
      case "En Proceso":
        return "secondary"
      case "Pendiente":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Solicitudes de Información</h1>
          <p className="text-muted-foreground mt-2">Control y seguimiento de solicitudes internas</p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Solicitud</DialogTitle>
                <DialogDescription>Complete la información de la solicitud de información</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="entityId">Ente *</Label>
                  <Select
                    value={formData.entityId}
                    onValueChange={(value) => setFormData({ ...formData, entityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un ente" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requestDate">Fecha de Solicitud *</Label>
                    <Input
                      id="requestDate"
                      type="date"
                      value={formData.requestDate}
                      onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estatus</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Proceso">En Proceso</SelectItem>
                        <SelectItem value="Completada">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requester">Solicitante *</Label>
                  <Input
                    id="requester"
                    value={formData.requester}
                    onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                    placeholder="Nombre de la institución o persona solicitante"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción de la Solicitud *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalle de la información solicitada"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseDate">Fecha de Respuesta</Label>
                  <Input
                    id="responseDate"
                    type="date"
                    value={formData.responseDate}
                    onChange={(e) => setFormData({ ...formData, responseDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAdd}>Registrar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Solicitudes</CardTitle>
              <CardDescription>{filteredRequests.length} solicitudes registradas</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="En Proceso">En Proceso</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => {
              const entity = entities.find((e) => e.id === request.entityId)
              return (
                <div
                  key={request.id}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <FileSearch className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{request.requester}</h3>
                        <p className="text-sm text-muted-foreground">{entity?.name}</p>
                      </div>
                      <Badge variant={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                    <p className="text-sm mb-3">{request.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <p>
                        <strong>Solicitud:</strong> {request.requestDate}
                      </p>
                      {request.responseDate && (
                        <p>
                          <strong>Respuesta:</strong> {request.responseDate}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(request.id)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {currentUser?.role === "Administrador" && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(request.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron solicitudes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Solicitud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ente</Label>
              <Select
                value={formData.entityId}
                onValueChange={(value) => setFormData({ ...formData, entityId: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Solicitud</Label>
                <Input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Estatus</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Solicitante</Label>
              <Input
                value={formData.requester}
                onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Respuesta</Label>
              <Input
                type="date"
                value={formData.responseDate || ""}
                onChange={(e) => setFormData({ ...formData, responseDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
