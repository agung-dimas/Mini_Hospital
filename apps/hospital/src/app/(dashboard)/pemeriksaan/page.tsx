'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import {
  Stethoscope,
  Save,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Activity,
  Lock,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Kunjungan {
  id: string
  waktuKunjungan: string
  status: string
  pasien: {
    id: string
    nomorRekamMedis: string
    namaLengkap: string
    tanggalLahir: string
    jenisKelamin: string
  }
  dokter: {
    id: string
    namaLengkap: string
    spesialisasi: string
  }
}

function PemeriksaanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { role } = useRole()
  const isDoctor = role === 'dokter'

  const paramKunjunganId = searchParams.get('kunjunganId')

  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([])
  const [selectedKunjunganId, setSelectedKunjunganId] = useState(paramKunjunganId || '')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
    diagnosis: '',
    catatan: '',
    tekananDarah: '120/80 mmHg',
    nadi: '80 bpm',
    suhuTubuh: '36.8 °C',
  })

  useEffect(() => {
    async function loadKunjungan() {
      try {
        setLoading(true)
        const res = await fetch('/api/v1/kunjungan')
        const json = await res.json()
        if (json.sukses) {
          setKunjunganList(json.data)
          if (!selectedKunjunganId && json.data.length > 0) {
            setSelectedKunjunganId(json.data[0].id)
          }
        }
      } catch (err) {
        console.error('Error load kunjungan:', err)
      } finally {
        setLoading(false)
      }
    }
    loadKunjungan()
  }, [selectedKunjunganId])

  const selectedKunjungan = kunjunganList.find((k) => k.id === selectedKunjunganId)

  const handleSubmit = async (e: React.FormEvent, proceedToPrescription = false) => {
    e.preventDefault()
    if (!isDoctor) {
      alert('Hanya Dokter yang berwenang menyimpan catatan medis dan diagnosis (PRD 5.3)')
      return
    }

    if (!selectedKunjunganId) {
      setMessage({ text: 'Pilih pasien kunjungan terlebih dahulu', type: 'error' })
      return
    }

    try {
      setSubmitting(true)
      setMessage(null)

      const catatanLengkap = `[Tanda Vital] Tensi: ${formData.tekananDarah}, Nadi: ${formData.nadi}, Suhu: ${formData.suhuTubuh}. Catatan Klinis: ${formData.catatan}`

      const res = await fetch('/api/v1/pemeriksaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kunjungan_id: selectedKunjunganId,
          diagnosis: formData.diagnosis,
          catatan: catatanLengkap,
        }),
      })
      const json = await res.json()

      if (json.sukses) {
        setMessage({ text: 'Pemeriksaan & diagnosis berhasil disimpan!', type: 'success' })
        if (proceedToPrescription && selectedKunjungan) {
          router.push(
            `/resep/baru?kunjunganId=${selectedKunjungan.id}&pasienId=${selectedKunjungan.pasien.id}&dokterId=${selectedKunjungan.dokter.id}`
          )
        }
      } else {
        setMessage({ text: json.pesan || 'Gagal menyimpan pemeriksaan', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Kesalahan jaringan atau server', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <HospitalHeader title="Pemeriksaan Medis & E-MR (Dokter)" />

      <main className="p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Banner Hak Akses PRD 5.3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 mt-0.5">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Modul Pemeriksaan Dokter (PRD 5.3 & 6.6)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                  Kewenangan Eksklusif Dokter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan pemeriksaan fisik, diagnosis ICD, dan catatan rekam medis pasien sebelum penerbitan resep.
              </p>
            </div>
          </div>

          {!isDoctor && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              Peran Anda ({role}): Pengisian diagnosis hanya oleh Dokter
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sisi Kiri: Pilih Kunjungan & Info Pasien */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Pilih Pasien Kunjungan</h3>

              {loading ? (
                <div className="text-xs text-slate-500">Memuat pasien...</div>
              ) : (
                <select
                  value={selectedKunjunganId}
                  onChange={(e) => setSelectedKunjunganId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {kunjunganList.map((k) => (
                    <option key={k.id} value={k.id}>
                      [{k.pasien.nomorRekamMedis}] {k.pasien.namaLengkap} - dr. {k.dokter.namaLengkap}
                    </option>
                  ))}
                </select>
              )}

              {selectedKunjungan && (
                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Pasien:</span>
                    <span className="font-bold text-slate-900">{selectedKunjungan.pasien.namaLengkap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nomor RM:</span>
                    <span className="font-mono text-slate-800">{selectedKunjungan.pasien.nomorRekamMedis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jenis Kelamin:</span>
                    <span className="text-slate-800">
                      {selectedKunjungan.pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dokter Penanggung:</span>
                    <span className="font-medium text-blue-600">{selectedKunjungan.dokter.namaLengkap}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Formulir Pemeriksaan & Diagnosis */}
          <div className="lg:col-span-2">
            <form
              onSubmit={(e) => handleSubmit(e, false)}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5"
            >
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Lembar Pemeriksaan Fisik & Diagnosis</h3>
                <p className="text-xs text-slate-500 mt-0.5">Catat temuan klinis pasien sebelum menentukan terapi obat</p>
              </div>

              {/* Tanda Vital */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Tanda-tanda Vital Pasien
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Tekanan Darah:</span>
                    <input
                      type="text"
                      disabled={!isDoctor}
                      value={formData.tekananDarah}
                      onChange={(e) => setFormData({ ...formData, tekananDarah: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Denyut Nadi:</span>
                    <input
                      type="text"
                      disabled={!isDoctor}
                      value={formData.nadi}
                      onChange={(e) => setFormData({ ...formData, nadi: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Suhu Tubuh:</span>
                    <input
                      type="text"
                      disabled={!isDoctor}
                      value={formData.suhuTubuh}
                      onChange={(e) => setFormData({ ...formData, suhuTubuh: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis Klinis */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnosis Medis / ICD-10 *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isDoctor}
                  placeholder="Contoh: ISPA Akut (J06.9) / Faringitis Akut (J02.9)"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Catatan Dokter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Medis & Instruksi Dokter
                </label>
                <textarea
                  rows={3}
                  disabled={!isDoctor}
                  placeholder="Keluhan batuk berdahak 3 hari, demam ringan, anjuran istirahat cukup dan banyak minum air putih..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Data otomatis tersimpan ke Supabase A
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !isDoctor}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={submitting || !isDoctor}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4" />
                    Simpan & Resepkan Obat
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

export default function PemeriksaanPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Memuat modul pemeriksaan...</div>}>
      <PemeriksaanContent />
    </Suspense>
  )
}
