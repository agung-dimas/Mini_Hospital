import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obatSchema } from '@/lib/validation'
import { jsonSuccess, jsonError } from '@/lib/response'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cari = searchParams.get('cari') || ''

    const daftarObat = await prisma.obat.findMany({
      where: cari
        ? {
            OR: [
              { namaObat: { contains: cari, mode: 'insensitive' } },
              { kodeObat: { contains: cari, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        pergerakanStok: true,
      },
      orderBy: { namaObat: 'asc' },
    })

    // Hitung stok aktual dari mutasi pergerakan stok
    const obatDenganStok = daftarObat.map((obat) => {
      const totalStok = obat.pergerakanStok.reduce(
        (total, mutasi) => total + mutasi.perubahanJumlah,
        0
      )
      return {
        id: obat.id,
        kode_obat: obat.kodeObat,
        nama_obat: obat.namaObat,
        bentuk_obat: obat.bentukObat,
        kekuatan_obat: obat.kekuatanObat,
        satuan: obat.satuan,
        stok_minimum: obat.stokMinimum,
        stok_saat_ini: totalStok,
        stok_rendah: totalStok <= obat.stokMinimum,
        aktif: obat.aktif,
      }
    })

    return jsonSuccess(obatDenganStok, 'Katalog obat berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/obat:', error)
    return jsonError('Gagal mengambil daftar obat', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validasi = obatSchema.safeParse(body)

    if (!validasi.success) {
      return jsonError('Validasi data obat gagal', 422, validasi.error.flatten().fieldErrors)
    }

    const { kode_obat, nama_obat, bentuk_obat, kekuatan_obat, satuan, stok_minimum } = validasi.data

    const duplikat = await prisma.obat.findUnique({
      where: { kodeObat: kode_obat },
    })

    if (duplikat) {
      return jsonError('Kode obat sudah terdaftar', 409, {
        kode_obat: ['Kode obat harus unik'],
      })
    }

    const obatBaru = await prisma.obat.create({
      data: {
        kodeObat: kode_obat,
        namaObat: nama_obat,
        bentukObat: bentuk_obat,
        kekuatanObat: kekuatan_obat,
        satuan,
        stokMinimum: stok_minimum,
        aktif: true,
      },
    })

    return jsonSuccess(obatBaru, 'Data master obat berhasil ditambahkan', 201)
  } catch (error) {
    console.error('Error POST /api/v1/obat:', error)
    return jsonError('Gagal menambahkan obat', 500)
  }
}
