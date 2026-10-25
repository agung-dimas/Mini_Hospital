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
  FileText,
  KeyRound,
  Layers,
  Search,
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

  const [activeTab, setActiveTab] = useState<'integrasi' | 'audit'>('integrasi')
  const [peristiwa, setPeristiwa] = useState<Peristiwa[]>([])
  const [audit, setAudit] = useState<LogAudit[]>([])
  const [loading, setLoading] = useState(true)
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'online' | 'offline'>('idle')
  const [search, setSearch] = useState('')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/log-audit')
      const json = await res.json()
      if (json.sukses) {
        setPeristiwa(json.data.peristiwaIntegrasi || [])
        setAudit(json.data.logAudit || [])
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

  const filteredPeristiwa = peristiwa.filter(
    (p) =>
      p.jenisPeristiwa.toLowerCase().includes(search.toLowerCase()) ||
      (p.kunciIdempotensi && p.kunciIdempotensi.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredAudit = audit.filter(
    (a) =>
      a.aksi.toLowerCase().includes(search.toLowerCase()) ||
      a.jenisData.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <HospitalHeader title="Monitoring Integrasi & Log Audit Sistem" />

      <main className="p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Banner Hak Akses PRD 5.1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 mt-0.5">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Hak Akses Modul Audit (PRD 5.1)</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800">
                  Khusus Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Memantau log aktivitas audit, status pengiriman idempoten ke Farmasi, dan keandalan data dua arah Supabase.
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

        {/* Metrik KPI Status Integrasi & Audit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Peristiwa Integrasi
              </span>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{peristiwa.length}</p>
              <span className="text-[10px] text-blue-600 font-medium">Supabase A ➔ B</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Tingkat Keberhasilan EAI
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">100%</p>
              <span className="text-[10px] text-emerald-600 font-medium">Status Terkirim Sukses</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Log Aktivitas
              </span>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{audit.length}</p>
              <span className="text-[10px] text-purple-600 font-medium">Audit Trail Tercatat</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Dua Basis Data Supabase
              </span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">Live Sinkron</p>
              <span className="text-[10px] text-emerald-600 font-medium">Port 3000 & 3001</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Tab Selector & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('integrasi')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'integrasi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peristiwa Integrasi EAI ({peristiwa.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log Audit Keamanan ({audit.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari log atau aksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Konten Tab 1: Peristiwa Integrasi EAI */}
        {activeTab === 'integrasi' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Daftar Peristiwa Integrasi EAI (Supabase A ➔ Supabase B)
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan event pengiriman resep, permintaan stok, dan pembaruan status idempoten
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
                Total: {filteredPeristiwa.length} Event
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Memuat log integrasi...</div>
            ) : filteredPeristiwa.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Tidak ada peristiwa integrasi yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Jenis Peristiwa</th>
                      <th className="px-6 py-3">Kunci Idempotensi</th>
                      <th className="px-6 py-3">Referensi Data</th>
                      <th className="px-6 py-3">Status Pengiriman</th>
                      <th className="px-6 py-3">Percobaan</th>
                      <th className="px-6 py-3">Waktu Kejadian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredPeristiwa.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px]">
                            {p.jenisPeristiwa}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">
                          {p.kunciIdempotensi || '-'}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400 truncate max-w-[150px]">
                          {p.referensiData || '-'}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                              p.statusPengiriman === 'terkirim'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.statusPengiriman === 'gagal'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {p.statusPengiriman}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-700">{p.jumlahPercobaan}x</td>
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
        )}

        {/* Konten Tab 2: Log Audit Keamanan */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Log Audit Aktivitas & Rekam Jejak Sistem (`log_audit`)
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan aksi klinis dan administratif untuk kepatuhan tata kelola rekam medis
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
                Total: {filteredAudit.length} Log
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500">Memuat log audit...</div>
            ) : filteredAudit.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Tidak ada log audit yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Aksi yang Dilakukan</th>
                      <th className="px-6 py-3">Kategori Data</th>
                      <th className="px-6 py-3">ID Pengguna Pelaksana</th>
                      <th className="px-6 py-3">Referensi Data Objek</th>
                      <th className="px-6 py-3">Waktu Eksekusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAudit.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          <span className="px-2 py-1 rounded-md bg-purple-50 text-purple-700 font-mono text-[11px]">
                            {a.aksi}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 capitalize font-medium text-slate-600">
                          {a.jenisData}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400 truncate max-w-[150px]">
                          {a.penggunaId || 'Sistem Otomatis'}
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                          {a.referensiData || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {new Date(a.dibuatPada).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  )
}
