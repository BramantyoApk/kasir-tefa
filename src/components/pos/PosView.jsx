import React, { useState, useRef, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  Search, 
  ScanBarcode, 
  Camera, 
  Plus, 
  ShoppingBag, 
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  Layers,
  X,
  PackagePlus,
  Layers3,
  Check
} from 'lucide-react';

export const PosView = ({ 
  onOpenCameraScanner, 
  onOpenMobileCart,
  onOpenHoldModal,
  onOpenPaymentModal,
  onGoToInventory
}) => {
  const { 
    products, 
    categories, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery, 
    addToCart, 
    cart, 
    cartGrandTotal, 
    totalItemCount,
    holdOrders
  } = usePos();

  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Variant Selection Modal
  const [variantModalProduct, setVariantModalProduct] = useState(null);

  // Keyboard shortcut listener (F1 focus search, F2 pay, F3 scan camera)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0) onOpenPaymentModal();
      } else if (e.key === 'F3') {
        e.preventDefault();
        onOpenCameraScanner();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, onOpenPaymentModal, onOpenCameraScanner]);

  // Handle Barcode Scanner Gun
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    // Check main product or product variant barcode
    let matchedProduct = null;
    let matchedVariant = null;

    for (const p of products) {
      if (p.barcode === code || p.id.toLowerCase() === code.toLowerCase()) {
        matchedProduct = p;
        break;
      }
      if (p.variants && p.variants.length > 0) {
        const foundVar = p.variants.find(v => v.barcode === code);
        if (foundVar) {
          matchedProduct = p;
          matchedVariant = foundVar;
          break;
        }
      }
    }

    if (matchedProduct) {
      if (matchedVariant) {
        addToCart(matchedProduct, 1, matchedVariant);
      } else if (matchedProduct.variants && matchedProduct.variants.length > 0) {
        setVariantModalProduct(matchedProduct);
      } else {
        addToCart(matchedProduct, 1);
      }
      setBarcodeInput('');
    } else {
      alert(`Produk dengan Barcode/SKU "${code}" tidak ditemukan!`);
      setBarcodeInput('');
    }
  };

  const handleProductCardClick = (product) => {
    if (product.stock <= 0) return;

    if (product.variants && product.variants.length > 0) {
      setVariantModalProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  // Filter products by category & search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'Semua' || product.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      product.name.toLowerCase().includes(q) || 
      product.barcode.includes(q) || 
      product.id.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden relative">
      
      {/* Top Search & Filter Bar */}
      <div className="bg-white border-b border-slate-200 p-3 sm:p-4 space-y-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Main Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari nama barang / barcode (F1)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Barcode Scanner Gun Input */}
          <form onSubmit={handleBarcodeSubmit} className="hidden sm:flex items-center relative w-48">
            <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-8 pr-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
          </form>

          {/* Camera Scanner Button */}
          <button
            onClick={onOpenCameraScanner}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
            title="Scan Barcode via Kamera HP/Laptop (F3)"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Kamera Scan (F3)</span>
          </button>
        </div>

        {/* Categories Horizontal Pills Slider */}
        {categories.length > 1 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Catalog Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
              <PackagePlus className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">Katalog Produk Masih Bersih (0 Barang)</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Database kasir siap digunakan. Silakan masukkan produk jualan Anda melalui menu Produk & Stok untuk mulai melayani transaksi.
              </p>
            </div>
            {onGoToInventory && (
              <button
                onClick={onGoToInventory}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Input Produk Pertama Sekarang</span>
              </button>
            )}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600 text-sm">Tidak ada produk ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba kata kunci pencarian lain atau pilih kategori "Semua"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3.5">
            {filteredProducts.map((product) => {
              const inCartCount = cart
                .filter(ci => (ci.productId || ci.id) === product.id)
                .reduce((sum, ci) => sum + ci.qty, 0);

              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;
              const hasVariants = product.variants && product.variants.length > 0;

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductCardClick(product)}
                  className={`
                    relative group bg-white rounded-2xl p-3 border text-left flex flex-col justify-between
                    transition-all duration-150 select-none shadow-sm
                    ${isOutOfStock ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50' : 'cursor-pointer hover:shadow-md hover:border-emerald-500/50 active:scale-[0.98] border-slate-200/80'}
                    ${inCartCount > 0 ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : ''}
                  `}
                >
                  {/* Top Badges & Image / Icon */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    {/* Uploaded Photo or Emoji */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 aspect-square">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl">{product.emoji || '📦'}</span>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Quantity in cart badge */}
                      {inCartCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-sm animate-in zoom-in-50">
                          {inCartCount} di keranjang
                        </span>
                      )}

                      {/* Variant badge */}
                      {hasVariants && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-0.5">
                          <Layers3 className="w-2.5 h-2.5" />
                          <span>{product.variants.length} Varian</span>
                        </span>
                      )}

                      {/* Stock status badge */}
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          Sisa {product.stock}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">
                          Stok: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mt-1">
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {product.barcode}
                    </div>
                  </div>

                  {/* Price & Add Indicator */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600 font-mono">
                        {hasVariants ? `Mulai ${formatRupiah(Math.min(...product.variants.map(v => v.price)))}` : formatRupiah(product.price)}
                      </span>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar for Mobile Android */}
      {cart.length > 0 && (
        <div className="lg:hidden p-3 bg-white border-t border-slate-200 shrink-0 shadow-xl">
          <button
            onClick={onOpenMobileCart}
            className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-between shadow-lg shadow-emerald-600/30 active:scale-98"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-extrabold">
                {totalItemCount}
              </div>
              <span className="text-sm">Lihat Keranjang</span>
            </div>
            <div className="text-base font-extrabold font-mono">
              {formatRupiah(cartGrandTotal)}
            </div>
          </button>
        </div>
      )}

      {/* VARIANT SELECTION POPUP MODAL */}
      {variantModalProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pilih Varian Produk</h3>
                <p className="text-xs text-slate-500">{variantModalProduct.name}</p>
              </div>
              <button 
                onClick={() => setVariantModalProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {variantModalProduct.variants.map((v) => {
                const isOutOfStock = v.stock !== undefined && v.stock <= 0;

                return (
                  <button
                    key={v.id}
                    disabled={isOutOfStock}
                    onClick={() => {
                      addToCart(variantModalProduct, 1, v);
                      setVariantModalProduct(null);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : 'hover:border-emerald-500 hover:bg-emerald-50/30 border-slate-200 active:scale-98 shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{v.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {v.stock !== undefined ? `Stok: ${v.stock} ${variantModalProduct.unit || 'pcs'}` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-700 font-mono text-sm">
                        {formatRupiah(v.price)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setVariantModalProduct(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Batal
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
