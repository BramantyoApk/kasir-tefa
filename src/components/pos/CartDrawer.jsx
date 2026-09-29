import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  FileText, 
  Layers, 
  RotateCcw, 
  CreditCard, 
  User, 
  X, 
  Percent, 
  Check,
  Edit2
} from 'lucide-react';

export const CartDrawer = ({ 
  isOpenMobile, 
  onCloseMobile, 
  onOpenPaymentModal, 
  onOpenHoldModal 
}) => {
  const { 
    cart, 
    updateCartQty, 
    updateCartItemPrice,
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    calculatedDiscount, 
    taxAmount, 
    cartGrandTotal, 
    totalItemCount,
    orderDiscount,
    setOrderDiscount,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    orderNote,
    setOrderNote,
    holdCurrentOrder,
    updateCartItemDiscount,
    updateCartItemNote,
    settings
  } = usePos();

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountType, setDiscountType] = useState(orderDiscount.type || 'nominal');
  const [discountVal, setDiscountVal] = useState(orderDiscount.value || 0);

  const [editingItemNote, setEditingItemNote] = useState(null);
  const [itemNoteText, setItemNoteText] = useState('');

  const [editingItemDiscount, setEditingItemDiscount] = useState(null);
  const [itemDiscountVal, setItemDiscountVal] = useState(0);

  // Editing Item Price directly
  const [editingItemPrice, setEditingItemPrice] = useState(null);
  const [itemPriceVal, setItemPriceVal] = useState(0);

  const handleApplyOrderDiscount = () => {
    setOrderDiscount({
      type: discountType,
      value: Number(discountVal) || 0
    });
    setShowDiscountModal(false);
  };

  const handleSaveItemNote = (cartItemId) => {
    updateCartItemNote(cartItemId, itemNoteText);
    setEditingItemNote(null);
    setItemNoteText('');
  };

  const handleSaveItemDiscount = (cartItemId) => {
    updateCartItemDiscount(cartItemId, Number(itemDiscountVal) || 0);
    setEditingItemDiscount(null);
    setItemDiscountVal(0);
  };

  const handleSaveItemPrice = (cartItemId) => {
    const numPrice = Number(itemPriceVal);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Harga harus berupa angka yang valid!');
      return;
    }
    updateCartItemPrice(cartItemId, numPrice);
    setEditingItemPrice(null);
  };

  return (
    <>
      {/* Mobile/Tablet Backdrop when cart drawer is open */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 top-14 sm:top-16 bg-slate-900/40 backdrop-blur-xs z-20 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <div className={`
        fixed lg:static top-14 sm:top-16 lg:top-auto bottom-0 right-0 z-30 lg:z-auto w-full sm:w-96 lg:w-[420px] bg-white border-l border-slate-200 
        flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] lg:h-full shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 text-lg">Keranjang Belanja</h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                {totalItemCount} item
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Daftar pesanan aktif transaksi ini</p>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Kosongkan semua item di keranjang?')) clearCart();
                }}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Kosongkan Keranjang"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            
            {/* Close button on Mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Selector & Quick Info */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customers.find(c => c.id === e.target.value);
                if (found) setSelectedCustomer(found);
              }}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.debt > 0 ? `(Bon: ${formatRupiah(c.debt)})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              if (cart.length === 0) {
                alert('Keranjang masih kosong!');
                return;
              }
              const name = prompt('Nama pelanggan antrian:', selectedCustomer.name);
              if (name !== null) {
                holdCurrentOrder(name);
                if (onCloseMobile) onCloseMobile();
              }
            }}
            disabled={cart.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors disabled:opacity-40"
            title="Tahan transaksi untuk melayani pelanggan berikutnya"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tahan</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3 text-3xl">
                🛒
              </div>
              <p className="font-semibold text-slate-600 text-sm">Keranjang Masih Kosong</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Pilih produk dari katalog di sebelah kiri atau scan barcode produk untuk memasukkan ke keranjang.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = (item.price * item.qty) - (item.discount || 0);

              return (
                <div 
                  key={item.id} 
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                        <span>{item.name}</span>
                      </div>

                      {/* Clickable Price to Edit directly */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItemPrice(item.id);
                            setItemPriceVal(item.price);
                          }}
                          className="text-xs text-emerald-700 font-mono font-bold hover:underline flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60"
                          title="Klik untuk ubah harga satuan barang ini"
                        >
                          <span>{formatRupiah(item.price)}</span>
                          <Edit2 className="w-3 h-3 text-emerald-600" />
                        </button>
                        <span className="text-[11px] text-slate-400">/ {item.unit || 'pcs'}</span>
                      </div>

                      {item.discount > 0 && (
                        <div className="text-[11px] text-rose-600 font-semibold">
                          Diskon item: -{formatRupiah(item.discount)}
                        </div>
                      )}
                      {item.note && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          Catatan: {item.note}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0 font-bold text-slate-900 text-sm font-mono">
                      {formatRupiah(Math.max(0, itemTotal))}
                    </div>
                  </div>

                  {/* Inline Price Edit */}
                  {editingItemPrice === item.id && (
                    <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                      <span className="text-xs font-bold text-emerald-800 shrink-0">Ubah Harga: Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={itemPriceVal}
                        onChange={(e) => setItemPriceVal(e.target.value)}
                        className="flex-1 text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 bg-white focus:ring-1 focus:ring-emerald-500 font-mono"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveItemPrice(item.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        title="Simpan Harga Baru"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingItemPrice(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Quantity and Action Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center space-x-1">
                      {/* Note Button */}
                      <button
                        onClick={() => {
                          setEditingItemNote(item.id);
                          setItemNoteText(item.note || '');
                        }}
                        className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                          item.note ? 'text-amber-600 bg-amber-50' : 'text-slate-400'
                        }`}
                        title="Tambah Catatan Item"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {/* Discount Item Button */}
                      <button
                        onClick={() => {
                          setEditingItemDiscount(item.id);
                          setItemDiscountVal(item.discount || 0);
                        }}
                        className={`p-1.5 rounded-lg text-xs hover:bg-slate-200 transition-colors ${
                          item.discount > 0 ? 'text-rose-600 bg-rose-50' : 'text-slate-400'
                        }`}
                        title="Diskon Khusus Item Ini"
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus dari Keranjang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateCartQty(item.id, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-9 text-center text-xs font-extrabold text-slate-800">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Item Note Edit */}
                  {editingItemNote === item.id && (
                    <div className="pt-2 flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Contoh: Tanpa gula, jangan pedas..."
                        value={itemNoteText}
                        onChange={(e) => setItemNoteText(e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveItemNote(item.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingItemNote(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Inline Item Discount Edit */}
                  {editingItemDiscount === item.id && (
                    <div className="pt-2 flex items-center gap-1">
                      <span className="text-xs text-slate-500">Diskon Rp:</span>
                      <input
                        type="number"
                        placeholder="Nominal Rp"
                        value={itemDiscountVal}
                        onChange={(e) => setItemDiscountVal(e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveItemDiscount(item.id)}
                        className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingItemDiscount(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Cart Bottom Summary & Checkout Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          
          {/* Subtotal, Discount & Tax breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal ({totalItemCount} item)</span>
              <span className="font-semibold text-slate-800 font-mono">{formatRupiah(cartSubtotal)}</span>
            </div>

            {/* Discount Row */}
            <div className="flex justify-between items-center text-rose-600">
              <button
                onClick={() => setShowDiscountModal(true)}
                className="flex items-center gap-1 font-semibold hover:underline"
              >
                <Tag className="w-3 h-3" />
                <span>
                  Diskon Transaksi {orderDiscount.value > 0 ? `(${orderDiscount.type === 'percent' ? `${orderDiscount.value}%` : formatRupiah(orderDiscount.value)})` : '+ Tambah'}
                </span>
              </button>
              <span className="font-bold font-mono">
                {calculatedDiscount > 0 ? `-${formatRupiah(calculatedDiscount)}` : 'Rp 0'}
              </span>
            </div>

            {/* Tax Row if enabled in settings */}
            {settings.taxEnabled && (
              <div className="flex justify-between">
                <span>PPN ({settings.taxRate}%)</span>
                <span className="font-semibold text-slate-800 font-mono">{formatRupiah(taxAmount)}</span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-extrabold text-slate-900">Total Tagihan</span>
              <span className="text-xl font-extrabold text-emerald-600 font-mono">
                {formatRupiah(cartGrandTotal)}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={() => {
              if (cart.length === 0) {
                alert('Keranjang masih kosong!');
                return;
              }
              onOpenPaymentModal();
            }}
            disabled={cart.length === 0}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-extrabold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <CreditCard className="w-5 h-5" />
            <span>Bayar Sekarang (F2)</span>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
              {formatRupiah(cartGrandTotal)}
            </span>
          </button>

        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Tag className="w-4 h-4 text-rose-500" />
                <span>Diskon Keseluruhan Transaksi</span>
              </h3>
              <button 
                onClick={() => setShowDiscountModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setDiscountType('nominal')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  discountType === 'nominal' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                Nominal (Rp)
              </button>
              <button
                onClick={() => setDiscountType('percent')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  discountType === 'percent' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
              >
                Persen (%)
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {discountType === 'nominal' ? 'Nilai Potongan (Rp)' : 'Persentase Diskon (%)'}
              </label>
              <input
                type="number"
                min="0"
                max={discountType === 'percent' ? 100 : cartSubtotal}
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                className="w-full text-base font-bold text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setDiscountVal(0);
                  setOrderDiscount({ type: 'nominal', value: 0 });
                  setShowDiscountModal(false);
                }}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hapus Diskon
              </button>
              <button
                onClick={handleApplyOrderDiscount}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
