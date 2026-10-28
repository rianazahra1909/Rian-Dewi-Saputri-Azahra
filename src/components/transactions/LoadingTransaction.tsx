import React, { useState, useEffect } from 'react';
import { Ship, ArrowUpRight, Plus, X, MapPin } from 'lucide-react';
import { StevedoringTransaction, Vessel, Container } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';
import { authService } from '../../services/auth.ts';

export const LoadingTransaction: React.FC = () => {
  const [transactions, setTransactions] = useState<StevedoringTransaction[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedVesselId, setSelectedVesselId] = useState('');
  const [selectedContainerId, setSelectedContainerId] = useState('');
  const [bayVessel, setBayVessel] = useState('Bay-08-02-84');
  const [quayCraneId, setQuayCraneId] = useState('QC-02');

  const refreshData = () => {
    setTransactions(dbService.getStevedoringTransactions().filter(t => t.type === 'LOADING'));
    const vList = dbService.getVessels();
    setVessels(vList);
    if (vList.length > 0 && !selectedVesselId) setSelectedVesselId(vList[0].id);

    // Filter containers ready for loading (in yard / staged)
    const cList = dbService.getContainers().filter(c => c.operationalStatus === 'IN_YARD' || c.operationalStatus === 'STAGED');
    setContainers(cList);
    if (cList.length > 0 && !selectedContainerId) setSelectedContainerId(cList[0].id);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const vessel = vessels.find(v => v.id === selectedVesselId) || vessels[0];
    const container = containers.find(c => c.id === selectedContainerId) || containers[0];
    if (!vessel || !container) return;

    const user = authService.getCurrentUser();
    dbService.addStevedoringTransaction({
      type: 'LOADING',
      vesselId: vessel.id,
      vesselName: vessel.vesselName,
      containerId: container.id,
      containerNumber: container.containerNumber,
      quayCraneId,
      terminalTractorId: 'TT-06',
      rtgCraneId: 'RTG-01',
      yardSlot: 'YARD-LOADED',
      bayLocationVessel: bayVessel,
      status: 'COMPLETED',
      operatorUsername: user ? user.username : 'planner',
    });

    refreshData();
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Transaksi Muat Kapal (Stevedoring Loading / Ekspor)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              {transactions.length} Kontainer Dimuat
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pemindahan kontainer dari lapangan penumpukan (staging area) ke palka kapal berdasarkan Stowage Plan.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Proses Muat Kontainer</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">No. Transaksi</th>
              <th className="py-3 px-4">Kapal Tujuan</th>
              <th className="py-3 px-4">No. Kontainer</th>
              <th className="py-3 px-4">Posisi Bay Kapal</th>
              <th className="py-3 px-4">Quay Crane</th>
              <th className="py-3 px-4">Waktu Muat</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Belum ada catatan muat kapal.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{tx.transactionNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{tx.vesselName}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{tx.containerNumber}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600">{tx.bayLocationVessel}</td>
                  <td className="py-3 px-4 font-mono">{tx.quayCraneId}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">{new Date(tx.timestamp).toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      LOADED
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4 text-blue-500" />
                <span>Registrasi Muat Kapal (Loading)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Kapal Tujuan Muat *
                </label>
                <select
                  value={selectedVesselId}
                  onChange={(e) => setSelectedVesselId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-bold"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>{v.vesselName} ({v.berthLocation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Peti Kemas di Lapangan *
                </label>
                <select
                  value={selectedContainerId}
                  onChange={(e) => setSelectedContainerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-mono"
                >
                  {containers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.containerNumber} - {c.size} ({c.ownerShippingLine})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quay Crane</label>
                  <select
                    value={quayCraneId}
                    onChange={(e) => setQuayCraneId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono"
                  >
                    <option value="QC-01">QC-01</option>
                    <option value="QC-02">QC-02</option>
                    <option value="QC-03">QC-03</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stowage Bay Plan Kapal *</label>
                  <input
                    type="text"
                    required
                    value={bayVessel}
                    onChange={(e) => setBayVessel(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  Konfirmasi Muat ke Kapal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
