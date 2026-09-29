import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah, formatDateTime, formatDate } from '../../utils/formatters';
import { exportSalesReportPdf } from '../../utils/pdfExport';
import { 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  RotateCcw, 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  Printer, 
  X, 
  Eye, 
  Ban, 
  CheckCircle, 
  AlertTriangle,
  FileDown
} from 'lucide-react';

export const ReportsView = ({ onReprintReceipt }) => {
  const { transactions, voidTransaction, settings } = usePos();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Transaction Detail Modal
  const [selectedTrx, setSelectedTrx] = useState(null);

  // Void Modal
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidTargetTrx, setVoidTargetTrx] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  // Calculations
  const validTransactions = transactions.filter(t => t.status !== 'VOID');
  const totalOmzet = validTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalHpp = validTransactions.reduce((sum, t) => sum + (t.hppTotal || 0), 0);
  const totalGrossProfit = totalOmzet - totalHpp;
  const avgBasketSize = validTransactions.length > 0 ? Math.round(totalOmzet / validTransactions.length) : 0;

  // Top Selling Products Calculation
  const productSalesMap = {};
  validTransactions.forEach(t => {
    t.items.forEach(item => {
      if (!productSalesMap[item.name]) {
        productSalesMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSalesMap[item.name].qty += item.qty;
      productSalesMap[item.name].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Filter transactions table
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !search || 
      t.id.toLowerCase().includes(search.toLowerCase()) || 
      (t.customer?.name && t.customer.name.toLowerCase().includes(search.toLowerCase())) || 
      t.cashier.toLowerCase().includes(search.toLowerCase());

    const matchesPayment = paymentFilter === 'ALL' || t.paymentMethod === paymentFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesPayment && matchesStatus;
  });

  const handleConfirmVoid = (e) => {
    e.preventDefault();
    if (!voidReason.trim()) {
      alert('Alasan pembatalan (VOID) wajib diisi untuk audit log!');
      return;
    }

    voidTransaction(voidTargetTrx.id, voidReason.trim());
    setShowVoidModal(false);
    setSelectedTrx(null);
  };

  // Robust UTF-8 BOM CSV Export
  const handleExportCsv = () => {
    if (transactions.length === 0) {
      alert('Belum ada data transaksi untuk diekspor!');
      return;
    }

    const headers = ['No Nota', 'Waktu', 'Kasir', 'Pelanggan', 'Metode Bayar', 'Total Tagihan', 'Uang Diterima (Bayar)', 'Kembalian', 'Diskon', 'Pajak', 'Status'];
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${formatDateTime(t.date)}"`,
      `"${(t.cashier || '').replace(/"/g, '""')}"`,
      `"${(t.customer?.name || 'Umum').replace(/"/g, '""')}"`,
      `"${t.paymentMethod}"`,
      t.total || 0,
      t.amountPaid || t.total,
      t.change || 0,
      t.discount || 0,
      t.tax || 0,
      `"${t.status}"`
    ]);

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_transaksi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportPdf = () => {
    exportSalesReportPdf({
      storeName: settings.storeName,
      storeAddress: settings.storeAddress,
      storePhone: settings.storePhone,
      transactions,
      totalOmzet,
      totalGrossProfit,
      validTransactionsCount: validTransactions.length,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 lg:pb-6">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Laporan Penjualan & Riwayat Kasir</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analisis omzet, laba kotor, dan rekap semua transaksi kasir
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {transactions.length > 0 && (
            <>
              <button
                onClick={handleExportPdf}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
                title="Simpan atau cetak Laporan sebagai PDF"
              >
                <FileDown className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all"
                title="Export laporan transaksi ke Excel/CSV"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel / CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Penjualan (Omzet)</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            {formatRupiah(totalOmzet)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{validTransactions.length} transaksi selesai</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Estimasi Laba Kotor</span>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono">
            {formatRupiah(totalGrossProfit)}
          </div>
          <div className="text-[11px] text-slate-400">
            Setelah dikurangi HPP produk
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Transaksi</span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono">
            {transactions.length}
          </div>
          <div className="text-[11px] text-slate-400">
            {transactions.filter(t => t.status === 'VOID').length} dibatalkan (VOID)
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Rata-rata Per Transaksi</span>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-600 font-mono">
            {formatRupiah(avgBasketSize)}
          </div>
          <div className="text-[11px] text-slate-400">
            Nilai rata-rata keranjang
          </div>
        </div>
      </div>

      {/* Top 5 Products Bar */}
      {topProducts.length > 0 && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Top 5 Produk Paling Laris</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-emerald-700">{p.qty} terjual</span>
                </div>
                <div className="font-bold text-slate-800 text-xs truncate mt-1">{p.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{formatRupiah(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {transactions.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID transaksi, kasir, atau nama pelanggan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Pembayaran</option>
              <option value="TUNAI">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="TRANSFER">Transfer</option>
              <option value="PIUTANG">Piutang / Bon</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="SELESAI">Selesai</option>
              <option value="VOID">Dibatalkan (VOID)</option>
            </select>
          </div>
        </div>
      )}

      {/* Transactions Table (Smooth Scrollable on Android & PC) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Receipt className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">Belum Ada Riwayat Transaksi</p>
            <p className="text-xs text-slate-400">Database transaksi kasir Anda masih kosong bersih (0 penjualan).</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada transaksi yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter atau kata kunci</p>
          </div>
        ) : (
          <div className="overflow-x-auto touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left text-xs sm:text-sm min-w-[850px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3.5">No. Nota</th>
                  <th className="px-4 py-3.5">Waktu</th>
                  <th className="px-4 py-3.5">Pelanggan</th>
                  <th className="px-4 py-3.5">Kasir</th>
                  <th className="px-4 py-3.5 text-center">Metode</th>
                  <th className="px-4 py-3.5 text-right">Total Tagihan</th>
                  <th className="px-4 py-3.5 text-right">Uang Diterima (Bayar)</th>
                  <th className="px-4 py-3.5 text-right">Kembalian</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTransactions.map((trx) => {
                  const isVoid = trx.status === 'VOID';

                  return (
                    <tr key={trx.id} className={`hover:bg-slate-50 transition-colors ${isVoid ? 'bg-rose-50/40 text-slate-400' : ''}`}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {trx.id}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {formatDateTime(trx.date)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {trx.customer?.name || 'Umum'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {trx.cashier}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {trx.paymentMethod}
                        </span>
                      </td>
                      {/* Total Tagihan */}
                      <td className={`px-4 py-3 text-right font-mono font-bold ${
                        isVoid ? 'line-through text-slate-400' : 'text-emerald-700'
                      }`}>
                        {formatRupiah(trx.total)}
                      </td>
                      {/* Uang Diterima / Bayar */}
                      <td className="px-4 py-3 text-right font-mono text-slate-800 font-semibold">
                        {formatRupiah(trx.amountPaid || trx.total)}
                      </td>
                      {/* Kembalian */}
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        {trx.change > 0 ? formatRupiah(trx.change) : '-'}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {isVoid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            VOID
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Selesai
                          </span>
                        )}
                      </td>
                      {/* Action */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedTrx(trx)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Lihat Detail Transaksi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onReprintReceipt(trx)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Cetak Ulang Struk"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {!isVoid && (
                            <button
                              onClick={() => {
                                setVoidTargetTrx(trx);
                                setVoidReason('');
                                setShowVoidModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                              title="Batalkan / VOID Transaksi"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TRANSACTION DETAIL MODAL (100% Scrollable & Mobile-Friendly) */}
      {selectedTrx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-200 my-auto max-h-[92vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Detail Transaksi {selectedTrx.id}</h3>
                <p className="text-xs text-slate-500">{formatDateTime(selectedTrx.date)} • Kasir: {selectedTrx.cashier}</p>
              </div>
              <button 
                onClick={() => setSelectedTrx(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTrx.status === 'VOID' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-1 shrink-0">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Transaksi ini telah dibatalkan (VOID)</span>
                </div>
                <div>Alasan: "{selectedTrx.voidReason}"</div>
                <div className="text-[11px] text-rose-600">Dibatalkan oleh {selectedTrx.voidBy} pada {formatDateTime(selectedTrx.voidAt)}</div>
              </div>
            )}

            {/* Items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto shrink-0">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Harga</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTrx.items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-medium">{it.name}</td>
                      <td className="p-2.5 text-center font-bold">{it.qty}</td>
                      <td className="p-2.5 text-right font-mono">{formatRupiah(it.price)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatRupiah(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payment & Summary Breakdown (Clear Uang Diterima & Kembalian) */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs text-slate-600 border border-slate-200/80 shrink-0">
              <div className="flex justify-between">
                <span>Subtotal Barang:</span>
                <span className="font-mono font-semibold text-slate-800">{formatRupiah(selectedTrx.subtotal)}</span>
              </div>
              {selectedTrx.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Potongan Diskon:</span>
                  <span className="font-mono">-{formatRupiah(selectedTrx.discount)}</span>
                </div>
              )}
              {selectedTrx.tax > 0 && (
                <div className="flex justify-between">
                  <span>Pajak (PPN):</span>
                  <span className="font-mono">{formatRupiah(selectedTrx.tax)}</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Tagihan:</span>
                <span className="text-emerald-700 font-mono text-base">{formatRupiah(selectedTrx.total)}</span>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Uang Diterima (Bayar):</span>
                  <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {formatRupiah(selectedTrx.amountPaid || selectedTrx.total)} ({selectedTrx.paymentMethod})
                  </span>
                </div>
                {selectedTrx.paymentMethod === 'TUNAI' && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Uang Kembalian:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {formatRupiah(selectedTrx.change || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1 shrink-0">
              <button
                onClick={() => {
                  onReprintReceipt(selectedTrx);
                  setSelectedTrx(null);
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Kirim Struk</span>
              </button>
              <button
                onClick={() => setSelectedTrx(null)}
                className="py-3 px-5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOID TRANSACTION CONFIRMATION MODAL */}
      {showVoidModal && voidTargetTrx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-rose-700 text-base flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                <span>Batalkan (VOID) Transaksi?</span>
              </h3>
              <button onClick={() => setShowVoidModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Membatalkan nota <span className="font-bold font-mono text-slate-900">{voidTargetTrx.id}</span> senilai <span className="font-bold text-rose-600 font-mono">{formatRupiah(voidTargetTrx.total)}</span>. Stok barang akan otomatis dikembalikan ke inventori toko dan tercatat permanen di audit log.
            </p>

            <form onSubmit={handleConfirmVoid} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Alasan Pembatalan / Refund <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Salah input pesanan, pelanggan batal beli..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Jangan Batalkan
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
                >
                  Konfirmasi VOID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
