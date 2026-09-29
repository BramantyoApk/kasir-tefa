import React, { useRef } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { exportReceiptPdf } from '../../utils/pdfExport';
import { 
  Printer, 
  Share2, 
  X, 
  CheckCircle2, 
  Send, 
  Copy,
  Receipt,
  FileDown
} from 'lucide-react';

export const ReceiptModal = ({ transaction, isOpen, onClose }) => {
  const { settings } = usePos();
  const receiptPrintRef = useRef(null);

  if (!isOpen || !transaction) return null;

  const is58mm = settings.receiptWidth === '58mm';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    exportReceiptPdf({
      storeName: settings.storeName,
      storeAddress: settings.storeAddress,
      storePhone: settings.storePhone,
      receiptFooter: settings.receiptFooter,
      transaction,
    });
  };

  const generateWhatsAppMessage = () => {
    const lines = [
      `*🧾 NOTA TRANSAKSI - ${settings.storeName.toUpperCase()}*`,
      `${settings.storeAddress}`,
      `Telp: ${settings.storePhone}`,
      `----------------------------------------`,
      `No. Nota: ${transaction.id}`,
      `Tanggal : ${formatDateTime(transaction.date)}`,
      `Kasir   : ${transaction.cashier}`,
      `Pelanggan: ${transaction.customer?.name || 'Umum'}`,
      `----------------------------------------`,
      ...transaction.items.map(item => 
        `${item.name}\n  ${item.qty} x ${formatRupiah(item.price)} = ${formatRupiah(item.subtotal)}`
      ),
      `----------------------------------------`,
      `Subtotal : ${formatRupiah(transaction.subtotal)}`,
      transaction.discount > 0 ? `Diskon   : -${formatRupiah(transaction.discount)}` : null,
      transaction.tax > 0 ? `PPN      : ${formatRupiah(transaction.tax)}` : null,
      `*TOTAL    : ${formatRupiah(transaction.total)}*`,
      `Bayar (${transaction.paymentMethod}) : ${formatRupiah(transaction.amountPaid || transaction.total)}`,
      transaction.paymentMethod === 'TUNAI' ? `Kembalian: ${formatRupiah(transaction.change || 0)}` : null,
      `----------------------------------------`,
      settings.receiptFooter || 'Terima kasih telah berbelanja!',
    ].filter(Boolean);

    return encodeURIComponent(lines.join('\n'));
  };

  const handleSendWhatsApp = () => {
    const text = generateWhatsAppMessage();
    let phone = transaction.customer?.phone?.replace(/\D/g, '') || '';
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    }
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const rawText = decodeURIComponent(generateWhatsAppMessage());
    navigator.clipboard.writeText(rawText);
    alert('Teks nota berhasil disalin ke clipboard!');
  };

  return (
    <>
      {/* Visual Modal Dialog */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 my-auto max-h-[92vh]">
          
          {/* Modal Header */}
          <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <h2 className="text-base font-bold">Transaksi Berhasil!</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Preview Card */}
          <div className="p-4 bg-slate-100 overflow-y-auto flex-1 flex justify-center">
            
            <div className={`bg-white p-4 shadow-sm border border-slate-200 rounded-lg text-slate-800 font-mono text-xs ${
              is58mm ? 'w-[280px]' : 'w-[340px]'
            }`}>
              
              {/* Store Header */}
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
                <div className="font-extrabold text-sm uppercase tracking-wide">
                  {settings.storeName}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  {settings.storeAddress}
                </div>
                <div className="text-[10px] text-slate-500">
                  Telp: {settings.storePhone}
                </div>
              </div>

              {/* Transaction Meta */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Nota:</span>
                  <span className="font-bold">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu:</span>
                  <span>{formatDateTime(transaction.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kasir:</span>
                  <span>{transaction.cashier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span>{transaction.customer?.name || 'Umum'}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-2 text-[11px]">
                {transaction.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold truncate">{item.name}</div>
                    <div className="flex justify-between text-slate-600">
                      <span>{item.qty} {item.unit || 'pcs'} x {formatRupiah(item.price)}</span>
                      <span className="font-bold text-slate-800 font-mono">{formatRupiah(item.subtotal)}</span>
                    </div>
                    {item.discount > 0 && (
                      <div className="text-rose-600 text-[10px]">
                        Diskon item: -{formatRupiah(item.discount)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals & Payment */}
              <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-mono">{formatRupiah(transaction.subtotal)}</span>
                </div>

                {transaction.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon</span>
                    <span className="font-mono">-{formatRupiah(transaction.discount)}</span>
                  </div>
                )}

                {transaction.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">PPN</span>
                    <span className="font-mono">{formatRupiah(transaction.tax)}</span>
                  </div>
                )}

                <div className="pt-1 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>TOTAL</span>
                  <span className="font-mono">{formatRupiah(transaction.total)}</span>
                </div>

                <div className="flex justify-between pt-1 text-[10px] text-slate-600 font-mono">
                  <span>Bayar ({transaction.paymentMethod})</span>
                  <span className="font-bold">{formatRupiah(transaction.amountPaid || transaction.total)}</span>
                </div>

                {transaction.paymentMethod === 'TUNAI' && (
                  <div className="flex justify-between text-[10px] font-bold text-slate-800 font-mono">
                    <span>Kembalian</span>
                    <span>{formatRupiah(transaction.change || 0)}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-3 text-[10px] text-slate-500 whitespace-pre-line leading-tight">
                {settings.receiptFooter}
              </div>

            </div>

          </div>

          {/* Action Toolbar */}
          <div className="p-4 bg-white border-t border-slate-200 space-y-2 shrink-0">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePrint}
                className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-md"
                title="Cetak lewat printer kasir / thermal"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Print</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-md"
                title="Simpan sebagai file PDF"
              >
                <FileDown className="w-4 h-4" />
                <span>Struk PDF</span>
              </button>

              <button
                onClick={handleSendWhatsApp}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-md"
                title="Kirim struk ke WhatsApp"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyText}
                className="flex-1 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks Nota</span>
              </button>

              <button
                onClick={onClose}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
              >
                Tutup / Selesai
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden Print Container for Clean Thermal Output */}
      <div id="thermal-receipt-print-area" className="hidden">
        <div style={{ width: is58mm ? '58mm' : '80mm', margin: '0 auto', fontSize: '11px', lineHeight: '1.2' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{settings.storeName}</div>
            <div>{settings.storeAddress}</div>
            <div>Telp: {settings.storePhone}</div>
          </div>
          <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />
          <div>No: {transaction.id}</div>
          <div>Tgl: {formatDateTime(transaction.date)}</div>
          <div>Kasir: {transaction.cashier}</div>
          <div>Pelanggan: {transaction.customer?.name || 'Umum'}</div>
          <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />
          {transaction.items.map((item, idx) => (
            <div key={idx} style={{ marginBottom: '4px' }}>
              <div>{item.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.qty} x {formatRupiah(item.price)}</span>
                <span style={{ fontWeight: 'bold' }}>{formatRupiah(item.subtotal)}</span>
              </div>
            </div>
          ))}
          <div style={{ borderBottom: '1px dashed #000', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>{formatRupiah(transaction.subtotal)}</span>
          </div>
          {transaction.discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Diskon:</span>
              <span>-{formatRupiah(transaction.discount)}</span>
            </div>
          )}
          {transaction.tax > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>PPN:</span>
              <span>{formatRupiah(transaction.tax)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', marginTop: '4px' }}>
            <span>TOTAL:</span>
            <span>{formatRupiah(transaction.total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
            <span>Bayar ({transaction.paymentMethod}):</span>
            <span>{formatRupiah(transaction.amountPaid || transaction.total)}</span>
          </div>
          {transaction.paymentMethod === 'TUNAI' && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Kembalian:</span>
              <span>{formatRupiah(transaction.change || 0)}</span>
            </div>
          )}
          <div style={{ borderBottom: '1px dashed #000', margin: '6px 0' }} />
          <div style={{ textAlign: 'center', whiteSpace: 'pre-line', fontSize: '10px' }}>
            {settings.receiptFooter}
          </div>
        </div>
      </div>
    </>
  );
};
