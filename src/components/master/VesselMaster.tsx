import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Anchor, 
  Clock, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Vessel } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';

export const VesselMaster: React.FC = () => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [vesselName, setVesselName] = useState('');
  const [callSign, setCallSign] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [flag, setFlag] = useState('Indonesia');
  const [capacityTEU, setCapacityTEU] = useState(2500);
  const [lengthOverall, setLengthOverall] = useState(210);
  const [shippingLine, setShippingLine] = useState('PT Meratus Line');
  const [status, setStatus] = useState<'SCHEDULED' | 'ANCHORAGE' | 'BERTHED' | 'DEPARTED'>('BERTHED');
  const [berthLocation, setBerthLocation] = useState('Dermaga 01');
  const [eta, setEta] = useState(new Date().toISOString().slice(0, 16));
  const [etd, setEtd] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
  const [totalDischarge, setTotalDischarge] = useState(350);
  const [totalLoading, setTotalLoading] = useState(300);

  const refreshData = () => {
    setVessels(dbService.getVessels());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch = 
      v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.imoNumber.includes(searchTerm) ||
      v.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.shippingLine.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingVessel(null);
    setVesselName('MV NUSANTARA EXPRESS');
    setCallSign('YB' + Math.floor(100 + Math.random() * 900));
    setImoNumber(String(Math.floor(9000000 + Math.random() * 999999)));
    setFlag('Indonesia');
    setCapacityTEU(3200);
    setLengthOverall(225);
    setShippingLine('PT Meratus Line');
    setStatus('BERTHED');
    setBerthLocation('Dermaga 01 (Quay Crane 01 & 02)');
    setEta(new Date().toISOString().slice(0, 16));
    setEtd(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16));
    setTotalDischarge(450);
    setTotalLoading(410);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vessel) => {
    setEditingVessel(v);
    setVesselName(v.vesselName);
    setCallSign(v.callSign);
    setImoNumber(v.imoNumber);
    setFlag(v.flag);
    setCapacityTEU(v.capacityTEU);
    setLengthOverall(v.lengthOverall);
    setShippingLine(v.shippingLine);
    setStatus(v.status);
    setBerthLocation(v.berthLocation || 'Dermaga 01');
    setEta(v.eta.slice(0, 16));
    setEtd(v.etd.slice(0, 16));
    setTotalDischarge(v.totalDischargePlanned);
    setTotalLoading(v.totalLoadingPlanned);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!/^\d{7}$/.test(imoNumber.trim())) {
      setFormError('Nomor IMO Kapal harus tepat 7 digit angka standar internasional.');
      return;
    }

    const payload = {
      ...(editingVessel ? { id: editingVessel.id } : {}),
      vesselName: vesselName.trim().toUpperCase(),
      callSign: callSign.trim().toUpperCase(),
      imoNumber: imoNumber.trim(),
      flag,
      capacityTEU: Number(capacityTEU),
      lengthOverall: Number(lengthOverall),
      shippingLine,
      status,
      berthLocation,
      eta: new Date(eta).toISOString(),
      etd: new Date(etd).toISOString(),
      ata: status === 'BERTHED' ? new Date(eta).toISOString() : undefined,
      totalDischargePlanned: Number(totalDischarge),
      totalLoadingPlanned: Number(totalLoading),
    };

    dbService.saveVessel(payload as any);
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      dbService.deleteVessel(deleteId);
      refreshData();
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Master Data Kapal (Vessels & Berth)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 font-semibold">
              {vessels.length} Kapal Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Jadwal kedatangan/keberangkatan kapal, alokasi dermaga tambat, dan rencana muat/bongkar peti kemas.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kapal Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Cari Kapal</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nama kapal, Call sign, IMO, Pelayaran..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Status Sandar / Pelayaran</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">Semua Status (Sandar, Labuh, Berangkat)</option>
            <option value="BERTHED">BERTHED (Sedang Sandar di Dermaga)</option>
            <option value="ANCHORAGE">ANCHORAGE (Tunggu Labuh Kolam)</option>
            <option value="SCHEDULED">SCHEDULED (Terjadwal Datang)</option>
            <option value="DEPARTED">DEPARTED (Sudah Berangkat)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Nama Kapal</th>
                <th className="py-3 px-4">Call Sign / IMO</th>
                <th className="py-3 px-4">Agen Pelayaran</th>
                <th className="py-3 px-4">Kapasitas TEU</th>
                <th className="py-3 px-4">Status & Posisi Dermaga</th>
                <th className="py-3 px-4">Jadwal (ETA / ETD)</th>
                <th className="py-3 px-4">Rencana Bongkar / Muat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVessels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada kapal ditemukan.
                  </td>
                </tr>
              ) : (
                filteredVessels.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                        <Ship className="w-4 h-4 text-blue-500" />
                        <span>{v.vesselName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Bendera: {v.flag} • LOA: {v.lengthOverall}m
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{v.callSign}</div>
                      <div className="text-[10px] text-slate-400">IMO: {v.imoNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {v.shippingLine}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {v.capacityTEU.toLocaleString()} TEU
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                          v.status === 'BERTHED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : v.status === 'ANCHORAGE'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {v.status}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {v.berthLocation || 'Menunggu penetapan dermaga'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px]">
                      <div>
                        <span className="text-slate-400">ETA:</span>{' '}
                        {new Date(v.eta).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <span className="text-slate-400">ETD:</span>{' '}
                        {new Date(v.etd).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 text-[11px]">
                        <span className="text-emerald-600 font-semibold flex items-center">
                          <ArrowDownLeft className="w-3 h-3 mr-0.5" />
                          {v.totalDischargePlanned}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">/</span>
                        <span className="text-blue-600 font-semibold flex items-center">
                          <ArrowUpRight className="w-3 h-3 mr-0.5" />
                          {v.totalLoadingPlanned}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(v.id)}
                        className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Ship className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingVessel ? 'Edit Data Kapal' : 'Pendaftaran Kapal Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kapal (Vessel Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor IMO (7 Digit Angka) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={7}
                    value={imoNumber}
                    onChange={(e) => setImoNumber(e.target.value)}
                    placeholder="9421882"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Call Sign *
                  </label>
                  <input
                    type="text"
                    required
                    value={callSign}
                    onChange={(e) => setCallSign(e.target.value.toUpperCase())}
                    placeholder="YBYB9"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bendera Kapal (Flag)
                  </label>
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kapasitas Maksimal (TEU)
                  </label>
                  <input
                    type="number"
                    value={capacityTEU}
                    onChange={(e) => setCapacityTEU(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Panjang Kapal / LOA (Meter)
                  </label>
                  <input
                    type="number"
                    value={lengthOverall}
                    onChange={(e) => setLengthOverall(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agen Pelayaran / Shipping Line
                  </label>
                  <input
                    type="text"
                    value={shippingLine}
                    onChange={(e) => setShippingLine(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Kapal
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="BERTHED">BERTHED (Sandar Dermaga)</option>
                    <option value="ANCHORAGE">ANCHORAGE (Tunggu Labuh)</option>
                    <option value="SCHEDULED">SCHEDULED (Jadwal Datang)</option>
                    <option value="DEPARTED">DEPARTED (Berangkat)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alokasi Dermaga / Quay
                  </label>
                  <input
                    type="text"
                    value={berthLocation}
                    onChange={(e) => setBerthLocation(e.target.value)}
                    placeholder="Dermaga 01 (Quay Crane 01)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Perkiraan Tiba (ETA)
                  </label>
                  <input
                    type="datetime-local"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Perkiraan Berangkat (ETD)
                  </label>
                  <input
                    type="datetime-local"
                    value={etd}
                    onChange={(e) => setEtd(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Bongkar (TEU)
                  </label>
                  <input
                    type="number"
                    value={totalDischarge}
                    onChange={(e) => setTotalDischarge(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Muat (TEU)
                  </label>
                  <input
                    type="number"
                    value={totalLoading}
                    onChange={(e) => setTotalLoading(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Simpan Kapal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Hapus Data Kapal?
            </h4>
            <p className="text-xs text-slate-500">
              Semua jadwal dan manifest kapal ini akan dihapus dari terminal.
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
