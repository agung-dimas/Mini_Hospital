'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { HospitalHeader } from '@/components/layout/header'
import { FileText, Plus, Clock, CheckCircle2, AlertCircle, Stethoscope, Users, Pill } from 'lucide-react'
import { useRole } from '@/context/role-context'

interface ResepItem {
  id: string
  status: string
  diterbitkanPada: string | null
  pasien: { namaLengkap: string; nomorRekamMedis: string }
  dokter: { id: string; namaLengkap: string; spesialisasi: string }
  detailResep: Array<{
    id: string
    namaObatSaatResep: string
    jumlah: number
    instruksiPenggunaan: string
  }>
}

export default function ResepPage() {
  const { role, user } = useRole()
  const isDoctor = role === 'dokter'

  const [daftarResep, setDaftarResep] = useState<ResepItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResep = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/v1/resep')
      const json = await res.json()
      if (json.sukses) {
        setDaftarResep(json.data)
      } else {
        setError(json.pesan || 'Gagal memuat daftar resep dari server')
      }
    } catch (err) {
      console.error('Error load resep:', err)
      setError(err instanceof Error ? err.message : 'Gagal menghubungi server resep')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResep()
  }, [])

  const isMyPrescription = (r: ResepItem) => {
    if (user?.dokterId && r.dokter.id === user.dokterId) return true
    if (user?.namaLengkap && r.dokter.namaLengkap.toLowerCase().includes(user.namaLengkap.toLowerCase())) return true
    return false
  }

  // Dokter hanya melihat resep yang diterbitkan oleh dirinya sendiri (PRD 5.3)
  const displayedResep = isDoctor ? daftarResep.filter(isMyPrescription) : daftarResep

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'diterbitkan':
        return 'bg-amber-50 text-amber-800 border-amber-200/80'
      case 'diterima':
        return 'bg-sky-50 text-sky-800 border-sky-200/80'
      case 'diproses':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200/80'
      case 'diserahkan':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
      case 'ditolak':
        return 'bg-rose-50 text-rose-800 border-rose-200/80'
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200/80'
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Manajemen Resep & Preskripsi Digital" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {isDoctor ? `Daftar Resep Medis: ${user?.namaLengkap || 'Dokter'}` : 'Daftar Seluruh Resep Medis RS'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isDoctor
                ? 'Resep medis yang Anda terbitkan dan pelacakan status penyerahan obat oleh Farmasi.'
                : 'Pelacakan status resep medis dari penerbitan hingga penyerahan obat oleh Farmasi.'}
            </p>
          </div>
          {isDoctor && (
            <Link
              href="/resep/baru"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Terbitkan Resep Baru</span>
            </Link>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
            <button
              onClick={fetchResep}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 font-medium">Memuat resep...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedResep.length === 0 ? (
              <div className="col-span-2 bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-3 shadow-xs">
                <div className="h-13 w-13 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {isDoctor
                      ? `Belum Ada Resep yang Diterbitkan oleh ${user?.namaLengkap || 'Anda'}`
                      : 'Belum Ada Resep Medis'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    {isDoctor
                      ? 'Anda belum menerbitkan resep obat untuk pasien. Anda dapat menerbitkan resep dari antrean kunjungan pasien Anda.'
                      : 'Belum ada resep medis yang tercatat di sistem.'}
                  </p>
                </div>
              </div>
            ) : (
              displayedResep.map((r) => {
                const isMine = isMyPrescription(r)
                return (
                  <div
                    key={r.id}
                    className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-xs space-y-4 transition-all hover:shadow-md ${
                      isMine ? 'border-sky-200/90' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 block font-medium">
                            ID: {r.id.slice(0, 8)}...
                          </span>
                          {isDoctor &&
                            (isMine ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                                Resep Anda
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                                Dokter: {r.dokter.namaLengkap}
                              </span>
                            ))}
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 mt-1">
                          {r.pasien.namaLengkap}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          <span className="font-mono text-sky-700 font-semibold">{r.pasien.nomorRekamMedis}</span> &bull; dr. {r.dokter.namaLengkap}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${getBadgeStyle(
                          r.status
                        )}`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Daftar Obat ({r.detailResep.length} item)
                      </span>
                      <ul className="space-y-2">
                        {r.detailResep.map((item) => (
                          <li key={item.id} className="bg-slate-50/80 p-3 rounded-2xl text-xs space-y-0.5 border border-slate-100">
                            <div className="flex justify-between font-bold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <Pill className="h-3.5 w-3.5 text-teal-600" />
                                {item.namaObatSaatResep}
                              </span>
                              <span className="text-sky-700 font-mono text-[11px] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 font-bold">
                                {item.jumlah} satuan
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px] italic pl-5">
                              {item.instruksiPenggunaan}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-slate-100">
                      <span>
                        Diterbitkan:{' '}
                        {r.diterbitkanPada
                          ? new Date(r.diterbitkanPada).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}{' '}
                        WIB
                      </span>
                      <span className="font-mono text-sky-600 font-bold text-[10px]">REST API v1</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}
