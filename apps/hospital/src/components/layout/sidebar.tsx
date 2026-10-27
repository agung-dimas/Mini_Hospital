'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  PlusCircle,
  ExternalLink,
  Shield,
  ClipboardList,
  LogOut,
  KeyRound,
  X,
  Plus,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface MenuItem {
  href: string
  label: string
  icon: React.ElementType
  roles: Array<'administrator' | 'petugas_pendaftaran' | 'dokter'>
  badge?: string
}

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['administrator', 'petugas_pendaftaran', 'dokter'],
  },
  {
    href: '/pasien',
    label: 'Data Pasien',
    icon: Users,
    roles: ['administrator', 'petugas_pendaftaran'],
    badge: 'Pendaftaran',
  },
  {
    href: '/pengguna',
    label: 'Manajemen Akun',
    icon: KeyRound,
    roles: ['administrator'],
    badge: 'Admin',
  },
  {
    href: '/dokter',
    label: 'Data Dokter',
    icon: UserCheck,
    roles: ['administrator'],
    badge: 'Admin',
  },
  {
    href: '/kunjungan',
    label: 'Kunjungan Medis',
    icon: Calendar,
    roles: ['petugas_pendaftaran', 'dokter'],
    badge: 'Antrean',
  },
  {
    href: '/pemeriksaan',
    label: 'Pemeriksaan (E-MR)',
    icon: ClipboardList,
    roles: ['dokter'],
    badge: 'Dokter',
  },
  {
    href: '/resep',
    label: 'Resep Medis',
    icon: FileText,
    roles: ['dokter'],
  },
  {
    href: '/resep/baru',
    label: 'Buat Resep Baru',
    icon: PlusCircle,
    roles: ['dokter'],
    badge: 'Dokter',
  },
  {
    href: '/log-audit',
    label: 'Log Audit & Integrasi',
    icon: Shield,
    roles: ['administrator'],
    badge: 'Audit',
  },
]

export function HospitalSidebar() {
  const pathname = usePathname()
  const { role, profile, logout, mobileNavOpen, setMobileNavOpen } = useRole()

  const navContent = (isMobile = false) => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
                <Plus className="h-2.5 w-2.5 text-sky-200 absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block leading-tight">
                Mini Hospital
              </span>
              <span className="block text-[9px] uppercase font-bold tracking-wider text-sky-200">
                Sistem Pelayanan RS
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="p-1.5 rounded-xl text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Tutup navigasi"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Active Role Indicator Card (Glassmorphism) */}
        <div className="p-3 mx-4 my-3 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className={`h-7 w-7 rounded-xl ${profile.colorTheme.badge} text-white flex items-center justify-center font-bold text-[10px] shadow-xs`}>
              {profile.avatarBadge}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {profile.label}
              </span>
              <span className="text-[10px] text-sky-100/80 block truncate mt-0.5">
                {profile.userName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)]">
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-sky-200/70 uppercase">
            Menu Akses ({profile.label})
          </div>

          {ALL_MENU_ITEMS.filter((item) => item.roles.includes(role)).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isMobile) setMobileNavOpen(false)
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/20 text-white font-bold backdrop-blur-md shadow-xs border border-white/20'
                    : 'text-sky-100/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-sky-200/80'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
                      isActive
                        ? 'bg-white/30 text-white border-white/30'
                        : 'bg-white/10 text-sky-200 border-white/15'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Integration Quick Link & Logout Footer */}
      <div className="p-4 border-t border-white/10 bg-black/10 backdrop-blur-xs space-y-2">
        <div className="bg-white/10 rounded-2xl p-3 border border-white/15 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-sky-100 font-medium">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Pharmacy App
            </span>
            <span className="text-[10px] text-sky-200 font-mono">Port 3001</span>
          </div>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-sky-200 hover:text-white font-bold transition-colors"
          >
            <span>Buka Pharmacy</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isMobile) setMobileNavOpen(false)
            logout()
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-200 hover:text-white hover:bg-rose-500/20 border border-rose-300/20 font-bold transition-all cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar (md+) */}
      <aside className="hidden md:flex w-64 bg-gradient-to-b from-[#0c5f92] via-[#084c75] to-[#043353] text-white flex-col h-screen sticky top-0 shrink-0 border-r border-[#084c75]/50 shadow-lg">
        {navContent(false)}
      </aside>

      {/* Mobile Drawer Slide-Over (< md) */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileNavOpen(false)}
          />
          {/* Drawer Content */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-[#0c5f92] via-[#084c75] to-[#043353] text-white shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {navContent(true)}
          </aside>
        </div>
      )}
    </>
  )
}
