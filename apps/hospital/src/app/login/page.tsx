'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  Shield,
  UserCheck,
  Stethoscope,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  KeyRound,
  ExternalLink,
} from 'lucide-react'
import { DEMO_USERS, UserRole } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('dokter')
  const [password, setPassword] = useState('dokter123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sukses, setSukses] = useState<string | null>(null)

  const handleQuickSelect = (key: 'admin' | 'pendaftaran' | 'dokter') => {
    const user = DEMO_USERS[key]
    setUsername(user.username)
    setPassword(user.kataSandi)
    setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const json = await res.json()

      if (json.sukses) {
        setSukses(`Selamat datang, ${json.data.namaLengkap}! Mengalihkan ke dashboard...`)
        // Simpan juga ke localStorage untuk sinkronisasi sekunder role context
        localStorage.setItem('mini_hospital_role', json.data.peran)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1000)
      } else {
        setError(json.pesan || 'Gagal masuk ke sistem')
      }
    } catch (err) {
      setError('Terjadi gangguan jaringan saat menghubungi server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Glow Accents */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight block">Mini Hospital</span>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase block">
              Hospital System (Port 3000)
            </span>
          </div>
        </Link>

        <a
          href="http://localhost:3001/login"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <span>Aplikasi Farmasi (3001)</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </header>

      {/* Main Login Container */}
      <main className="max-w-4xl mx-auto w-full px-6 py-6 z-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Kolom Kiri: Pilihan Akun Cepat Sesuai PRD 5 */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                PRD 5. Pengguna & Hak Akses
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-1">
                Pilih Peran Pengguna
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Setiap peran memiliki kewenangan dan menu akses tersendiri sesuai spesifikasi PRD.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Card Administrator */}
              <button
                type="button"
                onClick={() => handleQuickSelect('admin')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  username === 'admin'
                    ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500'
                    : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Administrator</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">Admin Hendra Wijaya</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Kelola master dokter, pantau log audit & status integrasi Supabase.
                    </p>
                  </div>
                </div>
              </button>

              {/* Card Petugas Pendaftaran */}
              <button
                type="button"
                onClick={() => handleQuickSelect('pendaftaran')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  username === 'pendaftaran'
                    ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500'
                    : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Petugas Pendaftaran</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        pendaftaran
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">Siti Nurhaliza (Loket)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Pendaftaran pasien (No RM unik), cari data, & pencatatan kunjungan dokter.
                    </p>
                  </div>
                </div>
              </button>

              {/* Card Dokter Spesialis */}
              <button
                type="button"
                onClick={() => handleQuickSelect('dokter')}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                  username === 'dokter'
                    ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Dokter Spesialis</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        dokter
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">dr. Budi Santoso, Sp.PD</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Pemeriksaan medis (E-MR), diagnosis penyakit, & penerbitan resep obat.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Form Masuk Sistem */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-7 lg:p-8 shadow-2xl shadow-slate-950/50 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Masuk ke Sistem Hospital</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gunakan kredensial yang dipilih atau masukkan username dan kata sandi Anda.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {sukses && (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{sukses}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Pengguna / Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: dokter, admin, atau pendaftaran"
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Kata Sandi (Password)
                    </label>
                    <span className="text-[10px] text-slate-400">Default: [username]123</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memverifikasi Sesi...
                      </>
                    ) : (
                      <>
                        Masuk Sistem Sekarang
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t border-slate-700/60 text-center">
                <p className="text-[11px] text-slate-400">
                  Terhubung aman ke basis data <strong className="text-slate-300">Supabase A</strong> (Mini Hospital DB).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 border-t border-slate-800 z-10">
        Mini Hospital Management System &bull; EAI Modular Healthcare Architecture &bull; 2026
      </footer>
    </div>
  )
}
