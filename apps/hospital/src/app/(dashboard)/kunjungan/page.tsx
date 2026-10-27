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
  ChevronLeft,
  MessageCircle,
  Pencil,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Pasien {
  id: string
  nomorRekamMedis: string
  namaLengkap: string
  tanggalLahir?: string
  jenisKelamin: string
  nomorTelepon?: string | null
  alamat?: string | null
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
  pemeriksaan: Array<{ id: string; diagnosis: string; catatan?: string | null }>
  resep: Array<{
    id: string
    status: string
    detailResep: Array<{
      namaObatSaatResep: string
      jumlah: number
      instruksiPenggunaan: string
    }>
  }>
}

export default function KunjunganPage() {
  const { role, user } = useRole()
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
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [visitView, setVisitView] = useState<'aktif' | 'riwayat'>('aktif')
  const [visitPage, setVisitPage] = useState(1)
  const [editingKunjungan, setEditingKunjungan] = useState<Kunjungan | null>(null)
  const [editFormData, setEditFormData] = useState({
    pasien_id: '',
    dokter_id: '',
    waktu_kunjungan: '',
    status: 'menunggu',
    nama_lengkap: '',
    tanggal_lahir: '',
    jenis_kelamin: 'laki-laki',
    nomor_telepon: '',
    alamat: '',
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (modalOpen || editingKunjungan)) {
        setModalOpen(false)
        setEditingKunjungan(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalOpen])

  const isMyPatient = (k: Kunjungan) => {
    if (user?.dokterId && k.dokter.id === user.dokterId) return true
    if (user?.namaLengkap && k.dokter.namaLengkap.toLowerCase().includes(user.namaLengkap.toLowerCase())) return true
    return false
  }

  // Dokter hanya melihat antrean pasien yang ditugaskan ke dirinya (PRD 5.3)
  // Petugas Pendaftaran & Admin melihat seluruh antrean kunjungan RS
  const displayedKunjungan = isDoctor ? kunjunganList.filter(isMyPatient) : kunjunganList
  const filteredKunjungan = displayedKunjungan.filter((kunjungan) =>
    visitView === 'aktif'
      ? kunjungan.status === 'menunggu' || kunjungan.status === 'sedang_diperiksa'
      : kunjungan.status === 'selesai' || kunjungan.status === 'batal'
  )
  const pageSize = 8
  const totalVisitPages = Math.max(1, Math.ceil(filteredKunjungan.length / pageSize))
  const paginatedKunjungan = filteredKunjungan.slice((visitPage - 1) * pageSize, visitPage * pageSize)

  const buatUrlWhatsApp = (kunjungan: Kunjungan) => {
    if (!kunjungan.pasien.nomorTelepon) return null

    const nomor = kunjungan.pasien.nomorTelepon.replace(/\D/g, '').replace(/^0/, '62')
    const pesan = [
      `Halo ${kunjungan.pasien.namaLengkap},`,
      '',
      'Detail kunjungan Anda:',
      '',
      'Detail rekam medis:',
      `Nama: ${kunjungan.pasien.namaLengkap}`,
      `Nomor rekam medis: ${kunjungan.pasien.nomorRekamMedis}`,
      ...(kunjungan.pasien.tanggalLahir
        ? [`Tanggal lahir: ${new Date(kunjungan.pasien.tanggalLahir).toLocaleDateString('id-ID')}`]
        : []),
      `Jenis kelamin: ${kunjungan.pasien.jenisKelamin === 'perempuan' ? 'Perempuan' : 'Laki-laki'}`,
      ...(kunjungan.pasien.alamat ? [`Alamat: ${kunjungan.pasien.alamat}`] : []),
      '',
      'Detail kunjungan:',
      `Dokter: ${kunjungan.dokter.namaLengkap}`,
      `Spesialisasi: ${kunjungan.dokter.spesialisasi}`,
      `Waktu kunjungan: ${new Date(kunjungan.waktuKunjungan).toLocaleString('id-ID')}`,
      `Status: ${kunjungan.status.replaceAll('_', ' ')}`,
      ...(kunjungan.pemeriksaan[0]?.diagnosis
        ? ['', `Diagnosis: ${kunjungan.pemeriksaan[0].diagnosis}`]
        : []),
      ...(kunjungan.pemeriksaan[0]?.catatan
        ? [`Catatan medis: ${kunjungan.pemeriksaan[0].catatan}`]
        : []),
      ...(kunjungan.resep.length > 0
        ? [
            '',
            'Detail resep obat:',
            ...kunjungan.resep.flatMap((resep, resepIndex) => [
              `Resep ${resepIndex + 1} (${resep.status}):`,
              ...resep.detailResep.map(
                (detail) =>
                  `- ${detail.namaObatSaatResep}, jumlah ${detail.jumlah}, aturan pakai: ${detail.instruksiPenggunaan}`
              ),
            ]),
            '',
            'Silakan tunjukkan pesan ini ke bagian Farmasi.',
          ]
        : []),
    ].join('\n')

    return `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`
  }

  useEffect(() => {
    setVisitPage(1)
  }, [visitView])

  useEffect(() => {
    if (visitPage > totalVisitPages) {
      setVisitPage(totalVisitPages)
    }
  }, [visitPage, totalVisitPages])

  const fetchData = async () => {
    try {
      setLoading(true)
      setFetchError(null)
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

      if (jsonKunjungan.sukses) {
        setKunjunganList(jsonKunjungan.data)
      } else {
        setFetchError(jsonKunjungan.pesan || 'Gagal memuat daftar kunjungan')
      }
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
      setFetchError(err instanceof Error ? err.message : 'Gagal menghubungi server kunjungan')
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
      alert('Hanya Petugas Pendaftaran yang berwenang mendaftarkan kunjungan pasien')
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

  const formatDateTimeLocal = (value: string) => {
    const date = new Date(value)
    const offset = date.getTimezoneOffset()
    return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16)
  }

  const handleOpenEdit = (kunjungan: Kunjungan) => {
    setEditingKunjungan(kunjungan)
    setEditFormData({
      pasien_id: kunjungan.pasien.id,
      dokter_id: kunjungan.dokter.id,
      waktu_kunjungan: formatDateTimeLocal(kunjungan.waktuKunjungan),
      status: kunjungan.status,
      nama_lengkap: kunjungan.pasien.namaLengkap,
      tanggal_lahir: kunjungan.pasien.tanggalLahir?.slice(0, 10) || '',
      jenis_kelamin: kunjungan.pasien.jenisKelamin === 'perempuan' ? 'perempuan' : 'laki-laki',
      nomor_telepon: kunjungan.pasien.nomorTelepon || '',
      alamat: kunjungan.pasien.alamat || '',
    })
    setMessage(null)
  }

  const handleEditVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingKunjungan || !canRegisterVisit) return

    try {
      setSubmitting(true)
      setMessage(null)
      const pasienRes = await fetch(`/api/v1/pasien/${editFormData.pasien_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_lengkap: editFormData.nama_lengkap,
          tanggal_lahir: editFormData.tanggal_lahir,
          jenis_kelamin: editFormData.jenis_kelamin,
          nomor_telepon: editFormData.nomor_telepon,
          alamat: editFormData.alamat,
        }),
      })
      const pasienJson = await pasienRes.json()

      if (!pasienJson.sukses) {
        setMessage({ text: pasienJson.pesan || 'Gagal memperbarui data pasien', type: 'error' })
        return
      }

      const kunjunganRes = await fetch('/api/v1/kunjungan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingKunjungan.id,
          pasien_id: editFormData.pasien_id,
          dokter_id: editFormData.dokter_id,
          status: editFormData.status,
          waktu_kunjungan: new Date(editFormData.waktu_kunjungan).toISOString(),
        }),
      })
      const kunjunganJson = await kunjunganRes.json()

      if (!kunjunganJson.sukses) {
        setMessage({ text: kunjunganJson.pesan || 'Data pasien tersimpan, tetapi kunjungan gagal diperbarui', type: 'error' })
        return
      }

      setMessage({ text: 'Data kunjungan berhasil diperbarui.', type: 'success' })
      setEditingKunjungan(null)
      await fetchData()
    } catch (err) {
      setMessage({ text: 'Terjadi kesalahan jaringan saat memperbarui kunjungan', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Menunggu Dokter
          </span>
        )
      case 'sedang_diperiksa':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200/80 flex items-center gap-1.5">
            <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
            Sedang Diperiksa
          </span>
        )
      case 'selesai':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Selesai
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Antrean & Kunjungan Poliklinik" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Hak Akses & Tombol Aksi */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 mt-0.5 shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Alur Pelayanan Antrean Kunjungan</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                  Front Office ➜ Dokter Spesialis
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Petugas pendaftaran mencatat kedatangan dan memasukkan ke antrean dokter. Dokter memeriksa dan menerbitkan resep medis.
              </p>
            </div>
          </div>

          {canRegisterVisit ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4.5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Daftarkan Kunjungan Baru</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
              <Lock className="h-3.5 w-3.5" />
              <span>Pendaftaran Kunjungan oleh Loket Admisi</span>
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

        {fetchError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-xs font-medium">{fetchError}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Tabel Antrean Kunjungan */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                {isDoctor
                  ? `Antrean Pasien: ${user?.namaLengkap || 'Dokter'}`
                  : 'Daftar Seluruh Antrean Kunjungan Pasien RS'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isDoctor
                  ? 'Daftar pasien yang terdaftar di poliklinik Anda dan siap diperiksa'
                  : 'Seluruh antrean kunjungan pasien rumah sakit yang dikelola oleh loket pendaftaran'}
              </p>
            </div>
            <span className="text-xs font-bold text-sky-700 px-3 py-1 bg-sky-50 border border-sky-200/80 rounded-full">
              Total: {filteredKunjungan.length} Pasien
            </span>
          </div>

          <div className="px-6 pt-4 flex flex-wrap items-center gap-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setVisitView('aktif')}
              className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                visitView === 'aktif'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Antrean aktif ({displayedKunjungan.filter((k) => k.status === 'menunggu' || k.status === 'sedang_diperiksa').length})
            </button>
            <button
              type="button"
              onClick={() => setVisitView('riwayat')}
              className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                visitView === 'riwayat'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Riwayat selesai ({displayedKunjungan.filter((k) => k.status === 'selesai' || k.status === 'batal').length})
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400 font-medium">
              Memuat data antrean kunjungan...
            </div>
          ) : filteredKunjungan.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="h-13 w-13 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">
                  {isDoctor
                    ? visitView === 'aktif'
                      ? `Belum Ada Antrean Aktif untuk ${user?.namaLengkap || 'Anda'}`
                      : 'Belum Ada Riwayat Kunjungan Selesai'
                    : visitView === 'aktif'
                      ? 'Belum Ada Antrean Aktif'
                      : 'Belum Ada Riwayat Kunjungan Selesai'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {visitView === 'aktif'
                    ? 'Kunjungan baru akan muncul setelah pasien didaftarkan oleh Petugas Pendaftaran.'
                    : 'Kunjungan yang sudah selesai akan muncul di bagian ini.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginatedKunjungan.map((k) => (
                <div
                  key={k.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-100 shadow-2xs">
                      {k.pasien.nomorRekamMedis.slice(-3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900">{k.pasien.namaLengkap}</h4>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-sky-700 font-bold border border-slate-200">
                          {k.pasien.nomorRekamMedis}
                        </span>
                        {isDoctor ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                            Poli Anda
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {k.dokter.namaLengkap}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-700 font-semibold">
                          <Stethoscope className="h-3.5 w-3.5 text-sky-600" />
                          {k.dokter.namaLengkap} ({k.dokter.spesialisasi})
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(k.waktuKunjungan).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
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
                          className="px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>Periksa Medis</span>
                        </Link>
                        <Link
                          href={`/resep/baru?kunjunganId=${k.id}&pasienId=${k.pasien.id}&dokterId=${user?.dokterId || k.dokter.id}`}
                          className="px-3.5 py-2 border border-sky-300 text-sky-700 hover:bg-sky-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Buat Resep</span>
                        </Link>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-xl">
                        Tunggu giliran periksa
                      </span>
                    )}
                    {canRegisterVisit && k.status !== 'selesai' && k.pemeriksaan.length === 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(k)}
                        aria-label={`Edit kunjungan ${k.pasien.namaLengkap}`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {buatUrlWhatsApp(k) ? (
                      <a
                        href={buatUrlWhatsApp(k) || '#'}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Kirim detail kunjungan ${k.pasien.namaLengkap} via WhatsApp`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1da851] focus:outline-hidden focus:ring-2 focus:ring-[#128C7E]"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Kirim WhatsApp</span>
                      </a>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400" title="Tambahkan nomor telepon pasien untuk mengirim WhatsApp">
                        Nomor WhatsApp belum tersedia
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredKunjungan.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                Halaman {visitPage} dari {totalVisitPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisitPage((page) => Math.max(1, page - 1))}
                  disabled={visitPage === 1}
                  aria-label="Halaman sebelumnya"
                  className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setVisitPage((page) => Math.min(totalVisitPages, page + 1))}
                  disabled={visitPage === totalVisitPages}
                  aria-label="Halaman berikutnya"
                  className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {editingKunjungan && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Edit Data Kunjungan</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Perubahan hanya tersedia sebelum pemeriksaan dimulai.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingKunjungan(null)}
                  aria-label="Tutup edit kunjungan"
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditVisit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pasien
                  </label>
                  <select
                    value={editFormData.pasien_id}
                    onChange={(e) => {
                      const pasien = pasienList.find((item) => item.id === e.target.value)
                      setEditFormData({
                        ...editFormData,
                        pasien_id: e.target.value,
                        nama_lengkap: pasien?.namaLengkap || '',
                        tanggal_lahir: pasien?.tanggalLahir?.slice(0, 10) || '',
                        jenis_kelamin: pasien?.jenisKelamin === 'perempuan' ? 'perempuan' : 'laki-laki',
                        nomor_telepon: pasien?.nomorTelepon || '',
                        alamat: pasien?.alamat || '',
                      })
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  >
                    {pasienList.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.nomorRekamMedis}] {p.namaLengkap}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama lengkap</label>
                    <input
                      value={editFormData.nama_lengkap}
                      onChange={(e) => setEditFormData({ ...editFormData, nama_lengkap: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal lahir</label>
                    <input
                      type="date"
                      value={editFormData.tanggal_lahir}
                      onChange={(e) => setEditFormData({ ...editFormData, tanggal_lahir: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis kelamin</label>
                    <select
                      value={editFormData.jenis_kelamin}
                      onChange={(e) => setEditFormData({ ...editFormData, jenis_kelamin: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                    >
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      value={editFormData.nomor_telepon}
                      onChange={(e) => setEditFormData({ ...editFormData, nomor_telepon: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat</label>
                  <textarea
                    value={editFormData.alamat}
                    onChange={(e) => setEditFormData({ ...editFormData, alamat: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Dokter tujuan
                  </label>
                  <select
                    value={editFormData.dokter_id}
                    onChange={(e) => setEditFormData({ ...editFormData, dokter_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  >
                    {dokterList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.namaLengkap} - {d.spesialisasi}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Waktu kunjungan
                  </label>
                  <input
                    type="datetime-local"
                    value={editFormData.waktu_kunjungan}
                    onChange={(e) => setEditFormData({ ...editFormData, waktu_kunjungan: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status antrean
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  >
                    <option value="menunggu">Menunggu</option>
                    <option value="sedang_diperiksa">Sedang diperiksa</option>
                    <option value="batal">Batal</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingKunjungan(null)}
                    className="min-h-11 px-4 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-11 px-5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Pendaftaran Kunjungan Baru Modern */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Pendaftaran Kunjungan Pasien</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Masukkan pasien ke dalam antrean poliklinik</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateVisit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Pasien Terdaftar *
                  </label>
                  <select
                    value={formData.pasien_id}
                    onChange={(e) => setFormData({ ...formData, pasien_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  >
                    {pasienList.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.nomorRekamMedis}] {p.namaLengkap} {p.nomorTelepon ? `• ${p.nomorTelepon}` : ''} ({p.jenisKelamin === 'laki-laki' || p.jenisKelamin === 'L' ? 'L' : 'P'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Dokter Tujuan *
                  </label>
                  <select
                    value={formData.dokter_id}
                    onChange={(e) => setFormData({ ...formData, dokter_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 bg-slate-50/80 focus:bg-white transition-all"
                  >
                    {dokterList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.namaLengkap} - {d.spesialisasi}
                      </option>
                    ))}
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
                    {submitting ? 'Menyimpan...' : 'Daftarkan Kunjungan'}
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
