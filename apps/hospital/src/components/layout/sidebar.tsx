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
} from 'lucide-react'

const MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pasien', label: 'Data Pasien', icon: Users },
  { href: '/dokter', label: 'Data Dokter', icon: UserCheck },
  { href: '/kunjungan', label: 'Kunjungan Medis', icon: Calendar },
  { href: '/resep', label: 'Resep Medis', icon: FileText },
  { href: '/resep/baru', label: 'Buat Resep Baru', icon: PlusCircle },
]

export function HospitalSidebar() {
  const pathname = usePathname()

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

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Pelayanan
        </div>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
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
