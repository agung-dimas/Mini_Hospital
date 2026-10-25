import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data Pharmacy (Supabase B)...')

  // 1. Profil Pengguna
  const apoteker = await prisma.profilPengguna.create({
    data: {
      namaLengkap: 'apt. Rina Marlina, S.Farm',
      peran: 'apoteker',
    },
  })

  const pengelola = await prisma.profilPengguna.create({
    data: {
      namaLengkap: 'Bambang Irawan',
      peran: 'pengelola_farmasi',
    },
  })

  // 2. Master Obat dengan stok awal
  const obat1 = await prisma.obat.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000001',
      kodeObat: 'OBT-PCT-500',
      namaObat: 'Paracetamol 500 mg',
      bentukObat: 'Tablet',
      kekuatanObat: '500 mg',
      satuan: 'Strip',
      stokMinimum: 20,
      aktif: true,
      pergerakanStok: {
        create: {
          jenisPergerakan: 'penerimaan',
          perubahanJumlah: 150,
          alasan: 'Stok awal gudang farmasi',
          dibuatOleh: pengelola.id,
        },
      },
    },
  })

  const obat2 = await prisma.obat.create({
    data: {
      id: 'a0000000-0000-0000-0000-000000000002',
      kodeObat: 'OBT-AMX-500',
      namaObat: 'Amoxicillin 500 mg',
      bentukObat: 'Kapsul',
      kekuatanObat: '500 mg',
      satuan: 'Strip',
      stokMinimum: 15,
      aktif: true,
      pergerakanStok: {
        create: {
          jenisPergerakan: 'penerimaan',
          perubahanJumlah: 80,
          alasan: 'Stok awal gudang farmasi',
          dibuatOleh: pengelola.id,
        },
      },
    },
  })

  const obat3 = await prisma.obat.create({
    data: {
      kodeObat: 'OBT-CTZ-010',
      namaObat: 'Cetirizine 10 mg',
      bentukObat: 'Tablet',
      kekuatanObat: '10 mg',
      satuan: 'Strip',
      stokMinimum: 10,
      aktif: true,
      pergerakanStok: {
        create: {
          jenisPergerakan: 'penerimaan',
          perubahanJumlah: 50,
          alasan: 'Stok awal gudang farmasi',
          dibuatOleh: pengelola.id,
        },
      },
    },
  })

  const obat4 = await prisma.obat.create({
    data: {
      kodeObat: 'OBT-OMZ-020',
      namaObat: 'Omeprazole 20 mg',
      bentukObat: 'Kapsul',
      kekuatanObat: '20 mg',
      satuan: 'Strip',
      stokMinimum: 15,
      aktif: true,
      pergerakanStok: {
        create: {
          jenisPergerakan: 'penerimaan',
          perubahanJumlah: 60,
          alasan: 'Stok awal gudang farmasi',
          dibuatOleh: pengelola.id,
        },
      },
    },
  })

  const obat5 = await prisma.obat.create({
    data: {
      kodeObat: 'OBT-AMB-SYR',
      namaObat: 'Ambroxol Sirup 15 mg/5 ml',
      bentukObat: 'Sirup',
      kekuatanObat: '15 mg / 5 ml',
      satuan: 'Botol',
      stokMinimum: 5,
      aktif: true,
      pergerakanStok: {
        create: {
          jenisPergerakan: 'penerimaan',
          perubahanJumlah: 25,
          alasan: 'Stok awal gudang farmasi',
          dibuatOleh: pengelola.id,
        },
      },
    },
  })

  console.log('Seeding Pharmacy selesai!')
  console.log({
    obatCount: 5,
    apotekerId: apoteker.id,
    paracetamolId: obat1.id,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
