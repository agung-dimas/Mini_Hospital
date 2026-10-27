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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        setModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdministrator) {
      alert('Hanya Administrator yang memiliki hak menambah dokter')
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
        setMessage({ text: 'Dokter berhasil ditambahkan ke master sistem!', type: 'success' })
        setFormData({ nama_lengkap: '', spesialisasi: 'Spesialis Penyakit Dalam' })
        setModalOpen(false)
        fetchDokter()
      } else {
        setMessage({ text: json.pesan || 'Gagal menambahkan dokter', type: 'error' })
      }
    } catch {
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
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Manajemen Master Dokter Spesialis" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Hak Akses */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 mt-0.5 shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Hak Akses Modul Dokter (Master SIMRS)</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                  Kewenangan Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pengelolaan akun dan status dokter aktif dilakukan oleh Administrator SIMRS untuk menjamin integritas data klinis.
              </p>
            </div>
          </div>

          {isAdministrator ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4.5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Dokter Baru</span>
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
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama dokter atau spesialisasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 shadow-2xs transition-all"
          />
        </div>

        {/* Dokter Cards Grid */}
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 font-medium bg-white rounded-3xl border border-slate-200/80">
            Memuat data dokter dari master database...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 font-medium bg-white rounded-3xl border border-slate-200/80">
            Tidak ada dokter yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((dok) => (
              <div
                key={dok.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm shadow-2xs border border-sky-100">
                      <Stethoscope className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{dok.namaLengkap}</h3>
                      <p className="text-xs text-sky-600 font-semibold mt-0.5">{dok.spesialisasi}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      dok.aktif ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {dok.aktif ? 'Praktik Aktif' : 'Non-Aktif'}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ID Dokter:</span>
                    <span className="font-mono text-[10px] text-slate-700 font-semibold truncate max-w-[150px]">
                      {dok.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status Registrasi:</span>
                    <span className="font-semibold text-emerald-700">Terdaftar Resmi</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAdministrator) {
                        alert('Hanya Administrator yang berwenang mengubah profil dokter')
                      } else {
                        alert(`Data profil dokter: ${dok.namaLengkap}`)
                      }
                    }}
                    className={`w-full py-2.5 text-center text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      isAdministrator
                        ? 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'
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

        {/* Modal Tambah Dokter Baru Modern */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Tambah Dokter Spesialis Baru</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Daftarkan dokter ke master database rumah sakit</p>
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
                    Nama Lengkap Beserta Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: dr. Dian Pratama, Sp.A"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Spesialisasi *
                  </label>
                  <select
                    value={formData.spesialisasi}
                    onChange={(e) => setFormData({ ...formData, spesialisasi: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  >
                    <option value="Spesialis Penyakit Dalam">Spesialis Penyakit Dalam (Sp.PD)</option>
                    <option value="Spesialis Anak">Spesialis Anak (Sp.A)</option>
                    <option value="Spesialis Jantung dan Pembuluh Darah">Spesialis Jantung & Pembuluh Darah (Sp.JP)</option>
                    <option value="Spesialis Bedah">Spesialis Bedah (Sp.B)</option>
                    <option value="Dokter Umum">Dokter Umum</option>
                  </select>
                </div>

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
                    {submitting ? 'Menyimpan...' : 'Simpan Dokter'}
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
