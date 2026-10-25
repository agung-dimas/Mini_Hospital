export async function getPharmacyStock(obatId: string) {
  const baseUrl = process.env.PHARMACY_API_BASE_URL || 'http://localhost:3001/api/v1'
  const token = process.env.PHARMACY_API_TOKEN || ''

  const res = await fetch(`${baseUrl}/obat/${obatId}/stok`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })
  return res.json()
}
