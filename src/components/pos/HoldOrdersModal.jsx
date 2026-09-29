import React from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah, formatTime } from '../../utils/formatters';
import { Layers, ArrowRight, Trash2, X, Clock, ShoppingBag } from 'lucide-react';

export const HoldOrdersModal = ({ isOpen, onClose }) => {
  const { holdOrders, resumeHoldOrder, deleteHoldOrder } = usePos();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold">Daftar Antrian Ditahan (Hold)</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
          {holdOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 text-sm">Tidak ada transaksi yang ditahan</p>
              <p className="text-xs text-slate-400 mt-1">
                Gunakan tombol "Tahan" di keranjang ketika ingin melayani antrian pelanggan berikutnya sementara.
              </p>
            </div>
          ) : (
            holdOrders.map((order) => {
              const totalItems = order.cart.reduce((sum, item) => sum + item.qty, 0);
              const totalAmount = order.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

              return (
                <div 
                  key={order.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {order.customerName}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                        {totalItems} item
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(order.timestamp)}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatRupiah(totalAmount)}
                      </span>
                    </div>

                    {/* Brief list of items */}
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">
                      {order.cart.map(c => `${c.qty}x ${c.name}`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus antrian atas nama "${order.customerName}"?`)) {
                          deleteHoldOrder(order.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Hapus antrian ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        resumeHoldOrder(order.id);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <span>Lanjutkan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
