'use client'

import React, { useState, useEffect } from 'react'
import { HospitalHeader } from '@/components/layout/header'
import {
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock,
  ArrowRight,
  Database,
} from 'lucide-react'
import { useRole } from '@/context/role-context'

interface Peristiwa {
  id: string
  jenisPeristiwa: string
  referensiData: string | null
  kunciIdempotensi: string | null
  statusPengiriman: string
  jumlahPercobaan: number
  kesalahanTerakhir: string | null
  dibuatPada: string
}

interface LogAudit {
  id: string
  penggunaId: string | null
  aksi: string
  jenisData: string
  referensiData: string | null
  dibuatPada: string
}

export default function LogAuditPage() {
  const { role } = useRole()
  const isAdministrator = role === 'administrator'

  const [peristiwa, setPeristiwa] = useState<Peristiwa[]>([])
  const [audit, setAudit] = useState<LogAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/log-audit')
      const json = await res.json()
      if (json.sukses) {
        setPeristiwa(json.data.peristiwaIntegrasi)
        setAudit(json.data.logAudit)
      }
    } catch (err) {
      console.error('Error load audit logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkPharmacyHealth = async () => {
    try {
      setPingStatus('checking')
      const res = await fetch('http://localhost:3001/api/v1/obat', {
        headers: { 'Accept': 'application/json' },
      })
      if (res.ok) {
        setPingStatus('online')
      } else {
        setPingStatus('offline')
      }
    } catch (err) {
      setPingStatus('offline')
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return (
    <>
      <HospitalHeader title="Monitoring Integrasi & Log Audit (Administrator)" />

      <main className="p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Banner Hak Akses PRD 5.1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 mt-0.5">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Hak Akses Administrator (PRD 5.1)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800">
                  Audit & Integrasi EAI
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Administrator memantau kesehatan integrasi dua arah antara Hospital (Supabase A) dan Pharmacy (Supabase B).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLogs}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Segarkan Log
            </button>
            <button
              type="button"
              onClick={checkPharmacyHealth}
              disabled={pingStatus === 'checking'}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Server className="h-3.5 w-3.5" />
              {pingStatus === 'checking'
                ? 'Memeriksa...'
                : pingStatus === 'online'
                ? 'Pharmacy Online (3001)'
                : pingStatus === 'offline'
                ? 'Cek Ulang Pharmacy'
                : 'Uji Koneksi Pharmacy'}
            </button>
          </div>
        </div>

        {/* Status Hubungan Dua Database Supabase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Database className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Supabase A (Hospital)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Terhubung Live
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Region: ap-south-1 • Port 3000</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Database className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Supabase B (Pharmacy)</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Terhubung Live
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Region: ap-northeast-2 • Port 3001</p>
            </div>
          </div>
        </div>

        {/* Tabel Peristiwa Integrasi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Peristiwa Integrasi EAI (Supabase A ➔ Supabase B)</h3>
              <p className="text-xs text-slate-500">Pelacakan pengiriman event resep diterbitkan dan status sinkronisasi</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
              {peristiwa.length} Peristiwa
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Memuat log integrasi...</div>
          ) : peristiwa.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              Belum ada peristiwa integrasi yang tercatat. Saat dokter menerbitkan resep baru, event pengiriman akan muncul di sini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-6 py-3">Jenis Peristiwa</th>
                    <th className="px-6 py-3">Kunci Idempotensi</th>
                    <th className="px-6 py-3">Status Pengiriman</th>
                    <th className="px-6 py-3">Percobaan</th>
                    <th className="px-6 py-3">Waktu Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {peristiwa.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        {p.jenisPeristiwa}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">
                        {p.kunciIdempotensi || '-'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.statusPengiriman === 'terkirim'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.statusPengiriman === 'gagal'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.statusPengiriman}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">{p.jumlahPercobaan}x</td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {new Date(p.dibuatPada).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
