import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Plus, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  FileText,
  Search,
  X
} from 'lucide-react';
import { Invoice, Container } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';

export const BillingTransactionView: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states
  const [selectedContainerNum, setSelectedContainerNum] = useState('');
  const [consignee, setConsignee] = useState('PT Mayora Indah Tbk');
  const [dwellingDays, setDwellingDays] = useState(4);
  const [containerSize, setContainerSize] = useState<'20ft' | '40ft'>('40ft');
  const [isReefer, setIsReefer] = useState(false);

  const refreshData = () => {
    setInvoices(dbService.getInvoices());
    const cList = dbService.getContainers();
    setContainers(cList);
    if (cList.length > 0 && !selectedContainerNum) {
      setSelectedContainerNum(cList[0].containerNumber);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleContainerChange = (num: string) => {
    setSelectedContainerNum(num);
    const c = containers.find(item => item.containerNumber === num);
    if (c) {
      setConsignee(c.consignee || 'PT Mitra Logistik Prima');
      setContainerSize(c.size === '20ft' ? '20ft' : '40ft');
      setIsReefer(c.type === 'REEFER');
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculations based on tariffs
    const loloRate = containerSize === '20ft' ? 285000 : 425000;
    const storageDailyRate = containerSize === '20ft' ? 27500 : 55000;
    const storageTotal = dwellingDays * storageDailyRate;
    const reeferTotal = isReefer ? dwellingDays * 3 * 180000 : 0;
    const adminFee = 35000;
    const subtotal = loloRate + storageTotal + reeferTotal + adminFee;
    const taxPpn = Math.round(subtotal * 0.11);
    const totalAmount = subtotal + taxPpn;

    const newInv = dbService.saveInvoice({
      consigneeOrShipper: consignee,
      containerNumber: selectedContainerNum,
      vesselName: 'MV NUSANTARA GLORY',
      entryDate: new Date(Date.now() - dwellingDays * 86400000).toISOString(),
      exitDate: new Date().toISOString(),
      dwellingDays: Number(dwellingDays),
      storageFee: storageTotal,
      liftOnOffFee: loloRate,
      reeferFee: reeferTotal,
      adminFee,
      taxPpn,
      totalAmount,
      paymentStatus: 'PAID',
      paymentDate: new Date().toISOString(),
    });

    refreshData();
    setIsModalOpen(false);
    setSelectedInvoice(newInv);
  };

  const handleTogglePayment = (inv: Invoice) => {
    const updated = {
      ...inv,
      paymentStatus: inv.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID',
      paymentDate: inv.paymentStatus === 'PAID' ? undefined : new Date().toISOString(),
    };
    dbService.saveInvoice(updated as any);
    refreshData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Transaksi Billing & Penagihan Jasa Kepelabuhanan
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
              {invoices.length} Faktur Tagihan
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Penghitungan otomatis biaya Lift-On/Lift-Off, Masa Penumpukan (Dwelling Time), Monitoring Reefer, dan PPN 11%.
          </p>
        </div>

        <button
          onClick={() => {
            if (containers.length > 0) handleContainerChange(containers[0].containerNumber);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Tagihan / Invoice Baru</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">No. Invoice</th>
              <th className="py-3 px-4">Consignee / Pemilik</th>
              <th className="py-3 px-4">No. Kontainer</th>
              <th className="py-3 px-4">Lama Inap (Dwelling)</th>
              <th className="py-3 px-4">Total Tagihan</th>
              <th className="py-3 px-4">Status Bayar</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Belum ada faktur penagihan.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {inv.consigneeOrShipper}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {inv.containerNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {inv.dwellingDays} Hari
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                    Rp {inv.totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePayment(inv)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        inv.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {inv.paymentStatus === 'PAID' ? '✓ LUNAS' : 'BELUM DIBAYAR'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold flex items-center space-x-1 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Faktur</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-blue-500" />
                <span>Penerbitan Invoice Jasa Terminal Peti Kemas</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Peti Kemas *
                </label>
                <select
                  value={selectedContainerNum}
                  onChange={(e) => handleContainerChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl font-mono font-bold"
                >
                  {containers.map(c => (
                    <option key={c.id} value={c.containerNumber}>
                      {c.containerNumber} - {c.size} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Consignee / Pemilik Barang *
                </label>
                <input
                  type="text"
                  required
                  value={consignee}
                  onChange={(e) => setConsignee(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lama Inap (Dwelling Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={dwellingDays}
                    onChange={(e) => setDwellingDays(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ukuran Kontainer
                  </label>
                  <select
                    value={containerSize}
                    onChange={(e) => setContainerSize(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 rounded-lg"
                  >
                    <option value="20ft">20 Feet</option>
                    <option value="40ft">40 Feet / HC</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-900 dark:text-blue-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Biaya Lo-Lo ({containerSize}):</span>
                  <span className="font-mono">Rp {(containerSize === '20ft' ? 285000 : 425000).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Penumpukan ({dwellingDays} hari):</span>
                  <span className="font-mono">Rp {(dwellingDays * (containerSize === '20ft' ? 27500 : 55000)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Administrasi & EIR:</span>
                  <span className="font-mono">Rp 35.000</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-200 dark:border-blue-800 font-bold">
                  <span>Estimasi Total (+ PPN 11%):</span>
                  <span className="font-mono text-blue-700 dark:text-blue-300">
                    Rp {Math.round(((containerSize === '20ft' ? 285000 : 425000) + (dwellingDays * (containerSize === '20ft' ? 27500 : 55000)) + 35000) * 1.11).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  Terbitkan Faktur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Print Preview Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl text-slate-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-black tracking-tight text-blue-900">
                  PORTVESSEL NUSANTARA PORT
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  FAKTUR TAGIHAN JASA KEPELABUHANAN (PORT INVOICE)
                </p>
                <div className="font-mono font-bold text-xs text-blue-700 mt-0.5">
                  {selectedInvoice.invoiceNumber}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-500">
                <div>Tanggal: {new Date(selectedInvoice.createdAt).toLocaleDateString('id-ID')}</div>
                <span className="inline-block mt-1 font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  {selectedInvoice.paymentStatus === 'PAID' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Penerima Jasa:</span>
                <span className="font-bold">{selectedInvoice.consigneeOrShipper}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-500">No. Kontainer:</span>
                <span className="font-bold text-blue-700">{selectedInvoice.containerNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa Penumpukan:</span>
                <span className="font-bold font-mono">{selectedInvoice.dwellingDays} Hari</span>
              </div>
            </div>

            {/* Breakdown Table */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px]">
                  <th className="py-1 text-left">Komponen Jasa</th>
                  <th className="py-1 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-1.5 font-sans">Jasa Lift-On / Lift-Off (Lo-Lo)</td>
                  <td className="py-1.5 text-right">Rp {selectedInvoice.liftOnOffFee.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-sans">Jasa Penumpukan Lapangan ({selectedInvoice.dwellingDays} Hari)</td>
                  <td className="py-1.5 text-right">Rp {selectedInvoice.storageFee.toLocaleString('id-ID')}</td>
                </tr>
                {selectedInvoice.reeferFee > 0 && (
                  <tr>
                    <td className="py-1.5 font-sans">Monitoring Listrik Reefer</td>
                    <td className="py-1.5 text-right">Rp {selectedInvoice.reeferFee.toLocaleString('id-ID')}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-1.5 font-sans">Administrasi Gate & Penerbitan EIR</td>
                  <td className="py-1.5 text-right">Rp {selectedInvoice.adminFee.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-sans text-slate-500">PPN (11%)</td>
                  <td className="py-1.5 text-right">Rp {selectedInvoice.taxPpn.toLocaleString('id-ID')}</td>
                </tr>
                <tr className="font-bold text-sm bg-blue-50/60">
                  <td className="py-2 px-1 text-blue-900 font-sans">TOTAL TAGIHAN</td>
                  <td className="py-2 px-1 text-right text-blue-900">
                    Rp {selectedInvoice.totalAmount.toLocaleString('id-ID')}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[10px] text-slate-500">
              <div>
                <span className="block font-bold">PT PELABUHAN NUSANTARA PERSERO</span>
                <span>NPWP: 01.328.910.4-022.000</span>
              </div>
              <div className="font-mono text-center">
                <div className="h-8 w-24 bg-slate-200 flex items-center justify-center font-bold text-[9px] tracking-widest">
                  ||||| | ||||| |||
                </div>
                <span>TAX INVOICE OK</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Faktur Tagihan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
