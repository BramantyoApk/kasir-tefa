import React, { useState, useRef } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah } from '../../utils/formatters';
import { compressImage } from '../../utils/imageCompressor';
import { exportProductsPdf } from '../../utils/pdfExport';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  AlertTriangle, 
  Barcode, 
  Printer, 
  X, 
  Check, 
  RotateCcw,
  TrendingUp,
  Tag,
  Filter,
  Download,
  PackagePlus,
  Upload,
  Image as ImageIcon,
  Layers3,
  FileDown
} from 'lucide-react';

export const InventoryView = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    adjustStock, 
    addCategory,
    exportProductsCsv,
    settings 
  } = usePos();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState('ALL');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustTarget, setStockAdjustTarget] = useState(null);
  const [stockAdjustType, setStockAdjustType] = useState('IN');
  const [stockAdjustAmount, setStockAdjustAmount] = useState('');
  const [stockAdjustReason, setStockAdjustReason] = useState('');

  const [showBarcodeLabelModal, setShowBarcodeLabelModal] = useState(false);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'Umum',
    costPrice: '',
    price: '',
    stock: '',
    minStock: 5,
    unit: 'pcs',
    emoji: '📦',
    image: null,
    hasVariants: false,
    variants: []
  });

  const [newCatInput, setNewCatInput] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const fileInputRef = useRef(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(q) || 
      p.barcode.includes(q) || 
      p.id.toLowerCase().includes(q);
    
    let matchesStock = true;
    if (stockFilter === 'LOW') matchesStock = p.stock > 0 && p.stock <= p.minStock;
    if (stockFilter === 'OUT') matchesStock = p.stock <= 0;

    return matchesCategory && matchesSearch && matchesStock;
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: `${Math.floor(899000000000 + Math.random() * 999999999)}`,
      category: categories.find(c => c !== 'Semua') || 'Umum',
      costPrice: '',
      price: '',
      stock: 10,
      minStock: 5,
      unit: 'pcs',
      emoji: '📦',
      image: null,
      hasVariants: false,
      variants: []
    });
    setShowAddEditModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      costPrice: product.costPrice || '',
      price: product.price || '',
      stock: product.stock,
      minStock: product.minStock || 5,
      unit: product.unit || 'pcs',
      emoji: product.emoji || '📦',
      image: product.image || null,
      hasVariants: product.variants && product.variants.length > 0,
      variants: product.variants ? [...product.variants] : []
    });
    setShowAddEditModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, 400, 400, 0.8);
      setFormData(prev => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      alert('Gagal mengompres gambar: ' + err.message);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddVariantRow = () => {
    const newVar = {
      id: `VAR-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      name: '',
      price: formData.price || '',
      costPrice: formData.costPrice || '',
      stock: formData.stock || 10,
      barcode: ''
    };
    setFormData(prev => ({
      ...prev,
      hasVariants: true,
      variants: [...prev.variants, newVar]
    }));
  };

  const handleUpdateVariant = (index, field, value) => {
    setFormData(prev => {
      const nextVars = [...prev.variants];
      nextVars[index] = { ...nextVars[index], [field]: value };
      return { ...prev, variants: nextVars };
    });
  };

  const handleRemoveVariant = (index) => {
    setFormData(prev => {
      const nextVars = prev.variants.filter((_, i) => i !== index);
      return { ...prev, variants: nextVars, hasVariants: nextVars.length > 0 };
    });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('Nama produk dan Harga Jual wajib diisi!');
      return;
    }

    const payload = {
      ...formData,
      variants: formData.hasVariants ? formData.variants.map(v => ({
        ...v,
        price: Number(v.price) || Number(formData.price),
        costPrice: Number(v.costPrice) || Number(formData.costPrice || 0),
        stock: Number(v.stock) || Number(formData.stock || 0)
      })) : []
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }
    setShowAddEditModal(false);
  };

  const handleOpenStockModal = (product) => {
    setStockAdjustTarget(product);
    setStockAdjustType('IN');
    setStockAdjustAmount('');
    setStockAdjustReason('');
    setShowStockModal(true);
  };

  const handleSaveStockAdjust = (e) => {
    e.preventDefault();
    if (!stockAdjustAmount || Number(stockAdjustAmount) <= 0) {
      alert('Masukkan jumlah stok yang valid!');
      return;
    }
    if (!stockAdjustReason.trim()) {
      alert('Catatan/alasan penyesuaian stok wajib diisi untuk audit log!');
      return;
    }

    adjustStock(stockAdjustTarget.id, stockAdjustType, Number(stockAdjustAmount), stockAdjustReason);
    setShowStockModal(false);
  };

  const handleCreateNewCategory = () => {
    if (!newCatInput.trim()) return;
    addCategory(newCatInput.trim());
    setFormData(prev => ({ ...prev, category: newCatInput.trim() }));
    setNewCatInput('');
    setShowNewCatInput(false);
  };

  const calcMargin = () => {
    const cost = Number(formData.costPrice) || 0;
    const sell = Number(formData.price) || 0;
    if (sell <= 0) return 0;
    return Math.round(((sell - cost) / sell) * 100);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 pb-28 lg:pb-6">
      
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Manajemen Produk & Stok</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Total {products.length} produk terdaftar di database kasir Anda
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {products.length > 0 && (
            <>
              <button
                onClick={() => exportProductsPdf({ storeName: settings.storeName, products })}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Cetak atau simpan daftar produk sebagai PDF"
              >
                <FileDown className="w-4 h-4" />
                <span>Export PDF</span>
              </button>

              <button
                onClick={exportProductsCsv}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                title="Export daftar produk ke CSV/Excel"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </>
          )}

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Stock Summary Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          onClick={() => setStockFilter('ALL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stockFilter === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          <div className="text-xs font-semibold opacity-80">Total Produk</div>
          <div className="text-2xl font-extrabold mt-1 font-mono">{products.length}</div>
        </div>

        <div 
          onClick={() => setStockFilter('LOW')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stockFilter === 'LOW' 
              ? 'bg-amber-500 text-white shadow-md' 
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          <div className="text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Stok Menipis</span>
          </div>
          <div className="text-2xl font-extrabold mt-1 font-mono">{lowStockCount}</div>
        </div>

        <div 
          onClick={() => setStockFilter('OUT')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            stockFilter === 'OUT' 
              ? 'bg-rose-600 text-white shadow-md' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="text-xs font-bold flex items-center gap-1">
            <RotateCcw className="w-4 h-4" />
            <span>Stok Habis (0)</span>
          </div>
          <div className="text-2xl font-extrabold mt-1 font-mono">{outOfStockCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      {products.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama barang, barcode atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Table / Empty State */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto text-3xl">
              📦
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">Belum Ada Produk Terdaftar</p>
              <p className="text-xs text-slate-400 mt-1">
                Database produk masih kosong. Klik tombol di bawah ini untuk memasukkan data barang jualan pertama Anda.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Produk Pertama</span>
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada produk yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter status</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3.5">Produk & Foto</th>
                  <th className="px-4 py-3.5">Barcode / SKU</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5 text-right">Modal (HPP)</th>
                  <th className="px-4 py-3.5 text-right">Harga Jual</th>
                  <th className="px-4 py-3.5 text-center">Stok</th>
                  <th className="px-4 py-3.5 text-center">Varian</th>
                  <th className="px-4 py-3.5 text-center">Aksi & Mutasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= p.minStock;
                  const isOut = p.stock <= 0;
                  const hasVariants = p.variants && p.variants.length > 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Photo/Emoji */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 aspect-square border border-slate-200/80">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">{p.emoji || '📦'}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.name}</div>
                            <div className="text-[11px] text-slate-400">{p.unit || 'pcs'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Barcode */}
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {p.barcode}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        {formatRupiah(p.costPrice || 0)}
                      </td>

                      {/* Sell Price */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        {hasVariants ? `Mulai ${formatRupiah(Math.min(...p.variants.map(v => v.price)))}` : formatRupiah(p.price)}
                      </td>

                      {/* Stock with Status Badge */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-sm font-mono">{p.stock}</span>
                          {isOut ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Habis
                            </span>
                          ) : isLow ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Min {p.minStock}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Aman</span>
                          )}
                        </div>
                      </td>

                      {/* Variants Indicator */}
                      <td className="px-4 py-3 text-center">
                        {hasVariants ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {p.variants.length} Varian
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">Standar</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Mutasi Stok (Masuk/Keluar/Koreksi)"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedBarcodeProduct(p);
                              setShowBarcodeLabelModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Cetak Label Barcode Rak/Produk"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            title="Edit Data Produk"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin MENGHAPUS produk "${p.name}"? Aksi ini akan tercatat di log.`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* ADD / EDIT PRODUCT MODAL (Scrollable & Responsive) */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 my-auto max-h-[92vh]">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>{editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}</span>
              </h2>
              <button 
                onClick={() => setShowAddEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Product Photo Upload */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  Foto Produk (Upload Gambar dari HP / Laptop):
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-6 h-6 mx-auto mb-0.5" />
                        <span className="text-[10px]">No Foto</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-photo-upload"
                    />
                    <div className="flex gap-2">
                      <label
                        htmlFor="product-photo-upload"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Foto Gambar</span>
                      </label>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Foto otomatis dikompres ringan sehingga aplikasi tetap super cepat dan bisa offline.
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Name & Icon */}
              <div className="flex gap-2">
                <div className="w-16">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Emoji</label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="w-full text-center text-xl p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Nama Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* Barcode & SKU */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Barcode / SKU</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, barcode: `${Math.floor(899000000000 + Math.random() * 999999999)}` })}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    Acak Barcode Otomatis
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Scan atau ketik kode barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Kategori</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    {showNewCatInput ? 'Pilih Yang Ada' : '+ Kategori Baru'}
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama kategori baru..."
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewCategory}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'Semua').length === 0 ? (
                      <option value="Umum">Umum</option>
                    ) : (
                      categories.filter(c => c !== 'Semua').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Prices: HPP and Sell Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Harga Modal / Beli (HPP)
                  </label>
                  <input
                    type="number"
                    placeholder="Rp 0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Harga Jual Standar <span className="text-rose-500">*</span>
                    </label>
                    {calcMargin() > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600">
                        Margin: {calcMargin()}%
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="Rp 0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-bold text-emerald-800 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Stock, Min Stock & Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Stok Total</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Batas Minimum</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="pcs / cup / porsi"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* VARIANTS SECTION */}
              <div className="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers3 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-extrabold text-indigo-900">Varian Produk (Ukuran, Rasa, Jenis)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah Varian</span>
                  </button>
                </div>

                {formData.variants && formData.variants.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {formData.variants.map((v, idx) => (
                      <div key={v.id || idx} className="p-2.5 bg-white border border-indigo-200/60 rounded-xl flex items-center gap-2 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Nama Varian (Contoh: Regular / Dingin)"
                          value={v.name}
                          onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                          className="flex-[2] px-2 py-1.5 border border-slate-300 rounded-lg font-bold"
                        />
                        <div className="flex-1">
                          <input
                            type="number"
                            required
                            placeholder="Harga Jual"
                            value={v.price}
                            onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                          />
                        </div>
                        <div className="w-16">
                          <input
                            type="number"
                            placeholder="Stok"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariant(idx, 'stock', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Hapus Varian Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Jika produk memiliki ukuran berbeda (misal: Regular Rp 3.000, Jumbo Rp 4.000) atau rasa berbeda, klik "+ Tambah Varian".
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {showStockModal && stockAdjustTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 my-auto">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-emerald-400" />
                  <span>Mutasi & Penyesuaian Stok</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">{stockAdjustTarget.name}</p>
              </div>
              <button 
                onClick={() => setShowStockModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjust} className="p-6 space-y-4">
              
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-500">Stok Saat Ini:</span>
                <span className="font-extrabold text-slate-900 text-base font-mono">
                  {stockAdjustTarget.stock} {stockAdjustTarget.unit || 'pcs'}
                </span>
              </div>

              {/* Adjust Type */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStockAdjustType('IN')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    stockAdjustType === 'IN' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow' 
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  + Stok Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjustType('OUT')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    stockAdjustType === 'OUT' 
                      ? 'bg-rose-600 text-white border-rose-600 shadow' 
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  - Stok Keluar
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjustType('SET')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    stockAdjustType === 'SET' 
                      ? 'bg-amber-600 text-white border-amber-600 shadow' 
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  Koreksi Fisik
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {stockAdjustType === 'SET' ? 'Atur Stok Menjadi:' : 'Jumlah Barang:'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Masukkan jumlah..."
                  value={stockAdjustAmount}
                  onChange={(e) => setStockAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alasan / Catatan Penyesuaian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kulakan supplier, barang kadaluarsa, opname mingguan..."
                  value={stockAdjustReason}
                  onChange={(e) => setStockAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Mutasi
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* BARCODE LABEL PRINT MODAL */}
      {showBarcodeLabelModal && selectedBarcodeProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 my-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-600" />
                <span>Label Barcode Produk</span>
              </h3>
              <button 
                onClick={() => setShowBarcodeLabelModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                {selectedBarcodeProduct.name}
              </div>
              
              <div className="bg-white p-2 border border-slate-200 rounded-lg flex flex-col items-center">
                <div className="flex items-end gap-[2px] h-10 px-2 py-1">
                  {[3, 1, 4, 1, 2, 4, 2, 3, 1, 3, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3].map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-[2px] bg-slate-900 ${h === 4 ? 'h-full' : h === 3 ? 'h-5/6' : h === 2 ? 'h-4/6' : 'h-3/6'}`} 
                    />
                  ))}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-slate-700 font-bold mt-0.5">
                  {selectedBarcodeProduct.barcode}
                </div>
              </div>

              <div className="text-sm font-extrabold text-emerald-700 font-mono">
                {formatRupiah(selectedBarcodeProduct.price)}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Label</span>
              </button>
              <button
                onClick={() => setShowBarcodeLabelModal(false)}
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
