import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  Truck, 
  Plus, 
  Search, 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X,
  MapPin,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { GateTransaction, Container, YardBlock } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';
import { authService } from '../../services/auth.ts';

export const GateInTransaction: React.FC = () => {
  const [gateTransactions, setGateTransactions] = useState<GateTransaction[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<GateTransaction | null>(null);

  // Form states
  const [containerNumber, setContainerNumber] = useState('');
  const [truckPlate, setTruckPlate] = useState('B 9482 UEK');
  const [driverName, setDriverName] = useState('Suryadi Pratama');
  const [driverIdCard, setDriverIdCard] = useState('32750819890001');
  const [truckingCompany, setTruckingCompany] = useState('PT Puninar Logistics');
  const [sealNumber, setSealNumber] = useState('');
  const [conditionStatus, setConditionStatus] = useState<'GOOD' | 'DAMAGED' | 'SEAL_BROKEN'>('GOOD');
  const [origin, setOrigin] = useState('Kawasan Industri MM2100 Cikarang');
  const [allocatedBlock, setAllocatedBlock] = useState('blk-b');
  const [allocatedBay, setAllocatedBay] = useState(6);
  const [allocatedRow, setAllocatedRow] = useState(2);
  const [allocatedTier, setAllocatedTier] = useState(1);
  const [notes, setNotes] = useState('Pemeriksaan fisik gate in lengkap');
  const [formError, setFormError] = useState('');

  const refreshData = () => {
    const allGate = dbService.getGateTransactions().filter(t => t.type === 'GATE_IN');
    setGateTransactions(allGate);
    setContainers(dbService.getContainers());
    setYardBlocks(dbService.getYardBlocks());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenModal = () => {
    setContainerNumber('MRTU' + Math.floor(1000000 + Math.random() * 9000000));
    setTruckPlate('B ' + Math.floor(9000 + Math.random() * 999) + ' UEK');
    setSealNumber('SL-IN-' + Math.floor(100000 + Math.random() * 900000));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanContainer = containerNumber.trim().toUpperCase();
    if (!/^[A-Z]{4}\d{7}$/.test(cleanContainer)) {
      setFormError('Nomor Kontainer harus sesuai format ISO (4 huruf + 7 digit, contoh: MRTU5519208).');
      return;
    }

    // Find block
    const block = yardBlocks.find(b => b.id === allocatedBlock);
    const blockCode = block ? block.blockCode : 'B';
    const slotStr = `${blockCode}-${String(allocatedBay).padStart(2,'0')}-${String(allocatedRow).padStart(2,'0')}-${String(allocatedTier).padStart(2,'0')}`;

    // Check if container exists or create one
    let target = containers.find(c => c.containerNumber === cleanContainer);
    if (!target) {
      target = dbService.saveContainer({
        containerNumber: cleanContainer,
        size: '40ft',
        type: 'DRY',
        status: 'FCL',
        operationalStatus: 'IN_YARD',
        tareWeight: 3700,
        grossWeight: 24500,
        maxPayload: 27000,
        ownerShippingLine: 'PT Meratus Line',
        isoCode: '42G1',
        yardBlockId: allocatedBlock,
        yardBay: Number(allocatedBay),
        yardRow: Number(allocatedRow),
        yardTier: Number(allocatedTier),
        sealNumber: sealNumber.trim(),
        entryDate: new Date().toISOString(),
        shipper: origin,
      });
    }

    const currentUser = authService.getCurrentUser();
    const newTx = dbService.addGateTransaction({
      type: 'GATE_IN',
      containerId: target.id,
      containerNumber: cleanContainer,
      truckLicensePlate: truckPlate.trim().toUpperCase(),
      driverName: driverName.trim(),
      driverIdCard: driverIdCard.trim(),
      truckingCompany: truckingCompany.trim(),
      sealNumber: sealNumber.trim(),
      conditionStatus,
      allocatedYardSlot: slotStr,
      destinationOrOrigin: origin.trim(),
      eirNumber: `EIR-GI-${Math.floor(100000 + Math.random() * 900000)}`,
      operatorUsername: currentUser ? currentUser.username : 'gate_op',
      notes,
    });

    refreshData();
    setIsModalOpen(false);
    setSelectedTicket(newTx);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Transaksi Gate In (Truk Masuk & Pemeriksaan EIR)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
              {gateTransactions.length} Transaksi Hari Ini
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Pencatatan truk masuk pembawa kontainer ekspor/empty, verifikasi segel fisik, penerbitan slip EIR, dan alokasi slot lapangan.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Proses Gate In Baru</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">No. Transaksi Gate</th>
                <th className="py-3 px-4">No. EIR</th>
                <th className="py-3 px-4">No. Kontainer</th>
                <th className="py-3 px-4">Truk & Supir</th>
                <th className="py-3 px-4">Segel & Kondisi</th>
                <th className="py-3 px-4">Alokasi Slot Yard</th>
                <th className="py-3 px-4">Waktu Masuk</th>
                <th className="py-3 px-4 text-right">Tiket EIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {gateTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada transaksi Gate In.
                  </td>
                </tr>
              ) : (
                gateTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {tx.transactionNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {tx.eirNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {tx.containerNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{tx.truckLicensePlate}</div>
                      <div className="text-[10px] text-slate-400">{tx.driverName} ({tx.truckingCompany})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700 dark:text-slate-300">{tx.sealNumber || '-'}</div>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        tx.conditionStatus === 'GOOD'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.conditionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span>{tx.allocatedYardSlot || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {new Date(tx.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTicket(tx)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 text-blue-600 rounded-lg text-xs font-semibold flex items-center space-x-1 ml-auto"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak EIR</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Gate In */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Pemeriksaan & Registrasi Gate In</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Kontainer (ISO) *
                  </label>
                  <input
                    type="text"
                    required
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase font-bold text-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Polisi Truk *
                  </label>
                  <input
                    type="text"
                    required
                    value={truckPlate}
                    onChange={(e) => setTruckPlate(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Pengemudi / Supir *
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Perusahaan Angkutan / EMKL
                  </label>
                  <input
                    type="text"
                    value={truckingCompany}
                    onChange={(e) => setTruckingCompany(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Segel (Seal Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kondisi Fisik Peti Kemas
                  </label>
                  <select
                    value={conditionStatus}
                    onChange={(e) => setConditionStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="GOOD">BAIK / MULUS (Good Condition)</option>
                    <option value="DAMAGED">RUSAK / PENYOK (Damaged Body)</option>
                    <option value="SEAL_BROKEN">SEGEL RUSAK / TIDAK SESUAI</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asal Barang / Pabrik Shipper
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                {/* Yard Allocation */}
                <div className="col-span-2 p-3 bg-slate-100 dark:bg-slate-800/70 rounded-xl space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Penetapan Alokasi Slot Lapangan (Disarankan oleh TOS)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Blok</label>
                      <select
                        value={allocatedBlock}
                        onChange={(e) => setAllocatedBlock(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs"
                      >
                        {yardBlocks.map(b => (
                          <option key={b.id} value={b.id}>Blok {b.blockCode}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Bay</label>
                      <input
                        type="number"
                        value={allocatedBay}
                        onChange={(e) => setAllocatedBay(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Row</label>
                      <input
                        type="number"
                        value={allocatedRow}
                        onChange={(e) => setAllocatedRow(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Tier</label>
                      <input
                        type="number"
                        value={allocatedTier}
                        onChange={(e) => setAllocatedTier(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20"
                >
                  Konfirmasi Gate In & Terbitkan EIR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip EIR Modal (Print Preview) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h2 className="text-base font-black tracking-tight">PORTVESSEL TERMINAL PETI KEMAS</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                EQUIPMENT INTERCHANGE RECEIPT (EIR) - GATE IN
              </p>
              <div className="font-mono font-bold text-sm text-blue-600 mt-1">
                {selectedTicket.eirNumber}
              </div>
            </div>

            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">No. Transaksi:</span>
                <span className="font-bold">{selectedTicket.transactionNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Waktu Masuk:</span>
                <span>{new Date(selectedTicket.timestamp).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">No. Kontainer:</span>
                <span className="font-bold text-sm text-blue-700">{selectedTicket.containerNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">No. Polisi Truk:</span>
                <span className="font-bold">{selectedTicket.truckLicensePlate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Pengemudi:</span>
                <span>{selectedTicket.driverName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">No. Segel:</span>
                <span>{selectedTicket.sealNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1 bg-amber-50 p-1.5 rounded">
                <span className="text-amber-800 font-bold">ALOKASI SLOT YARD:</span>
                <span className="font-black text-amber-900 text-sm">{selectedTicket.allocatedYardSlot}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Petugas Gate:</span>
                <span>{selectedTicket.operatorUsername}</span>
              </div>
            </div>

            <div className="p-2 bg-slate-50 rounded text-center text-[10px] text-slate-500">
              *Harap letakkan kontainer tepat pada blok/bay/row/tier yang tertera di slip ini.
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
