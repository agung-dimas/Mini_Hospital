import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data Hospital (Supabase A)...')

  // 1. Profil Pengguna
  const admin = await prisma.profilPengguna.create({
    data: {
      namaLengkap: 'Administrator Rumah Sakit',
      peran: 'admin',
    },
  })

  const pendaftaran = await prisma.profilPengguna.create({
    data: {
      namaLengkap: 'Petugas Pendaftaran 1',
      peran: 'pendaftaran',
    },
  })

  const dokterProfil = await prisma.profilPengguna.create({
    data: {
      namaLengkap: 'dr. Budi Santoso, Sp.PD',
      peran: 'dokter',
    },
  })

  // 2. Data Dokter
  const dokter1 = await prisma.dokter.create({
    data: {
      penggunaId: dokterProfil.id,
      namaLengkap: 'dr. Budi Santoso, Sp.PD',
      spesialisasi: 'Spesialis Penyakit Dalam',
      aktif: true,
    },
  })

  const dokter2 = await prisma.dokter.create({
    data: {
      namaLengkap: 'dr. Siti Rahmawati, Sp.A',
      spesialisasi: 'Spesialis Anak',
      aktif: true,
    },
  })

  const dokter3 = await prisma.dokter.create({
    data: {
      namaLengkap: 'dr. Hendra Kusuma, Sp.B',
      spesialisasi: 'Spesialis Bedah',
      aktif: true,
    },
  })

  // 3. Data Pasien
  const pasien1 = await prisma.pasien.create({
    data: {
      nomorRekamMedis: 'RM-2026-0001',
      namaLengkap: 'Ahmad Fauzi',
      tanggalLahir: new Date('1990-05-15'),
      jenisKelamin: 'laki-laki',
      alamat: 'Jl. Merdeka No. 12, Jakarta',
    },
  })

  const pasien2 = await prisma.pasien.create({
    data: {
      nomorRekamMedis: 'RM-2026-0002',
      namaLengkap: 'Dewi Lestari',
      tanggalLahir: new Date('1995-08-20'),
      jenisKelamin: 'perempuan',
      alamat: 'Jl. Sudirman No. 45, Bandung',
    },
  })

  const pasien3 = await prisma.pasien.create({
    data: {
      nomorRekamMedis: 'RM-2026-0003',
      namaLengkap: 'Rudi Hartono',
      tanggalLahir: new Date('1982-11-03'),
      jenisKelamin: 'laki-laki',
      alamat: 'Jl. Diponegoro No. 8, Surabaya',
    },
  })

  // 4. Kunjungan
  const kunjungan1 = await prisma.kunjungan.create({
    data: {
      pasienId: pasien1.id,
      dokterId: dokter1.id,
      status: 'selesai',
    },
  })

  // 5. Pemeriksaan
  await prisma.pemeriksaan.create({
    data: {
      kunjunganId: kunjungan1.id,
      diagnosis: 'Faringitis Akut & Demam Ringan',
      catatan: 'Pasien mengeluh radang tenggorokan dan demam selama 2 hari. Suhu tubuh 38°C.',
      dibuatOleh: dokterProfil.id,
    },
  })

  // 6. Resep
  const resep1 = await prisma.resep.create({
    data: {
      kunjunganId: kunjungan1.id,
      pasienId: pasien1.id,
      dokterId: dokter1.id,
      status: 'diterbitkan',
      diterbitkanPada: new Date(),
      detailResep: {
        create: [
          {
            obatId: 'a0000000-0000-0000-0000-000000000001',
            namaObatSaatResep: 'Paracetamol 500 mg',
            jumlah: 10,
            instruksiPenggunaan: '3 x 1 tablet sesudah makan bila demam',
          },
          {
            obatId: 'a0000000-0000-0000-0000-000000000002',
            namaObatSaatResep: 'Amoxicillin 500 mg',
            jumlah: 15,
            instruksiPenggunaan: '3 x 1 tablet sehari dihabiskan',
          },
        ],
      },
    },
  })

  console.log('Seeding Hospital selesai!')
  console.log({
    dokterCount: 3,
    pasienCount: 3,
    resepId: resep1.id,
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
