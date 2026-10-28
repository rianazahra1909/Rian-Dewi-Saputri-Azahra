import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Printer, 
  FileCheck2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Search
} from 'lucide-react';
import { GateTransaction, Container } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';
import { authService } from '../../services/auth.ts';

export const GateOutTransactionView: React.FC = () => {
  const [gateTransactions, setGateTransactions] = useState<GateTransaction[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGatePass, setSelectedGatePass] = useState<GateTransaction | null>(null);

  // Form fields
  const [selectedContainerId, setSelectedContainerId] = useState('');
  const [truckPlate, setTruckPlate] = useState('B 9840 UYX');
  const [driverName, setDriverName] = useState('Bambang Irawan');
  const [driverIdCard, setDriverIdCard] = useState('3174091985002');
  const [truckingCompany, setTruckingCompany] = useState('PT Samudera Logistik Indonesia');
  const [doNumber, setDoNumber] = useState('DO-MSK-2026-9912');
  const [sppbNumber, setSppbNumber] = useState('SPPB-BC-0992-KPU');
  const [destination, setDestination] = useState('Gudang Distribusi Cikarang Dry Port');
  const [formError, setFormError] = useState('');

  const refreshData = () => {
    const all = dbService.getGateTransactions().filter(t => t.type === 'GATE_OUT');
    setGateTransactions(all);
    const availableContainers = dbService.getContainers().filter(c => c.operationalStatus === 'IN_YARD' || c.operationalStatus === 'DISCHARGED');
    setContainers(availableContainers);
    if (availableContainers.length > 0 && !selectedContainerId) {
      setSelectedContainerId(availableContainers[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const targetContainer = containers.find(c => c.id === selectedContainerId) || containers[0];
    if (!targetContainer) {
      setFormError('Pilih kontainer yang valid di lapangan penumpukan.');
      return;
    }

    if (targetContainer.operationalStatus === 'CUSTOMS_HOLD') {
      setFormError('Kontainer berstatus CUSTOMS HOLD tidak dapat dikeluarkan sebelum SPPB Bea Cukai terbit.');
      return;
    }

    const user = authService.getCurrentUser();
    const newTx = dbService.addGateTransaction({
      type: 'GATE_OUT',
      containerId: targetContainer.id,
      containerNumber: targetContainer.containerNumber,
      truckLicensePlate: truckPlate.trim().toUpperCase(),
      driverName: driverName.trim(),
      driverIdCard: driverIdCard.trim(),
      truckingCompany: truckingCompany.trim(),
      sealNumber: targetContainer.sealNumber || 'SL-GO-' + Math.floor(100000 + Math.random() * 900000),
      conditionStatus: 'GOOD',
      destinationOrOrigin: destination.trim(),
      eirNumber: `GATEPASS-GO-${Math.floor(100000 + Math.random() * 900000)}`,
      operatorUsername: user ? user.username : 'gate_op',
      notes: `Verifikasi D/O: ${doNumber} | SPPB BC: ${sppbNumber}`,
    });

    refreshData();
    setIsModalOpen(false);
    setSelectedGatePass(newTx);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Transaksi Gate Out (Pengeluaran Peti Kemas & Gate Pass)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              {gateTransactions.length} Kontainer Keluar
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Verifikasi fisik, kelengkapan Delivery Order (D/O), Surat Persetujuan Pengeluaran Barang (SPPB Bea Cukai), dan cetak Gate Pass.
          </p>
        </div>

        <button
          onClick={() => {
            setDoNumber('DO-' + Math.floor(100000 + Math.random() * 900000));
            setSppbNumber('SPPB-BC-' + Math.floor(1000 + Math.random() * 9000));
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Proses Gate Out</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">No. Gate Pass</th>
              <th className="py-3 px-4">No. Kontainer</th>
              <th className="py-3 px-4">Truk Penjemput</th>
              <th className="py-3 px-4">Pengemudi & EMKL</th>
              <th className="py-3 px-4">Tujuan Pengiriman</th>
              <th className="py-3 px-4">Waktu Keluar</th>
              <th className="py-3 px-4">Status Dokumen</th>
              <th className="py-3 px-4 text-right">Tiket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {gateTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Belum ada transaksi Gate Out.
                </td>
              </tr>
            ) : (
              gateTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {tx.eirNumber}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {tx.containerNumber}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {tx.truckLicensePlate}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {tx.driverName} ({tx.truckingCompany})
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {tx.destinationOrOrigin}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(tx.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SPPB & D/O Valid</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedGatePass(tx)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 text-blue-600 rounded-lg text-xs font-semibold flex items-center space-x-1 ml-auto"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Cetak Pass</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Pemeriksaan Dokumen & Verifikasi Gate Out</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Kontainer yang Hendak Dikeluarkan *
                </label>
                <select
                  value={selectedContainerId}
                  onChange={(e) => setSelectedContainerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-mono font-bold"
                >
                  {containers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.containerNumber} - {c.size} ({c.ownerShippingLine}) [{c.operationalStatus}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor D/O (Delivery Order) *
                  </label>
                  <input
                    type="text"
                    required
                    value={doNumber}
                    onChange={(e) => setDoNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor SPPB Bea Cukai *
                  </label>
                  <input
                    type="text"
                    required
                    value={sppbNumber}
                    onChange={(e) => setSppbNumber(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">No. Polisi Truk</label>
                  <input
                    type="text"
                    required
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pengemudi</label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Perusahaan Truk / EMKL</label>
                <input
                  type="text"
                  value={truckingCompany}
                  onChange={(e) => setTruckingCompany(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tujuan Pengiriman</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  Verifikasi & Cetak Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gate Pass Slip */}
      {selectedGatePass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-base font-black tracking-tight">PORTVESSEL TERMINAL PETI KEMAS</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                SURAT JALAN / GATE PASS KELUAR PELABUHAN
              </p>
              <div className="font-mono font-bold text-sm text-emerald-600 mt-1">
                {selectedGatePass.eirNumber}
              </div>
            </div>

            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Waktu Keluar:</span>
                <span>{new Date(selectedGatePass.timestamp).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">No. Kontainer:</span>
                <span className="font-bold text-sm text-blue-700">{selectedGatePass.containerNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Truk & Supir:</span>
                <span className="font-bold">{selectedGatePass.truckLicensePlate} ({selectedGatePass.driverName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Tujuan:</span>
                <span>{selectedGatePass.destinationOrOrigin}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 text-[11px] text-slate-600">
                <span>Catatan Izin:</span>
                <span>{selectedGatePass.notes}</span>
              </div>
            </div>

            <div className="p-2 bg-emerald-50 rounded text-center text-[10px] text-emerald-800 font-bold">
              ✓ Telah diverifikasi petugas Gate Out dan Petugas Pengamanan Pelabuhan (Port Security)
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedGatePass(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Gate Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
