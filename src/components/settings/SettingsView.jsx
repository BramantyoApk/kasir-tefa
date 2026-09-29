import React, { useState, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import QRCode from 'qrcode';
import { 
  Settings, 
  Store, 
  Printer, 
  Smartphone, 
  Download, 
  Upload, 
  Save, 
  Check, 
  Wifi, 
  ExternalLink,
  Laptop,
  Trash2,
  AlertTriangle,
  Database,
  Cloud,
  Server,
  Globe,
  RefreshCw,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Radio,
  Zap,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

export const SettingsView = () => {
  const { 
    settings, 
    updateSettings, 
    exportAllDataJson, 
    importAllDataJson, 
    resetToCleanEmpty,
    dbStatus,
    syncToServerDb,
    cloudDbConfig,
    setCloudDbConfig,
    testCloudDb
  } = usePos();

  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'general' | 'online' | 'backup'
  const [formData, setFormData] = useState(settings);
  const [cloudForm, setCloudForm] = useState(cloudDbConfig || {
    enabled: false,
    provider: 'supabase',
    url: '',
    apiKey: '',
    autoSync: false,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lanQrUrl, setLanQrUrl] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [testCloudResult, setTestCloudResult] = useState(null);
  const [testingCloud, setTestingCloud] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (cloudDbConfig) {
      setCloudForm(cloudDbConfig);
    }
  }, [cloudDbConfig]);

  // Fetch Network & Server IP Info
  useEffect(() => {
    fetch('/api/network-info')
      .then(res => res.json())
      .then(info => {
        setNetworkInfo(info);
        // Generate QR code pointing directly to the LAN IP for mobile phones
        const targetUrl = info.lanUrl || window.location.href;
        QRCode.toDataURL(targetUrl, { width: 200, margin: 2 })
          .then(url => setLanQrUrl(url))
          .catch(err => console.error(err));
      })
      .catch(() => {
        // Fallback to current browser URL
        QRCode.toDataURL(window.location.href, { width: 200, margin: 2 })
          .then(url => setLanQrUrl(url))
          .catch(err => console.error(err));
      });
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSaveCloudConfig = (e) => {
    e.preventDefault();
    setCloudDbConfig(cloudForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncToServerDb();
      if (res && res.success) {
        setSyncFeedback({ type: 'success', text: 'Database server berhasil disinkronisasi!' });
      } else {
        setSyncFeedback({ type: 'error', text: 'Gagal menyinkronkan database server.' });
      }
    } catch (err) {
      setSyncFeedback({ type: 'error', text: err.message });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleTestCloudConnection = async () => {
    setTestingCloud(true);
    setTestCloudResult(null);
    try {
      const res = await testCloudDb(cloudForm);
      if (res.ok) {
        setTestCloudResult({ success: true, text: 'Koneksi ke Cloud Database BERHASIL! (HTTP ' + res.status + ')' });
      } else {
        setTestCloudResult({ success: false, text: 'Respon Cloud HTTP ' + res.status + '. Periksa URL & API Key.' });
      }
    } catch (err) {
      setTestCloudResult({ success: false, text: err.message });
    } finally {
      setTestingCloud(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file, 240, 240, 0.85);
      setFormData(prev => ({ ...prev, storeLogo: base64 }));
    } catch (err) {
      alert(err.message || 'Gagal mengupload logo toko');
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, storeLogo: '' }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        importAllDataJson(json);
      } catch (err) {
        alert('File backup JSON tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  const lanUrl = networkInfo?.lanUrl || `http://${window.location.hostname}:3000`;
  const restDbUrl = `${lanUrl}/api/db`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>Pengaturan Sistem & Database</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi database server, integrasi cloud, akses online non-localhost, profil toko & printer POS
          </p>
        </div>

        {/* Database Status Live Badge */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
            dbStatus === 'online' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : dbStatus === 'connecting'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              dbStatus === 'online' 
                ? 'bg-emerald-500 animate-pulse' 
                : dbStatus === 'connecting'
                ? 'bg-amber-500 animate-spin'
                : 'bg-rose-500'
            }`} />
            <span>
              {dbStatus === 'online' ? 'Database Terhubung (Online)' : dbStatus === 'connecting' ? 'Menghubungkan...' : 'Mode Offline (Lokal)'}
            </span>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Tersimpan!</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs - Responsive Grid (All 4 Options 100% Visible & Never Gepeng) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`p-3 sm:p-4 rounded-2xl text-left border transition-all flex items-center gap-3 select-none ${
            activeTab === 'database'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 aspect-square ${
            activeTab === 'database' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <Database className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs sm:text-sm font-extrabold truncate">
              Database & API
            </span>
            <span className={`block text-[10px] sm:text-[11px] truncate mt-0.5 ${
              activeTab === 'database' ? 'text-emerald-100' : 'text-slate-400'
            }`}>
              Server & REST Sync
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`p-3 sm:p-4 rounded-2xl text-left border transition-all flex items-center gap-3 select-none ${
            activeTab === 'online'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 aspect-square ${
            activeTab === 'online' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
          }`}>
            <Globe className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs sm:text-sm font-extrabold truncate">
              Akses Online
            </span>
            <span className={`block text-[10px] sm:text-[11px] truncate mt-0.5 ${
              activeTab === 'online' ? 'text-emerald-100' : 'text-slate-400'
            }`}>
              Bukan Localhost
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`p-3 sm:p-4 rounded-2xl text-left border transition-all flex items-center gap-3 select-none ${
            activeTab === 'general'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 aspect-square ${
            activeTab === 'general' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
          }`}>
            <Store className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs sm:text-sm font-extrabold truncate">
              Profil & Printer
            </span>
            <span className={`block text-[10px] sm:text-[11px] truncate mt-0.5 ${
              activeTab === 'general' ? 'text-emerald-100' : 'text-slate-400'
            }`}>
              Thermal & PPN
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`p-3 sm:p-4 rounded-2xl text-left border transition-all flex items-center gap-3 select-none ${
            activeTab === 'backup'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80 shadow-sm'
          }`}
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 aspect-square ${
            activeTab === 'backup' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
          }`}>
            <Download className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs sm:text-sm font-extrabold truncate">
              Cadangan & Reset
            </span>
            <span className={`block text-[10px] sm:text-[11px] truncate mt-0.5 ${
              activeTab === 'backup' ? 'text-emerald-100' : 'text-slate-400'
            }`}>
              Backup & 0 Data
            </span>
          </div>
        </button>
      </div>

      {/* TAB 1: DATABASE INTEGRATION */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Main DB Status & Endpoints */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Database Server Engine Card */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Database Server Terintegrasi (JSON Engine)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tersimpan permanen di file server dan tersinkronisasi otomatis antar perangkat
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                </button>
              </div>

              {syncFeedback && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  syncFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{syncFeedback.text}</span>
                </div>
              )}

              {/* Endpoint Details */}
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">REST API Database Endpoint:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(restDbUrl, 'rest')}
                      className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                    >
                      {copiedKey === 'rest' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'rest' ? 'Tersalin' : 'Salin URL'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 select-all break-all">
                    {restDbUrl}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Gunakan endpoint ini untuk mengintegrasikan kasir dengan aplikasi mobile, scanner barcode eksternal, atau dashboard manajemen cabang.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-bold block mb-1">Status Server Database:</span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{networkInfo?.status === 'online' ? 'Aktif & Melayani REST API' : 'Lokal Siap'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-bold block mb-1">Lokasi File Database:</span>
                    <div className="font-mono text-[11px] text-slate-700 truncate" title={networkInfo?.dbFile || 'database/kasirpro_db.json'}>
                      {networkInfo?.dbFile || 'database/kasirpro_db.json'}
                    </div>
                  </div>
                </div>
              </div>

              {/* API Endpoints Catalog */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Daftar Endpoint API Siap Pakai:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-emerald-700 font-bold">GET/POST /api/db</span>
                    <span className="text-[10px] text-slate-500 font-sans">Semua Data</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-emerald-700 font-bold">GET/POST /api/products</span>
                    <span className="text-[10px] text-slate-500 font-sans">Produk & Varian</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-emerald-700 font-bold">GET/POST /api/transactions</span>
                    <span className="text-[10px] text-slate-500 font-sans">Penjualan</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-emerald-700 font-bold">GET/POST /api/audit-logs</span>
                    <span className="text-[10px] text-slate-500 font-sans">Log Mutasi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Database Integration (Supabase / Remote REST) */}
            <form onSubmit={handleSaveCloudConfig} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Integrasi Cloud Database (Supabase / Remote REST)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hubungkan langsung ke cloud database online agar data tersimpan di awan secara gratis
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Aktifkan Sinkronisasi Cloud:</span>
                    <span className="text-[11px] text-slate-500">Kirim salinan transaksi & mutasi ke Cloud URL otomatis</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={cloudForm.enabled}
                    onChange={(e) => setCloudForm({ ...cloudForm, enabled: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Provider Database Cloud:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCloudForm({ ...cloudForm, provider: 'supabase' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        cloudForm.provider === 'supabase'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>Supabase (PostgreSQL)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCloudForm({ ...cloudForm, provider: 'rest' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        cloudForm.provider === 'rest'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>Custom REST API / Serverless</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">URL Endpoint Cloud:</label>
                  <input
                    type="url"
                    value={cloudForm.url}
                    onChange={(e) => setCloudForm({ ...cloudForm, url: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    placeholder="https://your-project.supabase.co/rest/v1/..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">API Key / Bearer Token:</label>
                  <input
                    type="password"
                    value={cloudForm.apiKey}
                    onChange={(e) => setCloudForm({ ...cloudForm, apiKey: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>

                {testCloudResult && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    testCloudResult.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    {testCloudResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                    <span>{testCloudResult.text}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestCloudConnection}
                    disabled={testingCloud || !cloudForm.url}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{testingCloud ? 'Menguji...' : 'Tes Koneksi Cloud'}</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengaturan Cloud</span>
                  </button>
                </div>
              </div>
            </form>

          </div>

          {/* Quick Summary / Status Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Arsitektur Multi-Device</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Aplikasi ini beroperasi dengan model **Offline-First & Auto-Sync**:
              </p>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <span className="font-bold text-emerald-400 block">1. Local Storage Cache:</span>
                  <p className="text-[11px] text-slate-300">
                    Kasir tetap bisa melayani transaksi cepat tanpa delay walau internet mati total.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <span className="font-bold text-emerald-400 block">2. Central REST Database:</span>
                  <p className="text-[11px] text-slate-300">
                    Semua transaksi, varian produk, dan stok tersimpan di server backend dan disinkronkan tiap kali terjadi perubahan.
                  </p>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                  <span className="font-bold text-emerald-400 block">3. Multi-Device Polling:</span>
                  <p className="text-[11px] text-slate-300">
                    Tablet kasir lain atau HP Android otomatis menerima perubahan stok baru dalam waktu nyata.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Action to Online Tab */}
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Ingin Akses Tanpa Localhost?</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Buka tab <strong>Akses Online</strong> untuk melihat cara membuka kasir dari HP Android, tablet, atau jaringan internet di luar toko.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('online')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all text-center block"
              >
                Buka Panduan Akses Online
              </button>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ONLINE ACCESS (BUKAN LOCALHOST) */}
      {activeTab === 'online' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Cara 1: Wi-Fi LAN Komputer Lain, HP & Tablet */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">1</span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Akses Lewat Wi-Fi yang Sama (Komputer Lain, Tablet & HP)
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Paling Mudah & Realtime
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Komputer kasir ini dan <strong>komputer lain / HP / tablet</strong> Anda cukup terhubung ke jaringan Wi-Fi yang sama. Di komputer lain atau HP, buka browser (Chrome/Edge/Safari) dan ketik URL berikut:
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="font-mono text-sm sm:text-base font-extrabold text-emerald-700 select-all">
                  {lanUrl}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(lanUrl, 'lan')}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  {copiedKey === 'lan' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'lan' ? 'Tersalin!' : 'Salin URL'}</span>
                </button>
              </div>

              {networkInfo?.allIps && networkInfo.allIps.length > 1 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Alamat Jaringan Terdeteksi di PC Ini:</span>
                  <div className="flex flex-wrap gap-2">
                    {networkInfo.allIps.map(ip => (
                      <button
                        key={ip.address}
                        type="button"
                        onClick={() => copyToClipboard(ip.url, ip.address)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border flex items-center gap-1.5 transition-all ${
                          ip.url === lanUrl
                            ? 'bg-emerald-500 text-white border-emerald-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{ip.name}:</span>
                        <span>{ip.address}</span>
                        {ip.isWifi && <span className="text-[9px] px-1 bg-emerald-700 rounded text-white font-sans">Wi-Fi</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tips Pemakaian Multi-Komputer:</span>
                </div>
                <ul className="text-[11px] text-emerald-800 list-disc list-inside space-y-0.5 ml-1">
                  <li>Komputer kasir utama bertindak sebagai Host/Server. Jangan matikan terminal node.</li>
                  <li>Komputer kasir ke-2, laptop admin, atau tablet kasir bisa input transaksi bersamaan.</li>
                  <li>Semua stok barang dan riwayat transaksi tersinkronisasi otomatis secara realtime!</li>
                </ul>
              </div>
            </div>

            {/* Cara 2: Akses Internet Luar Toko Gratis (Cloudflare Tunnel) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">2</span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Akses Dari Mana Saja via Internet Gratis (Cloudflare Tunnel)
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  Tanpa IP Publik / Port Forwarding
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Ingin memantau penjualan dari rumah menggunakan kuota HP (4G/5G) tanpa harus satu Wi-Fi? Jalankan Cloudflare Tunnel gratis:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Perintah Terminal (PowerShell / CMD):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('npx cloudflared tunnel --url http://localhost:3000', 'cf')}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'cf' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cf' ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl select-all break-all">
                  npx cloudflared tunnel --url http://localhost:3000
                </div>
                <p className="text-[11px] text-slate-500">
                  Cloudflare akan langsung memberikan link publik HTTPS resmi seperti <code className="text-indigo-600 font-mono font-bold">https://nama-acak.trycloudflare.com</code> yang aman dan bisa dibuka dari seluruh dunia.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-slate-800">Alternatif Cepat Lainnya:</span>
                <p className="text-[11px] text-slate-600 font-mono">
                  npx localtunnel --port 3000
                </p>
              </div>
            </div>

            {/* Cara 3: Cloud Hosting 24 Jam Nonstop */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">3</span>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Deploy Online 24/7 di Cloud Gratis (Render.com / Vercel / Railway)
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full">
                  Tanpa Komputer Menyala
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Aplikasi ini sudah dilengkapi file konfigurasi siap deploy (<code className="font-mono text-purple-700 font-bold">render.yaml</code> & <code className="font-mono text-purple-700 font-bold">vercel.json</code>). Anda bisa meng-upload repositori ini ke GitHub dan menghubungkannya ke <strong>Render.com</strong> atau <strong>Vercel</strong> secara 100% gratis.
              </p>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-1">
                <span className="font-bold block">Dokumentasi Panduan Lengkap:</span>
                <p className="text-[11px] text-purple-800">
                  Silakan buka file panduan <code className="font-mono font-bold">DEPLOY_ONLINE.md</code> di folder proyek ini untuk tutorial langkah demi langkah.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: QR Code Scan Card */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg space-y-4 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <Smartphone className="w-5 h-5" />
                <span>Scan dengan Kamera HP</span>
              </div>

              <p className="text-xs text-slate-300">
                Arahkan kamera HP Android atau iPhone Anda ke QR Code ini untuk langsung membuka kasir:
              </p>

              <div className="bg-white p-4 rounded-2xl inline-block shadow-md">
                {lanQrUrl ? (
                  <img src={lanQrUrl} alt="QR Link Toko" className="w-48 h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                    Membuat QR...
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-white/10 rounded-xl font-mono text-xs text-emerald-300 break-all select-all">
                {lanUrl}
              </div>

              <div className="text-[11px] text-slate-400 text-left space-y-1 pt-1">
                <p>✓ Tampilan otomatis beradaptasi ke layar HP</p>
                <p>✓ Mendukung input touchscreen & scanner barcode kamera</p>
                <p>✓ Cetak nota langsung via Bluetooth Thermal Printer</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PROFIL TOKO & PRINTER */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-5 h-5 text-emerald-600" />
            <span>Profil Toko & Header Struk</span>
          </h3>

          {/* Logo / Foto Profil Toko */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Logo / Foto Profil Toko:</label>
            <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 aspect-square overflow-hidden">
                {formData.storeLogo ? (
                  <img src={formData.storeLogo} alt="Logo Toko" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Logo Toko</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {formData.storeLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Logo</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Format gambar PNG/JPG/WEBP (otomatis tampil di Navbar atas dan cetak nota struk)
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Toko / Usaha:</label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Contoh: Toko Berkah Sejahtera"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Toko:</label>
            <input
              type="text"
              value={formData.storeAddress}
              onChange={(e) => setFormData({ ...formData, storeAddress: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Alamat lengkap toko"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp / Telepon Toko:</label>
            <input
              type="text"
              value={formData.storePhone}
              onChange={(e) => setFormData({ ...formData, storePhone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Kaki Struk (Footer):</label>
            <textarea
              rows="2"
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Pesan ucapan terima kasih di bagian bawah nota"
            />
          </div>

          {/* Printer & Tax Configuration */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-600" />
              <span>Format Printer Thermal POS & Pajak</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Thermal Width */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Lebar Kertas Thermal:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['58mm', '80mm'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, receiptWidth: size })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formData.receiptWidth === size 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {size} ({size === '58mm' ? 'Mini / Mobile' : 'Desktop Standar'})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tax (PPN) Toggle */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pajak Pertambahan Nilai (PPN):</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, taxEnabled: !formData.taxEnabled })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.taxEnabled 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {formData.taxEnabled ? 'Pajak Aktif' : 'Tanpa Pajak'}
                  </button>

                  {formData.taxEnabled && (
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                        className="w-full px-2 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl text-center"
                      />
                      <span className="text-xs font-bold">%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: CADANGAN & RESET */}
      {activeTab === 'backup' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="w-5 h-5 text-emerald-600" />
            <span>Cadangan & Pembersihan Data (Backup, Restore & Total Reset)</span>
          </h3>

          <p className="text-xs text-slate-500">
            Download seluruh data yang Anda masukkan ke file cadangan JSON atau bersihkan seluruh database menjadi 0 data bersih siap pakai.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Unduh Cadangan Database:</span>
              <p className="text-[11px] text-slate-500">
                Simpan file JSON berisi seluruh produk, riwayat transaksi, mutasi audit log, dan data pelanggan ke komputer Anda.
              </p>
              <button
                type="button"
                onClick={exportAllDataJson}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Backup JSON</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Pulihkan Data (Restore):</span>
              <p className="text-[11px] text-slate-500">
                Masukkan file JSON hasil backup sebelumnya untuk memulihkan seluruh data toko Anda.
              </p>
              <label className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Pilih File Backup JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Total Clean Empty */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Reset Bersih Database (Hapus 100% Seluruh Data)</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Tindakan ini akan menghapus semua produk, mutasi log, transaksi, dan shift kembali menjadi <strong>0 data bersih</strong>. Gunakan jika Anda ingin memasukkan data toko Anda dari nol.
              </p>
              <button
                type="button"
                onClick={resetToCleanEmpty}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Total Bersih Menjadi 0 Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
