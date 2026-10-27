const hospitalBaseUrl = () => process.env.HOSPITAL_API_BASE_URL || 'http://localhost:3000/api/v1'

const hospitalHeaders = () => ({
  Authorization: `Bearer ${process.env.HOSPITAL_API_TOKEN || ''}`,
  'Content-Type': 'application/json',
})

export async function getHospitalResep(resepId: string) {
  const res = await fetch(`${hospitalBaseUrl()}/resep/${resepId}`, {
    headers: hospitalHeaders(),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    throw new Error(`Hospital mengembalikan HTTP ${res.status} saat mengambil resep`)
  }

  const json = await res.json()
  if (!json.sukses || !json.data) {
    throw new Error(json.pesan || 'Data resep dari Hospital tidak tersedia')
  }

  return json.data
}

export async function updateHospitalResepStatus(
  resepId: string,
  status: string,
  idempotencyKey?: string
) {
  const baseUrl = hospitalBaseUrl()
  const token = process.env.HOSPITAL_API_TOKEN || ''

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }

  const res = await fetch(`${baseUrl}/resep/${resepId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
    cache: 'no-store',
  })
  return res.json()
}
