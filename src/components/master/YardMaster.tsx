import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Grid3X3,
  Thermometer,
  Zap
} from 'lucide-react';
import { YardBlock } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';

export const YardMaster: React.FC = () => {
  const [blocks, setBlocks] = useState<YardBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<YardBlock | null>(null);

  // Form Fields
  const [blockCode, setBlockCode] = useState('E');
  const [name, setName] = useState('Blok E - Lapangan Transit Cepat');
  const [category, setCategory] = useState<'IMPORT' | 'EXPORT' | 'REEFER' | 'EMPTY' | 'DANGEROUS_GOODS'>('IMPORT');
  const [maxBays, setMaxBays] = useState(12);
  const [maxRows, setMaxRows] = useState(6);
  const [maxTiers, setMaxTiers] = useState(5);
  const [reeferPlugs, setReeferPlugs] = useState(0);

  const refreshData = () => {
    setBlocks(dbService.getYardBlocks());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBlock(null);
    setBlockCode(String.fromCharCode(65 + blocks.length));
    setName(`Blok ${String.fromCharCode(65 + blocks.length)} - Lapangan Penumpukan Ekspor`);
    setCategory('EXPORT');
    setMaxBays(16);
    setMaxRows(6);
    setMaxTiers(5);
    setReeferPlugs(0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: YardBlock) => {
    setEditingBlock(b);
    setBlockCode(b.blockCode);
    setName(b.name);
    setCategory(b.category);
    setMaxBays(b.maxBays);
    setMaxRows(b.maxRows);
    setMaxTiers(b.maxTiers);
    setReeferPlugs(b.reeferPlugsAvailable || 0);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const totalCapacity = maxBays * maxRows * maxTiers;

    const payload: YardBlock = {
      id: editingBlock ? editingBlock.id : `blk-${blockCode.toLowerCase()}`,
      blockCode: blockCode.trim().toUpperCase(),
      name: name.trim(),
      category,
      maxBays: Number(maxBays),
      maxRows: Number(maxRows),
      maxTiers: Number(maxTiers),
      totalCapacityTEU: totalCapacity,
      currentOccupancyTEU: editingBlock ? editingBlock.currentOccupancyTEU : Math.floor(totalCapacity * 0.4),
      reeferPlugsAvailable: category === 'REEFER' ? Number(reeferPlugs) : 0,
      status: 'ACTIVE',
    };

    dbService.saveYardBlock(payload);
    refreshData();
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Master Blok & Lapangan Penumpukan (Yard Blocks)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              {blocks.length} Blok Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Konfigurasi grid dimensi penumpukan peti kemas (Bays, Rows, Tiers) dan pemantauan utilisasi lapangan (YOR).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Blok Lapangan</span>
        </button>
      </div>

      {/* Grid of Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {blocks.map((b) => {
          const occupancyPct = Math.round((b.currentOccupancyTEU / b.totalCapacityTEU) * 100);
          const isHigh = occupancyPct >= 75;

          return (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-500/50 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-lg flex items-center justify-center mb-2">
                    {b.blockCode}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                    {b.name}
                  </h3>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {b.category}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1 text-slate-400 hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Dimension Specs */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Bays</span>
                  <span className="font-bold">{b.maxBays}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Rows</span>
                  <span className="font-bold">{b.maxRows}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Tiers</span>
                  <span className="font-bold">{b.maxTiers}</span>
                </div>
              </div>

              {/* Progress & Occupancy */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500">Keterisian (YOR):</span>
                  <span className={`font-bold font-mono ${isHigh ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {b.currentOccupancyTEU} / {b.totalCapacityTEU} TEU ({occupancyPct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      occupancyPct > 80 
                        ? 'bg-rose-500' 
                        : occupancyPct > 60 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, occupancyPct)}%` }}
                  />
                </div>
              </div>

              {b.category === 'REEFER' && (
                <div className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center space-x-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>{b.reeferPlugsAvailable} Stop Kontak Reefer Siap Pakai</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {editingBlock ? 'Edit Blok Lapangan' : 'Tambah Blok Lapangan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kode Blok (1-2 Huruf) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={blockCode}
                  onChange={(e) => setBlockCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Blok *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Blok
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  <option value="IMPORT">IMPORT (Lapangan Impor Umum)</option>
                  <option value="EXPORT">EXPORT (Lapangan Ekspor Staging)</option>
                  <option value="REEFER">REEFER (Dedicated Reefer)</option>
                  <option value="EMPTY">EMPTY (Depo Kontainer Kosong)</option>
                  <option value="DANGEROUS_GOODS">DANGEROUS GOODS (Isolasi B3)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Jumlah Bay</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={maxBays}
                    onChange={(e) => setMaxBays(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Jumlah Row</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={maxRows}
                    onChange={(e) => setMaxRows(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block mb-1">Jumlah Tier</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={maxTiers}
                    onChange={(e) => setMaxTiers(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>

              {category === 'REEFER' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kapasitas Stop Kontak Reefer (Plugs)
                  </label>
                  <input
                    type="number"
                    value={reeferPlugs}
                    onChange={(e) => setReeferPlugs(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Simpan Blok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
