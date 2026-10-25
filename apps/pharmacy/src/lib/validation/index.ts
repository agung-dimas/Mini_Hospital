import { z } from 'zod'

export const obatSchema = z.object({
  kode_obat: z.string().min(1, 'Kode obat wajib diisi'),
  nama_obat: z.string().min(1, 'Nama obat wajib diisi'),
  bentuk_obat: z.string().min(1, 'Bentuk obat wajib diisi'),
  kekuatan_obat: z.string().min(1, 'Kekuatan obat wajib diisi'),
  satuan: z.string().min(1, 'Satuan wajib diisi'),
  stok_minimum: z.number().int().nonnegative('Stok minimum tidak boleh negatif').default(10),
})

export const pergerakanStokSchema = z.object({
  obat_id: z.string().uuid('ID obat tidak valid'),
  jenis_pergerakan: z.enum(['penerimaan', 'penyerahan', 'penyesuaian']),
  perubahan_jumlah: z.number().int(),
  referensi_transaksi: z.string().uuid().optional(),
  alasan: z.string().optional(),
})

export const penyerahanObatSchema = z.object({
  items: z.array(
    z.object({
      obat_id: z.string().uuid('ID obat tidak valid'),
      jumlah_diserahkan: z.number().int().positive('Jumlah harus lebih besar dari 0'),
    })
  ).min(1, 'Minimal sertakan 1 item penyerahan'),
})
