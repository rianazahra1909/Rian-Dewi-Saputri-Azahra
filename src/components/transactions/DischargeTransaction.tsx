import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  ArrowDownLeft, 
  Plus, 
  CheckCircle2, 
  Layers, 
  Truck, 
  Anchor, 
  X,
  Search,
  MapPin,
  Clock
} from 'lucide-react';
import { StevedoringTransaction, Vessel, Container, YardBlock } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';
import { authService } from '../../services/auth.ts';

export const DischargeTransaction: React.FC = () => {
  const [transactions, setTransactions] = useState<StevedoringTransaction[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedVesselId, setSelectedVesselId] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [quayCraneId, setQuayCraneId] = useState('QC-01');
  const [terminalTractorId, setTerminalTractorId] = useState('TT-04');
  const [rtgCraneId, setRtgCraneId] = useState('RTG-02');
  const [yardSlot, setYardSlot] = useState('A-04-02-03');
  const [bayVessel, setBayVessel] = useState('Bay-12-04-82');

  const refreshData = () => {
    const allStv = dbService.getStevedoringTransactions().filter(t => t.type === 'DISCHARGE');
    setTransactions(allStv);
    const vList = dbService.getVessels();
    setVessels(vList);
    if (vList.length > 0 && !selectedVesselId) {
      setSelectedVesselId(vList[0].id);
    }
    setContainers(dbService.getContainers());
    setYardBlocks(dbService.getYardBlocks());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenModal = () => {
    setContainerNumber('MSKU' + Math.floor(1000000 + Math.random() * 9000000));
    setYardSlot('A-' + String(Math.floor(1 + Math.random() * 12)).padStart(2,'0') + '-02-01');
    setBayVessel('Bay-' + String(Math.floor(2 + Math.random() * 20)).padStart(2,'0') + '-04-82');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const vessel = vessels.find(v => v.id === selectedVesselId) || vessels[0];
    const cleanNum = containerNumber.trim().toUpperCase();

    // Check or create container
    let c = containers.find(item => item.containerNumber === cleanNum);
    if (!c) {
      c = dbService.saveContainer({
        containerNumber: cleanNum,
        size: '40ft_HC',
        type: 'DRY',
        status: 'FCL',
        operationalStatus: 'DISCHARGED',
        tareWeight: 3850,
        grossWeight: 26000,
        maxPayload: 28500,
        ownerShippingLine: vessel.shippingLine,
        isoCode: '45G1',
        yardBlockId: 'blk-a',
        yardBay: 4,
        yardRow: 2,
        yardTier: 2,
        vesselId: vessel.id,
        entryDate: new Date().toISOString(),
      });
    }

    const user = authService.getCurrentUser();
    dbService.addStevedoringTransaction({
      type: 'DISCHARGE',
      vesselId: vessel.id,
      vesselName: vessel.vesselName,
      containerId: c.id,
      containerNumber: cleanNum,
      quayCraneId,
      terminalTractorId,
      rtgCraneId,
      yardSlot,
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
              Transaksi Bongkar Kapal (Stevedoring Discharge)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              {transactions.length} Kontainer Dibongkar
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pencatatan siklus pembongkaran dari palka/geladak kapal (Quay Crane) menuju lapangan penumpukan (RTG).
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Bongkar Kontainer</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">No. Transaksi</th>
              <th className="py-3 px-4">Kapal Asal</th>
              <th className="py-3 px-4">No. Kontainer</th>
              <th className="py-3 px-4">Quay Crane (QC)</th>
              <th className="py-3 px-4">Truk Terminal (TT)</th>
              <th className="py-3 px-4">Slot Lapangan Tujuan</th>
              <th className="py-3 px-4">Waktu Selesai</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Belum ada catatan bongkar kapal.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {tx.transactionNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {tx.vesselName}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {tx.containerNumber}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    {tx.quayCraneId}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {tx.terminalTractorId}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{tx.yardSlot}</span>
                    </div>
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {tx.status}
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
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Ship className="w-4 h-4 text-blue-500" />
                <span>Registrasi Operasi Bongkar (Discharge)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Kapal Sandar *
                </label>
                <select
                  value={selectedVesselId}
                  onChange={(e) => setSelectedVesselId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                >
                  {vessels.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vesselName} ({v.berthLocation || 'Dermaga'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Kontainer *
                </label>
                <input
                  type="text"
                  required
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase font-bold text-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quay Crane (Dermaga)</label>
                  <select
                    value={quayCraneId}
                    onChange={(e) => setQuayCraneId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono"
                  >
                    <option value="QC-01">QC-01 (Post-Panamax)</option>
                    <option value="QC-02">QC-02 (Post-Panamax)</option>
                    <option value="QC-03">QC-03 (Super Post-Panamax)</option>
                    <option value="QC-04">QC-04 (Super Post-Panamax)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Terminal Tractor (Truk)</label>
                  <select
                    value={terminalTractorId}
                    onChange={(e) => setTerminalTractorId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono"
                  >
                    <option value="TT-01">TT-01 (Terberg YT220)</option>
                    <option value="TT-04">TT-04 (Terberg YT220)</option>
                    <option value="TT-08">TT-08 (Kalmar Ottawa)</option>
                    <option value="TT-12">TT-12 (Kalmar Ottawa)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Posisi Bay di Kapal</label>
                  <input
                    type="text"
                    value={bayVessel}
                    onChange={(e) => setBayVessel(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Slot Yard Tujuan *</label>
                  <input
                    type="text"
                    required
                    value={yardSlot}
                    onChange={(e) => setYardSlot(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  Selesaikan Bongkar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
