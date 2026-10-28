import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Ship, 
  Truck, 
  Layers, 
  Clock, 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Grid3X3, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink
} from 'lucide-react';
import { dbService } from '../../services/db.ts';
import { authService } from '../../services/auth.ts';
import { ActiveTab } from '../layout/Sidebar.tsx';
import { Container, Vessel, YardBlock, GateTransaction, StevedoringTransaction, Invoice } from '../../types/index.ts';

interface DashboardOverviewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenDbModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate, onOpenDbModal }) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [gateTransactions, setGateTransactions] = useState<GateTransaction[]>([]);
  const [stevedoringTx, setStevedoringTx] = useState<StevedoringTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setContainers(dbService.getContainers());
    setVessels(dbService.getVessels());
    setYardBlocks(dbService.getYardBlocks());
    setGateTransactions(dbService.getGateTransactions());
    setStevedoringTx(dbService.getStevedoringTransactions());
    setInvoices(dbService.getInvoices());
  }, []);

  const totalInYard = containers.filter(c => c.operationalStatus === 'IN_YARD' || c.operationalStatus === 'DISCHARGED' || c.operationalStatus === 'STAGED').length;
  const berthedVessels = vessels.filter(v => v.status === 'BERTHED');
  const totalGateToday = gateTransactions.length;
  
  const totalCapacity = yardBlocks.reduce((acc, b) => acc + b.totalCapacityTEU, 0);
  const totalOccupancy = yardBlocks.reduce((acc, b) => acc + b.currentOccupancyTEU, 0);
  const yorPercentage = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  const user = authService.getCurrentUser();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-800/40">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10 pointer-events-none">
          <Ship className="w-80 h-80" />
        </div>

        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>Terminal Operating System (TOS) Aktif & Realtime</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Selamat Datang, {user ? user.name : 'Operator Terminal'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            Sistem terintegrasi penuh untuk operasional Terminal Peti Kemas: manajemen data kapal sandar, pergerakan gate in/out, crane stevedoring bongkar muat, visual yard mapping, dan billing jasa pelabuhan.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5 text-xs">
            <button
              onClick={() => onNavigate('trans_gate_in')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Gate In Truk</span>
            </button>
            <button
              onClick={() => onNavigate('trans_discharge')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold backdrop-blur-md flex items-center space-x-1.5 transition border border-white/20"
            >
              <Ship className="w-4 h-4 text-cyan-300" />
              <span>Bongkar Kapal</span>
            </button>
            <button
              onClick={() => onNavigate('yard_visualizer')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold backdrop-blur-md flex items-center space-x-1.5 transition border border-white/20"
            >
              <Grid3X3 className="w-4 h-4 text-amber-300" />
              <span>Peta Lapangan</span>
            </button>
            <button
              onClick={onOpenDbModal}
              className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl font-bold backdrop-blur-md flex items-center space-x-1.5 transition"
            >
              <Database className="w-4 h-4" />
              <span>Koneksi Real DB</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('master_containers')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Kontainer di Yard</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {totalInYard} <span className="text-xs font-sans font-medium text-slate-400">Box</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Total Terdaftar: {containers.length}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('master_vessels')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Kapal Sandar (Berthed)</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {berthedVessels.length} <span className="text-xs font-sans font-medium text-slate-400">Kapal</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{vessels.filter(v => v.status === 'ANCHORAGE').length} Tunggu Labuh</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('master_yard')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Yard Occupancy (YOR)</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {yorPercentage}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center justify-between">
            <span>Kondisi Aman (&lt; 70%)</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('trans_gate_in')}
          className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Aktivitas Gate Hari Ini</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {totalGateToday} <span className="text-xs font-sans font-medium text-slate-400">Truk</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Gate In & Out Berjalan</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Vessel Berth Windows */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Ship className="w-4 h-4 text-blue-500" />
                <span>Jadwal & Status Dermaga Tambat (Berth Schedule)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Monitoring kapal sandar di Quay Crane Dermaga 01 s/d Dermaga 03
              </p>
            </div>
            <button
              onClick={() => onNavigate('master_vessels')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {vessels.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {v.vesselName}
                    </span>
                    <span className="text-slate-500 ml-2">({v.shippingLine})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                    v.status === 'BERTHED' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {v.status} • {v.berthLocation}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block">Kapasitas TEU:</span>
                    <span className="font-mono font-bold">{v.capacityTEU.toLocaleString()} TEU</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Rencana Bongkar:</span>
                    <span className="font-mono font-bold text-emerald-600">{v.totalDischargePlanned} TEU</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Rencana Muat:</span>
                    <span className="font-mono font-bold text-blue-600">{v.totalLoadingPlanned} TEU</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Perkiraan Berangkat:</span>
                    <span className="font-mono">{new Date(v.etd).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Activity Stream */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Aktivitas Operasional Terkini
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Feed
            </span>
          </div>

          <div className="space-y-3">
            {gateTransactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-start space-x-3 text-xs">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  tx.type === 'GATE_IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {tx.type === 'GATE_IN' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {tx.type === 'GATE_IN' ? 'Gate In' : 'Gate Out'}: {tx.containerNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Truk {tx.truckLicensePlate} • {tx.allocatedYardSlot || 'D/O OK'}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
              </div>
            ))}

            {stevedoringTx.slice(0, 2).map((st) => (
              <div key={st.id} className="flex items-start space-x-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Ship className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {st.type}: {st.containerNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {st.vesselName} • {st.quayCraneId}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(st.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
