'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'

const initialForm = {
  kode_obat: '',
  nama_obat: '',
  bentuk_obat: '',
  kekuatan_obat: '',
  satuan: '',
  stok_minimum: '10',
  stok_awal: '0',
}

function generateKodeObat(namaObat: string, kekuatanObat: string) {
  const kodeNama = namaObat
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase()
  const kodeKekuatan = kekuatanObat.match(/\d+(?:[.,]\d+)?/)?.[0]?.replace(/[.,]/g, '') || '001'

  return kodeNama ? `OBT-${kodeNama}-${kodeKekuatan}` : ''
}

export function MedicineForm() {
  const [isManager, setIsManager] = useState(false)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('mini_pharmacy_user')
    if (!storedUser) return
    try {
      setIsManager(JSON.parse(storedUser).peran === 'pengelola_farmasi')
    } catch {
      localStorage.removeItem('mini_pharmacy_user')
    }
  }, [])

  if (!isManager) return null

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === 'nama_obat' || field === 'kekuatan_obat') {
        next.kode_obat = generateKodeObat(
          field === 'nama_obat' ? value : current.nama_obat,
          field === 'kekuatan_obat' ? value : current.kekuatan_obat
        )
      }
      return next
    })
  }

  const close = () => {
    if (saving) return
    setOpen(false)
    setMessage(null)
    setForm(initialForm)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const stokMinimum = Number(form.stok_minimum)
    const stokAwal = Number(form.stok_awal)

    if (!Number.isInteger(stokMinimum) || stokMinimum < 0 || !Number.isInteger(stokAwal) || stokAwal < 0) {
      setMessage({ text: 'Stok minimum dan stok awal harus berupa angka bulat nol atau lebih.', type: 'error' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)
      const response = await fetch('/api/v1/obat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode_obat: form.kode_obat.trim(),
          nama_obat: form.nama_obat.trim(),
          bentuk_obat: form.bentuk_obat.trim(),
          kekuatan_obat: form.kekuatan_obat.trim(),
          satuan: form.satuan.trim(),
          stok_minimum: stokMinimum,
        }),
      })
      const json = await response.json()

      if (!json.sukses) {
        setMessage({ text: json.pesan || 'Gagal menambahkan obat.', type: 'error' })
        return
      }

      if (stokAwal > 0) {
        const stockResponse = await fetch('/api/v1/pergerakan-stok', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            obat_id: json.data.id,
            jenis_pergerakan: 'penerimaan',
            perubahan_jumlah: stokAwal,
            alasan: 'Stok awal obat baru',
          }),
        })
        const stockJson = await stockResponse.json()
        if (!stockJson.sukses) {
          setMessage({
            text: 'Obat berhasil dibuat, tetapi stok awal gagal dicatat. Tambahkan stok dari tabel.',
            type: 'error',
          })
          return
        }
      }

      setMessage({ text: 'Jenis obat baru berhasil ditambahkan.', type: 'success' })
      setTimeout(() => window.location.reload(), 700)
    } catch {
      setMessage({ text: 'Terjadi kesalahan jaringan saat menambahkan obat.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
      >
        <Plus className="h-4 w-4" />
        Tambah Obat Baru
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Tambah Jenis Obat</h2>
                <p className="mt-1 text-xs text-slate-500">Data ini akan masuk ke katalog master obat Pharmacy.</p>
              </div>
              <button type="button" onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500" aria-label="Tutup form obat">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">
                  Kode obat (otomatis)
                  <input required readOnly value={form.kode_obat} placeholder="Isi nama dan kekuatan obat" className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-mono uppercase text-slate-600 focus:outline-hidden" />
                  <span className="mt-1 block font-normal text-slate-500">Dibuat dari nama dan kekuatan obat.</span>
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Nama obat
                  <input required value={form.nama_obat} onChange={(event) => updateField('nama_obat', event.target.value)} placeholder="Paracetamol" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Bentuk obat
                  <input required value={form.bentuk_obat} onChange={(event) => updateField('bentuk_obat', event.target.value)} placeholder="Tablet / Kapsul / Sirup" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Kekuatan obat
                  <input required value={form.kekuatan_obat} onChange={(event) => updateField('kekuatan_obat', event.target.value)} placeholder="500 mg" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Satuan
                  <input required value={form.satuan} onChange={(event) => updateField('satuan', event.target.value)} placeholder="Tablet / Strip / Botol" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Batas stok minimum
                  <input type="number" min="0" step="1" required value={form.stok_minimum} onChange={(event) => updateField('stok_minimum', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
                </label>
              </div>

              <label className="block text-xs font-semibold text-slate-700">
                Stok awal (opsional)
                <input type="number" min="0" step="1" required value={form.stok_awal} onChange={(event) => updateField('stok_awal', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
                <span className="mt-1 block font-normal text-slate-500">Jika diisi, stok dicatat sebagai penerimaan stok awal.</span>
              </label>

              {message && <p className={`rounded-xl p-3 text-xs ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{message.text}</p>}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={close} className="min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Obat'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
