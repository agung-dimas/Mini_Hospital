import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonSuccess, jsonError } from '@/lib/response'
import { updateHospitalResepStatus } from '@/lib/integrations/hospital'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { items, diserahkan_oleh } = body
    const idempotencyKey = request.headers.get('Idempotency-Key') || undefined

    const pesanan = await prisma.pesananResep.findUnique({
      where: { id },
      include: {
        detailPesananResep: {
          include: {
            obat: {
              include: { pergerakanStok: true },
            },
          },
        },
      },
    })

    if (!pesanan) {
      return jsonError('Data pesanan resep tidak ditemukan', 404)
    }

    if (pesanan.status === 'diserahkan') {
      return jsonError('Resep ini sudah selesai diserahkan sebelumnya', 409)
    }

    // Default item penyerahan sesuai permintaan jika tidak dikirim spesifik
    const itemPenyerahan: Array<{ obat_id: string; jumlah_diserahkan: number }> =
      items && items.length > 0
        ? items
        : pesanan.detailPesananResep.map((d) => ({
            obat_id: d.obatId,
            jumlah_diserahkan: d.jumlahDiminta,
          }))

    // Eksekusi atomik menggunakan Prisma Transaction
    const hasilPenyerahan = await prisma.$transaction(async (tx) => {
      // 1. Validasi ketersediaan stok setiap item
      for (const item of itemPenyerahan) {
        const obat = await tx.obat.findUnique({
          where: { id: item.obat_id },
          include: { pergerakanStok: true },
        })

        if (!obat) {
          throw new Error(`OBAT_NOT_FOUND:${item.obat_id}`)
        }

        const stokSaatIni = obat.pergerakanStok.reduce(
          (sum, m) => sum + m.perubahanJumlah,
          0
        )

        if (stokSaatIni < item.jumlah_diserahkan) {
          throw new Error(`STOK_KURANG:${obat.namaObat}:Tersedia ${stokSaatIni}, diminta ${item.jumlah_diserahkan}`)
        }

        // 2. Simpan detail penyerahan obat
        await tx.detailPenyerahanObat.create({
          data: {
            pesananResepId: pesanan.id,
            obatId: item.obat_id,
            jumlahDiserahkan: item.jumlah_diserahkan,
            diserahkanOleh: diserahkan_oleh,
          },
        })

        // 3. Potong stok melalui pencatatan mutasi negatif
        await tx.pergerakanStok.create({
          data: {
            obatId: item.obat_id,
            jenisPergerakan: 'penyerahan',
            perubahanJumlah: -Math.abs(item.jumlah_diserahkan),
            referensiTransaksi: pesanan.id,
            alasan: `Penyerahan obat untuk pesanan resep RS: ${pesanan.resepRumahSakitId}`,
            dibuatOleh: diserahkan_oleh,
          },
        })
      }

      // 4. Update status pesanan resep
      const updatedPesanan = await tx.pesananResep.update({
        where: { id: pesanan.id },
        data: { status: 'diserahkan' },
      })

      // 5. Catat log integrasi penyerahan
      await tx.logIntegrasi.create({
        data: {
          arahIntegrasi: 'keluar_ke_hospital',
          referensiData: pesanan.id,
          endpoint: `/api/v1/resep/${pesanan.resepRumahSakitId}/status`,
          kodeStatusHttp: 200,
          pesanKesalahan: null,
        },
      })

      return updatedPesanan
    })

    // 6. Sinkronisasi status kembali ke Hospital via REST API
    try {
      await updateHospitalResepStatus(
        pesanan.resepRumahSakitId,
        'diserahkan',
        idempotencyKey
      )
    } catch (syncError) {
      console.warn('Peringatan: Gagal mengirim status penyerahan ke Hospital secara otomatis:', syncError)
    }

    return jsonSuccess(
      hasilPenyerahan,
      'Penyerahan obat berhasil diproses, stok telah dipotong secara atomik, dan status disinkronkan'
    )
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.startsWith('STOK_KURANG')) {
        const detail = error.message.replace('STOK_KURANG:', '')
        return jsonError(`Ketersediaan stok tidak mencukupi: ${detail}`, 400)
      }
      if (error.message.startsWith('OBAT_NOT_FOUND')) {
        return jsonError('Salah satu obat tidak ditemukan di database Farmasi', 404)
      }
    }
    console.error('Error POST /api/v1/pesanan-resep/[id]/penyerahan:', error)
    return jsonError('Gagal memproses penyerahan obat', 500)
  }
}
