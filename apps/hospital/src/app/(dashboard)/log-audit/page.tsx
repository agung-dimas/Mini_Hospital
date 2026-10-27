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
    } catch {
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
    <div className="flex-1 flex flex-col">
      <HospitalHeader title="Monitoring Integrasi & Log Audit Sistem" />

      <main className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner Hak Akses */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 mt-0.5 shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">Hak Akses Modul Audit (SIMRS EAI)</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                  Khusus Administrator
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Memantau log aktivitas audit sistem, status pengiriman idempoten ke Farmasi, dan keandalan data dua arah Supabase.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={fetchLogs}
              className="px-4 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan Log</span>
            </button>
            <button
              type="button"
              onClick={checkPharmacyHealth}
              disabled={pingStatus === 'checking'}
              className="px-4.5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Server className="h-3.5 w-3.5" />
              <span>
                {pingStatus === 'checking'
                  ? 'Memeriksa...'
                  : pingStatus === 'online'
                  ? 'Pharmacy Online (3001)'
                  : pingStatus === 'offline'
                  ? 'Cek Ulang Pharmacy'
                  : 'Uji Koneksi Pharmacy'}
              </span>
            </button>
          </div>
        </div>

        {/* Metrik KPI Status Integrasi & Audit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Peristiwa Integrasi
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">{peristiwa.length}</p>
              <span className="text-xs text-sky-600 font-semibold">Supabase A ➔ B</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tingkat Keberhasilan EAI
              </span>
              <p className="text-3xl font-black text-emerald-600 mt-1">100%</p>
              <span className="text-xs text-emerald-600 font-semibold">Status Terkirim Sukses</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Log Aktivitas
              </span>
              <p className="text-3xl font-black text-slate-900 mt-1">{audit.length}</p>
              <span className="text-xs text-purple-600 font-semibold">Audit Trail Tercatat</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Dua Basis Data Supabase
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">Live Sinkron</p>
              <span className="text-xs text-emerald-600 font-semibold">Port 3000 & 3001</span>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Tab Selector & Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('integrasi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'integrasi'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Peristiwa Integrasi EAI ({peristiwa.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Log Audit Keamanan ({audit.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari log atau aksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Konten Tab 1: Peristiwa Integrasi EAI */}
        {activeTab === 'integrasi' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                  Daftar Peristiwa Integrasi EAI (Supabase A ➔ Supabase B)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pencatatan event pengiriman resep, permintaan stok, dan pembaruan status idempoten
                </p>
              </div>
              <span className="text-xs font-bold text-sky-700 px-3 py-1 bg-sky-50 border border-sky-200/80 rounded-full">
                Total: {filteredPeristiwa.length} Event
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 font-medium">Memuat log integrasi...</div>
            ) : filteredPeristiwa.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-400 font-medium">
                Tidak ada peristiwa integrasi yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-3.5">Jenis Peristiwa</th>
                      <th className="px-6 py-3.5">Kunci Idempotensi</th>
                      <th className="px-6 py-3.5">Referensi Data</th>
                      <th className="px-6 py-3.5">Status Pengiriman</th>
                      <th className="px-6 py-3.5">Percobaan</th>
                      <th className="px-6 py-3.5">Waktu Kejadian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredPeristiwa.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-mono text-[11px] border border-sky-100 font-semibold">
                            {p.jenisPeristiwa}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                          {p.kunciIdempotensi || '-'}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                          {p.referensiData || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit border ${
                              p.statusPengiriman === 'terkirim'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                : p.statusPengiriman === 'gagal'
                                ? 'bg-rose-50 text-rose-800 border-rose-200/80'
                                : 'bg-amber-50 text-amber-800 border-amber-200/80'
                            }`}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {p.statusPengiriman}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{p.jumlahPercobaan}x</td>
                        <td className="px-6 py-4 text-slate-400 font-medium">
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
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">
                  Log Audit Aktivitas & Rekam Jejak Sistem (`log_audit`)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pencatatan aksi klinis dan administratif untuk kepatuhan tata kelola rekam medis
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-full">
                Total: {filteredAudit.length} Log
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-xs text-slate-400 font-medium">Memuat log audit...</div>
            ) : filteredAudit.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-400 font-medium">
                Tidak ada log audit yang cocok.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-3.5">Aksi yang Dilakukan</th>
                      <th className="px-6 py-3.5">Kategori Data</th>
                      <th className="px-6 py-3.5">ID Pengguna Pelaksana</th>
                      <th className="px-6 py-3.5">Referensi Data Objek</th>
                      <th className="px-6 py-3.5">Waktu Eksekusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredAudit.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono text-[11px] border border-purple-100 font-semibold">
                            {a.aksi}
                          </span>
                        </td>
                        <td className="px-6 py-4 capitalize font-bold text-slate-700">
                          {a.jenisData}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                          {a.penggunaId || 'Sistem Otomatis'}
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                          {a.referensiData || '-'}
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-medium">
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
    </div>
  )
}
