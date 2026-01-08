export type UserRole = "Administrador" | "Editor" | "Lector"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
}

export type EntityType = "Organismo" | "Fideicomiso" | "EPEM"
export type EntityStatus = "Activo" | "Inactivo"

export interface Entity {
  id: string
  folio: string
  type: EntityType
  name: string
  purpose: string
  address: string
  creationInstrument: string
  creationDate: string
  officialPublication: string
  observations: string
  status: EntityStatus
  createdAt: string
  requestLetter?: string
  hasHistoricalRecords?: boolean
  historicalDocuments?: string[]
}

export interface RegulatoryDocument {
  id: string
  entityId: string
  type: string
  issueDate: string
  validity: string
  file: string
  notes: string
}

export interface GoverningBody {
  id: string
  entityId: string
  bodyType: string
  memberName: string
  position: string
  appointmentDate: string
  designationInstrument: string
  status: "Activo" | "Concluido"
  observations: string
}

export interface Director {
  id: string
  entityId: string
  name: string
  position: string
  responsibilityType: string
  startDate: string
  supportDocument: string
}

export interface Power {
  id: string
  entityId: string
  powerType: string
  attorneys: string[]
  grantDate: string
  document: string
}
