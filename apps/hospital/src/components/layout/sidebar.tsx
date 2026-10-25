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
  Stethoscope,
  ClipboardList,
  Lock,
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
  const { role, profile } = useRole()

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-base text-white tracking-tight">Mini Hospital</span>
          <span className="block text-[10px] uppercase font-semibold tracking-wider text-blue-400">
            Hospital System (3000)
          </span>
        </div>
      </div>

      {/* Active Role Indicator Card */}
      <div className="p-3 mx-3 my-3 bg-slate-800/80 border border-slate-700/60 rounded-xl">
        <div className="flex items-center gap-2">
          <div className={`h-6 w-6 rounded-md ${profile.colorTheme.badge} text-white flex items-center justify-center font-bold text-[10px]`}>
            {profile.avatarBadge}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-white block truncate">
              {profile.label}
            </span>
            <span className="text-[9px] text-slate-400 block truncate">
              {profile.userName}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Akses ({profile.label})
        </div>

        {ALL_MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isAllowed = item.roles.includes(role)

          if (!isAllowed) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500/60 cursor-not-allowed group opacity-50"
                title={`Fitur ini khusus untuk peran: ${item.roles.join(', ')} (PRD 5)`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-600" />
                  <span>{item.label}</span>
                </div>
                <Lock className="h-3 w-3 text-slate-600" />
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Integration Quick Link Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Pharmacy App
            </span>
            <span className="text-[10px] text-slate-400">Port 3001</span>
          </div>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Buka Pharmacy
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </aside>
  )
}
