'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PharmacyHeader } from '@/components/layout/header'
import { PackageCheck, AlertTriangle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ItemResep {
  id: string
  obat_id: string
  nama_obat: string
  jumlah_diminta: number
  stok_tersedia: number
  mencukupi: boolean
}

interface PesananDetail {
  id: string
  resep_rumah_sakit_id: string
  status: string
  diterima_pada: string
  items: ItemResep[]
}

function PenyerahanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pesananId = searchParams.get('pesanan_id')

  const [pesanan, setPesanan] = useState<PesananDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suksesPesan, setSuksesPesan] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!pesananId) {
      setLoading(false)
      return
    }

    async function loadDetail() {
      try {
        setLoading(true)
        const res = await fetch(`/api/v1/pesanan-resep/${pesananId}`)
        const data = await res.json()
        if (data.sukses) {
          setPesanan(data.data)
        } else {
          setError(data.pesan)
        }
      } catch (err) {
        setError('Gagal memuat data pesanan resep')
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [pesananId])

  const handleProsesPenyerahan = async () => {
    if (!pesanan) return
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/v1/pesanan-resep/${pesanan.id}/penyerahan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': crypto.randomUUID(),
          },
          body: JSON.stringify({}),
        })

        const result = await res.json()
        if (result.sukses) {
          setSuksesPesan('Obat berhasil diserahkan! Stok fisik otomatis dipotong dan status disinkronkan ke RS.')
          setTimeout(() => {
            router.push('/pesanan-resep')
          }, 2000)
        } else {
          setError(result.pesan)
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memproses penyerahan obat')
      }
    })
  }

  const semuaCukup = pesanan?.items.every((i) => i.mencukupi) ?? false

  return (
    <div className="flex-1 flex flex-col">
      <PharmacyHeader title="Pemrosesan Penyerahan Obat ke Pasien" />

      <main className="flex-1 p-8 space-y-6 max-w-4xl">
        <Link
          href="/pesanan-resep"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Antrean Resep
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-600" />
            Memuat verifikasi data resep...
          </div>
        ) : !pesananId || !pesanan ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <PackageCheck className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm text-slate-600 font-medium">
              Silakan pilih pesanan resep dari halaman antrean untuk melakukan penyerahan obat.
            </p>
            <Link
              href="/pesanan-resep"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              Buka Antrean Resep
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 font-mono">Pesanan ID: {pesanan.id}</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Resep Rumah Sakit: <span className="font-mono text-emerald-700">{pesanan.resep_rumah_sakit_id}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Diterima sistem pada: {new Date(pesanan.diterima_pada).toLocaleString('id-ID')}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold border capitalize bg-emerald-50 text-emerald-800 border-emerald-200">
                {pesanan.status}
              </span>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {suksesPesan && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{suksesPesan}</span>
              </div>
            )}

            {/* Checklist Item Obat */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Verifikasi Ketersediaan Stok Fisik
              </h3>
              <div className="space-y-2">
                {pesanan.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/50"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{item.nama_obat}</p>
                      <p className="text-xs text-slate-500">
                        Permintaan resep: <span className="font-semibold text-slate-800">{item.jumlah_diminta}</span>
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-xs text-slate-500 block">
                        Stok di rak: <span className="font-bold text-slate-900">{item.stok_tersedia}</span>
                      </span>
                      {item.mencukupi ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          Mencukupi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Stok Kurang
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispense Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Pemotongan stok berjalan atomik (Prisma Transaction) dan idempoten.
              </p>
              <button
                type="button"
                disabled={!semuaCukup || isPending || pesanan.status === 'diserahkan'}
                onClick={handleProsesPenyerahan}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-4 w-4" />
                    Serahkan Obat & Sinkronkan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function PenyerahanPage() {
  return (
    <Suspense fallback={<div className="p-8">Memuat antarmuka penyerahan obat...</div>}>
      <PenyerahanContent />
    </Suspense>
  )
}
