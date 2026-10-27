'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import { FileText, Plus, Trash2, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Lock, ChevronDown, Search, MessageCircle } from 'lucide-react'
import { useRole } from '@/context/role-context'

interface PasienOption {
  id: string
  namaLengkap: string
  nomorRekamMedis: string
  nomorTelepon?: string | null
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

interface ObatOption {
  id: string
  kode_obat: string
  nama_obat: string
  bentuk_obat: string
  kekuatan_obat: string
  satuan: string
  stok_saat_ini: number
  stok_rendah: boolean
}

function labelObat(o: ObatOption) {
  return `${o.nama_obat} ${o.kekuatan_obat}`.trim()
}

function ObatPicker({
  katalog,
  value,
  onSelect,
  disabled,
  loading = false,
}: {
  katalog: ObatOption[]
  value: string
  onSelect: (o: ObatOption) => void
  disabled?: boolean
  loading?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const terpilih = katalog.find((o) => o.id === value)
  const q = query.toLowerCase()
  const hasil = katalog.filter(
    (o) =>
      o.nama_obat.toLowerCase().includes(q) ||
      o.kode_obat.toLowerCase().includes(q) ||
      o.bentuk_obat.toLowerCase().includes(q)
  )

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => !loading && setOpen(!open)}
        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-left flex items-center justify-between gap-2 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 disabled:bg-slate-100"
      >
        <span className={terpilih ? 'text-slate-900' : 'text-slate-400'}>
          {loading
            ? 'Memuat katalog obat Farmasi...'
            : terpilih
            ? `${labelObat(terpilih)} (${terpilih.bentuk_obat})`
            : 'Pilih obat dari katalog Farmasi...'}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {open && !loading && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-slate-100 relative">
              <Search className="absolute left-4.5 top-4.5 h-3.5 w-3.5 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
                placeholder="Cari nama, kode, atau bentuk obat..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500/25"
              />
            </div>
            <ul className="max-h-60 overflow-y-auto py-1">
              {hasil.length === 0 ? (
                <li className="px-4 py-3 text-xs text-slate-400">Obat tidak ditemukan</li>
              ) : (
                hasil.map((o) => {
                  const habis = o.stok_saat_ini <= 0
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        disabled={habis}
                        onClick={() => {
                          onSelect(o)
                          setOpen(false)
                          setQuery('')
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs flex items-center justify-between gap-3 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>
                          <span className="font-bold text-slate-900 block">{labelObat(o)}</span>
                          <span className="text-[11px] text-slate-500">
                            {o.kode_obat} &bull; {o.bentuk_obat}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            habis
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : o.stok_rendah
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {habis ? 'Habis' : `Stok ${o.stok_saat_ini} ${o.satuan}`}
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

function BuatResepBaruContent() {
  const searchParams = useSearchParams()
  const { role, user } = useRole()
  const isDoctor = role === 'dokter'

  const paramPasienId = searchParams.get('pasienId') || ''
  const paramDokterId = searchParams.get('dokterId') || ''
  const paramKunjunganId = searchParams.get('kunjunganId') || ''

  const [pasienList, setPasienList] = useState<PasienOption[]>([])
  const [dokterList, setDokterList] = useState<DokterOption[]>([])
  const [katalogObat, setKatalogObat] = useState<ObatOption[]>([])
  const [errorKatalog, setErrorKatalog] = useState<string | null>(null)
  const [pasienId, setPasienId] = useState(paramPasienId)
  const [dokterId, setDokterId] = useState(paramDokterId)
  const [items, setItems] = useState<ItemObatForm[]>([
    { obat_id: '', nama_obat_saat_resep: '', jumlah: 1, instruksi_penggunaan: '3 x 1 sesudah makan' },
  ])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sukses, setSukses] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadData() {
      try {
        const [resPasien, resDokter, resObat] = await Promise.all([
          fetch('/api/v1/pasien'),
          fetch('/api/v1/dokter'),
          fetch('/api/v1/obat'),
        ])
        const dataPasien = await resPasien.json()
        const dataDokter = await resDokter.json()
        const dataObat = await resObat.json()

        if (dataPasien.sukses) setPasienList(dataPasien.data)
        if (dataDokter.sukses) setDokterList(dataDokter.data)
        if (dataObat.sukses) setKatalogObat(dataObat.data)
        else setErrorKatalog(dataObat.pesan || 'Katalog obat Farmasi tidak tersedia')

        if (paramPasienId) {
          setPasienId(paramPasienId)
        } else if (dataPasien.data?.length > 0) {
          setPasienId(dataPasien.data[0].id)
        }

        const matchingDoctor = dataDokter.data?.find((d: DokterOption) => {
          if (user?.dokterId && d.id === user.dokterId) return true
          if (user?.namaLengkap && d.namaLengkap.toLowerCase().includes(user.namaLengkap.toLowerCase())) return true
          return false
        })

        if (paramDokterId) {
          setDokterId(paramDokterId)
        } else if (matchingDoctor) {
          setDokterId(matchingDoctor.id)
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
  }, [paramPasienId, paramDokterId, user?.dokterId, user?.namaLengkap])

  const handleTambahItem = () => {
    setItems((prev) => [
      ...prev,
      {
        obat_id: '',
        nama_obat_saat_resep: '',
        jumlah: 1,
        instruksi_penggunaan: '2 x 1 sehari sesudah makan',
      },
    ])
  }

  const handleHapusItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof ItemObatForm, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!pasienId || !dokterId) {
      setError('Pilih pasien dan dokter terlebih dahulu')
      return
    }

    if (items.some((i) => !i.obat_id)) {
      setError('Setiap baris obat wajib dipilih dari katalog Farmasi')
      return
    }

    const kurang = items.find((i) => {
      const o = katalogObat.find((k) => k.id === i.obat_id)
      return o && i.jumlah > o.stok_saat_ini
    })
    if (kurang) {
      setError(`Jumlah ${kurang.nama_obat_saat_resep} melebihi stok Farmasi`)
      return
    }

    startTransition(async () => {
      try {
        let kunjunganId = paramKunjunganId
        if (!kunjunganId) {
          const resKunjungan = await fetch('/api/v1/kunjungan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pasien_id: pasienId, dokter_id: dokterId }),
          })
          const dataKunjungan = await resKunjungan.json()
          if (!dataKunjungan.sukses) {
            setError('Gagal membuat relasi kunjungan')
            return
          }
          kunjunganId = dataKunjungan.data.id
        }

        const resResep = await fetch('/api/v1/resep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kunjungan_id: kunjunganId,
            pasien_id: pasienId,
            dokter_id: dokterId,
            item_obat: items,
          }),
        })

        const dataResep = await resResep.json()

        if (dataResep.sukses) {
          const pasienTerpilih = pasienList.find((pasien) => pasien.id === pasienId)
          if (pasienTerpilih?.nomorTelepon) {
            const nomor = pasienTerpilih.nomorTelepon.replace(/\D/g, '').replace(/^0/, '62')
            const daftarObat = items
              .map((item) => `- ${item.nama_obat_saat_resep}: ${item.jumlah} satuan, ${item.instruksi_penggunaan}`)
              .join('\n')
            setWhatsappUrl(
              `https://wa.me/${nomor}?text=${encodeURIComponent(
                [
                  `Halo ${pasienTerpilih.namaLengkap},`,
                  '',
                  'Resep obat Anda sudah diterbitkan.',
                  `Nomor rekam medis: ${pasienTerpilih.nomorRekamMedis}`,
                  '',
                  'Daftar obat:',
                  daftarObat,
                  '',
                  'Silakan tunjukkan pesan ini ke bagian Farmasi saat mengambil obat.',
                ].join('\n')
              )}`
            )
          } else {
            setWhatsappUrl(null)
          }
          if (dataResep.data?.statusPengiriman === 'terkirim') {
            setSukses(dataResep.pesan)
          } else {
            setError(dataResep.pesan)
          }
        } else {
          setError(dataResep.pesan)
        }
      } catch {
        setError('Terjadi kesalahan saat menerbitkan resep')
      }
    })
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Formulir Penerbitan Resep Medis Dokter" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
        <Link
          href="/resep"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Resep</span>
        </Link>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Terbitkan Resep Obat Multi-Item</h2>
            <p className="text-xs text-slate-500 mt-1">
              Resep yang disimpan atomik akan dapat langsung ditarik oleh sistem Farmasi melalui REST API.
            </p>
          </div>

          {!isDoctor && (
            <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
              <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Kewenangan Terbatas (SIMRS):</span> Hanya Dokter yang memiliki kewenangan menerbitkan resep obat medis.
                Saat ini Anda aktif sebagai peran <strong className="capitalize font-mono">[{role}]</strong>.
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{error}</span>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:bg-[#1da851] focus:outline-hidden focus:ring-2 focus:ring-[#128C7E]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Kirim resep via WhatsApp
                </a>
              )}
            </div>
          )}

          {sukses && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{sukses}</span>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white hover:bg-[#1da851] focus:outline-hidden focus:ring-2 focus:ring-[#128C7E]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Kirim resep via WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Pasien & Dokter Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pilih Pasien *</label>
              <select
                value={pasienId}
                onChange={(e) => setPasienId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
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
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Dokter Pemeriksa *</span>
                {isDoctor && user?.namaLengkap && (
                  <span className="text-[10px] text-sky-600 font-semibold lowercase">
                    (akun aktif: {user.namaLengkap})
                  </span>
                )}
              </label>
              <select
                value={dokterId}
                onChange={(e) => setDokterId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
                required
              >
                {dokterList.length === 0 ? (
                  <option value="">(Belum ada data dokter)</option>
                ) : (
                  dokterList.map((d) => {
                    const isCurrent = user?.dokterId === d.id || (user?.namaLengkap && d.namaLengkap.toLowerCase().includes(user.namaLengkap.toLowerCase()))
                    return (
                      <option key={d.id} value={d.id}>
                        {d.namaLengkap} - {d.spesialisasi} {isCurrent ? '★ (Akun Anda)' : ''}
                      </option>
                    )
                  })
                )}
              </select>
            </div>
          </div>

          {/* Dynamic Medicine Items */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daftar Obat yang Diresepkan ({items.length})
              </h3>
              <button
                type="button"
                onClick={handleTambahItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors cursor-pointer border border-sky-200/80"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Baris Obat</span>
              </button>
            </div>

            {errorKatalog && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center gap-2 text-amber-900 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{errorKatalog}. Pastikan aplikasi Farmasi (port 3001) berjalan.</span>
              </div>
            )}

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Item Obat #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleHapusItem(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Obat dari Katalog Farmasi *</label>
                      <ObatPicker
                        katalog={katalogObat}
                        value={item.obat_id}
                        disabled={!isDoctor}
                        loading={loading}
                        onSelect={(o) => {
                          handleItemChange(idx, 'obat_id', o.id)
                          handleItemChange(idx, 'nama_obat_saat_resep', labelObat(o))
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Jumlah Satuan *</label>
                      <input
                        type="number"
                        min={1}
                        value={item.jumlah}
                        onChange={(e) => handleItemChange(idx, 'jumlah', parseInt(e.target.value) || 1)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Petunjuk & Aturan Minum *</label>
                    <input
                      type="text"
                      value={item.instruksi_penggunaan}
                      onChange={(e) => handleItemChange(idx, 'instruksi_penggunaan', e.target.value)}
                      placeholder="Contoh: 3 x 1 tablet sesudah makan"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Tersimpan aman & terintegrasi ke Farmasi
            </span>
            <button
              type="submit"
              disabled={isPending || !isDoctor || loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menerbitkan Resep...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>Terbitkan Resep Medis</span>
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
    <Suspense fallback={<div className="p-16 text-center text-xs text-slate-400 font-medium">Memuat formulir resep...</div>}>
      <BuatResepBaruContent />
    </Suspense>
  )
}
