import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET() {
  try {
    const [peristiwaList, auditList] = await Promise.all([
      prisma.peristiwaIntegrasi.findMany({
        take: 20,
        orderBy: { dibuatPada: 'desc' },
      }),
      prisma.logAudit.findMany({
        take: 20,
        orderBy: { dibuatPada: 'desc' },
      }),
    ])

    return jsonSuccess({
      peristiwaIntegrasi: peristiwaList,
      logAudit: auditList,
    }, 'Log audit & integrasi berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/log-audit:', error)
    return jsonError('Gagal mengambil data log audit', 500)
  }
}
