import React, { useState, useEffect } from 'react';
import { 
  Anchor, 
  Database, 
  Clock, 
  LogOut, 
  User as UserIcon, 
  Bell, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { User, DatabaseConfig } from '../../types/index.ts';
import { dbService } from '../../services/db.ts';
import { authService, PRESET_USERS } from '../../services/auth.ts';

interface NavbarProps {
  user: User | null;
  onOpenDbModal: () => void;
  onOpenLoginModal: () => void;
  onSearchGlobal: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onOpenDbModal, 
  onOpenLoginModal,
  onSearchGlobal 
}) => {
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(dbService.getConfig());
  const [timeStr, setTimeStr] = useState<string>('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('id-ID', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll db config status occasionally
  useEffect(() => {
    const checkDb = () => {
      setDbConfig(dbService.getConfig());
    };
    const id = setInterval(checkDb, 3000);
    return () => clearInterval(id);
  }, []);

  const getDbBadge = () => {
    switch (dbConfig.type) {
      case 'SUPABASE':
        return {
          label: 'Supabase DB',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      case 'NEON':
        return {
          label: 'Neon PostgreSQL',
          color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          dot: 'bg-cyan-500',
        };
      case 'FIREBASE':
        return {
          label: 'Firebase Store',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      default:
        return {
          label: 'Local Persistent DB',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          dot: 'bg-blue-500',
        };
    }
  };

  const badge = getDbBadge();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Terminal Info */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Anchor className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-base lg:text-lg tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              PORTVESSEL TOS
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
              V2.4 OPERASIONAL
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            Terminal Peti Kemas Nusantara International Port
          </p>
        </div>
      </div>

      {/* Center Search & Live Time */}
      <div className="hidden md:flex items-center space-x-4 max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onSearchGlobal(e.target.value);
            }}
            placeholder="Cari kontainer (e.g. MSKU, ONEU), kapal, atau EIR..."
            className="w-full text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Controls: Database Status & User Info */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Live System Time */}
        <div className="hidden xl:flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span className="font-mono text-[11px]">{timeStr}</span>
        </div>

        {/* Database Connection Pill */}
        <button
          onClick={onOpenDbModal}
          title="Klik untuk konfigurasi Supabase, Neon DB, atau Firebase"
          className={`flex items-center space-x-2 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition hover:opacity-90 ${badge.color}`}
        >
          <div className="relative flex items-center justify-center">
            <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`} />
          </div>
          <Database className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-semibold">{badge.label}</span>
          <span className="text-[10px] opacity-70 underline">Kelola</span>
        </button>

        {/* User Session Profile */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/30 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.username.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  {user.role === 'SUPER_ADMIN' ? 'Super Admin TOS' : user.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="border-b border-slate-100 dark:border-slate-700/60 pb-2 mb-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                    {user.department}
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Ganti Peran Cepat (Simulasi):</p>
                  <div className="space-y-1">
                    {PRESET_USERS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          authService.quickLoginAs(preset.role);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 text-xs rounded-lg transition flex items-center justify-between ${
                          user.role === preset.role 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>{preset.role.replace('_', ' ')}</span>
                        <span className="text-[10px] text-slate-400">{preset.username}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onOpenLoginModal();
                      setUserDropdownOpen(false);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Ganti Akun</span>
                  </button>
                  <button
                    onClick={() => {
                      authService.logout();
                      setUserDropdownOpen(false);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center space-x-1.5"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Login Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
