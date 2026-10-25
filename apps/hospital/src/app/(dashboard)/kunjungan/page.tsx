'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import {
  Calendar,
  Plus,
  Search,
  UserCheck,
  Clock,
  CheckCircle2,
  Stethoscope,
  Users,
  ChevronRight,
  AlertCircle,
  FileText,
  Lock,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Pasien {
  id: string
  nomorRekamMedis: string
  namaLengkap: string
  jenisKelamin: string
}

interface Dokter {
  id: string
  namaLengkap: string
  spesialisasi: string
}

interface Kunjungan {
  id: string
  waktuKunjungan: string
  status: string
  pasien: Pasien
  dokter: Dokter
  pemeriksaan: Array<{ id: string; diagnosis: string }>
  resep: Array<{ id: string; status: string }>
}

export default function KunjunganPage() {
  const { role } = useRole()
  const canRegisterVisit = role === 'petugas_pendaftaran' || role === 'administrator'
  const isDoctor = role === 'dokter'

  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([])
  const [pasienList, setPasienList] = useState<Pasien[]>([])
  const [dokterList, setDokterList] = useState<Dokter[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    pasien_id: '',
    dokter_id: '',
  })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resKunjungan, resPasien, resDokter] = await Promise.all([
        fetch('/api/v1/kunjungan'),
        fetch('/api/v1/pasien'),
        fetch('/api/v1/dokter'),
      ])
      const [jsonKunjungan, jsonPasien, jsonDokter] = await Promise.all([
        resKunjungan.json(),
        resPasien.json(),
        resDokter.json(),
      ])

      if (jsonKunjungan.sukses) setKunjunganList(jsonKunjungan.data)
      if (jsonPasien.sukses) {
        setPasienList(jsonPasien.data)
        if (jsonPasien.data.length > 0) {
          setFormData((prev) => ({ ...prev, pasien_id: jsonPasien.data[0].id }))
        }
      }
      if (jsonDokter.sukses) {
        setDokterList(jsonDokter.data)
        if (jsonDokter.data.length > 0) {
          setFormData((prev) => ({ ...prev, dokter_id: jsonDokter.data[0].id }))
        }
      }
    } catch (err) {
      console.error('Error fetching data kunjungan:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canRegisterVisit) {
      alert('Hanya Petugas Pendaftaran yang berwenang mendaftarkan kunjungan pasien (PRD 5.2)')
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)
      const res = await fetch('/api/v1/kunjungan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pasien_id: formData.pasien_id,
          dokter_id: formData.dokter_id,
          waktu_kunjungan: new Date().toISOString(),
        }),
      })
      const json = await res.json()

      if (json.sukses) {
        setMessage({ text: 'Kunjungan pasien berhasil didaftarkan ke antrean!', type: 'success' })
        setModalOpen(false)
        fetchData()
      } else {
        setMessage({ text: json.pesan || 'Gagal mendaftarkan kunjungan', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan sistem', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Menunggu Dokter
          </span>
        )
      case 'sedang_diperiksa':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <Stethoscope className="h-3 w-3" />
            Sedang Diperiksa
          </span>
        )
      case 'selesai':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            Selesai
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  return (
    <>
      <HospitalHeader title="Antrean & Kunjungan Medis" />

      <main className="p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Banner Hak Akses PRD 5.2 & 5.3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Alur Kunjungan Pasien (PRD 5.2 & 5.3)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                  Petugas Pendaftaran ➜ Dokter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Petugas pendaftaran mencatat kedatangan dan memasukkan ke antrean dokter. Dokter memeriksa dan meresepkan obat.
              </p>
            </div>
          </div>

          {canRegisterVisit ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
              Daftarkan Kunjungan Baru
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
              <Lock className="h-3.5 w-3.5" />
              Pendaftaran Kunjungan oleh Loket Front Office
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

        {/* Tabel Antrean Kunjungan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Antrean Kunjungan Hari Ini</h3>
              <p className="text-xs text-slate-500">Kunjungan aktif pasien ke klinik dokter spesialis</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
              Total: {kunjunganList.length} Pasien
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Memuat data kunjungan dari Supabase...
            </div>
          ) : kunjunganList.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Belum ada kunjungan yang terdaftar hari ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {kunjunganList.map((k) => (
                <div
                  key={k.id}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                      {k.pasien.nomorRekamMedis.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{k.pasien.namaLengkap}</h4>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {k.pasien.nomorRekamMedis}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Stethoscope className="h-3.5 w-3.5 text-blue-600" />
                          {k.dokter.namaLengkap} ({k.dokter.spesialisasi})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(k.waktuKunjungan).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} WIB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {getStatusBadge(k.status)}

                    {/* Aksi Dokter: Periksa & Resepkan */}
                    {isDoctor ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/pemeriksaan?kunjunganId=${k.id}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                          Periksa Medis
                        </Link>
                        <Link
                          href={`/resep/baru?kunjunganId=${k.id}&pasienId=${k.pasien.id}&dokterId=${k.dokter.id}`}
                          className="px-3 py-1.5 border border-blue-600 text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Buat Resep
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-lg">
                        Tunggu giliran periksa
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Pendaftaran Kunjungan Baru (Petugas Pendaftaran) */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm">Pendaftaran Kunjungan Pasien</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateVisit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Pasien Terdaftar *
                  </label>
                  <select
                    value={formData.pasien_id}
                    onChange={(e) => setFormData({ ...formData, pasien_id: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {pasienList.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.nomorRekamMedis}] {p.namaLengkap} - {p.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Dokter Tujuan *
                  </label>
                  <select
                    value={formData.dokter_id}
                    onChange={(e) => setFormData({ ...formData, dokter_id: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    {dokterList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.namaLengkap} - {d.spesialisasi}
                      </option>
                    ))}
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
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Daftarkan Kunjungan'}
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
