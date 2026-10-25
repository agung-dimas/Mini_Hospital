'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  LogOut,
  Shield,
  UserCheck,
  Stethoscope,
  Info,
  ChevronDown,
  User,
  KeyRound,
} from 'lucide-react'
import { useRole, UserRole } from '@/context/role-context'

export function HospitalHeader({ title }: { title: string }) {
  const { role, profile, logout } = useRole()
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const roleIcons: Record<UserRole, React.ReactNode> = {
    administrator: <Shield className="h-4 w-4 text-purple-600" />,
    petugas_pendaftaran: <UserCheck className="h-4 w-4 text-emerald-600" />,
    dokter: <Stethoscope className="h-4 w-4 text-blue-600" />,
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* User Profile & Role Info Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs hover:bg-slate-50 transition-all text-left"
          >
            <div className={`h-8 w-8 rounded-lg ${profile.colorTheme.badge} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
              {profile.avatarBadge}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {profile.userName}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${profile.colorTheme.bg} ${profile.colorTheme.text} border ${profile.colorTheme.border}`}>
                  {profile.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-none mt-0.5">
                {profile.subLabel}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Account Menu Dropdown */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{profile.userName}</p>
                  <p className="text-[11px] text-blue-600 font-semibold">{profile.label} (PRD 5)</p>
                  <p className="text-[10px] text-slate-400 mt-1">{profile.description}</p>
                </div>

                <div className="p-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setInfoOpen(true)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                  >
                    <Info className="h-4 w-4 text-blue-600" />
                    <span>Lihat Rincian Hak Akses (PRD 5)</span>
                  </button>

                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors text-left"
                  >
                    <KeyRound className="h-4 w-4 text-purple-600" />
                    <span>Ganti Akun / Peran Pengguna</span>
                  </Link>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Info Hak Akses PRD 5 */}
        {infoOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-lg ${profile.colorTheme.badge} text-white flex items-center justify-center font-bold text-xs`}>
                    {profile.avatarBadge}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Hak Akses: {profile.label}</h3>
                    <p className="text-xs text-slate-500">Berdasarkan PRD 5. Pengguna dan Hak Akses</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-600 mb-3">{profile.description}</p>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 block mb-1.5">
                      ✓ Kewenangan & Fitur yang Diizinkan:
                    </span>
                    <ul className="space-y-1">
                      {profile.kewenangan.map((k, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {k}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-rose-800 block mb-1.5">
                      ✕ Batasan & Larangan (PRD 5):
                    </span>
                    <ul className="space-y-1">
                      {profile.larangan.map((l, i) => (
                        <li key={i} className="text-xs text-rose-600 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInfoOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors relative"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600" />
        </button>
      </div>
    </header>
  )
}
