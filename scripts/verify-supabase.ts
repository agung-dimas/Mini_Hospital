import { PrismaClient as HospitalPrisma } from '../apps/hospital/src/lib/prisma';
import { PrismaClient as PharmacyPrisma } from '../apps/pharmacy/src/lib/prisma';

async function checkDatabase() {
  console.log('=== MEMULAI VERIFIKASI KONEKSI DUA DATABASE SUPABASE ===\n');

  // 1. Cek Supabase A (Hospital)
  console.log('--- [1] Supabase A: Hospital Database ---');
  try {
    const hospital = new HospitalPrisma();
    const [dokterCount, pasienCount, kunjunganCount, resepCount] = await Promise.all([
      hospital.dokter.count(),
      hospital.pasien.count(),
      hospital.kunjungan.count(),
      hospital.resep.count(),
    ]);

    console.log('Status: TERHUBUNG (OK)');
    console.log(`- Jumlah Dokter: ${dokterCount}`);
    console.log(`- Jumlah Pasien: ${pasienCount}`);
    console.log(`- Jumlah Kunjungan: ${kunjunganCount}`);
    console.log(`- Jumlah Resep: ${resepCount}`);

    const sampleResep = await hospital.resep.findFirst({
      include: {
        pasien: true,
        dokter: true,
        detail_resep: true,
      },
    });

    if (sampleResep) {
      console.log(`\nContoh Resep Tersimpan di Supabase A:`);
      console.log(`- Nomor Resep: ${sampleResep.nomor_resep}`);
      console.log(`- Pasien: ${sampleResep.pasien.nama_lengkap}`);
      console.log(`- Dokter: ${sampleResep.dokter.nama_lengkap} (${sampleResep.dokter.spesialisasi})`);
      console.log(`- Status: ${sampleResep.status}`);
      console.log(`- Jumlah Item Obat: ${sampleResep.detail_resep.length}`);
      sampleResep.detail_resep.forEach((d, i) => {
        console.log(`  ${i + 1}. [${d.kode_obat}] ${d.nama_obat} - ${d.jumlah} ${d.satuan} (${d.aturan_pakai})`);
      });
    }
    await hospital.$disconnect();
  } catch (err) {
    console.error('ERROR Koneksi Supabase A (Hospital):', err);
  }

  console.log('\n-----------------------------------------------\n');

  // 2. Cek Supabase B (Pharmacy)
  console.log('--- [2] Supabase B: Pharmacy Database ---');
  try {
    const pharmacy = new PharmacyPrisma();
    const [obatCount, stokMovementCount, pesananCount] = await Promise.all([
      pharmacy.obat.count(),
      pharmacy.pergerakan_stok.count(),
      pharmacy.pesanan_resep.count(),
    ]);

    console.log('Status: TERHUBUNG (OK)');
    console.log(`- Jumlah Master Obat: ${obatCount}`);
    console.log(`- Jumlah Pergerakan Stok: ${stokMovementCount}`);
    console.log(`- Jumlah Pesanan Resep: ${pesananCount}`);

    const obatList = await pharmacy.obat.findMany({
      take: 5,
      select: {
        kode_obat: true,
        nama_obat: true,
        kategori: true,
        satuan: true,
        stok_tersedia: true,
        stok_minimum: true,
      },
    });

    console.log(`\nDaftar Obat di Supabase B:`);
    obatList.forEach((o, i) => {
      console.log(`  ${i + 1}. [${o.kode_obat}] ${o.nama_obat} - Stok: ${o.stok_tersedia} ${o.satuan} (Min: ${o.stok_minimum})`);
    });

    await pharmacy.$disconnect();
  } catch (err) {
    console.error('ERROR Koneksi Supabase B (Pharmacy):', err);
  }

  console.log('\n=== VERIFIKASI SELESAI ===');
}

checkDatabase().catch(console.error);
