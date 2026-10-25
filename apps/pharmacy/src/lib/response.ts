import { NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export function jsonSuccess<T>(data: T, pesan = 'Permintaan berhasil diproses', status = 200) {
  const body: ApiResponse<T> = {
    sukses: true,
    pesan,
    data,
  }
  return NextResponse.json(body, { status })
}

export function jsonError(
  pesan = 'Terjadi kesalahan pada server',
  status = 500,
  kesalahan?: Record<string, string[]>
) {
  const body: ApiResponse = {
    sukses: false,
    pesan,
    kesalahan,
  }
  return NextResponse.json(body, { status })
}
