export type UserRole = 'administrator' | 'petugas_pendaftaran' | 'dokter'

export interface UserSession {
  id: string
  username: string
  namaLengkap: string
  peran: UserRole
  email: string
  spesialisasi?: string
  fotoAvatar?: string
  dokterId?: string
}

export const DEMO_USERS: Record<string, UserSession & { kataSandi: string }> = {
  admin: {
    id: 'usr-0000-0000-0000-000000000001',
    username: 'admin',
    kataSandi: 'admin123',
    email: 'admin@hospital.local',
    namaLengkap: 'Admin Hendra Wijaya',
    peran: 'administrator',
  },
  pendaftaran: {
    id: 'usr-0000-0000-0000-000000000002',
    username: 'pendaftaran',
    kataSandi: 'pendaftaran123',
    email: 'pendaftaran@hospital.local',
    namaLengkap: 'Siti Nurhaliza (Loket Pendaftaran)',
    peran: 'petugas_pendaftaran',
  },
  dokter: {
    id: 'usr-0000-0000-0000-000000000003',
    username: 'dokter',
    kataSandi: 'dokter123',
    email: 'dokter.budi@hospital.local',
    namaLengkap: 'dr. Budi Santoso, Sp.PD',
    peran: 'dokter',
    spesialisasi: 'Spesialis Penyakit Dalam',
  },
}

export const SESSION_COOKIE_NAME = 'hospital_session'
