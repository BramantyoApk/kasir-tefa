import React, { useState, useEffect, useRef } from 'react';
import { usePos } from '../context/PosContext';
import { 
  Store, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ChevronDown,
  ShoppingBag,
  Package,
  CircleDollarSign,
  BarChart3,
  FileText,
  Users,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenShiftModal, onOpenHoldModal }) => {
  const { 
    settings, 
    currentUser, 
    setCurrentUser, 
    users, 
    currentShift, 
    products, 
    holdOrders 
  } = usePos();
  
  const [time, setTime] = useState(new Date());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen state listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('Fullscreen request failed:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.warn('Exit fullscreen failed:', err);
        });
      }
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const navLinks = [
    { id: 'pos', label: 'Kasir', icon: ShoppingBag },
    { id: 'inventory', label: 'Produk', icon: Package },
    { id: 'shift', label: 'Shift Kas', icon: CircleDollarSign },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'logs', label: 'Audit Log', icon: FileText },
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm no-print">
      <div className="w-full px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Store Title (Compact, perfectly aligned, no overflow, no POS PRO) */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer shrink-0 group select-none min-w-0" 
            onClick={() => setActiveTab('pos')}
            title="Klik untuk ke layar Kasir"
          >
            {/* Square icon with shrink-0 aspect-square to guarantee NO distortion/oval */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/25 shrink-0 aspect-square group-hover:scale-105 transition-transform overflow-hidden">
              {settings.storeLogo ? (
                <img src={settings.storeLogo} alt="Logo Toko" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 shrink-0" />
              )}
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base md:text-lg truncate max-w-[130px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-xs leading-tight">
                {settings.storeName || 'Kasir Toko'}
              </span>
              {settings.storeAddress ? (
                <span className="text-[11px] text-slate-400 hidden sm:block truncate max-w-[130px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-xs leading-none mt-0.5">
                  {settings.storeAddress}
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 hidden sm:block leading-none mt-0.5">
                  Sistem Kasir POS
                </span>
              )}
            </div>
          </div>

          {/* Tablet & Desktop Navigation Links (Native Tablet Pill Tabs) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 overflow-x-auto scrollbar-none py-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition-all shrink-0 select-none ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 aspect-square ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & Quick Tools */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            
            {/* Hold orders button (if any) */}
            {holdOrders.length > 0 && (
              <button
                onClick={onOpenHoldModal}
                className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shrink-0 animate-pulse"
                title="Lihat antrian yang ditahan"
              >
                <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden sm:inline">{holdOrders.length} Tertahan</span>
                <span className="sm:hidden">{holdOrders.length}</span>
              </button>
            )}

            {/* Low Stock Warning Badge */}
            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('inventory')}
                className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors shrink-0"
                title={`${lowStockCount} produk stok menipis`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="font-bold">{lowStockCount} Menipis</span>
              </button>
            )}

            {/* Shift Status Button */}
            <button
              onClick={onOpenShiftModal}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                currentShift && currentShift.status === 'OPEN'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
              title="Status Shift Kasir"
            >
              {currentShift && currentShift.status === 'OPEN' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 aspect-square animate-pulse" />
                  <span className="hidden sm:inline text-slate-600 font-medium">Shift</span>
                  <span className="font-bold text-emerald-700">Buka</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="font-bold text-rose-700">Tutup</span>
                </>
              )}
            </button>

            {/* Cashier Switcher */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-1.5 p-1 sm:px-2 sm:py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-xl text-xs font-medium transition-colors shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 aspect-square shadow-sm">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden lg:block pr-0.5">
                  <div className="font-bold text-xs text-slate-800 leading-tight truncate max-w-[80px]">
                    {currentUser?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none">
                    {currentUser?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-[100] animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 text-xs text-slate-400 font-semibold">
                    Ganti Petugas Kasir:
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUser(u)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentUser?.id === u.id ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{u.role}</div>
                      </div>
                      {currentUser?.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle Button (Icon Only) */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all shrink-0 aspect-square flex items-center justify-center active:scale-95 shadow-xs"
              title={isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh (Fullscreen)"}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 shrink-0 text-slate-700" />
              ) : (
                <Maximize className="w-4 h-4 shrink-0 text-slate-700" />
              )}
            </button>

            {/* Digital Clock */}
            <div className="hidden 2xl:flex items-center space-x-1.5 text-slate-600 font-mono text-xs bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
