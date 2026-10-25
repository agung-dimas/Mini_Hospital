import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resepSchema } from '@/lib/validation'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const daftarResep = await prisma.resep.findMany({
      where: status ? { status } : undefined,
      include: {
        pasien: true,
        dokter: true,
        detailResep: true,
      },
      orderBy: { dibuatPada: 'desc' },
    })

    return jsonSuccess(daftarResep, 'Daftar resep berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/resep:', error)
    return jsonError('Gagal mengambil daftar resep', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validasi = resepSchema.safeParse(body)

    if (!validasi.success) {
      return jsonError('Validasi data resep gagal', 422, validasi.error.flatten().fieldErrors)
    }

    const { kunjungan_id, pasien_id, dokter_id, item_obat } = validasi.data

    const resepBaru = await prisma.$transaction(async (tx) => {
      const resep = await tx.resep.create({
        data: {
          kunjunganId: kunjungan_id,
          pasienId: pasien_id,
          dokterId: dokter_id,
          status: 'diterbitkan',
          diterbitkanPada: new Date(),
          detailResep: {
            create: item_obat.map((item) => ({
              obatId: item.obat_id,
              namaObatSaatResep: item.nama_obat_saat_resep,
              jumlah: item.jumlah,
              instruksiPenggunaan: item.instruksi_penggunaan,
            })),
          },
        },
        include: {
          pasien: true,
          dokter: true,
          detailResep: true,
        },
      })

      // Catat log integrasi pengiriman resep
      await tx.peristiwaIntegrasi.create({
        data: {
          jenisPeristiwa: 'terbitkan_resep',
          referensiData: resep.id,
          statusPengiriman: 'tertunda',
        },
      })

      return resep
    })

    return jsonSuccess(resepBaru, 'Resep berhasil diterbitkan oleh dokter', 201)
  } catch (error) {
    console.error('Error POST /api/v1/resep:', error)
    return jsonError('Gagal menerbitkan resep', 500)
  }
}
