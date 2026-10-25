import { prisma } from './src/lib/prisma';

async function checkHospitalDB() {
  console.log('=== VERIFIKASI SUPABASE A (HOSPITAL) ===');
  try {
    const [dokterCount, pasienCount, kunjunganCount, pemeriksaanCount, resepCount, detailResepCount] = await Promise.all([
      prisma.dokter.count(),
      prisma.pasien.count(),
      prisma.kunjungan.count(),
      prisma.pemeriksaan.count(),
      prisma.resep.count(),
      prisma.detailResep.count(),
    ]);

    console.log('STATUS: ? TERHUBUNG KE SUPABASE LIVE!');
    console.log(`- Tabel 'dokter': ${dokterCount} baris`);
    console.log(`- Tabel 'pasien': ${pasienCount} baris`);
    console.log(`- Tabel 'kunjungan': ${kunjunganCount} baris`);
    console.log(`- Tabel 'pemeriksaan': ${pemeriksaanCount} baris`);
    console.log(`- Tabel 'resep': ${resepCount} baris`);
    console.log(`- Tabel 'detail_resep': ${detailResepCount} baris`);

    const resepSample = await prisma.resep.findFirst({
      include: {
        pasien: true,
        dokter: true,
        detailResep: true,
      },
    });

    if (resepSample) {
      console.log('\n[Sampel Resep Tersedia di Supabase A]:');
      console.log(`- ID Resep: ${resepSample.id}`);
      console.log(`- Pasien: ${resepSample.pasien.namaLengkap} (No. RM: ${resepSample.pasien.nomorRekamMedis})`);
      console.log(`- Dokter: ${resepSample.dokter.namaLengkap} (${resepSample.dokter.spesialisasi})`);
      console.log(`- Status: ${resepSample.status}`);
      console.log(`- Diterbitkan Pada: ${resepSample.diterbitkanPada ?? 'Belum'}`);
      console.log('- Obat yang diresepkan:');
      for (const item of resepSample.detailResep) {
        console.log(`  * ${item.namaObatSaatResep} : ${item.jumlah} unit - Aturan: "${item.instruksiPenggunaan}"`);
      }
    }
  } catch (error) {
    console.error('GAGAL TERHUBUNG KE SUPABASE A:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHospitalDB();
