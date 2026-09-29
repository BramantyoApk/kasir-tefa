import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { 
  CircleDollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Printer, 
  FileText,
  PlusCircle,
  X
} from 'lucide-react';

export const ShiftView = ({ onOpenShiftModal }) => {
  const { 
    currentShift, 
    pettyCashLogs, 
    addPettyCash, 
    openShift, 
    closeShift,
    transactions,
    currentUser,
    settings 
  } = usePos();

  const [showPettyModal, setShowPettyModal] = useState(false);
  const [pettyType, setPettyType] = useState('OUT'); // 'OUT' (pengeluaran) or 'IN' (pemasukan)
  const [pettyAmount, setPettyAmount] = useState('');
  const [pettyDesc, setPettyDesc] = useState('');

  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualCashCounted, setActualCashCounted] = useState('');
  const [closeNote, setCloseNote] = useState('');

  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [startingCashInput, setStartingCashInput] = useState('200000');
  const [openShiftNote, setOpenShiftNote] = useState('');

  const [showZReportModal, setShowZReportModal] = useState(false);
  const [completedShiftSummary, setCompletedShiftSummary] = useState(null);

  const isOpen = currentShift && currentShift.status === 'OPEN';

  // Calculate shift cash sales
  const shiftCashSales = transactions
    .filter(t => t.paymentMethod === 'TUNAI' && t.status !== 'VOID')
    .reduce((sum, t) => sum + t.total, 0);

  const handleSavePettyCash = (e) => {
    e.preventDefault();
    if (!pettyAmount || Number(pettyAmount) <= 0) {
      alert('Masukkan nominal kas yang valid!');
      return;
    }
    if (!pettyDesc.trim()) {
      alert('Keterangan operasional wajib diisi!');
      return;
    }

    addPettyCash(pettyType, Number(pettyAmount), pettyDesc.trim());
    setPettyAmount('');
    setPettyDesc('');
    setShowPettyModal(false);
  };

  const handleConfirmCloseShift = (e) => {
    e.preventDefault();
    if (actualCashCounted === '' || isNaN(Number(actualCashCounted))) {
      alert('Masukkan jumlah uang fisik di laci kasir!');
      return;
    }

    const closed = closeShift(Number(actualCashCounted), closeNote);
    setShowCloseShiftModal(false);
    if (closed) {
      setCompletedShiftSummary(closed);
      setShowZReportModal(true);
    }
  };

  const handleConfirmOpenShift = (e) => {
    e.preventDefault();
    openShift(Number(startingCashInput), openShiftNote || 'Buka Shift Baru');
    setShowOpenShiftModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CircleDollarSign className="w-6 h-6 text-emerald-600" />
              <span>Manajemen Kas & Shift Kasir</span>
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isOpen ? '● SHIFT AKTIF (BUKA)' : '● SHIFT TERTUTUP'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekap uang tunai laci, arus kas kecil operasional, dan pertanggungjawaban shift
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? (
            <>
              <button
                onClick={() => setShowPettyModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Catat Kas Kecil</span>
              </button>
              
              <button
                onClick={() => {
                  setActualCashCounted(currentShift.expectedCash);
                  setShowCloseShiftModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Tutup Kasir (End Shift)</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowOpenShiftModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Shift Kasir Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Cash Drawer Metrics Grid */}
      {isOpen && currentShift && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Starting Cash */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500">Modal Awal Kas</span>
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {formatRupiah(currentShift.startingCash)}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Buka: {formatDateTime(currentShift.openedAt)}</span>
            </div>
          </div>

          {/* Cash Sales */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500">Penjualan Tunai Sistem</span>
            <div className="text-xl font-extrabold text-emerald-600 font-mono">
              +{formatRupiah(shiftCashSales)}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              Dari pesanan tunai shift ini
            </div>
          </div>

          {/* Petty Cash Out */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500">Kas Keluar Operasional</span>
            <div className="text-xl font-extrabold text-rose-600 font-mono">
              -{formatRupiah(currentShift.cashOut || 0)}
            </div>
            <div className="text-[11px] text-slate-400">
              Kas Masuk Lain: +{formatRupiah(currentShift.cashIn || 0)}
            </div>
          </div>

          {/* Expected Cash in Drawer */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md space-y-1">
            <span className="text-xs font-semibold text-slate-300">Estimasi Uang Fisik di Laci</span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatRupiah(currentShift.expectedCash)}
            </div>
            <div className="text-[10px] text-slate-400">
              Petugas: {currentShift.cashier}
            </div>
          </div>

        </div>
      )}

      {/* Petty Cash Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Riwayat Kas Kecil Operasional (Petty Cash)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan pengeluaran & pemasukan kecil (beli es, galon, uang kembalian tambahan, dll)
            </p>
          </div>

          {isOpen && (
            <button
              onClick={() => setShowPettyModal(true)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
            >
              + Catat Arus Kas
            </button>
          )}
        </div>

        {pettyCashLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-xs">Belum ada catatan kas kecil pada shift ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Petugas</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {pettyCashLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      {log.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>Kas Masuk</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Kas Keluar</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.user}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${
                      log.type === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {log.type === 'IN' ? '+' : '-'}{formatRupiah(log.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD PETTY CASH MODAL */}
      {showPettyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Catat Kas Operasional Laci</h3>
              <button onClick={() => setShowPettyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePettyCash} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPettyType('OUT')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    pettyType === 'OUT' ? 'bg-rose-600 text-white border-rose-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Kas Keluar (Biaya)
                </button>
                <button
                  type="button"
                  onClick={() => setPettyType('IN')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    pettyType === 'IN' ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Kas Masuk (Tambah)
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nominal (Rp):</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 25000"
                  value={pettyAmount}
                  onChange={(e) => setPettyAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Keterangan Pengeluaran/Pemasukan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli air mineral galon, kantong kresek..."
                  value={pettyDesc}
                  onChange={(e) => setPettyDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPettyModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Arus Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE SHIFT MODAL */}
      {showCloseShiftModal && currentShift && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-600" />
                  <span>Tutup Kasir / Akhiri Shift</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Petugas: {currentShift.cashier}</p>
              </div>
              <button onClick={() => setShowCloseShiftModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCloseShift} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimasi Kas Sistem:</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">
                    {formatRupiah(currentShift.expectedCash)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  (Modal Awal + Total Penjualan Tunai + Kas Masuk - Kas Keluar)
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Hitung Uang Fisik di Laci Kasir (Rp):
                </label>
                <input
                  type="number"
                  required
                  value={actualCashCounted}
                  onChange={(e) => setActualCashCounted(e.target.value)}
                  className="w-full px-3 py-2.5 text-lg font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 font-mono"
                  placeholder="Ketik total uang fisik..."
                  autoFocus
                />
              </div>

              {/* Difference Preview */}
              {actualCashCounted !== '' && (
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  Number(actualCashCounted) - currentShift.expectedCash === 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : Number(actualCashCounted) - currentShift.expectedCash > 0
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <span>Selisih Kas:</span>
                  <span className="font-mono text-sm">
                    {Number(actualCashCounted) - currentShift.expectedCash === 0
                      ? 'SEIMBANG (Rp 0)'
                      : (Number(actualCashCounted) - currentShift.expectedCash > 0 ? '+' : '') + 
                        formatRupiah(Number(actualCashCounted) - currentShift.expectedCash)}
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Tutup Shift (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Shift sore ramai, uang fisik sesuai"
                  value={closeNote}
                  onChange={(e) => setCloseNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseShiftModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
                >
                  Konfirmasi Tutup Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPEN SHIFT MODAL */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <span>Buka Shift Kasir Baru</span>
              </h3>
              <button onClick={() => setShowOpenShiftModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOpenShift} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Modal Kas Awal di Laci (Float Money):
                </label>
                <input
                  type="number"
                  required
                  value={startingCashInput}
                  onChange={(e) => setStartingCashInput(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="Rp 200.000"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Uang pecahan kembalian yang dimasukkan ke laci sebelum toko buka.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Catatan Pembukaan:
                </label>
                <input
                  type="text"
                  value={openShiftNote}
                  onChange={(e) => setOpenShiftNote(e.target.value)}
                  placeholder="Contoh: Shift Pagi Kasir 1"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenShiftModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Buka Shift Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Z-REPORT MODAL (REKAP SHIFT) */}
      {showZReportModal && completedShiftSummary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <span>Ringkasan Z-Report Shift</span>
              </h3>
              <button onClick={() => setShowZReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl font-mono text-xs space-y-2">
              <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300">
                LAPORAN TUTUP KASIR (Z-REPORT)
                <div className="text-[10px] text-slate-500 font-normal">{settings.storeName}</div>
              </div>
              <div className="flex justify-between">
                <span>Waktu Tutup:</span>
                <span>{formatDateTime(completedShiftSummary.closedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Petugas:</span>
                <span>{completedShiftSummary.closedBy}</span>
              </div>
              <div className="border-b border-dashed border-slate-300 my-1" />
              <div className="flex justify-between">
                <span>Modal Awal:</span>
                <span>{formatRupiah(completedShiftSummary.startingCash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Kas Laci:</span>
                <span>{formatRupiah(completedShiftSummary.expectedCash)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Fisik Dihitung:</span>
                <span>{formatRupiah(completedShiftSummary.actualCash)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-dashed border-slate-300 text-slate-900">
                <span>Selisih:</span>
                <span className={completedShiftSummary.difference < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {completedShiftSummary.difference >= 0 ? '+' : ''}{formatRupiah(completedShiftSummary.difference)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Rekap</span>
              </button>
              <button
                onClick={() => setShowZReportModal(false)}
                className="py-2.5 px-4 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
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
