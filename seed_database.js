import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const categories = [
  'Semua',
  'Minuman Sachet & Es',
  'Makanan & Mie Instan',
  'Snack & Biskuit'
];

const products = [
  {
    id: 'PROD-001',
    name: 'Marimas',
    category: 'Minuman Sachet & Es',
    barcode: '8991001001',
    costPrice: 1200,
    price: 2000,
    stock: 900,
    minStock: 20,
    unit: 'cup',
    emoji: '🍊',
    image: '/products/marimas.svg',
    hasVariants: true,
    variants: [
      { id: 'VAR-MAR-01', name: 'Jeruk', price: 2000, costPrice: 1200, stock: 150, barcode: '899100100101' },
      { id: 'VAR-MAR-02', name: 'Jeruk Manis', price: 2000, costPrice: 1200, stock: 150, barcode: '899100100102' },
      { id: 'VAR-MAR-03', name: 'Jambu Biji', price: 2000, costPrice: 1200, stock: 150, barcode: '899100100103' },
      { id: 'VAR-MAR-04', name: 'Melon', price: 2000, costPrice: 1200, stock: 150, barcode: '899100100104' },
      { id: 'VAR-MAR-05', name: 'Blewah', price: 2000, costPrice: 1200, stock: 150, barcode: '899100100105' },
      { id: 'VAR-MAR-06', name: 'Sirsak', price: 2000, costPrice: 1200, stock: 150, barcode: '899100100106' }
    ]
  },
  {
    id: 'PROD-002',
    name: 'Sarimi',
    category: 'Makanan & Mie Instan',
    barcode: '8992002002',
    costPrice: 2200,
    price: 3000,
    stock: 700,
    minStock: 20,
    unit: 'porsi',
    emoji: '🍜',
    image: '/products/sarimi.svg',
    hasVariants: true,
    variants: [
      { id: 'VAR-SAR-01', name: 'Bakso Sapi', price: 3000, costPrice: 2200, stock: 100, barcode: '899200200201' },
      { id: 'VAR-SAR-02', name: 'Kari Ayam', price: 3000, costPrice: 2200, stock: 100, barcode: '899200200202' },
      { id: 'VAR-SAR-03', name: 'Ayam Bawang', price: 3000, costPrice: 2200, stock: 100, barcode: '899200200203' },
      { id: 'VAR-SAR-04', name: 'Sosis', price: 3000, costPrice: 2200, stock: 100, barcode: '899200200204' },
      { id: 'VAR-SAR-05', name: 'Ayam Pedas Dower', price: 3000, costPrice: 2200, stock: 100, barcode: '899200200205' },
      { id: 'VAR-SAR-06', name: 'Soto', price: 3000, costPrice: 2200, stock: 100, barcode: '899200200206' },
      { id: 'VAR-SAR-07', name: 'Bakso Granat', price: 3000, costPrice: 2200, stock: 100, barcode: '899200200207' }
    ]
  },
  {
    id: 'PROD-003',
    name: 'Chocolatos Coklat',
    category: 'Snack & Biskuit',
    barcode: '8993003001',
    costPrice: 650,
    price: 1000,
    stock: 200,
    minStock: 15,
    unit: 'pcs',
    emoji: '🍫',
    image: '/products/chocolatos_coklat.svg',
    hasVariants: false,
    variants: []
  },
  {
    id: 'PROD-004',
    name: 'Chocolatos Vanilla',
    category: 'Snack & Biskuit',
    barcode: '8993003002',
    costPrice: 950,
    price: 1500,
    stock: 200,
    minStock: 15,
    unit: 'pcs',
    emoji: '🍦',
    image: '/products/chocolatos_vanilla.svg',
    hasVariants: false,
    variants: []
  },
  {
    id: 'PROD-005',
    name: 'Sari Gandum',
    category: 'Snack & Biskuit',
    barcode: '8994004001',
    costPrice: 1300,
    price: 2000,
    stock: 150,
    minStock: 15,
    unit: 'bks',
    emoji: '🍪',
    image: '/products/sari_gandum.svg',
    hasVariants: false,
    variants: []
  },
  {
    id: 'PROD-006',
    name: 'Coklat Dilan',
    category: 'Snack & Biskuit',
    barcode: '8995005001',
    costPrice: 1350,
    price: 2000,
    stock: 150,
    minStock: 15,
    unit: 'pcs',
    emoji: '🍫',
    image: '/products/coklat_dilan.svg',
    hasVariants: false,
    variants: []
  },
  {
    id: 'PROD-007',
    name: 'Chrunch',
    category: 'Snack & Biskuit',
    barcode: '8996006001',
    costPrice: 1300,
    price: 2000,
    stock: 150,
    minStock: 15,
    unit: 'pcs',
    emoji: '🧇',
    image: '/products/crunch.svg',
    hasVariants: false,
    variants: []
  },
  {
    id: 'PROD-008',
    name: 'Air Putih + Es Batu (Gelas Plastik)',
    category: 'Minuman Sachet & Es',
    barcode: '8997007001',
    costPrice: 300,
    price: 1000,
    stock: 500,
    minStock: 30,
    unit: 'gelas',
    emoji: '🥤',
    image: '/products/air_es_gelas.svg',
    hasVariants: false,
    variants: []
  },
  {
    id: 'PROD-009',
    name: 'Air Putih + Es Batu (Tumbler Besar)',
    category: 'Minuman Sachet & Es',
    barcode: '8997007002',
    costPrice: 500,
    price: 2000,
    stock: 300,
    minStock: 20,
    unit: 'tumbler',
    emoji: '🧊',
    image: '/products/air_es_tumbler.svg',
    hasVariants: false,
    variants: []
  }
];

const customers = [
  { id: 'CUST-001', name: 'Umum / Walk-in', phone: '-', debt: 0 },
  { id: 'CUST-002', name: 'Budi Santoso', phone: '0812-3456-7890', debt: 0 },
  { id: 'CUST-003', name: 'Siti Rahma', phone: '0857-1234-5678', debt: 0 }
];

const settings = {
  storeName: 'Kasir Toko',
  storeAddress: 'Jl. Utama No. 1, Toko',
  storePhone: '0812-3456-7890',
  receiptFooter: 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.',
  receiptWidth: '58mm',
  taxEnabled: false,
  taxRate: 11,
  soundEnabled: true,
  currency: 'Rp',
  theme: 'emerald',
  storeLogo: '',
  dbMode: 'server'
};

const users = [
  { id: 'USR-001', name: 'Admin Kasir', role: 'Admin', pin: '1234' },
  { id: 'USR-002', name: 'Kasir 1', role: 'Kasir', pin: '0000' }
];

// Helper to pick random item
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 150 realistic test transactions
const transactions = [];
const auditLogs = [];
let totalCashCollected = 0;

// Base date: today from 07:30 to 13:55
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');

for (let i = 1; i <= 150; i++) {
  const trxId = `TRX-${year}${month}${day}-${String(i).padStart(3, '0')}`;
  
  // Spread time from 07:30 to 13:55 (total 385 minutes)
  const minuteOffset = Math.floor((i / 150) * 385);
  const trxDate = new Date(today);
  trxDate.setHours(7, 30 + minuteOffset, randomInt(0, 59), 0);

  const cashier = i % 3 === 0 ? 'Kasir 1' : 'Admin Kasir';
  const customer = i % 10 === 0 ? sample(customers.slice(1)) : customers[0];

  // Payment method: 60% Tunai, 30% QRIS, 10% Transfer
  const randPay = Math.random();
  const paymentMethod = randPay < 0.60 ? 'TUNAI' : randPay < 0.90 ? 'QRIS' : 'TRANSFER';

  // Build 1 to 4 purchased items
  const itemCount = randomInt(1, 3);
  const items = [];
  const pickedProductIndexes = new Set();

  for (let j = 0; j < itemCount; j++) {
    let pIdx = randomInt(0, products.length - 1);
    if (pickedProductIndexes.has(pIdx) && pickedProductIndexes.size < products.length) {
      pIdx = (pIdx + 1) % products.length;
    }
    pickedProductIndexes.add(pIdx);
    const prod = products[pIdx];

    const qty = randomInt(1, 3);
    let selectedVariant = null;
    let itemName = prod.name;
    let unitPrice = prod.price;

    if (prod.hasVariants && prod.variants.length > 0) {
      selectedVariant = sample(prod.variants);
      itemName = `${prod.name} (${selectedVariant.name})`;
      unitPrice = selectedVariant.price;
    }

    const itemSubtotal = unitPrice * qty;
    items.push({
      id: `${trxId}-ITEM-${j + 1}`,
      productId: prod.id,
      name: itemName,
      unitPrice,
      qty,
      discount: 0,
      subtotal: itemSubtotal,
      unit: prod.unit,
      variantId: selectedVariant ? selectedVariant.id : null,
      variantName: selectedVariant ? selectedVariant.name : null
    });
  }

  const grandTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  let amountPaid = grandTotal;
  let change = 0;

  if (paymentMethod === 'TUNAI') {
    // Realistic cash amount paid (rounded up to 5k, 10k, 20k, 50k)
    if (grandTotal <= 5000) amountPaid = sample([grandTotal, 5000, 10000]);
    else if (grandTotal <= 10000) amountPaid = sample([grandTotal, 10000, 20000]);
    else if (grandTotal <= 20000) amountPaid = sample([grandTotal, 20000, 50000]);
    else amountPaid = Math.ceil(grandTotal / 10000) * 10000;
    change = amountPaid - grandTotal;
    totalCashCollected += grandTotal;
  }

  const hppTotal = Math.round(grandTotal * 0.65);
  const grossProfit = grandTotal - hppTotal;

  const trx = {
    id: trxId,
    date: trxDate.toISOString(),
    cashier,
    customer: { id: customer.id, name: customer.name },
    customerId: customer.id,
    customerName: customer.name,
    items,
    subtotal: grandTotal,
    discountAmount: 0,
    discount: 0,
    taxAmount: 0,
    tax: 0,
    grandTotal,
    total: grandTotal,
    hppTotal,
    grossProfit,
    paymentMethod,
    amountPaid,
    change,
    status: 'SELESAI',
    note: '-'
  };

  transactions.push(trx);

  // Add corresponding Audit Log
  auditLogs.push({
    id: `LOG-${Date.now()}-${i}`,
    timestamp: trxDate.toISOString(),
    user: cashier,
    action: 'TRANSACTION_SUCCESS',
    details: `Transaksi ${trxId} [${paymentMethod}] Total: Rp ${grandTotal.toLocaleString('id-ID')} (${items.map(it => `${it.qty}x ${it.name}`).join(', ')})`
  });
}

// Initial Audit Logs for Products Creation
products.forEach((p, idx) => {
  auditLogs.unshift({
    id: `LOG-INIT-${idx + 1}`,
    timestamp: new Date(today.getTime() - 3600000 * 8).toISOString(),
    user: 'Admin Kasir',
    action: 'ADD_PRODUCT',
    details: `Menambahkan produk baru: ${p.name} (${p.category}) - Harga Rp ${p.price.toLocaleString('id-ID')}`
  });
});

const currentShift = {
  id: `SHIFT-${year}${month}${day}-01`,
  status: 'OPEN',
  openedAt: new Date(today.setHours(7, 0, 0, 0)).toISOString(),
  cashier: 'Admin Kasir',
  startingCash: 100000,
  cashIn: totalCashCollected,
  cashOut: 0,
  expectedCash: 100000 + totalCashCollected,
  actualCash: null,
  closedAt: null,
  difference: 0,
  note: 'Shift Kas Pagi Toko'
};

const fullDb = {
  products,
  categories,
  customers,
  settings,
  users,
  transactions,
  auditLogs,
  currentShift,
  pettyCashLogs: [],
  holdOrders: []
};

// Write database files
const DB_FILE = path.join(__dirname, 'database', 'kasirpro_db.json');
const DB_BACKUP = path.join(__dirname, 'database', 'kasirpro_db_backup.json');

fs.writeFileSync(DB_FILE, JSON.stringify(fullDb, null, 2), 'utf-8');
fs.writeFileSync(DB_BACKUP, JSON.stringify(fullDb, null, 2), 'utf-8');

console.log('✅ Database kasirpro_db.json successfully generated with:');
console.log(`- ${products.length} Products with Variants & 1:1 Vector Images`);
console.log(`- ${categories.length} Categories`);
console.log(`- ${transactions.length} Test Transactions`);
console.log(`- ${auditLogs.length} Audit Logs`);
console.log(`- Current Shift Total Cash: Rp ${totalCashCollected.toLocaleString('id-ID')}`);
