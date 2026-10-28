import React from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Ship, 
  Grid3X3, 
  Building2, 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MoveRight, 
  FileText, 
  BarChart3, 
  Database, 
  Layers, 
  Truck,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { User } from '../../types/index.ts';

export type ActiveTab = 
  | 'dashboard'
  | 'master_containers'
  | 'master_vessels'
  | 'master_yard'
  | 'master_shipping'
  | 'master_tariffs'
  | 'trans_gate_in'
  | 'trans_discharge'
  | 'trans_loading'
  | 'trans_shifting'
  | 'trans_gate_out'
  | 'trans_billing'
  | 'reports'
  | 'yard_visualizer'
  | 'db_settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  onOpenDbModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user,
  onOpenDbModal
}) => {
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'yard_visualizer', label: 'Peta Lapangan (Yard Map)', icon: Grid3X3, badge: 'Live 2D' },
      ],
    },
    {
      title: 'MASTER DATA',
      items: [
        { id: 'master_containers', label: 'Data Peti Kemas', icon: Box },
        { id: 'master_vessels', label: 'Data Kapal (Vessels)', icon: Ship },
        { id: 'master_yard', label: 'Blok & Slot Lapangan', icon: Layers },
        { id: 'master_shipping', label: 'Shipping Lines & EMKL', icon: Building2 },
        { id: 'master_tariffs', label: 'Master Tarif Layanan', icon: DollarSign },
      ],
    },
    {
      title: 'TRANSAKSI DATA',
      items: [
        { id: 'trans_gate_in', label: 'Gate In (Truk Masuk)', icon: ArrowDownLeft, badge: 'EIR' },
        { id: 'trans_discharge', label: 'Bongkar Kapal (Discharge)', icon: Ship },
        { id: 'trans_loading', label: 'Muat Kapal (Loading)', icon: ArrowUpRight },
        { id: 'trans_shifting', label: 'Relokasi & Shifting', icon: MoveRight },
        { id: 'trans_gate_out', label: 'Gate Out (Truk Keluar)', icon: Truck, badge: 'D/O' },
        { id: 'trans_billing', label: 'Billing & Invoice', icon: Receipt },
      ],
    },
    {
      title: 'LAPORAN OPERASIONAL',
      items: [
        { id: 'reports', label: 'Pusat Laporan & KPI', icon: BarChart3, badge: 'Dwelling' },
      ],
    },
    {
      title: 'INTEGRASI DATABASE',
      items: [
        { id: 'db_settings', label: 'Koneksi Supabase / Neon', icon: Database },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Port Terminal Tag */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          <span>Lokasi Operasional</span>
        </div>
        <div className="text-xs font-bold text-slate-200">
          Dermaga Peti Kemas Nusantara
        </div>
        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span>Sistem TOS Aktif 24/7</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'db_settings') {
                        onOpenDbModal();
                      } else {
                        setActiveTab(item.id as ActiveTab);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isActive 
                          ? 'bg-blue-800 text-blue-100' 
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Operator Status Footer */}
      <div className="p-3 bg-slate-950/70 border-t border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-200 truncate">
              {user ? user.username : 'Belum Login'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {user ? user.role.replace('_', ' ') : 'Akses Tamu Terbatas'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
