import React, { useState } from 'react';
import { 
  Anchor, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Database
} from 'lucide-react';
import { authService, PRESET_USERS } from '../../services/auth.ts';
import { UserRole } from '../../types/index.ts';

interface LoginFormProps {
  onSuccess: () => void;
  onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onClose }) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.login(identifier, password);
      setIsLoading(false);
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Username / Email atau Password tidak valid.');
      }
    }, 400);
  };

  const handleQuickFill = (role: UserRole) => {
    const user = PRESET_USERS.find(u => u.role === role);
    if (user) {
      setIdentifier(user.username);
      setPassword(user.passwordHash);
      setErrorMsg('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-6 text-white text-center relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Anchor className="w-40 h-40" />
        </div>
        
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
          <Anchor className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">PORTVESSEL TOS</h2>
        <p className="text-xs text-blue-200 mt-0.5">
          Sistem Operasional Terminal Peti Kemas (TOS)
        </p>
        <div className="inline-flex items-center space-x-1.5 mt-2 bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 rounded-full text-[11px] text-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
          <span>Autentikasi Hak Akses Admin & Operator</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start space-x-2.5 text-rose-700 dark:text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username atau Email Admin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin atau admin@terminal.id"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Ingat Sesi Saya</span>
            </label>
            <span className="text-[11px] text-blue-600 dark:text-blue-400">
              Terminal Operasional Terenkripsi
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Masuk ke Dashboard TOS</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Chips */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center mb-2">
            Klik Cepat Akun Demo (Satu Klik):
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFill('SUPER_ADMIN')}
              className="p-2 text-left rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-[11px] transition"
            >
              <div className="font-bold text-blue-700 dark:text-blue-300">Super Admin</div>
              <div className="text-[10px] text-slate-500">admin / admin123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('YARD_PLANNER')}
              className="p-2 text-left rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-[11px] transition"
            >
              <div className="font-bold text-emerald-700 dark:text-emerald-300">Yard Planner</div>
              <div className="text-[10px] text-slate-500">planner / planner123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('GATE_OPERATOR')}
              className="p-2 text-left rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-[11px] transition"
            >
              <div className="font-bold text-amber-700 dark:text-amber-300">Gate Operator</div>
              <div className="text-[10px] text-slate-500">gate_op / gate123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('FINANCE_OFFICER')}
              className="p-2 text-left rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-[11px] transition"
            >
              <div className="font-bold text-purple-700 dark:text-purple-300">Finance Billing</div>
              <div className="text-[10px] text-slate-500">finance / finance123</div>
            </button>
          </div>
        </div>

        {onClose && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Tutup & Gunakan Akses Tamu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
