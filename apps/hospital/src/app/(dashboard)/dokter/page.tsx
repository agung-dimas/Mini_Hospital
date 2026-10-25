'use client'

import React, { useState, useEffect } from 'react'
import { HospitalHeader } from '@/components/layout/header'
import {
  UserCheck,
  Plus,
  Search,
  Shield,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  Phone,
  Mail,
  Lock,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Dokter {
  id: string
  namaLengkap: string
  spesialisasi: string
  nomorSip?: string | null
  aktif: boolean
  dibuatPada: string
}

export default function DokterPage() {
  const { role } = useRole()
  const isAdministrator = role === 'administrator'

  const [dokterList, setDokterList] = useState<Dokter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    spesialisasi: 'Spesialis Penyakit Dalam',
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchDokter = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/dokter')
      const json = await res.json()
      if (json.sukses) {
        setDokterList(json.data)
      }
    } catch (err) {
      console.error('Gagal mengambil data dokter:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDokter()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdministrator) {
      alert('Hanya Administrator yang memiliki hak menambah dokter (PRD 5.1)')
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)
      const res = await fetch('/api/v1/dokter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()

      if (json.sukses) {
        setMessage({ text: 'Dokter berhasil ditambahkan ke Supabase A!', type: 'success' })
        setFormData({ nama_lengkap: '', spesialisasi: 'Spesialis Penyakit Dalam' })
        setModalOpen(false)
        fetchDokter()
      } else {
        setMessage({ text: json.pesan || 'Gagal menambahkan dokter', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan jaringan', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = dokterList.filter(
    (d) =>
      d.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      d.spesialisasi.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <HospitalHeader title="Manajemen Data Dokter" />

      <main className="p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Banner Hak Akses PRD 5 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 mt-0.5">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Hak Akses Modul Dokter (PRD 5.1)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800">
                  Kewenangan Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengelolaan akun dan status dokter aktif dilakukan oleh Administrator. Peran lain hanya memiliki hak baca.
              </p>
            </div>
          </div>

          {isAdministrator ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              Tambah Dokter Baru
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
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            {message.text}
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama dokter atau spesialisasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Dokter Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Memuat data dokter dari Supabase A...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Tidak ada dokter yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dok) => (
              <div
                key={dok.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shadow-xs border border-blue-100">
                      <Stethoscope className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{dok.namaLengkap}</h3>
                      <p className="text-xs text-blue-600 font-medium">{dok.spesialisasi}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      dok.aktif ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {dok.aktif ? 'Praktik Aktif' : 'Non-Aktif'}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>ID Dokter:</span>
                    <span className="font-mono text-[10px] text-slate-700 truncate max-w-[150px]">
                      {dok.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status SIP:</span>
                    <span className="font-semibold text-slate-700">Terdaftar & Valid</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAdministrator) {
                        alert('Hanya Administrator yang berwenang mengubah profil dokter (PRD 5.1)')
                      } else {
                        alert(`Edit data dokter: ${dok.namaLengkap}`)
                      }
                    }}
                    className={`w-full py-2 text-center text-xs font-semibold rounded-xl border transition-colors ${
                      isAdministrator
                        ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        : 'border-slate-100 text-slate-400 cursor-not-allowed bg-slate-50/50'
                    }`}
                  >
                    {isAdministrator ? 'Kelola Profil Dokter' : 'Lihat Detail'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tambah Dokter Baru */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Tambah Dokter Spesialis Baru</h3>
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
                    Nama Lengkap Beserta Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: dr. Dian Pratama, Sp.A"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Spesialisasi *
                  </label>
                  <select
                    value={formData.spesialisasi}
                    onChange={(e) => setFormData({ ...formData, spesialisasi: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="Spesialis Penyakit Dalam">Spesialis Penyakit Dalam (Sp.PD)</option>
                    <option value="Spesialis Anak">Spesialis Anak (Sp.A)</option>
                    <option value="Spesialis Jantung dan Pembuluh Darah">Spesialis Jantung & Pembuluh Darah (Sp.JP)</option>
                    <option value="Spesialis Bedah">Spesialis Bedah (Sp.B)</option>
                    <option value="Dokter Umum">Dokter Umum</option>
                  </select>
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Dokter'}
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
