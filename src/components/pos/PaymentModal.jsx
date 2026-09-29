import React, { useState, useEffect, useRef } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah } from '../../utils/formatters';
import QRCode from 'qrcode';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  BookOpen, 
  X, 
  Check, 
  Printer, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Smartphone
} from 'lucide-react';

export const PaymentModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  const { 
    cartGrandTotal, 
    cartSubtotal, 
    calculatedDiscount, 
    taxAmount, 
    totalItemCount,
    selectedCustomer, 
    processCheckout,
    settings 
  } = usePos();

  const [paymentMethod, setPaymentMethod] = useState('TUNAI');
  const [cashAmount, setCashAmount] = useState(cartGrandTotal);
  const [paymentNote, setPaymentNote] = useState('');
  const [qrisDataUrl, setQrisDataUrl] = useState('');

  const cashInputRef = useRef(null);

  // Set default cash amount to exact total when modal opens
  useEffect(() => {
    if (isOpen) {
      setCashAmount(cartGrandTotal);
      setPaymentMethod('TUNAI');
      setPaymentNote('');
      setTimeout(() => cashInputRef.current?.select(), 100);
    }
  }, [isOpen, cartGrandTotal]);

  // Generate QR Code for QRIS
  useEffect(() => {
    if (paymentMethod === 'QRIS') {
      // Standard dummy QRIS payload with dynamic amount
      const qrisPayload = `00020101021226670014ID.LINKAJA.WWW01189360001400000000000215ID10200210000000303UMI51440014ID.CO.QRIS.WWW0215ID10200210000000303UMI520454115303360540${cartGrandTotal.toString().length}${cartGrandTotal}5802ID5913${settings.storeName.slice(0, 13)}6007JAKARTA61051011062070703A016304ABCD`;

      QRCode.toDataURL(qrisPayload, {
        width: 220,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      .then(url => setQrisDataUrl(url))
      .catch(err => console.error(err));
    }
  }, [paymentMethod, cartGrandTotal, settings.storeName]);

  if (!isOpen) return null;

  const quickNominals = [
    { label: 'Uang Pas', value: cartGrandTotal },
    { label: 'Rp 10.000', value: 10000 },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
  ].filter(item => item.value >= cartGrandTotal || item.label === 'Uang Pas');

  const parsedCash = Number(cashAmount) || 0;
  const changeAmount = Math.max(0, parsedCash - cartGrandTotal);
  const isCashInsufficient = paymentMethod === 'TUNAI' && parsedCash < cartGrandTotal;

  const handleConfirmPayment = () => {
    if (isCashInsufficient) {
      alert('Jumlah uang tunai yang dibayarkan kurang dari total belanja!');
      return;
    }

    if (paymentMethod === 'PIUTANG' && selectedCustomer.id === 'CUST-001') {
      alert('Pelanggan Umum / Walk-in tidak dapat menggunakan metode Piutang/Bon! Silakan pilih pelanggan terdaftar.');
      return;
    }

    const completedTrx = processCheckout({
      paymentMethod,
      amountPaid: parsedCash,
      note: paymentNote,
      customerId: selectedCustomer.id,
    });

    if (completedTrx) {
      onClose();
      onPaymentSuccess(completedTrx);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Pembayaran Kasir</h2>
            <p className="text-xs text-slate-300">
              Pelanggan: <span className="font-bold text-white">{selectedCustomer.name}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Total Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Total Tagihan
              </span>
              <div className="text-xs text-emerald-600 mt-0.5">
                {totalItemCount} barang
                {calculatedDiscount > 0 ? ` • Hemat ${formatRupiah(calculatedDiscount)}` : ''}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              {formatRupiah(cartGrandTotal)}
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Pilih Metode Pembayaran:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'TUNAI', label: 'Tunai', icon: Banknote },
                { id: 'QRIS', label: 'QRIS', icon: QrCode },
                { id: 'TRANSFER', label: 'Transfer', icon: CreditCard },
                { id: 'PIUTANG', label: 'Piutang / Bon', icon: BookOpen },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold scale-[1.02]'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Content */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            
            {/* TUNAI MODE */}
            {paymentMethod === 'TUNAI' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Uang Diterima (Rp):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">
                      Rp
                    </span>
                    <input
                      ref={cashInputRef}
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Quick Cash Buttons */}
                <div className="flex flex-wrap gap-2">
                  {quickNominals.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashAmount(item.value)}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Change Indicator (Kembalian) */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">Uang Kembalian:</span>
                  <span className={`text-xl font-extrabold font-mono ${
                    isCashInsufficient ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {isCashInsufficient 
                      ? `Kurang ${formatRupiah(cartGrandTotal - parsedCash)}`
                      : formatRupiah(changeAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS MODE */}
            {paymentMethod === 'QRIS' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center sm:text-left">
                  <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 shrink-0 aspect-square">
                    {qrisDataUrl ? (
                      <img 
                        src={qrisDataUrl} 
                        alt="QRIS Dinamis" 
                        className="w-40 h-40 rounded-xl"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                        Membuat QRIS...
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="font-extrabold text-slate-900 text-base">
                      Scan QRIS Dinamis ({settings.storeName})
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[11px] text-emerald-700 block font-medium">Total Tagihan QRIS:</span>
                      <span className="font-extrabold text-emerald-800 text-lg font-mono">
                        {formatRupiah(cartGrandTotal)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, DANA, ShopeePay & Semua Bank.
                    </p>
                  </div>
                </div>

                {/* Petunjuk Verifikasi Uang Masuk QRIS */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cara Mengetahui Pembayaran QRIS Sudah Masuk:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 bg-white rounded-xl border border-slate-100 flex items-start gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 block">1. Suara Soundbox / HP</strong>
                        <span>Notifikasi suara / SMS di HP merchant toko berbunyi uang masuk.</span>
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-100 flex items-start gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 block">2. Layar HP Pembeli</strong>
                        <span>Pastikan layar HP pembeli menampilkan status hijau <strong>"Berhasil"</strong> senilai {formatRupiah(cartGrandTotal)}.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSFER MODE */}
            {paymentMethod === 'TRANSFER' && (
              <div className="space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-800">Rekening Tujuan Toko:</div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bank Central Asia (BCA):</span>
                    <span className="font-bold font-mono text-slate-800">8234-9021-12</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Bank Mandiri:</span>
                    <span className="font-bold font-mono text-slate-800">1370-0099-2341</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Atas Nama:</span>
                    <span className="font-bold text-slate-800">{settings.storeName}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nomor Referensi / Catatan Transfer:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ref / Pengirim: Budi BCA"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* PIUTANG / BON MODE */}
            {paymentMethod === 'PIUTANG' && (
              <div className="space-y-3">
                {selectedCustomer.id === 'CUST-001' ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">Pelanggan belum dipilih!</span>
                      <p className="mt-0.5">Pilih nama pelanggan terdaftar di keranjang sebelum mencatat piutang/bon.</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pelanggan:</span>
                      <span className="font-bold text-slate-800">{selectedCustomer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hutang/Bon Sebelumnya:</span>
                      <span className="font-semibold text-rose-600 font-mono">{formatRupiah(selectedCustomer.debt || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tambah Bon Transaksi Ini:</span>
                      <span className="font-bold text-slate-900 font-mono">+{formatRupiah(cartGrandTotal)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                      <span className="text-slate-800">Total Hutang Akumulasi:</span>
                      <span className="text-rose-700 font-mono font-extrabold">
                        {formatRupiah((selectedCustomer.debt || 0) + cartGrandTotal)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Catatan Janji Bayar / Jatuh Tempo:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Janji bayar tgl 30 bulan ini"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isCashInsufficient}
              className="flex-[2] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <Check className="w-5 h-5" />
              <span>Selesaikan & Cetak Struk</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
