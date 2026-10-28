/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar, ActiveTab } from './components/layout/Sidebar.tsx';
import { LoginModal } from './components/auth/LoginModal.tsx';
import { DatabaseSettingsModal } from './components/database/DatabaseSettingsModal.tsx';

// Dashboard & Visualizer
import { DashboardOverview } from './components/dashboard/DashboardOverview.tsx';
import { YardVisualizer } from './components/yard/YardVisualizer.tsx';

// Master Data Components
import { ContainerMaster } from './components/master/ContainerMaster.tsx';
import { VesselMaster } from './components/master/VesselMaster.tsx';
import { YardMaster } from './components/master/YardMaster.tsx';
import { ShippingLineMaster } from './components/master/ShippingLineMaster.tsx';
import { TariffMaster } from './components/master/TariffMaster.tsx';

// Transaksi Data Components
import { GateInTransaction } from './components/transactions/GateInTransaction.tsx';
import { DischargeTransaction } from './components/transactions/DischargeTransaction.tsx';
import { LoadingTransaction } from './components/transactions/LoadingTransaction.tsx';
import { YardMovementTransactionView } from './components/transactions/YardMovementTransaction.tsx';
import { GateOutTransactionView } from './components/transactions/GateOutTransaction.tsx';
import { BillingTransactionView } from './components/transactions/BillingTransaction.tsx';

// Laporan Component
import { ReportsView } from './components/reports/ReportsView.tsx';

// Services
import { authService } from './services/auth.ts';
import { dbService } from './services/db.ts';
import { User } from './types/index.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  const handleSearchGlobal = (term: string) => {
    if (term.trim().length > 0) {
      setActiveTab('master_containers');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenDbModal={() => setIsDbModalOpen(true)}
          />
        );
      case 'yard_visualizer':
        return <YardVisualizer />;

      // Master Data
      case 'master_containers':
        return <ContainerMaster />;
      case 'master_vessels':
        return <VesselMaster />;
      case 'master_yard':
        return <YardMaster />;
      case 'master_shipping':
        return <ShippingLineMaster />;
      case 'master_tariffs':
        return <TariffMaster />;

      // Transaksi Data
      case 'trans_gate_in':
        return <GateInTransaction />;
      case 'trans_discharge':
        return <DischargeTransaction />;
      case 'trans_loading':
        return <LoadingTransaction />;
      case 'trans_shifting':
        return <YardMovementTransactionView />;
      case 'trans_gate_out':
        return <GateOutTransactionView />;
      case 'trans_billing':
        return <BillingTransactionView />;

      // Laporan
      case 'reports':
        return <ReportsView />;

      default:
        return (
          <DashboardOverview
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenDbModal={() => setIsDbModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onSearchGlobal={handleSearchGlobal}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          onOpenDbModal={() => setIsDbModalOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Database Connection Settings Modal */}
      <DatabaseSettingsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onConfigChanged={() => {}}
      />

      {/* Admin Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
