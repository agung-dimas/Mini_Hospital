'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'administrator' | 'petugas_pendaftaran' | 'dokter'

export interface RoleProfile {
  role: UserRole
  label: string
  subLabel: string
  userName: string
  avatarBadge: string
  colorTheme: {
    bg: string
    text: string
    border: string
    badge: string
  }
  description: string
  kewenangan: string[]
  larangan: string[]
  allowedPaths: string[]
}

export const ROLE_PROFILES: Record<UserRole, RoleProfile> = {
  administrator: {
    role: 'administrator',
    label: 'Administrator',
    subLabel: 'Manajemen Akun & Monitoring Integrasi',
    userName: 'Admin Hendra Wijaya',
    avatarBadge: 'ADM',
    colorTheme: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badge: 'bg-purple-600',
    },
    description: 'Mengelola data master dokter, memantau log audit dan peristiwa integrasi Supabase.',
    kewenangan: [
      'Kelola master & status dokter aktif',
      'Pantau log aktivitas & audit sistem',
      'Monitor peristiwa integrasi ke Farmasi',
      'Lihat data master pasien',
    ],
    larangan: [
      'Tidak berhak mengubah diagnosis medis dokter (PRD 5.1)',
      'Tidak berhak menyerahkan obat ke pasien (PRD 5.1)',
    ],
    allowedPaths: ['/dashboard', '/dokter', '/pasien', '/log-audit'],
  },
  petugas_pendaftaran: {
    role: 'petugas_pendaftaran',
    label: 'Petugas Pendaftaran',
    subLabel: 'Loket Pasien & Antrean Kunjungan',
    userName: 'Siti Nurhaliza (Front Office)',
    avatarBadge: 'REG',
    colorTheme: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-600',
    },
    description: 'Mendaftarkan pasien baru, mencari rekam medis, dan mencatat kunjungan dokter.',
    kewenangan: [
      'Pendaftaran & pencarian pasien (No. RM)',
      'Perbarui data identitas pasien',
      'Pendaftaran kunjungan baru ke dokter',
      'Pantau antrean tunggu pasien',
    ],
    larangan: [
      'Tidak berhak mengisi rekam medis atau diagnosis (PRD 5.2)',
      'Tidak berhak menerbitkan resep obat medis (PRD 5.2)',
    ],
    allowedPaths: ['/dashboard', '/pasien', '/kunjungan'],
  },
  dokter: {
    role: 'dokter',
    label: 'Dokter',
    subLabel: 'Spesialis Penyakit Dalam (Sp.PD)',
    userName: 'dr. Budi Santoso, Sp.PD',
    avatarBadge: 'DR',
    colorTheme: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-600',
    },
    description: 'Memeriksa pasien, mencatat diagnosis, serta menerbitkan resep obat ke Farmasi.',
    kewenangan: [
      'Lihat antrean kunjungan pasien saya',
      'Catat hasil pemeriksaan & diagnosis medis',
      'Terbitkan resep obat multi-item',
      'Pantau status penyerahan resep di Farmasi',
    ],
    larangan: [
      'Tidak mengelola akun sistem / master server (PRD 5.3)',
      'Resep yang telah terbit tidak dapat diedit langsung (harus dibatalkan)',
    ],
    allowedPaths: ['/dashboard', '/kunjungan', '/pemeriksaan', '/resep', '/resep/baru'],
  },
}

interface RoleContextType {
  role: UserRole
  profile: RoleProfile
  setRole: (role: UserRole) => void
  hasAccess: (path: string) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('dokter')

  useEffect(() => {
    const saved = localStorage.getItem('mini_hospital_role') as UserRole
    if (saved && ROLE_PROFILES[saved]) {
      setRoleState(saved)
    }
  }, [])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    localStorage.setItem('mini_hospital_role', newRole)
  }

  const profile = ROLE_PROFILES[role]

  const hasAccess = (path: string) => {
    if (path === '/dashboard') return true
    return profile.allowedPaths.some((p) => path.startsWith(p))
  }

  return (
    <RoleContext.Provider value={{ role, profile, setRole, hasAccess }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
