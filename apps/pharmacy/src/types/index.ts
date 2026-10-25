export type StatusResep =
  | 'draf'
  | 'diterbitkan'
  | 'diterima'
  | 'diproses'
  | 'diserahkan_sebagian'
  | 'diserahkan'
  | 'ditolak'
  | 'dibatalkan'

export type ApiResponse<T = unknown> = {
  sukses: boolean
  pesan: string
  data?: T
  kesalahan?: Record<string, string[]>
}
