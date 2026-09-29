import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_CUSTOMERS, 
  INITIAL_SETTINGS, 
  INITIAL_USERS 
} from '../data/initialData';
import { playBeep, playSuccessChime, playErrorSound, playClickSound } from '../utils/audio';

const PosContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'kasirpro_v2_products',
  CATEGORIES: 'kasirpro_v2_categories',
  CUSTOMERS: 'kasirpro_v2_customers',
  SETTINGS: 'kasirpro_v2_settings',
  USERS: 'kasirpro_v2_users',
  TRANSACTIONS: 'kasirpro_v2_transactions',
  AUDIT_LOGS: 'kasirpro_v2_audit_logs',
  CURRENT_SHIFT: 'kasirpro_v2_current_shift',
  PETTY_CASH: 'kasirpro_v2_petty_cash',
  HOLD_ORDERS: 'kasirpro_v2_hold_orders',
  CURRENT_USER: 'kasirpro_v2_current_user',
  CLOUD_DB_CONFIG: 'kasirpro_v2_cloud_db_config',
};

export const PosProvider = ({ children }) => {
  // --- Persistent States ---
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.storeName === 'KasirPro Mart') {
          parsed.storeName = 'Kasir Toko';
        }
        return parsed;
      } catch (e) {}
    }
    return INITIAL_SETTINGS;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [currentShift, setCurrentShift] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SHIFT);
    return saved ? JSON.parse(saved) : {
      id: `SHIFT-${Date.now()}`,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      cashier: INITIAL_USERS[0]?.name || 'Admin',
      startingCash: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: 0,
      actualCash: null,
      closedAt: null,
      difference: 0,
      note: 'Shift Awal Toko'
    };
  });

  const [pettyCashLogs, setPettyCashLogs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PETTY_CASH);
    return saved ? JSON.parse(saved) : [];
  });

  const [holdOrders, setHoldOrders] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOLD_ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [cloudDbConfig, setCloudDbConfig] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLOUD_DB_CONFIG);
    return saved ? JSON.parse(saved) : {
      enabled: false,
      provider: 'supabase', // 'supabase' | 'rest'
      url: '',
      apiKey: '',
      autoSync: false,
    };
  });

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState('connecting'); // 'online' | 'offline' | 'connecting'
  const isSyncingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // --- Active Transaction / Cart State ---
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDiscount, setOrderDiscount] = useState({ type: 'nominal', value: 0 });
  const [selectedCustomer, setSelectedCustomer] = useState(INITIAL_CUSTOMERS[0]);
  const [orderNote, setOrderNote] = useState('');

  // --- Sync to LocalStorage ---
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, JSON.stringify(currentShift)); }, [currentShift]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PETTY_CASH, JSON.stringify(pettyCashLogs)); }, [pettyCashLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HOLD_ORDERS, JSON.stringify(holdOrders)); }, [holdOrders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLOUD_DB_CONFIG, JSON.stringify(cloudDbConfig)); }, [cloudDbConfig]);

  // --- SERVER DATABASE INTEGRATION & SYNC ---
  // Fetch from server DB on initial mount
  useEffect(() => {
    const fetchServerDb = async () => {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            if (Array.isArray(d.products)) setProducts(d.products);
            if (Array.isArray(d.categories)) setCategories(d.categories);
            if (Array.isArray(d.customers)) setCustomers(d.customers);
            if (d.settings) {
              if (d.settings.storeName === 'KasirPro Mart') d.settings.storeName = 'Kasir Toko';
              setSettings(d.settings);
            }
            if (Array.isArray(d.transactions)) setTransactions(d.transactions);
            if (Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
            if (d.currentShift) setCurrentShift(d.currentShift);
            if (Array.isArray(d.pettyCashLogs)) setPettyCashLogs(d.pettyCashLogs);
            setDbStatus('online');
            isInitializedRef.current = true;
            return;
          }
        }
        setDbStatus('offline');
        isInitializedRef.current = true;
      } catch (err) {
        console.warn('Server DB not reachable, using local storage mode:', err.message);
        setDbStatus('offline');
        isInitializedRef.current = true;
      }
    };

    fetchServerDb();
  }, []);

  // Sync to server DB helper
  const syncToServerDb = async (overrideData = null) => {
    if (isSyncingRef.current) return;
    try {
      isSyncingRef.current = true;
      const payload = overrideData || {
        products,
        categories,
        customers,
        settings,
        transactions,
        auditLogs,
        currentShift,
        pettyCashLogs,
        holdOrders
      };

      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setDbStatus('online');
        return { success: true };
      } else {
        setDbStatus('offline');
        return { success: false };
      }
    } catch (err) {
      setDbStatus('offline');
      return { success: false, error: err.message };
    } finally {
      isSyncingRef.current = false;
    }
  };

  // Test Cloud DB Endpoint Helper
  const testCloudDb = async (customConfig = null) => {
    const cfg = customConfig || cloudDbConfig;
    if (!cfg.url) {
      throw new Error('URL Database Cloud wajib diisi');
    }
    try {
      const res = await fetch(cfg.url, {
        method: 'GET',
        headers: cfg.apiKey ? {
          'apikey': cfg.apiKey,
          'Authorization': `Bearer ${cfg.apiKey}`
        } : {}
      });
      return { ok: res.ok, status: res.status };
    } catch (err) {
      throw new Error(`Koneksi Cloud gagal: ${err.message}`);
    }
  };

  // Background debounce sync whenever data mutates (only AFTER initial load)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const timer = setTimeout(() => {
      syncToServerDb();
    }, 1500);
    return () => clearTimeout(timer);
  }, [products, categories, customers, transactions, auditLogs, currentShift, pettyCashLogs, settings]);

  // Periodic poll every 20s to receive updates made from other devices (e.g. phone or tablet)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden) return; // Skip if tab is inactive
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            // Update if items count or length changed
            if (d.products && d.products.length !== products.length) setProducts(d.products);
            if (d.transactions && d.transactions.length !== transactions.length) setTransactions(d.transactions);
            if (d.auditLogs && d.auditLogs.length !== auditLogs.length) setAuditLogs(d.auditLogs);
            setDbStatus('online');
          }
        }
      } catch (e) {
        setDbStatus('offline');
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [products.length, transactions.length, auditLogs.length]);

  // --- AUDIT LOG EMITTER ---
  const addAuditLog = (action, entity, description, details = {}) => {
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      user: currentUser?.name || 'Kasir',
      userRole: currentUser?.role || 'Staff',
      description,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
    return newLog;
  };

  // --- CART OPERATIONS ---
  const addToCart = (product, qty = 1, selectedVariant = null) => {
    const currentStock = selectedVariant 
      ? (selectedVariant.stock !== undefined ? selectedVariant.stock : product.stock)
      : product.stock;

    if (currentStock <= 0) {
      playErrorSound();
      alert(`Stok produk "${product.name}"${selectedVariant ? ` (${selectedVariant.name})` : ''} habis!`);
      return false;
    }

    const cartItemId = selectedVariant ? `${product.id}__var__${selectedVariant.id}` : product.id;
    const itemName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    const itemPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
    const itemCostPrice = selectedVariant ? Number(selectedVariant.costPrice || product.costPrice || 0) : Number(product.costPrice || 0);

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        if (existing.qty + qty > currentStock) {
          playErrorSound();
          alert(`Jumlah melebihi stok yang tersedia (${currentStock} ${product.unit || 'pcs'})`);
          return prev;
        }
        playBeep();
        return prev.map(item =>
          item.id === cartItemId ? { ...item, qty: item.qty + qty } : item
        );
      } else {
        playBeep();
        return [...prev, {
          id: cartItemId,
          productId: product.id,
          name: itemName,
          barcode: selectedVariant?.barcode || product.barcode,
          price: itemPrice,
          originalPrice: itemPrice,
          costPrice: itemCostPrice,
          stock: currentStock,
          unit: product.unit || 'pcs',
          image: product.image || null,
          emoji: product.emoji || '📦',
          variant: selectedVariant,
          qty,
          discount: 0,
          note: ''
        }];
      }
    });
    return true;
  };

  const updateCartQty = (cartItemId, newQty) => {
    const item = cart.find(i => i.id === cartItemId);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    if (newQty > item.stock) {
      playErrorSound();
      alert(`Jumlah melebihi stok yang tersedia (${item.stock} ${item.unit || 'pcs'})`);
      return;
    }

    playClickSound();
    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, qty: newQty } : i));
  };

  const updateCartItemPrice = (cartItemId, newPrice) => {
    const numPrice = Math.max(0, Number(newPrice) || 0);
    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, price: numPrice } : i));
    playClickSound();
  };

  const updateCartItemDiscount = (cartItemId, discountNominal) => {
    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, discount: Math.max(0, Number(discountNominal) || 0) } : i));
  };

  const updateCartItemNote = (cartItemId, note) => {
    setCart(prev => prev.map(i => i.id === cartItemId ? { ...i, note } : i));
  };

  const removeFromCart = (cartItemId) => {
    playClickSound();
    setCart(prev => prev.filter(i => i.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderDiscount({ type: 'nominal', value: 0 });
    setSelectedCustomer(customers[0] || { id: 'CUST-001', name: 'Umum / Walk-in' });
    setOrderNote('');
  };

  // --- HOLD / RESUME ORDER ---
  const holdCurrentOrder = (customerName = 'Antrian') => {
    if (cart.length === 0) return false;
    const newHold = {
      id: `HOLD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      customerName: customerName || selectedCustomer.name,
      customer: selectedCustomer,
      cart: [...cart],
      discount: orderDiscount,
      note: orderNote,
    };
    setHoldOrders(prev => [newHold, ...prev]);
    clearCart();
    addAuditLog('HOLD_ORDER', 'SALE', `Menahan transaksi order antrian atas nama "${newHold.customerName}" (${newHold.cart.length} item)`);
    playClickSound();
    return true;
  };

  const resumeHoldOrder = (holdId) => {
    const target = holdOrders.find(h => h.id === holdId);
    if (!target) return;
    setCart(target.cart);
    setSelectedCustomer(target.customer || customers[0]);
    setOrderDiscount(target.discount || { type: 'nominal', value: 0 });
    setOrderNote(target.note || '');
    setHoldOrders(prev => prev.filter(h => h.id !== holdId));
    addAuditLog('RESUME_ORDER', 'SALE', `Melanjutkan transaksi antrian atas nama "${target.customerName}"`);
    playClickSound();
  };

  const deleteHoldOrder = (holdId) => {
    const target = holdOrders.find(h => h.id === holdId);
    setHoldOrders(prev => prev.filter(h => h.id !== holdId));
    addAuditLog('DELETE_HOLD', 'SALE', `Menghapus antrian yang tertahan atas nama "${target?.customerName || holdId}"`);
  };

  // --- CART TOTAL CALCULATIONS ---
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemTotal = (item.price * item.qty) - (item.discount || 0);
    return sum + Math.max(0, itemTotal);
  }, 0);

  const cartHppTotal = cart.reduce((sum, item) => sum + ((item.costPrice || 0) * item.qty), 0);

  const calculatedDiscount = orderDiscount.type === 'percent'
    ? Math.round((cartSubtotal * orderDiscount.value) / 100)
    : Math.min(orderDiscount.value, cartSubtotal);

  const totalAfterDiscount = Math.max(0, cartSubtotal - calculatedDiscount);
  const taxAmount = settings.taxEnabled ? Math.round((totalAfterDiscount * (settings.taxRate || 11)) / 100) : 0;
  const cartGrandTotal = totalAfterDiscount + taxAmount;
  const totalItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // --- COMPLETE TRANSACTION (CHECKOUT) ---
  const processCheckout = ({ paymentMethod, amountPaid, note = '', customerId = null }) => {
    if (cart.length === 0) return null;

    const trxId = `TRX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const actualAmountPaid = paymentMethod === 'TUNAI' ? Number(amountPaid) : cartGrandTotal;
    const changeAmount = paymentMethod === 'TUNAI' ? Math.max(0, actualAmountPaid - cartGrandTotal) : 0;
    const actualCustomer = customers.find(c => c.id === customerId) || selectedCustomer;

    const newTransaction = {
      id: trxId,
      date: new Date().toISOString(),
      cashier: currentUser.name,
      cashierRole: currentUser.role,
      customer: {
        id: actualCustomer.id,
        name: actualCustomer.name,
        phone: actualCustomer.phone || '-'
      },
      items: cart.map(item => ({
        id: item.id,
        productId: item.productId || item.id,
        name: item.name,
        barcode: item.barcode,
        price: item.price,
        costPrice: item.costPrice || 0,
        qty: item.qty,
        unit: item.unit || 'pcs',
        discount: item.discount || 0,
        subtotal: (item.price * item.qty) - (item.discount || 0),
        note: item.note || '',
        variant: item.variant || null
      })),
      subtotal: cartSubtotal,
      discount: calculatedDiscount,
      discountDetail: orderDiscount,
      tax: taxAmount,
      total: cartGrandTotal,
      hppTotal: cartHppTotal,
      grossProfit: cartGrandTotal - taxAmount - cartHppTotal,
      paymentMethod,
      amountPaid: actualAmountPaid,
      change: changeAmount,
      status: 'SELESAI',
      note: note || orderNote || '',
    };

    // 1. Deduct Stock from Products & Variants
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const matchingCartItems = cart.filter(ci => (ci.productId || ci.id) === p.id);
        if (matchingCartItems.length > 0) {
          let updatedProduct = { ...p };
          matchingCartItems.forEach(ci => {
            const qtySold = ci.qty;
            updatedProduct.stock = Math.max(0, updatedProduct.stock - qtySold);
            if (ci.variant && updatedProduct.variants && Array.isArray(updatedProduct.variants)) {
              updatedProduct.variants = updatedProduct.variants.map(v => 
                v.id === ci.variant.id ? { ...v, stock: Math.max(0, (v.stock ?? updatedProduct.stock) - qtySold) } : v
              );
            }
          });
          return updatedProduct;
        }
        return p;
      });
    });

    // 2. Save Transaction
    setTransactions(prev => [newTransaction, ...prev]);

    // 3. Update Customer Debt if paymentMethod === 'PIUTANG'
    if (paymentMethod === 'PIUTANG' && actualCustomer.id !== 'CUST-001') {
      setCustomers(prev => prev.map(c => 
        c.id === actualCustomer.id ? { ...c, debt: (c.debt || 0) + cartGrandTotal } : c
      ));
      addAuditLog('UPDATE_DEBT', 'CUSTOMER', `Penambahan piutang/bon pelanggan "${actualCustomer.name}" sebesar Rp ${cartGrandTotal.toLocaleString('id-ID')} via ${trxId}`);
    }

    // 4. Update Shift Cash if Tunai
    if (paymentMethod === 'TUNAI' && currentShift && currentShift.status === 'OPEN') {
      setCurrentShift(prev => ({
        ...prev,
        expectedCash: (prev.expectedCash || 0) + cartGrandTotal,
      }));
    }

    // 5. Emit Audit Log
    addAuditLog(
      'TRANSACTION',
      'SALE',
      `Penjualan berhasil: ${trxId} Total: Rp ${cartGrandTotal.toLocaleString('id-ID')} (${paymentMethod}, Bayar: Rp ${actualAmountPaid.toLocaleString('id-ID')}) oleh ${currentUser.name}`,
      {
        trxId,
        total: cartGrandTotal,
        amountPaid: actualAmountPaid,
        change: changeAmount,
        itemsCount: totalItemCount,
        paymentMethod,
        customer: actualCustomer.name
      }
    );

    playSuccessChime();
    clearCart();

    return newTransaction;
  };

  // --- VOID / CANCEL TRANSACTION ---
  const voidTransaction = (trxId, reason = 'Pembatalan Transaksi') => {
    const target = transactions.find(t => t.id === trxId);
    if (!target) return false;
    if (target.status === 'VOID') {
      alert('Transaksi ini sudah berstatus VOID sebelumnya!');
      return false;
    }

    // 1. Return stock to products & variants
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const matchingItems = target.items.filter(ti => (ti.productId || ti.id) === p.id);
        if (matchingItems.length > 0) {
          let updatedProduct = { ...p };
          matchingItems.forEach(ti => {
            updatedProduct.stock = updatedProduct.stock + ti.qty;
            if (ti.variant && updatedProduct.variants && Array.isArray(updatedProduct.variants)) {
              updatedProduct.variants = updatedProduct.variants.map(v => 
                v.id === ti.variant.id ? { ...v, stock: (v.stock ?? 0) + ti.qty } : v
              );
            }
          });
          return updatedProduct;
        }
        return p;
      });
    });

    if (target.paymentMethod === 'PIUTANG' && target.customer.id !== 'CUST-001') {
      setCustomers(prev => prev.map(c => 
        c.id === target.customer.id ? { ...c, debt: Math.max(0, (c.debt || 0) - target.total) } : c
      ));
    }

    if (target.paymentMethod === 'TUNAI' && currentShift && currentShift.status === 'OPEN') {
      setCurrentShift(prev => ({
        ...prev,
        expectedCash: Math.max(0, (prev.expectedCash || 0) - target.total)
      }));
    }

    setTransactions(prev => prev.map(t => 
      t.id === trxId ? { ...t, status: 'VOID', voidReason: reason, voidAt: new Date().toISOString(), voidBy: currentUser.name } : t
    ));

    addAuditLog(
      'VOID',
      'SALE',
      `VOID Transaksi: ${trxId} dibatalkan senilai Rp ${target.total.toLocaleString('id-ID')}. Alasan: "${reason}" oleh ${currentUser.name}`,
      { trxId, total: target.total, reason, items: target.items }
    );

    playErrorSound();
    return true;
  };

  // --- INVENTORY MANAGEMENT (CRUD + STOK + VARIANTS + IMAGE) ---
  const addProduct = (productData) => {
    const newId = `PRD-${Date.now().toString().slice(-4)}`;
    const newProduct = {
      ...productData,
      id: newId,
      costPrice: Number(productData.costPrice) || 0,
      price: Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      minStock: Number(productData.minStock) || 5,
      unit: productData.unit || 'pcs',
      category: productData.category || 'Umum',
      barcode: productData.barcode || `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      emoji: productData.emoji || '📦',
      image: productData.image || null,
      variants: Array.isArray(productData.variants) ? productData.variants : [],
      color: productData.color || 'bg-slate-100 text-slate-800'
    };

    setProducts(prev => [newProduct, ...prev]);

    if (newProduct.category && !categories.includes(newProduct.category)) {
      setCategories(prev => [...prev, newProduct.category]);
    }

    addAuditLog(
      'CREATE',
      'PRODUCT',
      `Menambah produk baru: "${newProduct.name}" (Barcode: ${newProduct.barcode}, Harga: Rp ${newProduct.price.toLocaleString('id-ID')}, Stok: ${newProduct.stock})`,
      newProduct
    );
    return newProduct;
  };

  const updateProduct = (productId, updatedData) => {
    const oldProduct = products.find(p => p.id === productId);
    if (!oldProduct) return false;

    const newProduct = {
      ...oldProduct,
      ...updatedData,
      costPrice: Number(updatedData.costPrice ?? oldProduct.costPrice),
      price: Number(updatedData.price ?? oldProduct.price),
      stock: Number(updatedData.stock ?? oldProduct.stock),
      minStock: Number(updatedData.minStock ?? oldProduct.minStock),
      variants: updatedData.variants !== undefined ? updatedData.variants : (oldProduct.variants || []),
      image: updatedData.image !== undefined ? updatedData.image : oldProduct.image
    };

    setProducts(prev => prev.map(p => p.id === productId ? newProduct : p));

    addAuditLog(
      'UPDATE',
      'PRODUCT',
      `Mengubah data produk: "${newProduct.name}" (Harga: Rp ${newProduct.price.toLocaleString('id-ID')}, Stok: ${newProduct.stock})`,
      { before: oldProduct, after: newProduct }
    );
    return true;
  };

  const deleteProduct = (productId) => {
    const target = products.find(p => p.id === productId);
    if (!target) return false;

    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => (item.productId || item.id) !== productId));

    addAuditLog(
      'DELETE',
      'PRODUCT',
      `MENGHAPUS produk: "${target.name}" (Barcode: ${target.barcode}, Kategori: ${target.category})`,
      target
    );
    return true;
  };

  const adjustStock = (productId, type, amount, reason = 'Penyesuaian Stok') => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;

    const qtyNumber = Number(amount);
    if (isNaN(qtyNumber) || qtyNumber <= 0) return false;

    let newStock = product.stock;
    let actionLabel = '';

    if (type === 'IN') {
      newStock += qtyNumber;
      actionLabel = 'STOK MASUK';
    } else if (type === 'OUT') {
      newStock = Math.max(0, newStock - qtyNumber);
      actionLabel = 'STOK KELUAR';
    } else if (type === 'SET') {
      newStock = qtyNumber;
      actionLabel = 'KOREKSI STOK';
    }

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));

    addAuditLog(
      'STOCK',
      'PRODUCT',
      `${actionLabel} "${product.name}": ${product.stock} -> ${newStock} (${type === 'SET' ? 'Diatur ke ' + qtyNumber : (type === 'IN' ? '+' : '-') + qtyNumber} ${product.unit}). Catatan: "${reason}"`,
      { productId, productName: product.name, oldStock: product.stock, newStock, type, amount: qtyNumber, reason }
    );
    return true;
  };

  // --- CATEGORIES ---
  const addCategory = (categoryName) => {
    const clean = categoryName.trim();
    if (!clean || categories.includes(clean)) return;
    setCategories(prev => [...prev, clean]);
    addAuditLog('CREATE', 'CATEGORY', `Menambah kategori baru: "${clean}"`);
  };

  const deleteCategory = (categoryName) => {
    if (categoryName === 'Semua') return;
    setCategories(prev => prev.filter(c => c !== categoryName));
    addAuditLog('DELETE', 'CATEGORY', `Menghapus kategori: "${categoryName}"`);
  };

  // --- CASH DRAWER & SHIFT MANAGEMENT ---
  const openShift = (startingCash = 0, note = 'Buka Shift Baru') => {
    const newShift = {
      id: `SHIFT-${Date.now()}`,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      cashier: currentUser.name,
      startingCash: Number(startingCash) || 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: Number(startingCash) || 0,
      actualCash: null,
      closedAt: null,
      difference: 0,
      note,
    };
    setCurrentShift(newShift);
    addAuditLog(
      'SHIFT_OPEN',
      'CASH_DRAWER',
      `BUKA KASIR (Shift Baru): Modal awal kas Rp ${newShift.startingCash.toLocaleString('id-ID')} oleh ${currentUser.name}`,
      newShift
    );
    playSuccessChime();
    return newShift;
  };

  const closeShift = (actualCashCounted, note = '') => {
    if (!currentShift || currentShift.status !== 'OPEN') return null;

    const actual = Number(actualCashCounted) || 0;
    const diff = actual - currentShift.expectedCash;

    const closedShift = {
      ...currentShift,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      closedBy: currentUser.name,
      actualCash: actual,
      difference: diff,
      closeNote: note,
    };

    setCurrentShift(closedShift);

    addAuditLog(
      'SHIFT_CLOSE',
      'CASH_DRAWER',
      `TUTUP KASIR: Sistem mengharapkan Rp ${closedShift.expectedCash.toLocaleString('id-ID')}, Fisik di laci Rp ${actual.toLocaleString('id-ID')}. Selisih: ${diff >= 0 ? '+' : ''}Rp ${diff.toLocaleString('id-ID')}. Petugas: ${currentUser.name}`,
      closedShift
    );
    playBeep();
    return closedShift;
  };

  const addPettyCash = (type, amount, description) => {
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) return;

    const entry = {
      id: `PC-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      amount: numAmount,
      description,
      user: currentUser.name,
      shiftId: currentShift?.id || null
    };

    setPettyCashLogs(prev => [entry, ...prev]);

    setCurrentShift(prev => {
      if (!prev || prev.status !== 'OPEN') return prev;
      const newExpected = type === 'IN' 
        ? prev.expectedCash + numAmount 
        : Math.max(0, prev.expectedCash - numAmount);
      const newCashIn = type === 'IN' ? (prev.cashIn || 0) + numAmount : prev.cashIn;
      const newCashOut = type === 'OUT' ? (prev.cashOut || 0) + numAmount : prev.cashOut;

      return {
        ...prev,
        expectedCash: newExpected,
        cashIn: newCashIn,
        cashOut: newCashOut,
      };
    });

    addAuditLog(
      'PETTY_CASH',
      'CASH_DRAWER',
      `Arus Kas Laci (${type === 'IN' ? 'Kas Masuk' : 'Kas Keluar Operasional'}): Rp ${numAmount.toLocaleString('id-ID')} - "${description}" oleh ${currentUser.name}`,
      entry
    );
  };

  // --- CUSTOMER MANAGEMENT & DEBT SETTLEMENT ---
  const addCustomer = (customerData) => {
    const newCust = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name: customerData.name,
      phone: customerData.phone || '-',
      debt: Number(customerData.debt) || 0,
      note: customerData.note || ''
    };
    setCustomers(prev => [...prev, newCust]);
    addAuditLog('CREATE', 'CUSTOMER', `Menambah data pelanggan baru: "${newCust.name}" (Telp: ${newCust.phone})`, newCust);
    return newCust;
  };

  const payCustomerDebt = (customerId, amount, paymentMethod = 'TUNAI', note = '') => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return false;

    const payAmount = Number(amount) || 0;
    if (payAmount <= 0) return false;

    const updatedDebt = Math.max(0, (cust.debt || 0) - payAmount);
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, debt: updatedDebt } : c));

    if (paymentMethod === 'TUNAI' && currentShift && currentShift.status === 'OPEN') {
      setCurrentShift(prev => ({
        ...prev,
        expectedCash: prev.expectedCash + payAmount
      }));
    }

    addAuditLog(
      'UPDATE_DEBT',
      'CUSTOMER',
      `Pelunasan Piutang: Pelanggan "${cust.name}" membayar Rp ${payAmount.toLocaleString('id-ID')} (${paymentMethod}). Sisa piutang: Rp ${updatedDebt.toLocaleString('id-ID')}`,
      { customerId, name: cust.name, paid: payAmount, remaining: updatedDebt, note }
    );

    playSuccessChime();
    return true;
  };

  // --- SETTINGS ---
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('UPDATE', 'SETTINGS', `Memperbarui konfigurasi sistem/toko kasir`, newSettings);
  };

  // --- EXPORT & BACKUP ENGINE ---
  const exportAllDataJson = () => {
    const data = {
      appName: 'KasirPro',
      exportedAt: new Date().toISOString(),
      products,
      categories,
      customers,
      settings,
      users,
      transactions,
      auditLogs,
      currentShift,
      pettyCashLogs,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kasirpro_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addAuditLog('BACKUP', 'SYSTEM', `Export file backup database sistem JSON`);
  };

  const exportProductsCsv = () => {
    if (products.length === 0) {
      alert('Belum ada produk terdaftar untuk diekspor!');
      return;
    }
    const headers = ['ID Produk', 'Barcode', 'Nama Produk', 'Kategori', 'Harga Modal (HPP)', 'Harga Jual', 'Stok', 'Min Stok', 'Satuan', 'Jumlah Varian'];
    const rows = products.map(p => [
      `"${p.id}"`,
      `"${p.barcode}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      p.costPrice || 0,
      p.price || 0,
      p.stock || 0,
      p.minStock || 0,
      `"${p.unit || 'pcs'}"`,
      p.variants ? p.variants.length : 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `daftar_produk_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addAuditLog('EXPORT_PRODUCTS', 'PRODUCT', `Mengekspor daftar produk ke format CSV`);
  };

  const importAllDataJson = async (jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (Array.isArray(data.customers)) setCustomers(data.customers);
      if (data.settings && typeof data.settings === 'object') setSettings(data.settings);
      if (Array.isArray(data.users)) setUsers(data.users);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      if (data.currentShift) setCurrentShift(data.currentShift);
      if (Array.isArray(data.pettyCashLogs)) setPettyCashLogs(data.pettyCashLogs);

      // Sync imported data to server DB
      await syncToServerDb(data);

      addAuditLog('RESTORE', 'SYSTEM', `Restore database sistem berhasil dari file backup`);
      alert('Data sistem berhasil dipulihkan!');
      return true;
    } catch (err) {
      alert('Format file JSON tidak valid!');
      return false;
    }
  };

  const resetToCleanEmpty = async () => {
    if (confirm('PERINGATAN KERAS: Semua data produk, transaksi, log audit, kasir, dan pelanggan akan DIHAPUS TOTAL menjadi KOSONG BERSIH (0 data). Lanjutkan?')) {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.clear();

      setProducts([]);
      setCategories(['Semua']);
      setCustomers([{ id: 'CUST-001', name: 'Umum / Walk-in', phone: '-', debt: 0 }]);
      setTransactions([]);
      setAuditLogs([]);
      setPettyCashLogs([]);
      setHoldOrders([]);
      setCurrentShift({
        id: `SHIFT-${Date.now()}`,
        status: 'OPEN',
        openedAt: new Date().toISOString(),
        cashier: currentUser?.name || 'Admin',
        startingCash: 0,
        cashIn: 0,
        cashOut: 0,
        expectedCash: 0,
        actualCash: null,
        closedAt: null,
        difference: 0,
        note: 'Shift Awal Toko Bersih'
      });
      clearCart();

      // Reset server DB as well
      try {
        await fetch('/api/db/reset', { method: 'POST' });
      } catch (e) {}

      alert('Semua data dan log berhasil dikosongkan total! Sekarang sistem bersih 100% tanpa data.');
    }
  };

  return (
    <PosContext.Provider
      value={{
        // Data states
        products,
        categories,
        customers,
        settings,
        users,
        currentUser,
        setCurrentUser,
        transactions,
        auditLogs,
        currentShift,
        pettyCashLogs,
        holdOrders,
        cloudDbConfig,
        setCloudDbConfig,
        dbStatus,
        testCloudDb,

        // Cart states & getters
        cart,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        orderDiscount,
        setOrderDiscount,
        selectedCustomer,
        setSelectedCustomer,
        orderNote,
        setOrderNote,
        cartSubtotal,
        calculatedDiscount,
        taxAmount,
        cartGrandTotal,
        totalItemCount,

        // Cart actions
        addToCart,
        updateCartQty,
        updateCartItemPrice,
        updateCartItemDiscount,
        updateCartItemNote,
        removeFromCart,
        clearCart,
        holdCurrentOrder,
        resumeHoldOrder,
        deleteHoldOrder,

        // Checkout & Void
        processCheckout,
        voidTransaction,

        // Product & Inventory actions
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCategory,
        deleteCategory,

        // Shift & Cash Drawer
        openShift,
        closeShift,
        addPettyCash,

        // Customer & Debt
        addCustomer,
        payCustomerDebt,

        // Database Sync, Settings & Clean Reset
        syncToServerDb,
        updateSettings,
        addAuditLog,
        exportAllDataJson,
        exportProductsCsv,
        importAllDataJson,
        resetToCleanEmpty,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => useContext(PosContext);
