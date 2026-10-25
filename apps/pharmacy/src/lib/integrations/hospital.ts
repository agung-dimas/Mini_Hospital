export async function updateHospitalResepStatus(
  resepId: string,
  status: string,
  idempotencyKey?: string
) {
  const baseUrl = process.env.HOSPITAL_API_BASE_URL || 'http://localhost:3000/api/v1'
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
