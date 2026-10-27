const baseUrl = () => process.env.PHARMACY_API_BASE_URL || 'http://localhost:3001/api/v1'

const headers = () => ({
  Authorization: `Bearer ${process.env.PHARMACY_API_TOKEN || ''}`,
  'Content-Type': 'application/json',
})

export async function getPharmacyStock(obatId: string) {
  const res = await fetch(`${baseUrl()}/obat/${obatId}/stok`, {
    headers: headers(),
    cache: 'no-store',
  })
  return res.json()
}

export async function getPharmacyObat(cari = '') {
  const query = cari ? `?cari=${encodeURIComponent(cari)}` : ''
  const res = await fetch(`${baseUrl()}/obat${query}`, {
    headers: headers(),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  return res.json()
}

export async function kirimResepKeFarmasi(resep: {
  id: string
  pasien: {
    namaLengkap: string
    nomorRekamMedis: string
    tanggalLahir: Date
    jenisKelamin: string
  }
  dokter: {
    namaLengkap: string
    spesialisasi: string
  }
  kunjungan: {
    pemeriksaan: Array<{ diagnosis: string; catatan: string | null }>
  }
  diterbitkanPada: Date | null
  detailResep: Array<{ id: string; obatId: string; namaObatSaatResep: string; jumlah: number }>
}) {
  const pemeriksaan = resep.kunjungan.pemeriksaan[0]
  const res = await fetch(`${baseUrl()}/pesanan-resep`, {
    method: 'POST',
    headers: { ...headers(), 'Idempotency-Key': `resep-${resep.id}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      resep_rumah_sakit_id: resep.id,
      pasien: {
        nama_lengkap: resep.pasien.namaLengkap,
        nomor_rekam_medis: resep.pasien.nomorRekamMedis,
        tanggal_lahir: resep.pasien.tanggalLahir,
        jenis_kelamin: resep.pasien.jenisKelamin,
      },
      dokter: {
        nama_lengkap: resep.dokter.namaLengkap,
        spesialisasi: resep.dokter.spesialisasi,
      },
      diagnosis: pemeriksaan?.diagnosis || null,
      catatan_klinis: pemeriksaan?.catatan || null,
      diterbitkan_pada: resep.diterbitkanPada,
      items: resep.detailResep.map((d) => ({
        detail_resep_rumah_sakit_id: d.id,
        obat_id: d.obatId,
        nama_obat_saat_pesanan: d.namaObatSaatResep,
        jumlah_diminta: d.jumlah,
      })),
    }),
  })
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json }
}
