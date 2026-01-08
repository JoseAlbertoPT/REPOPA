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
import { Plus, Search, Edit, Trash2, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function GoverningBodiesPage() {
  const { entities, governingBodies, addGoverningBody, updateGoverningBody, deleteGoverningBody } = useApp()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEntity, setFilterEntity] = useState<string>("Todos")
  const [filterStatus, setFilterStatus] = useState<"Todos" | "Activo" | "Concluido">("Todos")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBody, setSelectedBody] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    entityId: "",
    bodyType: "",
    memberName: "",
    position: "",
    appointmentDate: "",
    designationInstrument: "",
    status: "Activo" as "Activo" | "Concluido",
    observations: "",
  })

  useEffect(() => {
    const userStr = sessionStorage.getItem("currentUser")
    if (userStr) {
      setCurrentUser(JSON.parse(userStr))
    }
  }, [])

  const filteredBodies = governingBodies.filter((body) => {
    const entity = entities.find((e) => e.id === body.entityId)
    const matchesSearch =
      body.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      body.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEntity = filterEntity === "Todos" || body.entityId === filterEntity
    const matchesStatus = filterStatus === "Todos" || body.status === filterStatus
    return matchesSearch && matchesEntity && matchesStatus
  })

  const handleAdd = () => {
    if (!formData.entityId || !formData.memberName || !formData.position) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos",
        variant: "destructive",
      })
      return
    }

    addGoverningBody(formData)
    toast({
      title: "Miembro registrado",
      description: "El integrante del órgano de gobierno ha sido registrado",
    })
    setIsAddDialogOpen(false)
    setFormData({
      entityId: "",
      bodyType: "",
      memberName: "",
      position: "",
      appointmentDate: "",
      designationInstrument: "",
      status: "Activo",
      observations: "",
    })
  }

  const handleEdit = () => {
    if (selectedBody) {
      updateGoverningBody(selectedBody, formData)
      toast({
        title: "Actualizado",
        description: "El registro ha sido actualizado correctamente",
      })
      setIsEditDialogOpen(false)
      setSelectedBody(null)
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

    if (confirm("¿Está seguro de eliminar este registro?")) {
      deleteGoverningBody(id)
      toast({
        title: "Eliminado",
        description: "El registro ha sido eliminado",
      })
    }
  }

  const openEditDialog = (id: string) => {
    const body = governingBodies.find((b) => b.id === id)
    if (body) {
      setFormData(body)
      setSelectedBody(id)
      setIsEditDialogOpen(true)
    }
  }

  const canEdit = currentUser?.role === "Administrador" || currentUser?.role === "Editor"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Integrantes</h1>
          <p className="text-muted-foreground mt-2">Integrantes de juntas, consejos y comités</p>
        </div>
        {canEdit && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Integrante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Registrar Integrante</DialogTitle>
                <DialogDescription>Complete la información del integrante del órgano de gobierno</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto flex-1">
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
                <div className="space-y-2">
                  <Label htmlFor="bodyType">Tipo de Órgano</Label>
                  <Input
                    id="bodyType"
                    value={formData.bodyType}
                    onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                    placeholder="Junta, Consejo, Comité Técnico"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memberName">Nombre del Integrante *</Label>
                  <Input
                    id="memberName"
                    value={formData.memberName}
                    onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Cargo *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Presidente, Vocal, etc."
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
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Concluido">Concluido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">Fecha de Nombramiento</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designationInstrument">Instrumento de Designación</Label>
                  <Input
                    id="designationInstrument"
                    value={formData.designationInstrument}
                    onChange={(e) => setFormData({ ...formData, designationInstrument: e.target.value })}
                    placeholder="Acuerdo, Oficio, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
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
              <CardTitle>Integrantes</CardTitle>
              <CardDescription>{filteredBodies.length} integrantes registrados</CardDescription>
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
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Activo">Activos</SelectItem>
                  <SelectItem value="Concluido">Concluidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBodies.map((body) => {
              const entity = entities.find((e) => e.id === body.entityId)
              return (
                <div
                  key={body.id}
                  className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{body.memberName}</h3>
                        <p className="text-sm text-muted-foreground">{body.position}</p>
                      </div>
                      <Badge variant={body.status === "Activo" ? "default" : "outline"}>{body.status}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <p>
                        <strong>Ente:</strong> {entity?.name}
                      </p>
                      <p>
                        <strong>Órgano:</strong> {body.bodyType || "No especificado"}
                      </p>
                      <p>
                        <strong>Nombramiento:</strong> {body.appointmentDate || "No especificado"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canEdit && (
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(body.id)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      )}
                      {currentUser?.role === "Administrador" && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(body.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredBodies.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron integrantes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar Integrante</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1">
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
            <div className="space-y-2">
              <Label>Tipo de Órgano</Label>
              <Input
                value={formData.bodyType}
                onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formData.memberName}
                onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Concluido">Concluido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Nombramiento</Label>
              <Input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Instrumento de Designación</Label>
              <Input
                value={formData.designationInstrument}
                onChange={(e) => setFormData({ ...formData, designationInstrument: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
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
