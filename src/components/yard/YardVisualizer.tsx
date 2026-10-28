import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Box, 
  MapPin, 
  Layers, 
  Thermometer, 
  ShieldAlert, 
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { dbService } from '../../services/db.ts';
import { Container, YardBlock } from '../../types/index.ts';

export const YardVisualizer: React.FC = () => {
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('blk-a');
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  const refreshData = () => {
    const blocks = dbService.getYardBlocks();
    setYardBlocks(blocks);
    setContainers(dbService.getContainers());
    if (blocks.length > 0 && !selectedBlockId) {
      setSelectedBlockId(blocks[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const activeBlock = yardBlocks.find(b => b.id === selectedBlockId) || yardBlocks[0];

  // Containers in this block
  const blockContainers = containers.filter(c => c.yardBlockId === selectedBlockId && c.operationalStatus !== 'GATED_OUT' && c.operationalStatus !== 'LOADED');

  // Bays array (e.g. 1 to 12)
  const baysCount = Math.min(activeBlock?.maxBays || 8, 12);
  const rowsCount = Math.min(activeBlock?.maxRows || 6, 6);
  const tiersCount = Math.min(activeBlock?.maxTiers || 5, 5);

  const getContainerAt = (bay: number, row: number, tier: number) => {
    return blockContainers.find(c => c.yardBay === bay && c.yardRow === row && c.yardTier === tier);
  };

  const getSlotColor = (c: Container) => {
    if (c.dangerousGoodsClass) return 'bg-amber-500 border-amber-600 text-white';
    if (c.type === 'REEFER') return 'bg-cyan-600 border-cyan-700 text-white';
    if (c.status === 'EMPTY') return 'bg-slate-400 border-slate-500 text-white';
    if (c.operationalStatus === 'STAGED') return 'bg-emerald-600 border-emerald-700 text-white';
    return 'bg-blue-600 border-blue-700 text-white';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Peta Visual Lapangan Penumpukan (2D Yard Visualizer)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              Live Slot Grid
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Representasi visual spasial penataan peti kemas (Bay, Row, Tier) dan monitoring kepadatan blok.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Posisi Yard</span>
        </button>
      </div>

      {/* Block Selector Chips */}
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {yardBlocks.map((b) => (
          <button
            key={b.id}
            onClick={() => {
              setSelectedBlockId(b.id);
              setSelectedContainer(null);
            }}
            className={`px-4 py-2 rounded-xl transition flex items-center space-x-2 border ${
              selectedBlockId === b.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <span className="font-extrabold font-mono text-sm">Blok {b.blockCode}</span>
            <span className="opacity-80 text-[11px] font-sans">({b.category})</span>
          </button>
        ))}
      </div>

      {/* Color Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
        <span className="font-bold text-slate-400 uppercase text-[10px]">Legenda Jenis:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block"></span>
          <span>FCL Dry Umum</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-cyan-600 inline-block"></span>
          <span>Reefer (Pendingin)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block"></span>
          <span>Siap Muat Ekspor (Staged)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block"></span>
          <span>B3 / Dangerous Goods</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded bg-slate-400 inline-block"></span>
          <span>Empty (Kosong)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded border border-dashed border-slate-300 dark:border-slate-700 inline-block"></span>
          <span>Slot Kosong</span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {activeBlock?.name}
            </h3>
            <span className="text-xs text-slate-500">
              Kapasitas: {activeBlock?.totalCapacityTEU} TEU • Terisi: {blockContainers.length} Kontainer Aktif
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
            Tampak Atas: Kolom Bay (01-{String(baysCount).padStart(2,'0')}) x Baris Row (01-{String(rowsCount).padStart(2,'0')})
          </span>
        </div>

        <div className="grid grid-flow-col auto-cols-max gap-4 pb-4">
          {Array.from({ length: baysCount }).map((_, bayIdx) => {
            const bayNum = bayIdx + 1;
            return (
              <div key={bayNum} className="space-y-2 border border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                <div className="text-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300 pb-1 border-b border-slate-200 dark:border-slate-800">
                  BAY {String(bayNum).padStart(2, '0')}
                </div>

                <div className="space-y-1.5">
                  {Array.from({ length: rowsCount }).map((_, rowIdx) => {
                    const rowNum = rowIdx + 1;
                    // Check if there is a container on any tier of this bay and row
                    // We check highest tier first (Tier 5 down to 1)
                    let foundContainer: Container | undefined;
                    let foundTier = 1;
                    for (let t = tiersCount; t >= 1; t--) {
                      const c = getContainerAt(bayNum, rowNum, t);
                      if (c) {
                        foundContainer = c;
                        foundTier = t;
                        break;
                      }
                    }

                    return (
                      <div
                        key={rowNum}
                        onClick={() => {
                          if (foundContainer) setSelectedContainer(foundContainer);
                        }}
                        className={`w-36 h-12 rounded-lg border text-left p-1.5 transition select-none flex flex-col justify-between ${
                          foundContainer
                            ? `${getSlotColor(foundContainer)} shadow-sm cursor-pointer hover:scale-105`
                            : 'border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                          <span className="font-bold">R{String(rowNum).padStart(2,'0')}</span>
                          {foundContainer ? (
                            <span className="font-bold bg-black/25 px-1 py-0.2 rounded text-[9px]">
                              T{foundTier}
                            </span>
                          ) : (
                            <span className="text-[9px] opacity-60">Kosong</span>
                          )}
                        </div>

                        {foundContainer ? (
                          <div className="font-mono font-black text-[11px] truncate leading-tight">
                            {foundContainer.containerNumber}
                          </div>
                        ) : (
                          <div className="text-[9px] text-slate-400 text-center">-</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Inspector Drawer / Card when a slot is clicked */}
      {selectedContainer && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-500 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                INSPEKSI SLOT YARD
              </span>
              <span className="font-mono font-bold text-xs text-blue-600">
                Slot: {activeBlock.blockCode}-{String(selectedContainer.yardBay).padStart(2,'0')}-{String(selectedContainer.yardRow).padStart(2,'0')}-{String(selectedContainer.yardTier).padStart(2,'0')}
              </span>
            </div>
            <h3 className="text-base font-black font-mono text-slate-900 dark:text-slate-100">
              {selectedContainer.containerNumber}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedContainer.size.replace('_', ' ')} • {selectedContainer.type} • {selectedContainer.status} • {selectedContainer.ownerShippingLine} • Berat: {selectedContainer.grossWeight.toLocaleString()} kg
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedContainer(null)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
            >
              Tutup Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
