import React, { useState, useEffect } from 'react';
import { MoveRight, Plus, MapPin, X } from 'lucide-react';
import { YardMovementTransaction, Container } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';
import { authService } from '../../services/auth.ts';

export const YardMovementTransactionView: React.FC = () => {
  const [movements, setMovements] = useState<YardMovementTransaction[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedContainerId, setSelectedContainerId] = useState('');
  const [fromSlot, setFromSlot] = useState('');
  const [toSlot, setToSlot] = useState('B-04-02-01');
  const [reason, setReason] = useState<'OPTIMIZATION' | 'EXPORT_STAGING' | 'REEFER_CONNECTION' | 'INSPECTION' | 'CUSTOMS_HOLD'>('OPTIMIZATION');
  const [equipmentUsed, setEquipmentUsed] = useState('RTG-03');

  const refreshData = () => {
    setMovements(dbService.getYardMovements());
    const cList = dbService.getContainers().filter(c => c.operationalStatus === 'IN_YARD' || c.operationalStatus === 'STAGED');
    setContainers(cList);
    if (cList.length > 0 && !selectedContainerId) {
      setSelectedContainerId(cList[0].id);
      setFromSlot(`A-${cList[0].yardBay || 1}-${cList[0].yardRow || 1}-${cList[0].yardTier || 1}`);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleContainerChange = (id: string) => {
    setSelectedContainerId(id);
    const c = containers.find(item => item.id === id);
    if (c) {
      const blockCode = c.yardBlockId?.replace('blk-', '').toUpperCase() || 'A';
      setFromSlot(`${blockCode}-${String(c.yardBay || 1).padStart(2,'0')}-${String(c.yardRow || 1).padStart(2,'0')}-${String(c.yardTier || 1).padStart(2,'0')}`);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const c = containers.find(item => item.id === selectedContainerId) || containers[0];
    if (!c) return;

    const user = authService.getCurrentUser();
    dbService.addYardMovement({
      containerId: c.id,
      containerNumber: c.containerNumber,
      fromSlot: fromSlot || 'A-01-01-01',
      toSlot: toSlot.trim().toUpperCase(),
      reason,
      equipmentUsed,
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
              Transaksi Relokasi Lapangan (Yard Movement / Shifting)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              {movements.length} Pergerakan Dicatat
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Perpindahan posisi kontainer antar blok, bay, row, dan tier untuk optimasi crane, penataan ekspor, atau inspeksi Bea Cukai.
          </p>
        </div>

        <button
          onClick={() => {
            if (containers.length > 0) handleContainerChange(containers[0].id);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Relokasi Peti Kemas Baru</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">No. Transaksi</th>
              <th className="py-3 px-4">No. Kontainer</th>
              <th className="py-3 px-4">Slot Asal (From)</th>
              <th className="py-3 px-4">Slot Baru (To)</th>
              <th className="py-3 px-4">Alasan Relokasi</th>
              <th className="py-3 px-4">Alat Berat / Crane</th>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4">Operator</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {movements.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Belum ada catatan relokasi yard.
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600">{m.transactionNumber}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{m.containerNumber}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{m.fromSlot}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{m.toSlot}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                      {m.reason}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{m.equipmentUsed}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{m.operatorUsername}</td>
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
                <MoveRight className="w-4 h-4 text-blue-500" />
                <span>Instruksi Shifting / Relokasi Yard</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Pilih Kontainer di Lapangan *</label>
                <select
                  value={selectedContainerId}
                  onChange={(e) => handleContainerChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-mono"
                >
                  {containers.map(c => (
                    <option key={c.id} value={c.id}>{c.containerNumber} ({c.ownerShippingLine})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Slot Asal (From)</label>
                  <input
                    type="text"
                    disabled
                    value={fromSlot}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg font-mono opacity-80"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Slot Baru Tujuan (To) *</label>
                  <input
                    type="text"
                    required
                    value={toSlot}
                    onChange={(e) => setToSlot(e.target.value)}
                    placeholder="B-04-02-01"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alasan Perpindahan (Reason)</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl"
                >
                  <option value="OPTIMIZATION">Optimasi Kepadatan Lapangan</option>
                  <option value="EXPORT_STAGING">Persiapan Staging Muat Ekspor</option>
                  <option value="REEFER_CONNECTION">Penyambungan Listrik Reefer</option>
                  <option value="INSPECTION">Pemeriksaan Fisik Lapangan</option>
                  <option value="CUSTOMS_HOLD">Isolasi Behandle Bea Cukai</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Alat Berat Pengangkut</label>
                <select
                  value={equipmentUsed}
                  onChange={(e) => setEquipmentUsed(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-mono"
                >
                  <option value="RTG-01">RTG-01 (Rubber Tyred Gantry)</option>
                  <option value="RTG-02">RTG-02 (Rubber Tyred Gantry)</option>
                  <option value="RTG-03">RTG-03 (Rubber Tyred Gantry)</option>
                  <option value="Reach Stacker-01">Reach Stacker-01 (Kalmar)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  Simpan Relokasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
