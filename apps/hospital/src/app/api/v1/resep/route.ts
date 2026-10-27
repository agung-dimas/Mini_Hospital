import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resepSchema } from '@/lib/validation'
import { jsonSuccess, jsonError } from '@/lib/response'
import { kirimResepKeFarmasi } from '@/lib/integrations/pharmacy'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const dokterId = searchParams.get('dokterId')

    const where: Record<string, any> = {}
    if (status) where.status = status
    if (dokterId) where.dokterId = dokterId

    const daftarResep = await prisma.resep.findMany({
      where,
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

      return resep
    })

    const kunjunganDenganPemeriksaan = await prisma.kunjungan.findUnique({
      where: { id: resepBaru.kunjunganId },
      include: {
        pemeriksaan: {
          orderBy: { dibuatPada: 'desc' },
          take: 1,
        },
      },
    })

    // Kirim ke Farmasi di luar transaksi agar resep tetap tersimpan walau Farmasi mati
    let statusPengiriman = 'gagal'
    let kesalahanTerakhir: string | null = null
    try {
      const hasil = await kirimResepKeFarmasi({
        ...resepBaru,
        kunjungan: { pemeriksaan: kunjunganDenganPemeriksaan?.pemeriksaan || [] },
      })
      if (hasil.ok) statusPengiriman = 'terkirim'
      else kesalahanTerakhir = hasil.json?.pesan || `HTTP ${hasil.status}`
    } catch (err) {
      kesalahanTerakhir = err instanceof Error ? err.message : 'Farmasi tidak merespons'
    }

    await prisma.peristiwaIntegrasi.create({
      data: {
        jenisPeristiwa: 'terbitkan_resep',
        referensiData: resepBaru.id,
        kunciIdempotensi: `resep-${resepBaru.id}`,
        statusPengiriman,
        jumlahPercobaan: 1,
        kesalahanTerakhir,
      },
    })

    const pesan =
      statusPengiriman === 'terkirim'
        ? 'Resep diterbitkan dan sudah masuk antrean Farmasi'
        : `Resep tersimpan, tetapi gagal dikirim ke Farmasi: ${kesalahanTerakhir}`
    return jsonSuccess({ ...resepBaru, statusPengiriman }, pesan, 201)
  } catch (error) {
    console.error('Error POST /api/v1/resep:', error)
    return jsonError('Gagal menerbitkan resep', 500)
  }
}
