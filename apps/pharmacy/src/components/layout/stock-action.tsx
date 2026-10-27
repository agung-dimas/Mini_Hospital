'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'

export function StockAction({ obatId, namaObat, satuan }: { obatId: string; namaObat: string; satuan: string }) {
  const [isManager, setIsManager] = useState(false)
  const [open, setOpen] = useState(false)
  const [jumlah, setJumlah] = useState('')
  const [alasan, setAlasan] = useState('Penerimaan stok gudang')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(jumlah)
    if (!Number.isInteger(amount) || amount <= 0) {
      setMessage('Jumlah stok harus berupa bilangan bulat lebih dari 0.')
      return
    }

    try {
      setSaving(true)
      setMessage(null)
      const response = await fetch('/api/v1/pergerakan-stok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          obat_id: obatId,
          jenis_pergerakan: 'penerimaan',
          perubahan_jumlah: amount,
          alasan: alasan.trim() || 'Penerimaan stok gudang',
        }),
      })
      const json = await response.json()
      if (!json.sukses) {
        setMessage(json.pesan || 'Gagal menambahkan stok.')
        return
      }
      setMessage(`Stok ${namaObat} bertambah ${amount} ${satuan}. Segarkan halaman untuk melihat jumlah terbaru.`)
      setJumlah('')
    } catch {
      setMessage('Terjadi kesalahan jaringan saat menambahkan stok.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
      >
        <Plus className="h-3.5 w-3.5" />
        Tambah Stok
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Tambah Stok Obat</h2>
                <p className="mt-1 text-xs text-slate-500">{namaObat}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500" aria-label="Tutup dialog">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                Jumlah ({satuan})
                <input type="number" min="1" step="1" required value={jumlah} onChange={(event) => setJumlah(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Alasan
                <input value={alasan} onChange={(event) => setAlasan(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20" />
              </label>
              {message && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700">{message}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Stok'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
