import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  AlertCircle,
  Layers,
  ArrowUpDown,
  Download,
  Thermometer,
  ShieldAlert,
  MapPin
} from 'lucide-react';
import { Container, ContainerSize, ContainerStatus, ContainerType, OperationalStatus, YardBlock } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';

export const ContainerMaster: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [opStatusFilter, setOpStatusFilter] = useState<string>('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [viewDetail, setViewDetail] = useState<Container | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [containerNumber, setContainerNumber] = useState('');
  const [size, setSize] = useState<ContainerSize>('40ft_HC');
  const [type, setType] = useState<ContainerType>('DRY');
  const [status, setStatus] = useState<ContainerStatus>('FCL');
  const [opStatus, setOpStatus] = useState<OperationalStatus>('IN_YARD');
  const [tareWeight, setTareWeight] = useState(3800);
  const [grossWeight, setGrossWeight] = useState(25000);
  const [maxPayload, setMaxPayload] = useState(28500);
  const [ownerShippingLine, setOwnerShippingLine] = useState('Maersk Line A/S');
  const [yardBlockId, setYardBlockId] = useState('blk-a');
  const [yardBay, setYardBay] = useState(1);
  const [yardRow, setYardRow] = useState(1);
  const [yardTier, setYardTier] = useState(1);
  const [sealNumber, setSealNumber] = useState('');
  const [temperature, setTemperature] = useState<number | undefined>(undefined);
  const [dangerousGoodsClass, setDangerousGoodsClass] = useState('');
  const [consignee, setConsignee] = useState('');
  const [shipper, setShipper] = useState('');

  const refreshData = () => {
    setContainers(dbService.getContainers());
    setYardBlocks(dbService.getYardBlocks());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filtered list
  const filteredContainers = containers.filter((c) => {
    const matchesSearch = 
      c.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerShippingLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.consignee && c.consignee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.sealNumber && c.sealNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSize = sizeFilter === 'ALL' || c.size === sizeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesOpStatus = opStatusFilter === 'ALL' || c.operationalStatus === opStatusFilter;

    return matchesSearch && matchesSize && matchesStatus && matchesOpStatus;
  });

  const handleOpenCreate = () => {
    setEditingContainer(null);
    setContainerNumber('MSKU' + Math.floor(1000000 + Math.random() * 9000000));
    setSize('40ft_HC');
    setType('DRY');
    setStatus('FCL');
    setOpStatus('IN_YARD');
    setTareWeight(3800);
    setGrossWeight(24000);
    setMaxPayload(28500);
    setOwnerShippingLine('Maersk Line A/S');
    setYardBlockId('blk-a');
    setYardBay(4);
    setYardRow(2);
    setYardTier(1);
    setSealNumber('SL-' + Math.floor(100000 + Math.random() * 900000));
    setTemperature(undefined);
    setDangerousGoodsClass('');
    setConsignee('PT Logistik Nusantara Sejahtera');
    setShipper('Global Export Freight Ltd');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Container) => {
    setEditingContainer(c);
    setContainerNumber(c.containerNumber);
    setSize(c.size);
    setType(c.type);
    setStatus(c.status);
    setOpStatus(c.operationalStatus);
    setTareWeight(c.tareWeight);
    setGrossWeight(c.grossWeight);
    setMaxPayload(c.maxPayload);
    setOwnerShippingLine(c.ownerShippingLine);
    setYardBlockId(c.yardBlockId || 'blk-a');
    setYardBay(c.yardBay || 1);
    setYardRow(c.yardRow || 1);
    setYardTier(c.yardTier || 1);
    setSealNumber(c.sealNumber || '');
    setTemperature(c.temperature);
    setDangerousGoodsClass(c.dangerousGoodsClass || '');
    setConsignee(c.consignee || '');
    setShipper(c.shipper || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // ISO 6346 validation check (4 letters + 7 digits)
    const cleanNum = containerNumber.trim().toUpperCase();
    if (!/^[A-Z]{4}\d{7}$/.test(cleanNum)) {
      setFormError('Format Nomor Kontainer harus standar ISO 6346 (4 huruf kode pemilik + 7 digit angka, contoh: MSKU1234567).');
      return;
    }

    // Weight validation
    if (grossWeight < tareWeight) {
      setFormError('Berat Kotor (Gross Weight) tidak boleh lebih kecil dari Berat Kosong (Tare Weight).');
      return;
    }

    const payload = {
      ...(editingContainer ? { id: editingContainer.id } : {}),
      containerNumber: cleanNum,
      size,
      type,
      status,
      operationalStatus: opStatus,
      tareWeight: Number(tareWeight),
      grossWeight: Number(grossWeight),
      maxPayload: Number(maxPayload),
      ownerShippingLine,
      isoCode: size === '20ft' ? '22G1' : size === '40ft' ? '42G1' : '45G1',
      yardBlockId,
      yardBay: Number(yardBay),
      yardRow: Number(yardRow),
      yardTier: Number(yardTier),
      sealNumber: sealNumber.trim() || undefined,
      temperature: type === 'REEFER' && temperature !== undefined ? Number(temperature) : undefined,
      dangerousGoodsClass: dangerousGoodsClass.trim() || undefined,
      entryDate: editingContainer?.entryDate || new Date().toISOString(),
      exitDate: editingContainer?.exitDate,
      consignee: consignee.trim() || undefined,
      shipper: shipper.trim() || undefined,
    };

    dbService.saveContainer(payload as any);
    refreshData();
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      dbService.deleteContainer(deleteId);
      refreshData();
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Master Data Peti Kemas (Containers)
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-semibold">
              {containers.length} Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengelolaan spesifikasi fisik, nomor ISO 6346, posisi penumpukan yard, dan status operasional.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Peti Kemas Baru</span>
        </button>
      </div>

      {/* Filter and Search Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Pencarian</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="No. Kontainer / Pemilik / Segel..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Ukuran (Size)</label>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">Semua Ukuran (20ft, 40ft, HC)</option>
            <option value="20ft">20 Feet Standard</option>
            <option value="40ft">40 Feet Standard</option>
            <option value="40ft_HC">40 Feet High Cube (HC)</option>
            <option value="45ft">45 Feet High Cube</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Status Muatan</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">Semua Muatan (FCL, LCL, Empty)</option>
            <option value="FCL">FCL (Full Container Load)</option>
            <option value="LCL">LCL (Less than Container Load)</option>
            <option value="EMPTY">EMPTY (Kontainer Kosong)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-500 mb-1 font-semibold">Status Operasional</label>
          <select
            value={opStatusFilter}
            onChange={(e) => setOpStatusFilter(e.target.value)}
            className="w-full py-1.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
          >
            <option value="ALL">Semua Status Operasional</option>
            <option value="IN_YARD">IN_YARD (Di Lapangan)</option>
            <option value="DISCHARGED">DISCHARGED (Baru Bongkar)</option>
            <option value="STAGED">STAGED (Siap Muat)</option>
            <option value="LOADED">LOADED (Sudah di Kapal)</option>
            <option value="GATED_OUT">GATED_OUT (Sudah Keluar)</option>
            <option value="CUSTOMS_HOLD">CUSTOMS_HOLD (Tahan Bea Cukai)</option>
          </select>
        </div>
      </div>

      {/* Containers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">No. Kontainer</th>
                <th className="py-3 px-4">Tipe & Ukuran</th>
                <th className="py-3 px-4">Pemilik / Pelayaran</th>
                <th className="py-3 px-4">Muatan</th>
                <th className="py-3 px-4">Posisi Lapangan (Slot)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Berat Kotor</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContainers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada peti kemas yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredContainers.map((c) => {
                  const block = yardBlocks.find((b) => b.id === c.yardBlockId);
                  const slotStr = block ? `${block.blockCode}-${String(c.yardBay || 1).padStart(2,'0')}-${String(c.yardRow || 1).padStart(2,'0')}-${String(c.yardTier || 1).padStart(2,'0')}` : '-';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {c.containerNumber}
                        {c.dangerousGoodsClass && (
                          <span title={c.dangerousGoodsClass} className="ml-1.5 inline-block text-[10px] px-1 bg-amber-500 text-white rounded font-sans font-bold">
                            DG
                          </span>
                        )}
                        {c.type === 'REEFER' && (
                          <span title={`Reefer Temp: ${c.temperature ?? -20}°C`} className="ml-1 inline-block text-[10px] px-1 bg-cyan-500 text-white rounded font-sans font-bold">
                            ❄ {c.temperature ?? -20}°C
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {c.size.replace('_', ' ')}
                        </span>{' '}
                        <span className="text-slate-400 text-[11px]">({c.type})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {c.ownerShippingLine}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'FCL' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
                            : c.status === 'LCL'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {c.operationalStatus === 'GATED_OUT' || c.operationalStatus === 'LOADED' ? (
                          <span className="text-slate-400 italic">Di Luar Yard</span>
                        ) : (
                          <div className="flex items-center space-x-1 font-mono font-semibold text-slate-800 dark:text-slate-200">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                            <span>{slotStr}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.operationalStatus === 'IN_YARD'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : c.operationalStatus === 'CUSTOMS_HOLD'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                            : c.operationalStatus === 'STAGED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : c.operationalStatus === 'GATED_OUT'
                            ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                        }`}>
                          {c.operationalStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {c.grossWeight.toLocaleString('id-ID')} kg
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => setViewDetail(c)}
                          title="Lihat Detail Lengkap"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Peti Kemas"
                          className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          title="Hapus"
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {viewDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                  Peti Kemas Detail
                </span>
                <h3 className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100">
                  {viewDetail.containerNumber}
                </h3>
              </div>
              <button
                onClick={() => setViewDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Ukuran & Tipe</span>
                <span className="font-semibold">{viewDetail.size.replace('_', ' ')} / {viewDetail.type}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Status Muatan</span>
                <span className="font-semibold">{viewDetail.status} ({viewDetail.operationalStatus})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Berat Kosong (Tare)</span>
                <span className="font-semibold">{viewDetail.tareWeight.toLocaleString()} kg</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Berat Kotor (Gross)</span>
                <span className="font-semibold">{viewDetail.grossWeight.toLocaleString()} kg</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Nomor Segel (Seal)</span>
                <span className="font-semibold font-mono">{viewDetail.sealNumber || 'Tanpa Segel'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Shipping Line</span>
                <span className="font-semibold">{viewDetail.ownerShippingLine}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 col-span-2">
                <span className="text-slate-400 block text-[10px]">Consignee / Penerima</span>
                <span className="font-semibold">{viewDetail.consignee || '-'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 col-span-2">
                <span className="text-slate-400 block text-[10px]">Shipper / Pengirim</span>
                <span className="font-semibold">{viewDetail.shipper || '-'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Box className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">
                  {editingContainer ? 'Edit Data Peti Kemas' : 'Tambah Peti Kemas Baru'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Kontainer (ISO 6346) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                    placeholder="Contoh: MSKU8492014"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase font-bold text-blue-600"
                  />
                  <span className="text-[10px] text-slate-400">4 huruf prefix + 7 angka serial</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Shipping Line *
                  </label>
                  <select
                    value={ownerShippingLine}
                    onChange={(e) => setOwnerShippingLine(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Maersk Line A/S">Maersk Line A/S</option>
                    <option value="Ocean Network Express (ONE)">Ocean Network Express (ONE)</option>
                    <option value="Evergreen Marine Corp">Evergreen Marine Corp</option>
                    <option value="PT Meratus Line">PT Meratus Line</option>
                    <option value="PT Salam Pacific Indonesia Lines (SPIL)">PT Salam Pacific (SPIL)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ukuran (Size)
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as ContainerSize)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="20ft">20 Feet Standard</option>
                    <option value="40ft">40 Feet Standard</option>
                    <option value="40ft_HC">40 Feet High Cube (HC)</option>
                    <option value="45ft">45 Feet High Cube</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipe Kontainer
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ContainerType)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="DRY">Dry Container (General Cargo)</option>
                    <option value="REEFER">Reefer (Pendingin)</option>
                    <option value="OPEN_TOP">Open Top</option>
                    <option value="FLAT_RACK">Flat Rack</option>
                    <option value="TANK">ISO Tank (Liquid/Chemical)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Muatan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ContainerStatus)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="FCL">FCL (Full Container Load)</option>
                    <option value="LCL">LCL (Less than Container Load)</option>
                    <option value="EMPTY">EMPTY (Kontainer Kosong)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Operasional
                  </label>
                  <select
                    value={opStatus}
                    onChange={(e) => setOpStatus(e.target.value as OperationalStatus)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="IN_YARD">IN_YARD (Di Lapangan)</option>
                    <option value="DISCHARGED">DISCHARGED (Bongkar)</option>
                    <option value="STAGED">STAGED (Staging Muat)</option>
                    <option value="LOADED">LOADED (Di Kapal)</option>
                    <option value="GATED_OUT">GATED_OUT (Keluar Gate)</option>
                    <option value="CUSTOMS_HOLD">CUSTOMS_HOLD (Tahan BC)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Berat Kosong (Tare Weight - kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Berat Total Kotor (Gross Weight - kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                {/* Yard Allocation Block */}
                <div className="col-span-1 sm:col-span-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Alokasi Slot Lapangan Penumpukan (Yard Slotting)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Blok</label>
                      <select
                        value={yardBlockId}
                        onChange={(e) => setYardBlockId(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      >
                        {yardBlocks.map((b) => (
                          <option key={b.id} value={b.id}>
                            Blok {b.blockCode} ({b.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Bay (01-20)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={yardBay}
                        onChange={(e) => setYardBay(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Row (01-06)</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={yardRow}
                        onChange={(e) => setYardRow(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold block">Tier (01-05)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={yardTier}
                        onChange={(e) => setYardTier(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Segel (Seal Number)
                  </label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    placeholder="Contoh: ML-99201"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Barang Berbahaya (DG / IMO Class)
                  </label>
                  <input
                    type="text"
                    value={dangerousGoodsClass}
                    onChange={(e) => setDangerousGoodsClass(e.target.value)}
                    placeholder="Kosongkan jika bukan DG (e.g. IMO Class 3)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Consignee (Penerima Barang)
                  </label>
                  <input
                    type="text"
                    value={consignee}
                    onChange={(e) => setConsignee(e.target.value)}
                    placeholder="PT Perusahaan Penerima..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan Peti Kemas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Hapus Data Peti Kemas?
            </h4>
            <p className="text-xs text-slate-500">
              Tindakan ini akan menghapus data kontainer dari database operasional terminal.
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
