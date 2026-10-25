import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const obat = await prisma.obat.findUnique({
      where: { id },
      include: {
        pergerakanStok: {
          orderBy: { dibuatPada: 'desc' },
          take: 20,
        },
      },
    })

    if (!obat) {
      return jsonError('Data obat tidak ditemukan', 404)
    }

    const totalStok = obat.pergerakanStok.reduce(
      (total, mutasi) => total + mutasi.perubahanJumlah,
      0
    )

    return jsonSuccess(
      {
        ...obat,
        stok_saat_ini: totalStok,
        stok_rendah: totalStok <= obat.stokMinimum,
      },
      'Detail data obat berhasil diambil'
    )
  } catch (error) {
    console.error('Error GET /api/v1/obat/[id]:', error)
    return jsonError('Gagal mengambil data obat', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const obat = await prisma.obat.findUnique({
      where: { id },
    })

    if (!obat) {
      return jsonError('Data obat tidak ditemukan', 404)
    }

    const dataUpdate: {
      namaObat?: string
      bentukObat?: string
      kekuatanObat?: string
      satuan?: string
      stokMinimum?: number
      aktif?: boolean
    } = {}

    if (body.nama_obat) dataUpdate.namaObat = body.nama_obat
    if (body.bentuk_obat) dataUpdate.bentukObat = body.bentuk_obat
    if (body.kekuatan_obat) dataUpdate.kekuatanObat = body.kekuatan_obat
    if (body.satuan) dataUpdate.satuan = body.satuan
    if (body.stok_minimum !== undefined) dataUpdate.stokMinimum = body.stok_minimum
    if (body.aktif !== undefined) dataUpdate.aktif = body.aktif

    const updated = await prisma.obat.update({
      where: { id },
      data: dataUpdate,
    })

    return jsonSuccess(updated, 'Data obat berhasil diperbarui')
  } catch (error) {
    console.error('Error PATCH /api/v1/obat/[id]:', error)
    return jsonError('Gagal memperbarui data obat', 500)
  }
}
