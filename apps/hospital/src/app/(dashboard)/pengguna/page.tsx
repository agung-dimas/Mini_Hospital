'use client'

import React, { useState, useEffect } from 'react'
import { HospitalHeader } from '@/components/layout/header'
import {
  Users,
  Plus,
  Shield,
  UserCheck,
  Stethoscope,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface PenggunaItem {
  id: string
  namaLengkap: string
  email: string | null
  peran: string
  dibuatPada: string
  source: 'simrs' | 'farmasi'
  dokter: {
    id: string
    spesialisasi: string
    aktif: boolean
  } | null
}

export default function PenggunaPage() {
  const { role } = useRole()
  const isAdministrator = role === 'administrator'

  const [penggunaList, setPenggunaList] = useState<PenggunaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen])

  const [formData, setFormData] = useState({
    sumber: 'simrs' as 'simrs' | 'farmasi',
    nama_lengkap: '',
    email: '',
    kata_sandi: 'password123',
    peran: 'dokter' as 'dokter' | 'petugas_pendaftaran' | 'apoteker' | 'pengelola_farmasi',
    spesialisasi: 'Spesialis Anak (Sp.A)',
  })

  const fetchPengguna = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      const res = await fetch('/api/v1/pengguna')
      const json = await res.json()
      if (json.sukses) {
        setPenggunaList(json.data)
      } else {
        setFetchError(json.pesan || 'Gagal memuat daftar pengguna')
      }
    } catch (err) {
      console.error('Error load pengguna:', err)
      setFetchError(err instanceof Error ? err.message : 'Gagal menghubungi server pengguna')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPengguna()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdministrator) {
      alert('Hanya Administrator yang memiliki wewenang membuat akun pengguna (PRD 5.1)')
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)
      const res = await fetch('/api/v1/pengguna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          peran: formData.peran,
          sumber: formData.sumber,
        }),
      })
      const json = await res.json()

      if (json.sukses) {
        setMessage({
          text:
            formData.sumber === 'farmasi'
              ? `Akun ${formData.peran === 'pengelola_farmasi' ? 'Pengelola Farmasi' : 'Apoteker'} berhasil dibuat!`
              : `Akun ${formData.peran === 'dokter' ? 'Dokter' : 'Petugas Pendaftaran'} berhasil dibuat!`,
          type: 'success',
        })
        setFormData({
          sumber: 'simrs',
          nama_lengkap: '',
          email: '',
          kata_sandi: 'password123',
          peran: 'dokter',
          spesialisasi: 'Spesialis Anak (Sp.A)',
        })
        setModalOpen(false)
        fetchPengguna()
      } else {
        setMessage({ text: json.pesan || 'Gagal membuat akun pengguna', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Terjadi kesalahan sistem saat membuat akun', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleBadge = (peran: string) => {
    switch (peran) {
      case 'administrator':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center gap-1.5 w-fit">
            <Shield className="h-3 w-3 text-purple-600" />
            Administrator
          </span>
        )
      case 'petugas_pendaftaran':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5 w-fit">
            <UserCheck className="h-3 w-3 text-emerald-600" />
            Petugas Pendaftaran
          </span>
        )
      case 'dokter':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 flex items-center gap-1.5 w-fit">
            <Stethoscope className="h-3 w-3 text-sky-600" />
            Dokter Spesialis
          </span>
        )
      case 'apoteker':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5 w-fit">
            <Shield className="h-3 w-3 text-emerald-600" />
            Apoteker
          </span>
        )
      case 'pengelola_farmasi':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1.5 w-fit">
            <Shield className="h-3 w-3 text-amber-600" />
            Pengelola Farmasi
          </span>
        )
      default:
        return <span className="text-xs text-slate-500 font-medium">{peran}</span>
    }
  }

  const filtered = penggunaList.filter(
    (u) =>
      u.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      u.peran.toLowerCase().includes(search.toLowerCase()) ||
      u.source.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Manajemen Pengguna & Pembuatan Akun" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Hak Akses */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 mt-0.5 shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Manajemen Pengguna (SIMRS RBAC)</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                  Kewenangan Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Administrator mengelola akun login SIMRS dan akun Farmasi, termasuk Dokter, Petugas Pendaftaran, Apoteker, serta Pengelola Farmasi.
              </p>
            </div>
          </div>

          {isAdministrator ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-4.5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Akun Farmasi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    sumber: 'simrs',
                    nama_lengkap: '',
                    email: '',
                    kata_sandi: 'password123',
                    peran: 'dokter',
                    spesialisasi: 'Spesialis Anak (Sp.A)',
                  })
                  setModalOpen(true)
                }}
                className="px-4.5 py-2.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Akun SIMRS</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
              <Lock className="h-3.5 w-3.5" />
              <span>Administrator hanya dapat menambah akun</span>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {fetchError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-xs font-medium">{fetchError}</span>
            </div>
            <button
              onClick={fetchPengguna}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pengguna, email, peran, atau sumber..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 shadow-2xs transition-all"
          />
        </div>

        {/* Tabel Akun Pengguna Modern */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Daftar Akun Pengguna Sistem</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Akun terdaftar yang memiliki hak akses login dengan email dan kata sandi
              </p>
            </div>
            <span className="text-xs font-bold text-sky-700 px-3 py-1 bg-sky-50 border border-sky-200/80 rounded-full">
              Total: {filtered.length} Akun
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 font-medium">Memuat akun pengguna...</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 font-medium">Tidak ada pengguna yang cocok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">Nama Pengguna</th>
                    <th className="px-6 py-3.5">Email Login</th>
                    <th className="px-6 py-3.5">Peran (Role)</th>
                    <th className="px-6 py-3.5">Sumber</th>
                    <th className="px-6 py-3.5">Spesialisasi Medis</th>
                    <th className="px-6 py-3.5">Terdaftar Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((u) => (
                    <tr key={`${u.source}-${u.id}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{u.namaLengkap}</td>
                      <td className="px-6 py-4 font-mono text-sky-600 font-semibold">
                        {u.email || '-'}
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(u.peran)}</td>
                     <td className="px-6 py-4">
                       <span
                         className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                           u.source === 'farmasi'
                             ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                             : 'bg-slate-100 text-slate-700 border-slate-200'
                         }`}
                       >
                         {u.source === 'farmasi' ? 'Farmasi' : 'SIMRS'}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-slate-600">
                       {u.dokter ? (
                         <div>
                           <span className="font-medium text-slate-800">{u.dokter.spesialisasi}</span>
                           <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">
                             Status: Dokter Aktif
                           </span>
                         </div>
                       ) : (
                         <span className="text-slate-400">-</span>
                       )}
                     </td>
                     <td className="px-6 py-4 text-slate-400 font-medium">
                       {new Date(u.dibuatPada).toLocaleDateString('id-ID')}
                     </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Buat Akun Baru oleh Admin Modern */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Buat Akun Login Pengguna Baru</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Didaftarkan oleh Administrator SIMRS atau Farmasi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sumber Akses *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sumber: 'simrs',
                          peran: 'dokter',
                          email: formData.email || '',
                          kata_sandi: formData.kata_sandi || 'password123',
                        })
                      }
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                        formData.sumber === 'simrs'
                          ? 'bg-sky-50 border-sky-200 text-sky-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      SIMRS / Rumah Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          sumber: 'farmasi',
                          peran: 'apoteker',
                          email: '',
                          kata_sandi: '',
                        })
                      }
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                        formData.sumber === 'farmasi'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Tambah Akun Farmasi
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Peran Akun *
                  </label>
                  <select
                    value={formData.peran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        peran: e.target.value as 'dokter' | 'petugas_pendaftaran' | 'apoteker' | 'pengelola_farmasi',
                      })
                    }
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                  >
                    {formData.sumber === 'farmasi' ? (
                      <>
                        <option value="apoteker">Apoteker</option>
                        <option value="pengelola_farmasi">Pengelola Farmasi</option>
                      </>
                    ) : (
                      <>
                        <option value="dokter">Dokter Spesialis (Dapat Meresepkan & Memeriksa)</option>
                        <option value="petugas_pendaftaran">Petugas Pendaftaran (Loket & Antrean Pasien)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formData.sumber === 'farmasi'
                        ? 'Contoh: apt. Rina Marlina, S.Farm'
                        : formData.peran === 'dokter'
                        ? 'Contoh: dr. Dian Pratama, Sp.A'
                        : 'Contoh: Rian Pratama'
                    }
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  />
                </div>

                {formData.sumber === 'simrs' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Login *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nama@hospital.local"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 font-mono border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Kata Sandi Login *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.kata_sandi}
                        onChange={(e) => setFormData({ ...formData, kata_sandi: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {formData.sumber === 'simrs' && formData.peran === 'dokter' && (
                  <div className="p-4 bg-sky-50/80 border border-sky-200/80 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-sky-900 block">
                      Spesifikasi Profil Dokter Spesialis
                    </span>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Bidang Spesialisasi *
                      </label>
                      <select
                        value={formData.spesialisasi}
                        onChange={(e) => setFormData({ ...formData, spesialisasi: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500"
                      >
                        <option value="Spesialis Penyakit Dalam (Sp.PD)">Spesialis Penyakit Dalam (Sp.PD)</option>
                        <option value="Spesialis Anak (Sp.A)">Spesialis Anak (Sp.A)</option>
                        <option value="Spesialis Jantung & Pembuluh Darah (Sp.JP)">Spesialis Jantung (Sp.JP)</option>
                        <option value="Spesialis Bedah (Sp.B)">Spesialis Bedah (Sp.B)</option>
                        <option value="Dokter Umum">Dokter Umum</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Membuat Akun...' : 'Simpan & Buat Akun'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
