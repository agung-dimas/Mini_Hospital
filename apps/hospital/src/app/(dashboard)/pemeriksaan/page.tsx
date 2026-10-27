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
  Phone,
  ArrowRight,
  History,
  MessageCircle,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Kunjungan {
  id: string
  waktuKunjungan: string
  status: string
  pemeriksaan: Array<{
    id: string
    diagnosis: string
    catatan?: string | null
    dibuatPada: string
  }>
  pasien: {
    id: string
    nomorRekamMedis: string
    namaLengkap: string
    tanggalLahir: string
    jenisKelamin: string
    nomorTelepon?: string | null
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
  const { role, user } = useRole()
  const isDoctor = role === 'dokter'

  const paramKunjunganId = searchParams.get('kunjunganId')

  const [kunjunganList, setKunjunganList] = useState<Kunjungan[]>([])
  const [selectedKunjunganId, setSelectedKunjunganId] = useState(paramKunjunganId || '')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    diagnosis: '',
    catatan: '',
    tekananDarah: '120/80 mmHg',
    nadi: '80 bpm',
    suhuTubuh: '36.8 °C',
  })

  const isMyVisit = (k: Kunjungan) => {
    if (user?.dokterId && k.dokter.id === user.dokterId) return true
    if (user?.namaLengkap && k.dokter.namaLengkap.toLowerCase().includes(user.namaLengkap.toLowerCase())) return true
    return false
  }

  const loadKunjungan = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      const res = await fetch('/api/v1/kunjungan')
      const json = await res.json()
      if (json.sukses) {
        setKunjunganList(json.data)
        if (!selectedKunjunganId) {
          const myVisits = json.data.filter((k: Kunjungan) => {
            if (user?.dokterId && k.dokter.id === user.dokterId) return true
            if (user?.namaLengkap && k.dokter.namaLengkap.toLowerCase().includes(user.namaLengkap.toLowerCase())) return true
            return false
          })
          if (myVisits.length > 0) {
            setSelectedKunjunganId(myVisits[0].id)
          } else if (json.data.length > 0) {
            setSelectedKunjunganId(json.data[0].id)
          }
        }
      } else {
        setFetchError(json.pesan || 'Gagal memuat antrean kunjungan pasien')
      }
    } catch (err) {
      console.error('Error load kunjungan:', err)
      setFetchError(err instanceof Error ? err.message : 'Gagal menghubungi server kunjungan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKunjungan()
  }, [])

  const selectedKunjungan = kunjunganList.find((k) => k.id === selectedKunjunganId)
  const riwayatPemeriksaan = selectedKunjungan
    ? kunjunganList
        .filter((k) => k.pasien.id === selectedKunjungan.pasien.id)
        .flatMap((k) =>
          k.pemeriksaan.map((pemeriksaan) => ({
            ...pemeriksaan,
            waktuKunjungan: k.waktuKunjungan,
            dokter: k.dokter.namaLengkap,
          }))
        )
        .sort((a, b) => new Date(b.dibuatPada || b.waktuKunjungan).getTime() - new Date(a.dibuatPada || a.waktuKunjungan).getTime())
    : []

  const buatUrlWhatsApp = (nomorTelepon: string, pesan: string) => {
    const nomor = nomorTelepon.replace(/\D/g, '').replace(/^0/, '62')
    return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
  }

  const handleSubmit = async (e: React.FormEvent, proceedToPrescription = false) => {
    e.preventDefault()

    if (!isDoctor) {
      alert('Hanya Dokter yang berwenang mengisi hasil pemeriksaan fisik dan diagnosis (PRD 5.3)')
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
          dibuat_oleh: user?.dokterId || user?.id,
        }),
      })
      const json = await res.json()

      if (json.sukses) {
        setMessage({ text: 'Pemeriksaan & diagnosis berhasil disimpan!', type: 'success' })
        if (selectedKunjungan?.pasien.nomorTelepon) {
          setWhatsappUrl(
            buatUrlWhatsApp(
              selectedKunjungan.pasien.nomorTelepon,
              [
                `Halo ${selectedKunjungan.pasien.namaLengkap},`,
                '',
                'Hasil pemeriksaan Anda:',
                `Diagnosis: ${formData.diagnosis}`,
                `Catatan dokter: ${catatanLengkap}`,
                '',
                'Silakan tunjukkan pesan ini ke bagian Farmasi saat mengambil obat.',
                `Nomor rekam medis: ${selectedKunjungan.pasien.nomorRekamMedis}`,
              ].join('\n')
            )
          )
        } else {
          setWhatsappUrl(null)
        }
        loadKunjungan()
        if (proceedToPrescription && selectedKunjungan) {
          router.push(
            `/resep/baru?kunjunganId=${selectedKunjungan.id}&pasienId=${selectedKunjungan.pasien.id}&dokterId=${selectedKunjungan.dokter.id}`
          )
        }
      } else {
        setMessage({ text: json.pesan || 'Gagal menyimpan pemeriksaan', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Kesalahan jaringan atau server saat menyimpan data', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Pemeriksaan Medis & E-MR (Dokter)" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Hak Akses */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 mt-0.5 shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Modul Rekam Medis Elektronik (RME)</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                  Kewenangan Eksklusif Dokter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Pencatatan tanda-tanda vital, diagnosis klinis terstandar, dan catatan instruksi medis sebelum penerbitan resep digital.
              </p>
            </div>
          </div>

          {!isDoctor && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <span>Akses Terbatas: Pengisian rekam medis hanya untuk Dokter</span>
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
            {message.type === 'success' && whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:bg-[#1da851] focus:outline-hidden focus:ring-2 focus:ring-[#128C7E]"
              >
                <MessageCircle className="h-4 w-4" />
                Kirim hasil via WhatsApp
              </a>
            )}
          </div>
        )}

        {fetchError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-xs font-medium">{fetchError}</span>
            </div>
            <button
              onClick={loadKunjungan}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sisi Kiri: Pilih Kunjungan & Info Pasien */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Pilih Pasien Kunjungan</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Antrean pasien poliklinik aktif</p>
              </div>

              {loading ? (
                <div className="text-xs text-slate-400 font-medium py-3">Memuat antrean...</div>
              ) : (isDoctor ? kunjunganList.filter(isMyVisit) : kunjunganList).length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 border border-slate-200 text-center">
                  {isDoctor
                    ? `Belum ada antrean pasien untuk poli ${user?.namaLengkap || 'Anda'}.`
                    : 'Belum ada antrean terdaftar.'}
                </div>
              ) : (
                <select
                  value={selectedKunjunganId}
                  onChange={(e) => setSelectedKunjunganId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                >
                  {(isDoctor ? kunjunganList.filter(isMyVisit) : kunjunganList).map((k) => (
                    <option key={k.id} value={k.id}>
                      [{k.pasien.nomorRekamMedis}] {k.pasien.namaLengkap} - {k.status}
                    </option>
                  ))}
                </select>
              )}

              {selectedKunjungan && (
                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Nama Pasien:</span>
                    <span className="font-bold text-slate-900">{selectedKunjungan.pasien.namaLengkap}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Nomor RM:</span>
                    <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {selectedKunjungan.pasien.nomorRekamMedis}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Jenis Kelamin:</span>
                    <span className="text-slate-800 font-semibold capitalize">
                      {selectedKunjungan.pasien.jenisKelamin === 'laki-laki' || selectedKunjungan.pasien.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  {selectedKunjungan.pasien.nomorTelepon && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">No. HP:</span>
                      <span className="font-mono text-emerald-800 font-semibold flex items-center gap-1">
                        <Phone className="h-3 w-3 text-emerald-600" />
                        {selectedKunjungan.pasien.nomorTelepon}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Dokter Penanggung:</span>
                    <span className="font-bold text-sky-700">{selectedKunjungan.dokter.namaLengkap}</span>
                  </div>
                </div>
              )}
            </div>

            <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 shrink-0">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Riwayat Pemeriksaan</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Catatan pemeriksaan pasien sebelumnya</p>
                </div>
              </div>

              {!selectedKunjungan ? (
                <p className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 border border-slate-200 text-center">
                  Pilih pasien untuk melihat riwayat pemeriksaan.
                </p>
              ) : riwayatPemeriksaan.length === 0 ? (
                <p className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 border border-slate-200 text-center">
                  Belum ada riwayat pemeriksaan untuk pasien ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {riwayatPemeriksaan.map((pemeriksaan) => (
                    <article key={pemeriksaan.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <time className="text-[11px] font-semibold text-slate-500">
                          {new Date(pemeriksaan.dibuatPada || pemeriksaan.waktuKunjungan).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                        <span className="text-[11px] text-slate-500">Dokter: {pemeriksaan.dokter}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{pemeriksaan.diagnosis}</h4>
                      {pemeriksaan.catatan && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">
                          {pemeriksaan.catatan}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sisi Kanan: Formulir Pemeriksaan & Diagnosis */}
          <div className="lg:col-span-2">
            <form
              onSubmit={(e) => handleSubmit(e, false)}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5"
            >
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                  Lembar Pemeriksaan Fisik & Diagnosis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Catat temuan klinis pasien sebelum menentukan terapi obat</p>
              </div>

              {/* Tanda Vital */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Tanda-tanda Vital Pasien
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">Tekanan Darah:</span>
                    <input
                      type="text"
                      disabled={!isDoctor}
                      value={formData.tekananDarah}
                      onChange={(e) => setFormData({ ...formData, tekananDarah: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">Denyut Nadi:</span>
                    <input
                      type="text"
                      disabled={!isDoctor}
                      value={formData.nadi}
                      onChange={(e) => setFormData({ ...formData, nadi: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1">Suhu Tubuh:</span>
                    <input
                      type="text"
                      disabled={!isDoctor}
                      value={formData.suhuTubuh}
                      onChange={(e) => setFormData({ ...formData, suhuTubuh: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50/80 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnosis Klinis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Diagnosis Medis / ICD-10 *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isDoctor}
                  placeholder="Contoh: ISPA Akut (J06.9) / Faringitis Akut (J02.9)"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                />
              </div>

              {/* Catatan Dokter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Medis & Instruksi Klinis
                </label>
                <textarea
                  rows={3}
                  disabled={!isDoctor}
                  placeholder="Keluhan batuk berdahak 3 hari, demam ringan, anjuran istirahat cukup dan perbanyak hidrasi..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white disabled:bg-slate-100 disabled:cursor-not-allowed transition-all resize-none"
                />
              </div>

              {/* Tombol Aksi */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 font-medium">
                  Tersimpan otomatis ke database rekam medis
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="submit"
                    disabled={submitting || !isDoctor}
                    className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={submitting || !isDoctor}
                    className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Simpan & Buat Resep</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PemeriksaanPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400 font-medium">Memuat modul pemeriksaan...</div>}>
      <PemeriksaanContent />
    </Suspense>
  )
}
