'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  Shield,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Mail,
  Eye,
  EyeOff,
  HelpCircle,
  FileText,
  Pill,
  Check,
  SlidersHorizontal,
  Globe,
  Plus,
} from 'lucide-react'

type RoleType = 'dokter' | 'pendaftaran' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<RoleType>('dokter')
  const [email, setEmail] = useState('dokter.budi@hospital.local')
  const [password, setPassword] = useState('dokter123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sukses, setSukses] = useState<string | null>(null)
  const [showGuideModal, setShowGuideModal] = useState(false)

  // Ganti peran via tombol tab peran
  const handleSelectRoleTab = (role: RoleType) => {
    setSelectedRole(role)
    setError(null)
    if (role === 'dokter') {
      setEmail('dokter.budi@hospital.local')
      setPassword('dokter123')
    } else if (role === 'pendaftaran') {
      setEmail('pendaftaran@hospital.local')
      setPassword('pendaftaran123')
    } else if (role === 'admin') {
      setEmail('admin@hospital.local')
      setPassword('admin123')
    }
  }

  // Pilih akun demo cepat
  const handleQuickSelect = (role: RoleType, userEmail: string, pass: string) => {
    setSelectedRole(role)
    setEmail(userEmail)
    setPassword(pass)
    setError(null)
  }

  const getRoleHelperText = () => {
    switch (selectedRole) {
      case 'dokter':
        return 'Dokter Spesialis Rawat Jalan'
      case 'pendaftaran':
        return 'Petugas Loket Admisi & Pasien'
      case 'admin':
        return 'Administrator Sistem SIMRS'
      default:
        return 'Akses Pengguna Rumah Sakit'
    }
  }

  const isEmailValid = email.includes('@') && email.includes('.')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()

      if (json.sukses) {
        setSukses(`Selamat datang, ${json.data.namaLengkap}! Mengalihkan ke dashboard...`)
        localStorage.setItem('mini_hospital_role', json.data.peran)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 700)
      } else {
        setError(json.pesan || 'Email atau kata sandi tidak sesuai dengan sistem')
      }
    } catch {
      setError('Terjadi gangguan jaringan saat menghubungi server rumah sakit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#edf2f7] text-slate-800 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-sky-500 selection:text-white">
      {/* Bar Atas */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between text-xs py-2 px-1">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Informasi Manajemen Rumah Sakit &bull; Layanan Terpadu</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1 rounded-full font-medium shadow-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Klinik & Farmasi Terpadu</span>
        </div>
      </header>

      {/* Kontainer Utama Dua Kolom Sesuai Referensi Desain */}
      <main className="max-w-6xl mx-auto w-full my-auto py-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* Kolom Kiri: Panel Biru Medis Pelayanan Pasien */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0c5f92] via-[#084c75] to-[#043353] p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Aksen Latar Belakang */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header Logo & Nama Aplikasi */}
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                  <div className="relative flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                    <Plus className="h-3 w-3 text-sky-200 absolute -top-1 -right-1" />
                  </div>
                </div>
                <div>
                  <h1 className="font-extrabold text-lg text-white leading-tight tracking-tight">Mini Hospital</h1>
                  <p className="text-[10px] font-bold text-sky-200 tracking-wider uppercase">
                    Sistem Pelayanan Rumah Sakit
                  </p>
                </div>
              </div>

              {/* Tagline & Deskripsi SIMRS */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-sky-200 text-xs font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Sistem Terpadu SIMRS
                </div>

                <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-3 leading-snug">
                  Pelayanan Pasien & Preskripsi Digital
                </h2>

                <p className="text-xs text-sky-100/85 leading-relaxed mt-2.5">
                  Platform operasional rekam medis elektronik (RME) yang terintegrasi langsung dengan apotek otomatis, loket admisi, dan antrean poliklinik.
                </p>
              </div>

              {/* Tiga Kartu Fitur Unggulan (Translucent Glassmorphism) */}
              <div className="space-y-3 pt-1">
                {/* Fitur 1 */}
                <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-sky-400/25 border border-sky-300/30 flex items-center justify-center text-sky-200 shrink-0 mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Rekam Medis Elektronik (RME)</h3>
                    <p className="text-[11px] text-sky-100/75 leading-tight mt-0.5">
                      Pencatatan klinis pasien, riwayat alergi, dan diagnosis terintegrasi.
                    </p>
                  </div>
                </div>

                {/* Fitur 2 */}
                <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-teal-400/25 border border-teal-300/30 flex items-center justify-center text-teal-200 shrink-0 mt-0.5">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Resep Elektronik Langsung</h3>
                    <p className="text-[11px] text-sky-100/75 leading-tight mt-0.5">
                      Penerbitan e-resep langsung terhubung ke apotek rawat jalan tanpa antre manual.
                    </p>
                  </div>
                </div>

                {/* Fitur 3 */}
                <div className="bg-white/10 hover:bg-white/15 transition-colors backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-indigo-400/25 border border-indigo-300/30 flex items-center justify-center text-indigo-200 shrink-0 mt-0.5">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Privasi & Keamanan Data Medis</h3>
                    <p className="text-[11px] text-sky-100/75 leading-tight mt-0.5">
                      Perlindungan data pasien dengan standar kerahasiaan medis rumah sakit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Panel Kiri */}
            <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-xs text-sky-200/90 relative z-10">
              <div className="flex items-center gap-1.5 font-medium">
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                <span>Standar SATUSEHAT Kemenkes RI</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-white/15 border border-white/20 text-sky-100">
                Terakreditasi
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Form Masuk Sistem */}
          <div className="lg:col-span-7 bg-white p-8 lg:p-10 flex flex-col justify-between">
            <div>
              {/* Judul & Status Keamanan */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke Sistem Hospital</h2>
                  <p className="text-xs text-slate-500 mt-1">Silakan masukkan kredensial akun rumah sakit Anda</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-semibold shrink-0 shadow-xs">
                  <Lock className="h-3.5 w-3.5 text-sky-600" />
                  <span>Koneksi Aman</span>
                </div>
              </div>

              {/* Pemilih Peran Akses Kerja */}
              <div className="mt-6 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    Pilih Peran Akses Kerja
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Panduan Peran</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90">
                  <button
                    type="button"
                    onClick={() => handleSelectRoleTab('dokter')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'dokter'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Stethoscope className={`h-4 w-4 ${selectedRole === 'dokter' ? 'text-sky-600' : 'text-slate-500'}`} />
                    <span>Dokter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRoleTab('pendaftaran')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'pendaftaran'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <UserCheck className={`h-4 w-4 ${selectedRole === 'pendaftaran' ? 'text-emerald-600' : 'text-slate-500'}`} />
                    <span>Pendaftaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectRoleTab('admin')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <SlidersHorizontal className={`h-4 w-4 ${selectedRole === 'admin' ? 'text-purple-600' : 'text-slate-500'}`} />
                    <span>Admin SIMRS</span>
                  </button>
                </div>
              </div>

              {/* Notifikasi Error & Sukses */}
              {error && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {sukses && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{sukses}</span>
                </div>
              )}

              {/* Form Input Email & Password */}
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Email Institusi</label>
                    <span className="text-xs font-semibold text-sky-600">{getRoleHelperText()}</span>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@hospital.local"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                    />
                    {isEmailValid && (
                      <CheckCircle2 className="absolute right-3.5 top-3 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Kata Sandi</label>
                    <button
                      type="button"
                      onClick={() => setError('Silakan hubungi Administrator SIMRS untuk reset kata sandi petugas')}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Checkbox Ingat Saya */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500/30 accent-sky-600"
                    />
                    <span className="text-xs text-slate-600 font-medium">Ingat saya di perangkat ini</span>
                  </label>
                </div>

                {/* Tombol Masuk */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] active:bg-[#075985] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-600/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Memverifikasi Akses SIMRS...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dashboard Hospital</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Akun Uji Coba Cepat (Pill Badges) */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-2.5">
                  Akun Uji Coba Cepat (Klik Untuk Pasang):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSelect('dokter', 'dokter.budi@hospital.local', 'dokter123')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      email === 'dokter.budi@hospital.local'
                        ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Dokter Spesialis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSelect('pendaftaran', 'pendaftaran@hospital.local', 'pendaftaran123')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      email === 'pendaftaran@hospital.local'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Petugas Pendaftaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSelect('admin', 'admin@hospital.local', 'admin123')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      email === 'admin@hospital.local'
                        ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Kartu Masuk */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Sistem Informasi Medis Terproteksi</span>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(true)}
                className="hover:text-slate-800 text-slate-500 hover:underline transition-colors"
              >
                Pusat Bantuan & Layanan IT Rumah Sakit
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bar Bawah */}
      <footer className="max-w-6xl mx-auto w-full flex items-center justify-between text-xs text-slate-500 py-2 px-1">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-slate-400" />
          <span>Layanan Portal Rumah Sakit Resmi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-slate-400" />
          <span>Bahasa Indonesia</span>
        </div>
      </footer>

      {/* Modal Panduan Peran */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Panduan Peran Sistem SIMRS</h3>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100">
                <span className="font-bold text-sky-800 block">🩺 Dokter Spesialis</span>
                <p className="mt-0.5 text-sky-700">
                  Melakukan pemeriksaan klinis pasien (E-MR), pengisian keluhan, riwayat penyakit, diagnosis, serta penerbitan e-resep ke modul Farmasi.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="font-bold text-emerald-800 block">👤 Petugas Pendaftaran</span>
                <p className="mt-0.5 text-emerald-700">
                  Registrasi pasien baru dengan No. RM unik dan nomor telepon, pencarian master data pasien, serta pencatatan antrean kunjungan dokter.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="font-bold text-purple-800 block">⚙️ Administrator SIMRS</span>
                <p className="mt-0.5 text-purple-700">
                  Pengelolaan master dokter, pembuatan dan pengaturan akun pengguna sistem, serta pemantauan log audit seluruh aktivitas operasional.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
