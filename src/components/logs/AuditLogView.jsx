import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatDateTime } from '../../utils/formatters';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  ShoppingCart, 
  Ban, 
  CircleDollarSign, 
  ArrowUpDown, 
  ShieldCheck, 
  Eye, 
  X,
  UserCheck
} from 'lucide-react';

export const AuditLogView = () => {
  const { auditLogs } = usePos();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: PlusCircle,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'TAMBAH'
        };
      case 'UPDATE':
        return {
          icon: Edit3,
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'EDIT'
        };
      case 'DELETE':
        return {
          icon: Trash2,
          color: 'bg-rose-100 text-rose-800 border-rose-200',
          label: 'HAPUS'
        };
      case 'TRANSACTION':
        return {
          icon: ShoppingCart,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'TRANSAKSI'
        };
      case 'VOID':
        return {
          icon: Ban,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'VOID/BATAL'
        };
      case 'SHIFT_OPEN':
      case 'SHIFT_CLOSE':
        return {
          icon: CircleDollarSign,
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          label: 'SHIFT/KAS'
        };
      case 'STOCK':
        return {
          icon: ArrowUpDown,
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          label: 'MUTASI STOK'
        };
      default:
        return {
          icon: ShieldCheck,
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          label: action
        };
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !search || 
      log.description.toLowerCase().includes(search.toLowerCase()) || 
      log.user.toLowerCase().includes(search.toLowerCase()) || 
      log.entity.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  // 100% Bug-Free UTF-8 BOM CSV Export for Excel & Mobile
  const handleExportCsv = () => {
    if (auditLogs.length === 0) {
      alert('Belum ada catatan aktivitas / log audit untuk diekspor!');
      return;
    }

    const headers = ['ID Log', 'Waktu', 'Aksi', 'Modul', 'Petugas', 'Deskripsi'];
    const rows = auditLogs.map(l => [
      `"${l.id}"`,
      `"${formatDateTime(l.timestamp)}"`,
      `"${l.action}"`,
      `"${l.entity}"`,
      `"${(l.user || '').replace(/"/g, '""')}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Sistem Log & Audit Trail Kasir</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Merekam 100% setiap tindakan tambah, edit, hapus, transaksi, void, dan mutasi stok secara transparan
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Log CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      {auditLogs.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aktivitas, petugas, atau nama barang di log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Jenis Aksi</option>
              <option value="CREATE">Tambah (Add)</option>
              <option value="UPDATE">Ubah (Edit)</option>
              <option value="DELETE">Hapus (Delete)</option>
              <option value="TRANSACTION">Penjualan (Sale)</option>
              <option value="VOID">Pembatalan (Void)</option>
              <option value="STOCK">Mutasi Stok</option>
              <option value="SHIFT_OPEN">Buka Kasir</option>
              <option value="SHIFT_CLOSE">Tutup Kasir</option>
            </select>
          </div>
        </div>
      )}

      {/* Audit Log Table / Empty State */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {auditLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">Belum Ada Aktivitas / Log Bersih</p>
            <p className="text-xs text-slate-400">
              Setiap kali Anda menambah produk, mengubah harga, menghapus barang, atau melakukan transaksi, sistem akan otomatis mencatatnya di sini.
            </p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada log yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter aksi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3.5">Waktu</th>
                  <th className="px-4 py-3.5">Aksi</th>
                  <th className="px-4 py-3.5">Modul</th>
                  <th className="px-4 py-3.5">Petugas</th>
                  <th className="px-4 py-3.5">Keterangan / Rincian Log</th>
                  <th className="px-4 py-3.5 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 text-xs font-mono whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-500 whitespace-nowrap">
                        {log.entity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-900">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium max-w-md">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Lihat Data Snapshot JSON"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SNAPSHOT DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Rincian Data Log Audit</h3>
                <p className="text-xs text-slate-500">{formatDateTime(selectedLog.timestamp)} • Petugas: {selectedLog.user}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-semibold text-slate-800">{selectedLog.description}</div>
              <div className="text-[11px] text-slate-500">ID: {selectedLog.id} | Aksi: {selectedLog.action}</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payload Snapshot (JSON):</label>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
