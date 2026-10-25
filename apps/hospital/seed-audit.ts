import { prisma } from './src/lib/prisma';

async function seedAuditDanIntegrasi() {
  console.log('Seeding data audit dan peristiwa integrasi ke Supabase A...');

  const resep = await prisma.resep.findFirst();
  const dokter = await prisma.dokter.findFirst();
  const pasien = await prisma.pasien.findFirst();
  const admin = await prisma.profilPengguna.findFirst({ where: { peran: 'admin' } });

  // 1. Peristiwa Integrasi
  await prisma.peristiwaIntegrasi.createMany({
    data: [
      {
        jenisPeristiwa: 'resep_diterbitkan',
        referensiData: resep?.id,
        kunciIdempotensi: `idemp-resep-${Date.now()}-001`,
        statusPengiriman: 'terkirim',
        jumlahPercobaan: 1,
        kesalahanTerakhir: null,
      },
      {
        jenisPeristiwa: 'permintaan_stok_obat',
        referensiData: resep?.id,
        kunciIdempotensi: `idemp-stok-${Date.now()}-002`,
        statusPengiriman: 'terkirim',
        jumlahPercobaan: 1,
        kesalahanTerakhir: null,
      },
      {
        jenisPeristiwa: 'sinkronisasi_status_resep',
        referensiData: resep?.id,
        kunciIdempotensi: `idemp-sync-${Date.now()}-003`,
        statusPengiriman: 'terkirim',
        jumlahPercobaan: 1,
        kesalahanTerakhir: null,
      },
    ],
  });

  // 2. Log Audit
  await prisma.logAudit.createMany({
    data: [
      {
        penggunaId: admin?.id,
        aksi: 'LOGIN_SISTEM',
        jenisData: 'autentikasi',
        referensiData: admin?.id,
      },
      {
        penggunaId: dokter?.penggunaId,
        aksi: 'TERBITKAN_RESEP',
        jenisData: 'resep',
        referensiData: resep?.id,
      },
      {
        penggunaId: dokter?.penggunaId,
        aksi: 'SIMPAN_PEMERIKSAAN_MEDIS',
        jenisData: 'pemeriksaan',
        referensiData: pasien?.id,
      },
      {
        penggunaId: admin?.id,
        aksi: 'PENDAFTARAN_PASIEN_BARU',
        jenisData: 'pasien',
        referensiData: pasien?.id,
      },
      {
        penggunaId: admin?.id,
        aksi: 'VERIFIKASI_INTEGRASI_SUPABASE',
        jenisData: 'sistem',
        referensiData: null,
      },
    ],
  });

  console.log('Seeding audit & integrasi Supabase A berhasil!');
}

seedAuditDanIntegrasi()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
