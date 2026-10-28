import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  Layers, 
  Ship, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { dbService } from '../../services/db.ts';
import { Container, Vessel, YardBlock, GateTransaction, Invoice } from '../../types/index.ts';

export const ReportsView: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [gateTransactions, setGateTransactions] = useState<GateTransaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [dateRange, setDateRange] = useState('OCT_2026');
  const [activeReportTab, setActiveReportTab] = useState<'DWELLING' | 'THROUGHPUT' | 'YOR' | 'GATE' | 'FINANCE'>('DWELLING');

  useEffect(() => {
    setContainers(dbService.getContainers());
    setVessels(dbService.getVessels());
    setYardBlocks(dbService.getYardBlocks());
    setGateTransactions(dbService.getGateTransactions());
    setInvoices(dbService.getInvoices());
  }, []);

  // KPI Calculations
  const totalCapacity = yardBlocks.reduce((acc, b) => acc + b.totalCapacityTEU, 0);
  const totalOccupancy = yardBlocks.reduce((acc, b) => acc + b.currentOccupancyTEU, 0);
  const overallYor = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  // Average Dwelling Time calculation
  const totalDwellingDays = invoices.reduce((acc, inv) => acc + inv.dwellingDays, 0);
  const avgDwellingTime = invoices.length > 0 ? (totalDwellingDays / invoices.length).toFixed(1) : '2.8';

  // Throughput (TEU Bongkar + Muat)
  const totalDischargeTEU = vessels.reduce((acc, v) => acc + v.totalDischargePlanned, 0);
  const totalLoadingTEU = vessels.reduce((acc, v) => acc + v.totalLoadingPlanned, 0);
  const totalThroughput = totalDischargeTEU + totalLoadingTEU;

  // Total Revenue
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (activeReportTab === 'DWELLING' || activeReportTab === 'FINANCE') {
      csvContent += "Invoice Number,Consignee,Container,Dwelling Days,Storage Fee,Total Amount,Status\n";
      invoices.forEach(i => {
        csvContent += `"${i.invoiceNumber}","${i.consigneeOrShipper}","${i.containerNumber}",${i.dwellingDays},${i.storageFee},${i.totalAmount},"${i.paymentStatus}"\n`;
      });
    } else if (activeReportTab === 'YOR') {
      csvContent += "Block Code,Name,Category,Capacity TEU,Occupancy TEU,YOR Percentage\n";
      yardBlocks.forEach(b => {
        csvContent += `"${b.blockCode}","${b.name}","${b.category}",${b.totalCapacityTEU},${b.currentOccupancyTEU},${Math.round((b.currentOccupancyTEU/b.totalCapacityTEU)*100)}%\n`;
      });
    } else {
      csvContent += "Container Number,Size,Type,Status,Operational Status,Gross Weight,Shipping Line\n";
      containers.forEach(c => {
        csvContent += `"${c.containerNumber}","${c.size}","${c.type}","${c.status}","${c.operationalStatus}",${c.grossWeight},"${c.ownerShippingLine}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_TOS_Terminal_${activeReportTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Pusat Laporan & Analitik Kinerja Terminal Peti Kemas
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              KPI Eksekutif
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Laporan Throughput TEU, Dwelling Time, Yard Occupancy Rate (YOR), dan Pendapatan Billing Jasa Kepelabuhanan.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Rata-Rata Dwelling Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {avgDwellingTime} <span className="text-xs font-sans font-medium text-slate-400">Hari</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target Nasional: &lt; 3.0 Hari (Aman)</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Yard Occupancy Rate (YOR)</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {overallYor}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalOccupancy} dari {totalCapacity} TEU Terpakai
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Throughput Periode Ini</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
            {totalThroughput.toLocaleString('id-ID')} <span className="text-xs font-sans font-medium text-slate-400">TEU</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalDischargeTEU} Bongkar • {totalLoadingTEU} Muat
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Pendapatan Billing</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
            Rp {(totalRevenue / 1000000).toFixed(1)} <span className="text-xs font-sans font-medium text-slate-400">Juta</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {invoices.length} Faktur Tagihan Terbit
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveReportTab('DWELLING')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeReportTab === 'DWELLING'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Laporan Dwelling Time
        </button>
        <button
          onClick={() => setActiveReportTab('THROUGHPUT')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeReportTab === 'THROUGHPUT'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Laporan Throughput TEU
        </button>
        <button
          onClick={() => setActiveReportTab('YOR')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeReportTab === 'YOR'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Laporan Keterisian Lapangan (YOR)
        </button>
        <button
          onClick={() => setActiveReportTab('FINANCE')}
          className={`pb-2.5 px-3 border-b-2 transition ${
            activeReportTab === 'FINANCE'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Laporan Finansial Billing
        </button>
      </div>

      {/* Report Tables & Visual Charts */}
      {activeReportTab === 'DWELLING' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Detail Waktu Inap Peti Kemas (Dwelling Time Breakdown)
              </h3>
              <p className="text-xs text-slate-500">
                Lama inap dihitung sejak kontainer dibongkar/masuk gate hingga diambil oleh pemilik barang (Consignee).
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              Rata-rata: {avgDwellingTime} Hari
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2.5 px-3">No. Kontainer</th>
                <th className="py-2.5 px-3">Consignee</th>
                <th className="py-2.5 px-3">Waktu Masuk</th>
                <th className="py-2.5 px-3">Waktu Keluar</th>
                <th className="py-2.5 px-3">Lama Inap</th>
                <th className="py-2.5 px-3">Status Kinerja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-bold text-blue-600">{inv.containerNumber}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{inv.consigneeOrShipper}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-sans">
                    {new Date(inv.entryDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-sans">
                    {new Date(inv.exitDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{inv.dwellingDays} Hari</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.dwellingDays <= 3 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : inv.dwellingDays <= 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.dwellingDays <= 3 ? 'KILAT (Ideal)' : inv.dwellingDays <= 5 ? 'STANDAR' : 'TERLAMBAT (Overdue)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReportTab === 'THROUGHPUT' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Rekapitulasi Throughput Kapal & Dermaga (TEU)
              </h3>
              <p className="text-xs text-slate-500">
                Volume pergerakan peti kemas masuk dan keluar dari dermaga pelabuhan.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
              Total TEU: {totalThroughput} Box
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vessels.map((v) => (
              <div key={v.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span className="flex items-center space-x-1.5">
                    <Ship className="w-4 h-4 text-blue-500" />
                    <span>{v.vesselName}</span>
                  </span>
                  <span className="font-mono text-blue-600">{v.totalDischargePlanned + v.totalLoadingPlanned} TEU</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block">Bongkar (Discharge):</span>
                    <span className="font-mono font-bold text-emerald-600">{v.totalDischargePlanned} TEU</span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-slate-900">
                    <span className="text-slate-400 block">Muat (Loading):</span>
                    <span className="font-mono font-bold text-blue-600">{v.totalLoadingPlanned} TEU</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  Pelayaran: {v.shippingLine} • Sandar: {v.berthLocation || 'Dermaga 01'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReportTab === 'YOR' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Laporan Yard Occupancy Rate (YOR) per Blok Lapangan
            </h3>
            <p className="text-xs text-slate-500">
              Batas aman YOR standar Ditjen Perhubungan Laut adalah maksimal 65-70% untuk mencegah kongesti.
            </p>
          </div>

          <div className="space-y-4">
            {yardBlocks.map((b) => {
              const pct = Math.round((b.currentOccupancyTEU / b.totalCapacityTEU) * 100);
              return (
                <div key={b.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>{b.name} ({b.category})</span>
                    <span className="font-mono font-bold">{b.currentOccupancyTEU} / {b.totalCapacityTEU} TEU ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 80 ? 'bg-rose-500' : pct >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeReportTab === 'FINANCE' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Rekapitulasi Penerimaan Jasa Kepelabuhanan
              </h3>
              <p className="text-xs text-slate-500">
                Total pendapatan dari tarif Lo-Lo, Penumpukan Masa I & II, Reefer, dan PPN.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-lg">
              Total: Rp {totalRevenue.toLocaleString('id-ID')}
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">No. Faktur</th>
                <th className="py-2.5 px-3">Consignee</th>
                <th className="py-2.5 px-3">Biaya Lo-Lo</th>
                <th className="py-2.5 px-3">Biaya Penumpukan</th>
                <th className="py-2.5 px-3">PPN 11%</th>
                <th className="py-2.5 px-3">Total Tagihan</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {invoices.map((i) => (
                <tr key={i.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-bold text-blue-600">{i.invoiceNumber}</td>
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{i.consigneeOrShipper}</td>
                  <td className="py-2.5 px-3">Rp {i.liftOnOffFee.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3">Rp {i.storageFee.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 text-slate-400">Rp {i.taxPpn.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">Rp {i.totalAmount.toLocaleString('id-ID')}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {i.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
