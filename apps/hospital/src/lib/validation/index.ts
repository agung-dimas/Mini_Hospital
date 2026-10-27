import { z } from 'zod'

export const pasienSchema = z.object({
  nomor_rekam_medis: z.string().min(1, 'Nomor rekam medis wajib diisi'),
  nama_lengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenis_kelamin: z.enum(['laki-laki', 'perempuan']),
  nomor_telepon: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
})

export const kunjunganSchema = z.object({
  pasien_id: z.string().uuid('ID pasien tidak valid'),
  dokter_id: z.string().uuid('ID dokter tidak valid'),
  waktu_kunjungan: z.string().optional(),
})

export const detailResepItemSchema = z.object({
  obat_id: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      'ID obat tidak valid'
    ),
  nama_obat_saat_resep: z.string().min(1, 'Nama obat wajib diisi'),
  jumlah: z.number().int().positive('Jumlah obat harus lebih besar dari 0'),
  instruksi_penggunaan: z.string().min(1, 'Instruksi penggunaan wajib diisi'),
})

export const resepSchema = z.object({
  kunjungan_id: z.string().uuid('ID kunjungan tidak valid'),
  pasien_id: z.string().uuid('ID pasien tidak valid'),
  dokter_id: z.string().uuid('ID dokter tidak valid'),
  item_obat: z.array(detailResepItemSchema).min(1, 'Minimal sertakan 1 item obat'),
})
