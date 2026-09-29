import React from 'react';
import { 
  ShoppingBag, 
  Package, 
  BarChart3, 
  FileText, 
  Settings, 
  CircleDollarSign,
  Users
} from 'lucide-react';
import { usePos } from '../context/PosContext';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const { currentShift } = usePos();

  const navItems = [
    { id: 'pos', label: 'Kasir', icon: ShoppingBag },
    { id: 'inventory', label: 'Produk', icon: Package },
    { id: 'shift', label: 'Shift/Kas', icon: CircleDollarSign },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'logs', label: 'Audit Log', icon: FileText },
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'settings', label: 'Setting', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-lg px-1 py-1 no-print">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all shrink-0 ${
                isActive
                  ? 'text-emerald-600 font-bold bg-emerald-50 scale-105'
                  : 'text-slate-500 font-medium hover:text-slate-900'
              }`}
            >
              <div className="relative shrink-0 aspect-square flex items-center justify-center">
                <Icon className={`w-5 h-5 shrink-0 aspect-square ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.id === 'shift' && currentShift && currentShift.status === 'OPEN' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0 aspect-square" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
