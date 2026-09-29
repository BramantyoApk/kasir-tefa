import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' })); // Support base64 product images
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// --- PERSISTENT DATABASE ENGINE ---
const DB_DIR = path.join(__dirname, 'database');
const DB_FILE = path.join(DB_DIR, 'kasirpro_db.json');
const DB_BACKUP = path.join(DB_DIR, 'kasirpro_db_backup.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DEFAULT_DB_DATA = {
  products: [],
  categories: [
    'Semua',
    'Minuman Sachet & Es',
    'Makanan & Mie Instan',
    'Snack & Biskuit'
  ],
  customers: [
    { id: 'CUST-001', name: 'Umum / Walk-in', phone: '-', debt: 0 }
  ],
  settings: {
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
    dbMode: 'server' // 'server' | 'cloud'
  },
  users: [
    { id: 'USR-001', name: 'Admin Kasir', role: 'Admin', pin: '1234' },
    { id: 'USR-002', name: 'Kasir 1', role: 'Kasir', pin: '0000' }
  ],
  transactions: [],
  auditLogs: [],
  currentShift: {
    id: `SHIFT-${Date.now()}`,
    status: 'OPEN',
    openedAt: new Date().toISOString(),
    cashier: 'Admin Kasir',
    startingCash: 0,
    cashIn: 0,
    cashOut: 0,
    expectedCash: 0,
    actualCash: null,
    closedAt: null,
    difference: 0,
    note: 'Shift Awal Toko Bersih'
  },
  pettyCashLogs: [],
  holdOrders: []
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(DEFAULT_DB_DATA);
      return DEFAULT_DB_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, attempting backup recovery...', err);
    if (fs.existsSync(DB_BACKUP)) {
      try {
        const backupRaw = fs.readFileSync(DB_BACKUP, 'utf-8');
        return JSON.parse(backupRaw);
      } catch (e) {}
    }
    return DEFAULT_DB_DATA;
  }
}

function writeDb(data) {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    // Write atomic temp file then rename
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, jsonStr, 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    // Also save copy to backup
    fs.writeFileSync(DB_BACKUP, jsonStr, 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// Find local IPv4 address prioritizing Wi-Fi and physical LAN adapters
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    const isVirtual = /vethernet|virtual|vmware|wsl|hyper-v|docker|loopback/i.test(name);
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        candidates.push({ name, address: net.address, isVirtual });
      }
    }
  }
  // 1. Wi-Fi
  const wifi = candidates.find(c => !c.isVirtual && /wi-fi|wlan|wireless/i.test(c.name));
  if (wifi) return wifi.address;
  // 2. Physical Ethernet
  const eth = candidates.find(c => !c.isVirtual && /ethernet|lan/i.test(c.name));
  if (eth) return eth.address;
  // 3. Any non-virtual physical adapter
  const physical = candidates.find(c => !c.isVirtual);
  if (physical) return physical.address;
  // 4. Fallback to any IPv4 candidate
  if (candidates.length > 0) return candidates[0].address;
  return 'localhost';
}

function getAllNetworkIps() {
  const interfaces = os.networkInterfaces();
  const list = [];
  for (const name of Object.keys(interfaces)) {
    const isVirtual = /vethernet|virtual|vmware|wsl|hyper-v|docker|loopback/i.test(name);
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        list.push({
          name,
          address: net.address,
          url: `http://${net.address}:${PORT}`,
          isVirtual,
          isWifi: /wi-fi|wlan|wireless/i.test(name)
        });
      }
    }
  }
  return list;
}

// ==========================================
// REST API DATABASE ENDPOINTS FOR INTEGRATION
// ==========================================

// 1. Health & Network info
app.get('/api/network-info', (req, res) => {
  const currentIp = getLocalIpAddress();
  res.json({
    status: 'online',
    database: 'active',
    dbFile: DB_FILE,
    localIp: currentIp,
    allIps: getAllNetworkIps(),
    port: PORT,
    localUrl: `http://localhost:${PORT}`,
    lanUrl: `http://${currentIp}:${PORT}`,
    hostname: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// 2. Full Database Sync
app.get('/api/db', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db });
});

app.post('/api/db/sync', (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const currentDb = readDb();
  const mergedDb = {
    ...currentDb,
    ...incoming,
    products: (Array.isArray(incoming.products) && incoming.products.length > 0)
      ? incoming.products
      : (currentDb.products && currentDb.products.length > 0 ? currentDb.products : incoming.products || []),
    categories: (Array.isArray(incoming.categories) && incoming.categories.length > 1)
      ? incoming.categories
      : (currentDb.categories && currentDb.categories.length > 1 ? currentDb.categories : incoming.categories || ['Semua']),
    customers: incoming.customers !== undefined ? incoming.customers : currentDb.customers,
    settings: incoming.settings !== undefined ? { ...currentDb.settings, ...incoming.settings } : currentDb.settings,
    transactions: (Array.isArray(incoming.transactions) && incoming.transactions.length >= (currentDb.transactions || []).length)
      ? incoming.transactions
      : (currentDb.transactions || []),
    auditLogs: incoming.auditLogs !== undefined ? incoming.auditLogs : currentDb.auditLogs,
    currentShift: incoming.currentShift !== undefined ? incoming.currentShift : currentDb.currentShift,
    pettyCashLogs: incoming.pettyCashLogs !== undefined ? incoming.pettyCashLogs : currentDb.pettyCashLogs,
    holdOrders: incoming.holdOrders !== undefined ? incoming.holdOrders : currentDb.holdOrders,
  };

  writeDb(mergedDb);
  res.json({ success: true, message: 'Database tersinkronisasi!', data: mergedDb });
});

// 3. Products Endpoints
app.get('/api/products', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.products || [] });
});

app.post('/api/products', (req, res) => {
  const db = readDb();
  const newProduct = req.body;
  if (!newProduct || !newProduct.name) {
    return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
  }

  db.products = [newProduct, ...(db.products || [])];
  if (newProduct.category && !db.categories.includes(newProduct.category)) {
    db.categories.push(newProduct.category);
  }
  writeDb(db);
  res.json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  const updated = req.body;

  const idx = (db.products || []).findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
  }

  db.products[idx] = { ...db.products[idx], ...updated };
  writeDb(db);
  res.json({ success: true, data: db.products[idx] });
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDb();
  const id = req.params.id;
  db.products = (db.products || []).filter(p => p.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'Produk berhasil dihapus' });
});

// 3b. Categories Endpoints
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.categories || [] });
});

// 4. Transactions Endpoints
app.get('/api/transactions', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.transactions || [] });
});

app.post('/api/transactions', (req, res) => {
  const db = readDb();
  const trx = req.body;
  if (!trx || !trx.id) {
    return res.status(400).json({ success: false, message: 'Data transaksi tidak valid' });
  }

  db.transactions = [trx, ...(db.transactions || [])];
  writeDb(db);
  res.json({ success: true, data: trx });
});

// 5. Audit Logs Endpoints
app.get('/api/audit-logs', (req, res) => {
  const db = readDb();
  res.json({ success: true, data: db.auditLogs || [] });
});

app.post('/api/audit-logs', (req, res) => {
  const db = readDb();
  const log = req.body;
  if (log && log.action) {
    db.auditLogs = [log, ...(db.auditLogs || [])];
    writeDb(db);
  }
  res.json({ success: true, data: log });
});

// 6. Reset Database Total
app.post('/api/db/reset', (req, res) => {
  const freshDb = {
    ...DEFAULT_DB_DATA,
    currentShift: {
      id: `SHIFT-${Date.now()}`,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      cashier: 'Admin Kasir',
      startingCash: 0,
      cashIn: 0,
      cashOut: 0,
      expectedCash: 0,
      actualCash: null,
      closedAt: null,
      difference: 0,
      note: 'Shift Awal Bersih'
    }
  };
  writeDb(freshDb);
  res.json({ success: true, message: 'Database server berhasil direset bersih!', data: freshDb });
});

// Serve frontend dist static assets
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  const activeIp = getLocalIpAddress();
  console.log(`\n=============================================================`);
  console.log(`🚀 KASIRPRO SERVER & DATABASE BACKEND AKTIF!`);
  console.log(`=============================================================`);
  console.log(`💾  Database File Path       : ${DB_FILE}`);
  console.log(`🖥️   Akses Lokal Komputer    : http://localhost:${PORT}`);
  console.log(`📱  Akses Komputer Lain/Wi-Fi: http://${activeIp}:${PORT}`);
  console.log(`🔗  REST API Database Sync   : http://${activeIp}:${PORT}/api/db`);
  console.log(`=============================================================\n`);
});
