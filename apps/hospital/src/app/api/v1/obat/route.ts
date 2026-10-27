import { NextRequest } from 'next/server'
import { jsonSuccess, jsonError } from '@/lib/response'
import { getPharmacyObat } from '@/lib/integrations/pharmacy'

// Proxy katalog obat Farmasi agar browser tidak terkena CORS antar-port
export async function GET(request: NextRequest) {
  try {
    const cari = new URL(request.url).searchParams.get('cari') || ''
    const json = await getPharmacyObat(cari)
    if (!json?.sukses) {
      return jsonError(json?.pesan || 'Katalog obat Farmasi tidak dapat diambil', 502)
    }
    const aktif = (json.data as Array<{ aktif: boolean }>).filter((o) => o.aktif)
    return jsonSuccess(aktif, 'Katalog obat Farmasi berhasil diambil')
  } catch (error) {
    console.error('Error GET /api/v1/obat (proxy farmasi):', error)
    return jsonError('Layanan Farmasi (port 3001) tidak merespons', 503)
  }
}
