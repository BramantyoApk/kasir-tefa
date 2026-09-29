import React, { useState } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { PosView } from './components/pos/PosView';
import { CartDrawer } from './components/pos/CartDrawer';
import { PaymentModal } from './components/pos/PaymentModal';
import { ReceiptModal } from './components/pos/ReceiptModal';
import { CameraScannerModal } from './components/pos/CameraScannerModal';
import { HoldOrdersModal } from './components/pos/HoldOrdersModal';
import { InventoryView } from './components/inventory/InventoryView';
import { ShiftView } from './components/shift/ShiftView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogView } from './components/logs/AuditLogView';
import { CustomersView } from './components/customers/CustomersView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'inventory' | 'shift' | 'reports' | 'logs' | 'customers' | 'settings'

  // Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceiptTrx, setActiveReceiptTrx] = useState(null);
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const handlePaymentSuccess = (completedTransaction) => {
    setActiveReceiptTrx(completedTransaction);
    setShowReceiptModal(true);
  };

  const handleReprintReceipt = (transaction) => {
    setActiveReceiptTrx(transaction);
    setShowReceiptModal(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      
      {/* Top Header Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenShiftModal={() => setActiveTab('shift')}
        onOpenHoldModal={() => setShowHoldModal(true)}
      />

      {/* Main Body Area */}
      <main className="flex-1 flex overflow-hidden pb-14 md:pb-0">
        {activeTab === 'pos' && (
          <div className="flex-1 flex overflow-hidden relative">
            <PosView 
              onOpenCameraScanner={() => setShowCameraScanner(true)}
              onOpenMobileCart={() => setIsMobileCartOpen(true)}
              onOpenHoldModal={() => setShowHoldModal(true)}
              onOpenPaymentModal={() => setShowPaymentModal(true)}
              onGoToInventory={() => setActiveTab('inventory')}
            />

            <CartDrawer 
              isOpenMobile={isMobileCartOpen}
              onCloseMobile={() => setIsMobileCartOpen(false)}
              onOpenPaymentModal={() => {
                setIsMobileCartOpen(false);
                setShowPaymentModal(true);
              }}
              onOpenHoldModal={() => setShowHoldModal(true)}
            />
          </div>
        )}

        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'shift' && <ShiftView />}
        {activeTab === 'reports' && <ReportsView onReprintReceipt={handleReprintReceipt} />}
        {activeTab === 'logs' && <AuditLogView />}
        {activeTab === 'customers' && <CustomersView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Bottom Nav for Android & Tablet screens (< 1024px) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals Suite */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <ReceiptModal 
        isOpen={showReceiptModal}
        transaction={activeReceiptTrx}
        onClose={() => setShowReceiptModal(false)}
      />

      <CameraScannerModal 
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
      />

      <HoldOrdersModal 
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
      />

    </div>
  );
};

export default function App() {
  return (
    <PosProvider>
      <MainLayout />
    </PosProvider>
  );
}
