import { prisma } from './src/lib/prisma';

async function checkPharmacyDB() {
  console.log('=== VERIFIKASI SUPABASE B (PHARMACY) ===');
  try {
    const [obatCount, pergerakanStokCount, pesananResepCount, profilPenggunaCount] = await Promise.all([
      prisma.obat.count(),
      prisma.pergerakanStok.count(),
      prisma.pesananResep.count(),
      prisma.profilPengguna.count(),
    ]);

    console.log('STATUS: ? TERHUBUNG KE SUPABASE LIVE!');
    console.log(`- Tabel 'profil_pengguna': ${profilPenggunaCount} baris`);
    console.log(`- Tabel 'obat': ${obatCount} baris`);
    console.log(`- Tabel 'pergerakan_stok': ${pergerakanStokCount} baris`);
    console.log(`- Tabel 'pesanan_resep': ${pesananResepCount} baris`);

    const daftarObat = await prisma.obat.findMany({
      orderBy: { kodeObat: 'asc' },
    });

    console.log('\n[Daftar Obat & Kalkulasi Stok di Supabase B]:');
    for (const obat of daftarObat) {
      const stokAgg = await prisma.pergerakanStok.aggregate({
        where: { obatId: obat.id },
        _sum: { perubahanJumlah: true },
      });
      const totalStok = stokAgg._sum.perubahanJumlah ?? 0;
      console.log(`  * [${obat.kodeObat}] ${obat.namaObat} | Bentuk: ${obat.bentukObat} ${obat.kekuatanObat} | Stok: ${totalStok} ${obat.satuan} (Min: ${obat.stokMinimum})`);
    }

    const pergerakanTerakhir = await prisma.pergerakanStok.findMany({
      take: 5,
      orderBy: { dibuatPada: 'desc' },
      include: { obat: true },
    });

    if (pergerakanTerakhir.length > 0) {
      console.log('\n[Riwayat Pergerakan Stok]:');
      for (const m of pergerakanTerakhir) {
        console.log(`  * ${m.obat.namaObat}: [${m.jenisPergerakan}] ${m.perubahanJumlah > 0 ? '+' : ''}${m.perubahanJumlah} ${m.obat.satuan} | Alasan: ${m.alasan}`);
      }
    }
  } catch (error) {
    console.error('GAGAL TERHUBUNG KE SUPABASE B:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPharmacyDB();
