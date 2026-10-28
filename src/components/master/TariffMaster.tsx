import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Check, X, ShieldCheck } from 'lucide-react';
import { TariffItem } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';

export const TariffMaster: React.FC = () => {
  const [tariffs, setTariffs] = useState<TariffItem[]>([]);
  const [editingTariff, setEditingTariff] = useState<TariffItem | null>(null);
  const [rateInput, setRateInput] = useState<number>(0);

  const refreshData = () => {
    setTariffs(dbService.getTariffs());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleEditRate = (t: TariffItem) => {
    setEditingTariff(t);
    setRateInput(t.ratePerUnit);
  };

  const handleSaveRate = () => {
    if (editingTariff) {
      dbService.saveTariff({
        ...editingTariff,
        ratePerUnit: Number(rateInput),
      });
      refreshData();
      setEditingTariff(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Master Tarif Layanan Terminal (Port Tariffs & Surcharges)
        </h1>
        <p className="text-xs text-slate-500">
          Tarif resmi jasa kepelabuhanan: Lift-On/Lift-Off (Lo-Lo), Penumpukan Lapangan (Storage), Reefer Monitoring, dan Administrasi Gate.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="py-3.5 px-4">Kode Tarif</th>
              <th className="py-3.5 px-4">Deskripsi Layanan</th>
              <th className="py-3.5 px-4">Kategori Jasa</th>
              <th className="py-3.5 px-4">Ukuran Kontainer</th>
              <th className="py-3.5 px-4">Tarif Satuan (IDR)</th>
              <th className="py-3.5 px-4">Satuan Hitung</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {tariffs.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                  {t.code}
                </td>
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                  {t.description}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {t.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  {t.size}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {editingTariff?.id === t.id ? (
                    <input
                      type="number"
                      value={rateInput}
                      onChange={(e) => setRateInput(Number(e.target.value))}
                      className="w-32 px-2 py-1 bg-white dark:bg-slate-800 border border-blue-500 rounded font-mono text-xs"
                    />
                  ) : (
                    `Rp ${t.ratePerUnit.toLocaleString('id-ID')}`
                  )}
                </td>
                <td className="py-3 px-4 text-slate-500 font-medium text-[11px]">
                  {t.unitOfMeasure.replace('PER_', 'Per ')}
                </td>
                <td className="py-3 px-4 text-right">
                  {editingTariff?.id === t.id ? (
                    <div className="space-x-1">
                      <button
                        onClick={handleSaveRate}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingTariff(null)}
                        className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditRate(t)}
                      className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded text-xs font-semibold"
                    >
                      Ubah Tarif
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
