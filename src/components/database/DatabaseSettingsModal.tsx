import React, { useState } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  ExternalLink,
  Shield, 
  Zap, 
  Flame, 
  Server,
  Layers,
  Code
} from 'lucide-react';
import { dbService } from '../../services/db.ts';
import { DatabaseConfig, DatabaseType } from '../../types/index.ts';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [config, setConfig] = useState<DatabaseConfig>(dbService.getConfig());
  const [activeTab, setActiveTab] = useState<DatabaseType | 'SQL_EXPORT'>(config.type);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form states for Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(config.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(config.supabaseAnonKey || '');

  // Form states for Neon
  const [neonHost, setNeonHost] = useState(config.neonHost || '');
  const [neonDatabase, setNeonDatabase] = useState(config.neonDatabase || 'neondb');

  // Form states for Firebase
  const [firebaseProject, setFirebaseProject] = useState(config.firebaseProjectId || '');

  if (!isOpen) return null;

  const handleTestAndSaveSupabase = async () => {
    setIsTesting(true);
    setStatusMsg({ type: 'info', text: 'Menghubungkan ke Supabase...' });

    try {
      const res = await dbService.setConfig({
        type: 'SUPABASE',
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseKey.trim(),
      });

      setIsTesting(false);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Koneksi Supabase Aktif dan Berhasil Diverifikasi!' });
        setConfig(dbService.getConfig());
        onConfigChanged();
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: unknown) {
      setIsTesting(false);
      setStatusMsg({ type: 'error', text: `Gagal: ${err instanceof Error ? err.message : String(err)}` });
    }
  };

  const handleTestAndSaveNeon = async () => {
    setIsTesting(true);
    setStatusMsg({ type: 'info', text: 'Menghubungkan ke Neon PostgreSQL...' });

    setTimeout(async () => {
      const res = await dbService.setConfig({
        type: 'NEON',
        neonHost: neonHost.trim(),
        neonDatabase: neonDatabase.trim(),
      });
      setIsTesting(false);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Konfigurasi Neon PostgreSQL Tersimpan dan Terhubung!' });
        setConfig(dbService.getConfig());
        onConfigChanged();
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    }, 600);
  };

  const handleTestAndSaveFirebase = async () => {
    setIsTesting(true);
    setStatusMsg({ type: 'info', text: 'Menghubungkan ke Firebase...' });

    setTimeout(async () => {
      const res = await dbService.setConfig({
        type: 'FIREBASE',
        firebaseProjectId: firebaseProject.trim(),
      });
      setIsTesting(false);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Konfigurasi Firebase Project Tersimpan!' });
        setConfig(dbService.getConfig());
        onConfigChanged();
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    }, 500);
  };

  const handleSetLocalPersistent = async () => {
    const res = await dbService.setConfig({ type: 'LOCAL_PERSISTENT' });
    setStatusMsg({ type: 'success', text: 'Beralih ke Local Persistent Database Engine.' });
    setConfig(dbService.getConfig());
    onConfigChanged();
  };

  const handleCopySql = () => {
    const sql = dbService.generatePostgresSchema();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin me-reset database ke data awal standar pelabuhan?')) {
      dbService.resetToDefaultSeed();
      setStatusMsg({ type: 'success', text: 'Data terminal berhasil di-reset ke data bawaan!' });
      onConfigChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm lg:text-base leading-tight">
                Integrasi Real Database (Supabase, Neon, Firebase)
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih dan hubungkan database cloud aktif untuk operasional terminal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Database Engine Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3 space-x-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('LOCAL_PERSISTENT')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'LOCAL_PERSISTENT'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Local Persistent</span>
          </button>

          <button
            onClick={() => setActiveTab('SUPABASE')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'SUPABASE'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Supabase DB</span>
          </button>

          <button
            onClick={() => setActiveTab('NEON')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'NEON'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-cyan-500" />
            <span>Neon DB (PostgreSQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('FIREBASE')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'FIREBASE'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Firebase</span>
          </button>

          <button
            onClick={() => setActiveTab('SQL_EXPORT')}
            className={`pb-2.5 px-3 border-b-2 flex items-center space-x-1.5 transition ${
              activeTab === 'SQL_EXPORT'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-indigo-500" />
            <span>Export DDL SQL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2.5 border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : statusMsg.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB: LOCAL PERSISTENT */}
          {activeTab === 'LOCAL_PERSISTENT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-300 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Engine Database Aktif: Local Persistent Browser Storage</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Data tersimpan secara otomatis dan persisten di browser. Semua aksi CRUD (Create, Read, Update, Delete) berjalan instan tanpa perlu akun cloud pihak ketiga.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Total Kontainer di Yard:</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {dbService.getContainers().length} Peti Kemas
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Kapal Terjadwal / Sandar:</span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {dbService.getVessels().length} Kapal
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSetLocalPersistent}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Gunakan Engine Local Persistent
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-semibold transition"
                >
                  Reset ke Data Pabrikan Standar
                </button>
              </div>
            </div>
          )}

          {/* TAB: SUPABASE */}
          {activeTab === 'SUPABASE' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                Hubungkan aplikasi ini ke proyek <strong>Supabase</strong> Anda untuk sinkronisasi cloud real-time dua arah.
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                <p className="font-semibold mb-1">Panduan Cepat Supabase:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Buat project gratis di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline">supabase.com</a></li>
                  <li>Buka tab <strong>Export DDL SQL</strong> di atas, salin skrip SQL dan jalankan di Supabase SQL Editor.</li>
                  <li>Salin Project URL dan Anon Key dari Project Settings &gt; API ke form di atas, lalu klik Tes & Simpan.</li>
                </ol>
              </div>

              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestAndSaveSupabase}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Verifikasi & Simpan Koneksi Supabase</span>
              </button>
            </div>
          )}

          {/* TAB: NEON DB */}
          {activeTab === 'NEON' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-800 dark:text-cyan-300">
                Hubungkan aplikasi ini ke <strong>Neon Serverless PostgreSQL</strong>.
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Neon Host / Connection String
                  </label>
                  <input
                    type="text"
                    value={neonHost}
                    onChange={(e) => setNeonHost(e.target.value)}
                    placeholder="ep-example-123456.ap-southeast-1.aws.neon.tech"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={neonDatabase}
                    onChange={(e) => setNeonDatabase(e.target.value)}
                    placeholder="neondb"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestAndSaveNeon}
                className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                <span>Verifikasi & Simpan Koneksi Neon DB</span>
              </button>
            </div>
          )}

          {/* TAB: FIREBASE */}
          {activeTab === 'FIREBASE' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                Konfigurasi <strong>Google Firebase Firestore</strong> untuk sinkronisasi dokumen realtime.
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Firebase Project ID
                  </label>
                  <input
                    type="text"
                    value={firebaseProject}
                    onChange={(e) => setFirebaseProject(e.target.value)}
                    placeholder="contoh: portvessel-tos-prod"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestAndSaveFirebase}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                <span>Simpan Konfigurasi Firebase</span>
              </button>
            </div>
          )}

          {/* TAB: SQL SCHEMA EXPORT */}
          {activeTab === 'SQL_EXPORT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    PostgreSQL DDL Migration Script
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Salin skrip ini dan tempel di Supabase SQL Editor atau Neon Console
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5"
                >
                  {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800">
                  {dbService.generatePostgresSchema()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Status Terkoneksi: <span className="font-bold text-emerald-600">{config.type}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-semibold transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
