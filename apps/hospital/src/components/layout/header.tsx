'use client'

import React, { useState } from 'react'
import {
  Bell,
  ChevronDown,
  Shield,
  UserCheck,
  Stethoscope,
  Check,
  Info,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useRole, ROLE_PROFILES, UserRole } from '@/context/role-context'

export function HospitalHeader({ title }: { title: string }) {
  const { role, profile, setRole } = useRole()
  const [dropdownOpen, setDropdownOpen] = useState(false)
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
        {/* Role Switcher Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-xs hover:bg-slate-50 transition-all text-left"
          >
            <div className={`h-7 w-7 rounded-lg ${profile.colorTheme.badge} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
              {profile.avatarBadge}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {profile.label}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({profile.userName})
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-none mt-0.5">
                Ganti Peran Pengguna
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu Peran */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Pilih Peran Pengguna (PRD 5)</p>
                    <p className="text-[11px] text-slate-500">Simulasi hak akses sistem rumah sakit</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false)
                      setInfoOpen(true)
                    }}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    title="Lihat detail kewenangan"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-1.5 space-y-1">
                  {(Object.keys(ROLE_PROFILES) as UserRole[]).map((rKey) => {
                    const item = ROLE_PROFILES[rKey]
                    const isSelected = role === rKey
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => {
                          setRole(rKey)
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? `${item.colorTheme.bg} ${item.colorTheme.border} border shadow-xs`
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className={`mt-0.5 h-7 w-7 rounded-lg ${item.colorTheme.badge} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                          {item.avatarBadge}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{item.label}</span>
                            {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{item.userName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.subLabel}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="px-3 pt-2 pb-1 border-t border-slate-100 mt-1">
                  <div className="rounded-lg bg-amber-50 border border-amber-200/60 p-2 text-[10px] text-amber-800 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Menu navigasi & kewenangan tombol akan menyesuaikan otomatis sesuai aturan PRD 5.
                    </span>
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
