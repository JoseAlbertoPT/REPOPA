import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // TOTAL DE ENTES ACTIVOS
    const [totalResult]: any = await db.query(`
      SELECT COUNT(*) AS total
      FROM entes
      WHERE estatus = 'Activo'
    `)

    const totalEntities = totalResult?.[0]?.total ?? 0

    // ORGANISMOS PÚBLICOS DESCENTRALIZADOS (OPD)
    const [opdResult]: any = await db.query(`
      SELECT COUNT(*) AS total
      FROM entes
      WHERE tipo_ente = 'OPD'
        AND estatus = 'Activo'
    `)

    const activeOrganisms = opdResult?.[0]?.total ?? 0

    // FIDEICOMISOS
    const [fiResult]: any = await db.query(`
      SELECT COUNT(*) AS total
      FROM entes
      WHERE tipo_ente = 'Fideicomiso'
        AND estatus = 'Activo'
    `)

    const activeTrusts = fiResult?.[0]?.total ?? 0

    // EMPRESAS DE PARTICIPACIÓN ESTATAL (EPEM)
    const [epemResult]: any = await db.query(`
      SELECT COUNT(*) AS total
      FROM entes
      WHERE tipo_ente = 'EPEM'
        AND estatus = 'Activo'
    `)

    const activeEPEM = epemResult?.[0]?.total ?? 0

    // ÚLTIMOS 5 ENTES REGISTRADOS
    const [recentEntities]: any = await db.query(`
      SELECT
        id,
        nombre_oficial AS name,
        folio_inscripcion AS folio,
        tipo_ente
      FROM entes
      WHERE estatus = 'Activo'
      ORDER BY created_at DESC
      LIMIT 5
    `)

    // RESPUESTA FINAL
    return NextResponse.json({
      totalEntities,
      activeOrganisms,
      activeTrusts,
      activeEPEM,
      recentEntities: recentEntities ?? []
    })

  } catch (error) {
    console.error("Error al cargar estadísticas del dashboard:", error)

    return NextResponse.json(
      {
        error: "Error al cargar estadísticas",
        totalEntities: 0,
        activeOrganisms: 0,
        activeTrusts: 0,
        activeEPEM: 0,
        recentEntities: []
      },
      { status: 500 }
    )
  }
}
