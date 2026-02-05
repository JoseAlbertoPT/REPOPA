import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import type { RowDataPacket, ResultSetHeader } from "mysql2"

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(`
      SELECT 
        id,
        folio_inscripcion AS folio,
        nombre_oficial AS name,
        tipo_ente AS type,
        objeto AS purpose,
        domicilio AS address,
        estatus AS status
      FROM entes
      ORDER BY nombre_oficial ASC
    `)

    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data.name || !data.type) {
      return NextResponse.json({ error: "Nombre y tipo son obligatorios" }, { status: 400 })
    }

 
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT MAX(
        CAST(
          SUBSTRING_INDEX(folio_inscripcion, '-', -1) 
          AS UNSIGNED
        )
      ) as lastNum 
      FROM entes 
      WHERE folio_inscripcion LIKE 'SAyF-PF-REPOPA-%'`
    )
    
    const nextNum = (rows[0]?.lastNum || 0) + 1
    const consecutivo = String(nextNum).padStart(3, '0')

    const nameParts = data.name.trim().split(/\s+/)
    const siglas = nameParts
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 5)
      .replace(/[^A-Z]/g, '') 

    const tipoMap: Record<string, string> = {
      'OPD': 'OPD',
      'Organismo': 'OPD',
      'Fideicomiso': 'FI',
      'EPEM': 'EPEM'
    }

    const tipoSigla = tipoMap[data.type] || 'OPD'
    const year = new Date().getFullYear()

    
    const folio = `SAyF-PF-REPOPA-${siglas}-${tipoSigla}-${year}-${consecutivo}`

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO entes 
      (folio_inscripcion, nombre_oficial, tipo_ente, objeto, domicilio, estatus)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        folio,
        data.name,
        data.type,
        data.purpose || "",
        data.address || "",
        data.status || "Activo",
      ]
    )

    return NextResponse.json({ id: result.insertId, folio })
  } catch (error: any) {
    console.error("Error en POST /api/entes:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}