import { Bell, User } from 'lucide-react'

export function HospitalHeader({ title }: { title: string }) {
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
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            <User className="h-5 w-5" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-sm font-semibold text-slate-900 leading-tight">dr. Budi Santoso</span>
            <span className="block text-xs text-slate-500">Dokter Spesialis</span>
          </div>
        </div>
      </div>
    </header>
  )
}
