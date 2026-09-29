export const INITIAL_CATEGORIES = [
  'Semua',
  'Minuman Sachet & Es',
  'Makanan & Mie Instan',
  'Snack & Biskuit'
];

export const INITIAL_PRODUCTS = [
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

export const INITIAL_CUSTOMERS = [
  { id: 'CUST-001', name: 'Umum / Walk-in', phone: '-', debt: 0 },
  { id: 'CUST-002', name: 'Budi Santoso', phone: '0812-3456-7890', debt: 0 },
  { id: 'CUST-003', name: 'Siti Rahma', phone: '0857-1234-5678', debt: 0 }
];

export const INITIAL_SETTINGS = {
  storeName: 'Kasir Toko',
  storeAddress: 'Jl. Utama No. 1, Toko',
  storePhone: '0812-3456-7890',
  receiptFooter: 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.',
  receiptWidth: '58mm', // '58mm' or '80mm'
  taxEnabled: false,
  taxRate: 11, // 11% PPN
  soundEnabled: true,
  currency: 'Rp',
  theme: 'emerald',
  storeLogo: ''
};

export const INITIAL_USERS = [
  { id: 'USR-001', name: 'Admin Kasir', role: 'Admin', pin: '1234' },
  { id: 'USR-002', name: 'Kasir 1', role: 'Kasir', pin: '0000' }
];
