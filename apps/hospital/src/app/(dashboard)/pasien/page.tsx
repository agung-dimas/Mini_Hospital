'use client'

import React, { useState, useEffect } from 'react'
import { HospitalHeader } from '@/components/layout/header'
import {
  Users,
  Search,
  Plus,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Shield,
  Phone,
  User,
  MapPin,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Pasien {
  id: string
  nomorRekamMedis: string
  namaLengkap: string
  tanggalLahir: string
  jenisKelamin: string
  nomorTelepon: string | null
  alamat: string | null
  dibuatPada: string
}

export default function PasienPage() {
  const { role } = useRole()
  const canRegister = role === 'petugas_pendaftaran' || role === 'administrator'

  const [pasienList, setPasienList] = useState<Pasien[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
    nomor_rekam_medis: '',
    nama_lengkap: '',
    tanggal_lahir: '1995-05-15',
    jenis_kelamin: 'laki-laki' as 'laki-laki' | 'perempuan',
    nomor_telepon: '',
    alamat: '',
  })

  const fetchPasien = async (query = '') => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/pasien${query ? `?cari=${encodeURIComponent(query)}` : ''}`)
      const json = await res.json()
      if (json.sukses) {
        setPasienList(json.data)
      }
    } catch (err) {
      console.error('Error load pasien:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPasien(search)
  }, [search])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen])

  const generateNomorRM = () => {
    const random = Math.floor(1000 + Math.random() * 9000)
    return `RM-2026-${random}`
  }

  const handleOpenModal = () => {
    setFormData({
      nomor_rekam_medis: generateNomorRM(),
      nama_lengkap: '',
      tanggal_lahir: '1995-05-15',
      jenis_kelamin: 'laki-laki',
      nomor_telepon: '',
      alamat: '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canRegister) {
      alert('Hanya Petugas Pendaftaran atau Administrator yang berwenang mendaftarkan pasien')
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)
      const res = await fetch('/api/v1/pasien', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()

      if (json.sukses) {
        setMessage({ text: 'Pasien baru berhasil didaftarkan ke master sistem!', type: 'success' })
        setModalOpen(false)
        fetchPasien()
      } else {
        setMessage({ text: json.pesan || 'Gagal mendaftarkan pasien', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan jaringan saat mendaftarkan pasien', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Manajemen Data Pasien & Rekam Medis" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Hak Akses & Tombol Aksi */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 mt-0.5 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Hak Akses Modul Pasien (SIMRS)</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Petugas Pendaftaran
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pendaftaran identitas pasien baru (No. RM unik dan nomor telepon), pencarian data medis, serta pengelolaan master pasien.
              </p>
            </div>
          </div>

          {canRegister ? (
            <button
              type="button"
              onClick={handleOpenModal}
              className="px-4.5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Daftar Pasien Baru</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
              <Lock className="h-3.5 w-3.5" />
              <span>Mode Hanya Baca ({role})</span>
            </div>
          )}
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${message.type === 'success'
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

        {/* Search Bar Modern */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pasien, No. RM, atau No. HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 shadow-2xs transition-all"
          />
        </div>

        {/* Tabel Pasien Modern */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Daftar Pasien Terdaftar</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Seluruh rekam data pasien yang tersimpan dalam sistem</p>
            </div>
            <span className="text-xs font-bold text-sky-700 px-3 py-1 bg-sky-50 border border-sky-200/80 rounded-full">
              Total: {pasienList.length} Pasien
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 font-medium">Memuat data pasien...</div>
          ) : pasienList.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 font-medium">
              Tidak ada data pasien yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-3.5">No. Rekam Medis</th>
                    <th className="px-6 py-3.5">Nama Lengkap</th>
                    <th className="px-6 py-3.5">No. HP / Telepon</th>
                    <th className="px-6 py-3.5">Tanggal Lahir</th>
                    <th className="px-6 py-3.5">Jenis Kelamin</th>
                    <th className="px-6 py-3.5">Alamat</th>
                    <th className="px-6 py-3.5">Terdaftar Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pasienList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sky-600">
                        {p.nomorRekamMedis}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{p.namaLengkap}</td>
                      <td className="px-6 py-4 font-mono">
                        {p.nomorTelepon ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-semibold text-[11px]">
                            <Phone className="h-3 w-3 text-emerald-600 shrink-0" />
                            {p.nomorTelepon}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(p.tanggalLahir).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${p.jenisKelamin === 'laki-laki'
                              ? 'bg-sky-50 text-sky-700 border-sky-200/80'
                              : 'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}
                        >
                          {p.jenisKelamin}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {p.alamat || '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-medium">
                        {new Date(p.dibuatPada).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Tambah Pasien Baru Modern */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Pendaftaran Pasien Baru</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Input data rekam medis pasien ke dalam sistem</p>
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
                    Nomor Rekam Medis (Unik) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomor_rekam_medis}
                    onChange={(e) => setFormData({ ...formData, nomor_rekam_medis: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono font-bold text-sky-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap Pasien *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Prasetyo"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor HP / WhatsApp Pasien
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={formData.nomor_telepon}
                      onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Jenis Kelamin *
                    </label>
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jenis_kelamin: e.target.value as 'laki-laki' | 'perempuan',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                    >
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Tempat Tinggal</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Jl. Sudirman No. 12, Jakarta"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-100">
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
                    {submitting ? 'Menyimpan...' : 'Simpan Pasien Baru'}
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
