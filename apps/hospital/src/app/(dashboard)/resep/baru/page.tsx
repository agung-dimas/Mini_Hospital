'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import { FileText, Plus, Trash2, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Lock, Stethoscope } from 'lucide-react'
import { useRole } from '@/context/role-context'

interface PasienOption {
  id: string
  namaLengkap: string
  nomorRekamMedis: string
}

interface DokterOption {
  id: string
  namaLengkap: string
  spesialisasi: string
}

interface ItemObatForm {
  obat_id: string
  nama_obat_saat_resep: string
  jumlah: number
  instruksi_penggunaan: string
}

function BuatResepBaruContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { role } = useRole()
  const isDoctor = role === 'dokter'

  const paramPasienId = searchParams.get('pasienId') || ''
  const paramDokterId = searchParams.get('dokterId') || ''
  const paramKunjunganId = searchParams.get('kunjunganId') || ''

  const [pasienList, setPasienList] = useState<PasienOption[]>([])
  const [dokterList, setDokterList] = useState<DokterOption[]>([])
  const [pasienId, setPasienId] = useState(paramPasienId)
  const [dokterId, setDokterId] = useState(paramDokterId)
  const [items, setItems] = useState<ItemObatForm[]>([
    {
      obat_id: 'a0000000-0000-0000-0000-000000000001',
      nama_obat_saat_resep: 'Paracetamol 500 mg',
      jumlah: 10,
      instruksi_penggunaan: '3 x 1 tablet sesudah makan bila demam',
    },
  ])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sukses, setSukses] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadData() {
      try {
        const [resPasien, resDokter] = await Promise.all([
          fetch('/api/v1/pasien'),
          fetch('/api/v1/dokter'),
        ])
        const dataPasien = await resPasien.json()
        const dataDokter = await resDokter.json()

        if (dataPasien.sukses) setPasienList(dataPasien.data)
        if (dataDokter.sukses) setDokterList(dataDokter.data)

        if (paramPasienId) {
          setPasienId(paramPasienId)
        } else if (dataPasien.data?.length > 0) {
          setPasienId(dataPasien.data[0].id)
        }

        if (paramDokterId) {
          setDokterId(paramDokterId)
        } else if (dataDokter.data?.length > 0) {
          setDokterId(dataDokter.data[0].id)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [paramPasienId, paramDokterId])

  const handleTambahItem = () => {
    setItems((prev) => [
      ...prev,
      {
        obat_id: crypto.randomUUID(),
        nama_obat_saat_resep: '',
        jumlah: 1,
        instruksi_penggunaan: '',
      },
    ])
  }

  const handleHapusItem = (index: number) => {
    if (items.length === 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof ItemObatForm, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!pasienId || !dokterId) {
      setError('Pilih pasien dan dokter terlebih dahulu')
      return
    }

    startTransition(async () => {
      try {
        // Buat atau hubungkan kunjungan dummy untuk resep jika belum ada
        const resKunjungan = await fetch('/api/v1/kunjungan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pasien_id: pasienId,
            dokter_id: dokterId,
          }),
        })
        const dataKunjungan = await resKunjungan.json()

        if (!dataKunjungan.sukses) {
          setError('Gagal membuat relasi kunjungan')
          return
        }

        const resResep = await fetch('/api/v1/resep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kunjungan_id: dataKunjungan.data.id,
            pasien_id: pasienId,
            dokter_id: dokterId,
            item_obat: items,
          }),
        })

        const dataResep = await resResep.json()

        if (dataResep.sukses) {
          setSukses('Resep berhasil diterbitkan oleh dokter dan siap diproses Farmasi!')
          setTimeout(() => {
            router.push('/resep')
          }, 1500)
        } else {
          setError(dataResep.pesan)
        }
      } catch (err) {
        setError('Terjadi kesalahan saat menerbitkan resep')
      }
    })
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Formulir Penerbitan Resep Medis Dokter" />

      <main className="flex-1 p-8 space-y-6 max-w-4xl">
        <Link
          href="/resep"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Resep
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Terbitkan Resep Obat Multi-Item</h2>
            <p className="text-xs text-slate-500 mt-1">
              Resep yang disimpan atomik akan dapat langsung ditarik oleh sistem Farmasi melalui REST API.
            </p>
          </div>

          {!isDoctor && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
              <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kewenangan Terbatas (PRD 5.3):</span> Hanya Dokter yang memiliki kewenangan menerbitkan resep obat medis.
                Saat ini Anda aktif sebagai peran <strong className="capitalize font-mono">[{role}]</strong>. Silakan beralih ke peran Dokter pada pemilih peran di pojok kanan atas untuk mengaktifkan tombol terbitkan resep.
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sukses && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{sukses}</span>
            </div>
          )}

          {/* Pasien & Dokter Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Pasien</label>
              <select
                value={pasienId}
                onChange={(e) => setPasienId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                {pasienList.length === 0 ? (
                  <option value="">(Belum ada data pasien)</option>
                ) : (
                  pasienList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.namaLengkap} ({p.nomorRekamMedis})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dokter Pemeriksa</label>
              <select
                value={dokterId}
                onChange={(e) => setDokterId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              >
                {dokterList.length === 0 ? (
                  <option value="">(Belum ada data dokter)</option>
                ) : (
                  dokterList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.namaLengkap} - {d.spesialisasi}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Dynamic Medicine Items */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Daftar Obat yang Diresepkan ({items.length})
              </h3>
              <button
                type="button"
                onClick={handleTambahItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Baris Obat
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Obat #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleHapusItem(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-medium text-slate-600">Nama Obat</label>
                      <input
                        type="text"
                        value={item.nama_obat_saat_resep}
                        onChange={(e) => handleItemChange(idx, 'nama_obat_saat_resep', e.target.value)}
                        placeholder="Contoh: Paracetamol 500 mg"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-600">Jumlah Satuan</label>
                      <input
                        type="number"
                        min={1}
                        value={item.jumlah}
                        onChange={(e) => handleItemChange(idx, 'jumlah', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Petunjuk / Aturan Minum</label>
                    <input
                      type="text"
                      value={item.instruksi_penggunaan}
                      onChange={(e) => handleItemChange(idx, 'instruksi_penggunaan', e.target.value)}
                      placeholder="Contoh: 3 x 1 tablet sesudah makan"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Disimpan atomik via transaksi Prisma di Supabase A
            </span>
            <button
              type="submit"
              disabled={isPending || !isDoctor}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menerbitkan Resep...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Terbitkan Resep Medis
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function BuatResepBaruPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Memuat formulir resep...</div>}>
      <BuatResepBaruContent />
    </Suspense>
  )
}
