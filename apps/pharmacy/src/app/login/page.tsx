'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  Mail,
  PackageCheck,
  Pill,
  ShieldCheck,
  Warehouse,
} from 'lucide-react'

type RoleType = 'apoteker' | 'pengelola_farmasi'

export default function PharmacyLoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<RoleType>('apoteker')
  const [email, setEmail] = useState('apoteker@pharmacy.local')
  const [password, setPassword] = useState('apoteker123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectRole = (role: RoleType) => {
    setSelectedRole(role)
    setError(null)
    if (role === 'apoteker') {
      setEmail('apoteker@pharmacy.local')
      setPassword('apoteker123')
    } else {
      setEmail('pengelola@pharmacy.local')
      setPassword('pengelola123')
    }
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await response.json()

      if (!json.sukses) {
        setError(json.pesan || 'Email atau kata sandi tidak sesuai')
        return
      }

      setSuccess(`Selamat datang, ${json.data.namaLengkap}. Mengalihkan ke dashboard...`)
      localStorage.setItem('mini_pharmacy_user', JSON.stringify(json.data))
      window.setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 700)
    } catch {
      setError('Terjadi gangguan jaringan saat menghubungi server Pharmacy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#edf7f2] text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-600 selection:text-white">
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between text-xs py-2 px-1">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Informasi Pengelolaan Farmasi</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Farmasi Terhubung dengan Hospital</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full my-auto py-4">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          <div className="lg:col-span-5 bg-gradient-to-br from-[#087443] via-[#075c38] to-[#06432b] p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                  <Pill className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-extrabold text-lg leading-tight tracking-tight">Mini Pharmacy</h1>
                  <p className="text-[10px] font-bold text-emerald-200 tracking-wider uppercase">Sistem Pengelolaan Farmasi</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-emerald-100 text-xs font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Operasional Farmasi
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mt-3 leading-snug">
                  Kelola resep dan stok obat dengan data yang jelas.
                </h2>
                <p className="text-xs text-emerald-100/85 leading-relaxed mt-2.5">
                  Pantau resep masuk dari Hospital, periksa ketersediaan obat, dan catat penyerahan kepada pasien dari satu ruang kerja.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-emerald-300/20 border border-emerald-200/30 flex items-center justify-center text-emerald-100 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">Resep Masuk dari Hospital</h3>
                    <p className="text-[11px] text-emerald-100/75 leading-tight mt-0.5">Identitas pasien, diagnosis, catatan medis, dan detail obat tersedia untuk verifikasi.</p>
                  </div>
                </div>
                <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-teal-300/20 border border-teal-200/30 flex items-center justify-center text-teal-100 shrink-0">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">Verifikasi dan Penyerahan</h3>
                    <p className="text-[11px] text-emerald-100/75 leading-tight mt-0.5">Pastikan stok cukup sebelum obat diserahkan kepada pasien.</p>
                  </div>
                </div>
                <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-lime-300/20 border border-lime-200/30 flex items-center justify-center text-lime-100 shrink-0">
                    <Warehouse className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">Mutasi Stok Tercatat</h3>
                    <p className="text-[11px] text-emerald-100/75 leading-tight mt-0.5">Riwayat penerimaan dan pengeluaran obat tetap dapat ditelusuri.</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="relative z-10 text-[10px] text-emerald-200/70">Mini Pharmacy &bull; Layanan Farmasi Terintegrasi</p>
          </div>

          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-7">
                <p className="text-xs font-bold text-emerald-700 mb-2">AKSES PETUGAS FARMASI</p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Masuk ke Pharmacy</h2>
                <p className="text-xs text-slate-500 mt-1.5">Gunakan akun yang diberikan Administrator Pharmacy.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => selectRole('apoteker')}
                  className={`min-h-11 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${selectedRole === 'apoteker' ? 'bg-white text-slate-900 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-white/70'}`}
                >
                  <Pill className={`h-4 w-4 ${selectedRole === 'apoteker' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  Apoteker
                </button>
                <button
                  type="button"
                  onClick={() => selectRole('pengelola_farmasi')}
                  className={`min-h-11 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${selectedRole === 'pengelola_farmasi' ? 'bg-white text-slate-900 shadow-sm border border-emerald-100' : 'text-slate-600 hover:bg-white/70'}`}
                >
                  <Warehouse className={`h-4 w-4 ${selectedRole === 'pengelola_farmasi' ? 'text-teal-600' : 'text-slate-500'}`} />
                  Pengelola Farmasi
                </button>
              </div>

              {error && <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5"><AlertCircle className="h-4 w-4 text-rose-500 shrink-0" /><span className="font-medium">{error}</span></div>}
              {success && <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /><span className="font-medium">{success}</span></div>}

              <form onSubmit={handleLogin} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email akun Pharmacy</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 rounded">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full min-h-11 py-3 bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi akses Pharmacy...</> : <>Masuk ke Dashboard Pharmacy <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                Akses ini digunakan untuk memproses resep, memeriksa stok, dan mencatat penyerahan obat.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
