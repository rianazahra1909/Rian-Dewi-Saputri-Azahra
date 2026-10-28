import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Mail, Phone, Globe, X } from 'lucide-react';
import { ShippingLine } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';

export const ShippingLineMaster: React.FC = () => {
  const [lines, setLines] = useState<ShippingLine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ShippingLine | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contracts, setContracts] = useState(5);

  const refreshData = () => {
    setLines(dbService.getShippingLines());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleOpenCreate = () => {
    setEditingLine(null);
    setCode('CMA');
    setName('CMA CGM Shipping Line');
    setCountry('France');
    setContactPerson('Bambang Irawan');
    setPhone('+62 21 2994 1234');
    setEmail('ops.jkt@cma-cgm.com');
    setContracts(8);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: ShippingLine) => {
    setEditingLine(l);
    setCode(l.code);
    setName(l.name);
    setCountry(l.country);
    setContactPerson(l.contactPerson);
    setPhone(l.phone);
    setEmail(l.email);
    setContracts(l.activeContracts);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.saveShippingLine({
      ...(editingLine ? { id: editingLine.id } : {}),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      country: country.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      activeContracts: Number(contracts),
    });
    refreshData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus shipping line ini?')) {
      dbService.deleteShippingLine(id);
      refreshData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Master Agen Pelayaran & Ekspedisi (Shipping Lines & EMKL)
          </h1>
          <p className="text-xs text-slate-500">
            Daftar maskapai pelayaran internasional/domestik dan mitra trucking di terminal.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Shipping Line</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lines.map((l) => (
          <div
            key={l.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  {l.code}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                  {l.name}
                </h3>
                <span className="text-xs text-slate-400">{l.country}</span>
              </div>
              <div className="space-x-1">
                <button onClick={() => handleOpenEdit(l)} className="p-1 text-slate-400 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(l.id)} className="p-1 text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">PIC:</span>
                <span className="font-semibold">{l.contactPerson}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{l.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{l.email}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-400">Kontrak Layanan:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{l.activeContracts} Berjalan</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {editingLine ? 'Edit Shipping Line' : 'Tambah Shipping Line'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Line (3-4 Huruf)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan Pelayaran</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Negara Asal</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Person in Charge (PIC)</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon Operasional</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 font-semibold">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
