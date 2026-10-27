'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User } from 'lucide-react'

export function PharmacyHeader({ title }: { title: string }) {
  const router = useRouter()
  const [user, setUser] = useState<{ namaLengkap?: string; peran?: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('mini_pharmacy_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('mini_pharmacy_user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('mini_pharmacy_user')
    router.push('/login')
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-600" />
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-sm font-semibold text-slate-900 leading-tight">{user?.namaLengkap || 'Petugas Pharmacy'}</span>
            <span className="block text-xs text-slate-500">{user?.peran === 'pengelola_farmasi' ? 'Pengelola Farmasi' : 'Apoteker'}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-rose-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          aria-label="Keluar dari Pharmacy"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  )
}
