import { prisma } from './src/lib/prisma';

async function updateCredentials() {
  console.log('Mengisi email dan kata sandi pengguna di Supabase A...');

  const admin = await prisma.profilPengguna.findFirst({ where: { peran: 'admin' } });
  if (admin) {
    await prisma.profilPengguna.update({
      where: { id: admin.id },
      data: {
        email: 'admin@hospital.local',
        kataSandi: 'admin123',
      },
    });
    console.log('- Admin diperbarui: admin@hospital.local');
  }

  const pendaftaran = await prisma.profilPengguna.findFirst({ where: { peran: 'pendaftaran' } });
  if (pendaftaran) {
    await prisma.profilPengguna.update({
      where: { id: pendaftaran.id },
      data: {
        email: 'pendaftaran@hospital.local',
        kataSandi: 'pendaftaran123',
      },
    });
    console.log('- Pendaftaran diperbarui: pendaftaran@hospital.local');
  }

  const dokter = await prisma.profilPengguna.findFirst({ where: { peran: 'dokter' } });
  if (dokter) {
    await prisma.profilPengguna.update({
      where: { id: dokter.id },
      data: {
        email: 'dokter.budi@hospital.local',
        kataSandi: 'dokter123',
      },
    });
    console.log('- Dokter diperbarui: dokter.budi@hospital.local');
  }

  console.log('Pembaruan kredensial selesai!');
}

updateCredentials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
