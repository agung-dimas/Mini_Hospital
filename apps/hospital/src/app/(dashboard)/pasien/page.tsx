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
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Pasien {
  id: string
  nomorRekamMedis: string
  namaLengkap: string
  tanggalLahir: string
  jenisKelamin: string
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
      alamat: '',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canRegister) {
      alert('Hanya Petugas Pendaftaran atau Administrator yang berwenang mendaftarkan pasien (PRD 5.2)')
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
        setMessage({ text: 'Pasien baru berhasil didaftarkan ke Supabase A!', type: 'success' })
        setModalOpen(false)
        fetchPasien()
      } else {
        setMessage({ text: json.pesan || 'Gagal mendaftarkan pasien', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <HospitalHeader title="Manajemen Data Pasien" />

      <main className="p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Banner Hak Akses PRD 5.2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Hak Akses Modul Pasien (PRD 5.2)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                  Petugas Pendaftaran
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Petugas pendaftaran berwenang mendaftarkan, memperbarui identitas, serta mencari data pasien berdasarkan nama atau nomor rekam medis unik.
              </p>
            </div>
          </div>

          {canRegister ? (
            <button
              type="button"
              onClick={handleOpenModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              Daftar Pasien Baru
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
              <Lock className="h-3.5 w-3.5" />
              Mode Hanya Baca ({role})
            </div>
          )}
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            {message.text}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama pasien atau No. RM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Tabel Pasien */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Daftar Pasien Terdaftar</h3>
            <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
              Total: {pasienList.length} Pasien
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Memuat data pasien...</div>
          ) : pasienList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Tidak ada data pasien yang cocok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-6 py-3">No. Rekam Medis</th>
                    <th className="px-6 py-3">Nama Lengkap</th>
                    <th className="px-6 py-3">Tanggal Lahir</th>
                    <th className="px-6 py-3">Jenis Kelamin</th>
                    <th className="px-6 py-3">Alamat</th>
                    <th className="px-6 py-3">Terdaftar Pada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pasienList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-mono font-bold text-blue-600">
                        {p.nomorRekamMedis}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{p.namaLengkap}</td>
                      <td className="px-6 py-3.5 text-slate-600">
                        {new Date(p.tanggalLahir).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-3.5 capitalize">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.jenisKelamin === 'laki-laki'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {p.jenisKelamin}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">
                        {p.alamat || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        {new Date(p.dibuatPada).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Tambah Pasien Baru */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Pendaftaran Pasien Baru</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Rekam Medis (Unik) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nomor_rekam_medis}
                    onChange={(e) => setFormData({ ...formData, nomor_rekam_medis: e.target.value })}
                    className="w-full px-3.5 py-2 font-mono border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap Pasien *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Hidayat"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                    >
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Tempat Tinggal
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Jl. Merdeka No. 12, Jakarta"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Daftarkan Pasien'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
