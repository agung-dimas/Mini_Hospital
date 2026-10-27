'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Bell,
  LogOut,
  Shield,
  UserCheck,
  Stethoscope,
  Info,
  ChevronDown,
  KeyRound,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useRole, UserRole } from '@/context/role-context'

export function HospitalHeader({ title }: { title: string }) {
  const { role, profile, logout, mobileNavOpen, setMobileNavOpen } = useRole()
  const [menuOpen, setMenuOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  // Keyboard accessibility - Tutup modal & dropdown saat tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (menuOpen) setMenuOpen(false)
        if (infoOpen) setInfoOpen(false)
        if (mobileNavOpen) setMobileNavOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen, infoOpen, mobileNavOpen, setMobileNavOpen])

  const roleBadgeStyles: Record<UserRole, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    administrator: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200/80',
      icon: <Shield className="h-3.5 w-3.5 text-purple-600" />,
    },
    petugas_pendaftaran: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/80',
      icon: <UserCheck className="h-3.5 w-3.5 text-emerald-600" />,
    },
    dokter: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200/80',
      icon: <Stethoscope className="h-3.5 w-3.5 text-sky-600" />,
    },
  }

  const currentBadge = roleBadgeStyles[role]

  return (
    <header className="h-18 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-3.5">
        {/* Tombol Mobile Hamburger Menu */}
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="md:hidden p-2 rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label={mobileNavOpen ? 'Tutup navigasi mobile' : 'Buka navigasi mobile'}
        >
          {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Portal Terpadu Pelayanan Rumah Sakit & Rekam Medis
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* User Profile & Role Info Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-slate-200/90 hover:border-sky-300 bg-white shadow-xs hover:bg-slate-50/80 transition-all text-left cursor-pointer"
          >
            <div className={`h-8 w-8 rounded-xl ${profile.colorTheme.badge} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
              {profile.avatarBadge}
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {profile.userName}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${currentBadge.bg} ${currentBadge.text} border ${currentBadge.border}`}>
                  {currentBadge.icon}
                  {profile.label}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block leading-none mt-0.5 font-medium">
                {profile.subLabel}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Account Menu Dropdown */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-76 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-5 py-3.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{profile.userName}</p>
                  <p className="text-[11px] text-sky-600 font-semibold mt-0.5">{profile.label} (SIMRS)</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{profile.description}</p>
                </div>

                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setInfoOpen(true)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs text-slate-700 hover:bg-slate-50 font-semibold transition-colors text-left cursor-pointer"
                  >
                    <Info className="h-4 w-4 text-sky-600" />
                    <span>Lihat Rincian Hak Akses Kerja</span>
                  </button>

                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs text-slate-700 hover:bg-slate-50 font-semibold transition-colors text-left"
                  >
                    <KeyRound className="h-4 w-4 text-purple-600" />
                    <span>Ganti Akun / Peran Pengguna</span>
                  </Link>

                  <div className="pt-1.5 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs text-rose-600 hover:bg-rose-50 font-bold transition-colors text-left cursor-pointer"
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

        {/* Modal Info Hak Akses */}
        {infoOpen && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-2xl ${profile.colorTheme.badge} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
                    {profile.avatarBadge}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{profile.label}</h3>
                    <span className="text-[11px] text-slate-500">{profile.subLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-600 mb-3.5">{profile.description}</p>
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                    <span className="text-xs font-bold text-emerald-800 block mb-1.5">
                      ✓ Kewenangan & Fitur yang Diizinkan:
                    </span>
                    <ul className="space-y-1">
                      {profile.kewenangan.map((k, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70">
                    <span className="text-xs font-bold text-rose-800 block mb-1.5">
                      ✕ Batasan Akses Peran:
                    </span>
                    <ul className="space-y-1">
                      {profile.larangan.map((l, i) => (
                        <li key={i} className="text-xs text-rose-700 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span>{l}</span>
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
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="p-2.5 text-slate-400 hover:text-slate-600 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all relative cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-sky-500" />
        </button>
      </div>
    </header>
  )
}
