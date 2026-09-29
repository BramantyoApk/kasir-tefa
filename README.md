# 🛒 KasirPro - Aplikasi Alat Kasir Website Multi-Device (100% Lengkap)

Aplikasi Point of Sale (POS) modern berbasis web yang ringan, cepat, dan 100% responsif di perangkat **Desktop PC, Laptop, Tablet (iPad & Android), serta Smartphone Android**.

---

## 🌟 Fitur Utama & Alat-Alat Kasir Lengkap

### 1. 🖥️ Kasir Pintar (POS Desk)
- **Pencarian Cepat & Filter Kategori**: Filter instan Makanan, Minuman, Sembako, Snack, Kebutuhan Rumah.
- **Scanner Barcode Dual Mode**:
  - **Kamera HP Android / Webcam (F3)**: Memindai barcode & QR langsung dari kamera belakang HP.
  - **Barcode Scanner Gun (USB / Bluetooth)**: Input otomatis dengan auto-enter.
- **Pintasan Keyboard (Keyboard Shortcuts)**:
  - `F1`: Fokus pencarian barang.
  - `F2`: Buka pembayaran cepat.
  - `F3`: Buka scanner kamera barcode.
  - `Esc`: Tutup modal.
- **Efek Suara Offline (Web Audio API)**: Suara beep saat scan barcode dan chime saat checkout sukses.
- **Tahan Transaksi (Hold Orders)**: Menyimpan antrian transaksi sementara untuk melayani pelanggan berikutnya.

### 2. 💳 Pembayaran Fleksibel (Multi-Payment)
- **Tunai (Cash)**: Tombol pecahan uang cepat (Uang Pas, 10k, 20k, 50k, 100k, 200k) + kalkulator kembalian otomatis.
- **QRIS Dinamis**: Menghasilkan QR Code QRIS secara real-time dengan nominal tagihan tepat (BCA, GoPay, OVO, DANA, ShopeePay, dll).
- **Transfer Bank**: Catatan nomor rekening BCA & Mandiri toko dan input nomor referensi pengirim.
- **Kas Bon / Piutang Pelanggan**: Catat bon belanja pelanggan dengan riwayat pelunasan bertahap.

### 3. 🧾 Format Struk & Nota Multi-Format
- **Cetak Printer Thermal POS**: Mendukung format ukuran kertas **58mm** (mini POS/mobile) dan **80mm** (standar kasir desktop).
- **Kirim Struk WhatsApp**: Otomatis membuat format teks nota rapi dan langsung membuka WhatsApp ke nomor pembeli.
- **Salin Teks Nota**: Salin teks struk belanja ke clipboard.

### 4. 🛡️ Sistem Log & Audit Trail (100% Transparan)
Setiap mutasi dan aksi terekam otomatis dengan timestamp, nama kasir, dan snapshot data:
- `CREATE`: Penambahan produk, kategori, pelanggan baru.
- `UPDATE`: Pengeditan harga, stok, nama produk, profil toko.
- `DELETE`: Penghapusan barang atau kategori.
- `TRANSACTION`: Rekap penjualan dengan rincian item, kasir, dan pembayaran.
- `VOID`: Pembatalan/refund transaksi dengan alasan wajib dan pengembalian stok otomatis.
- `STOCK`: Mutasi stok masuk, keluar, atau koreksi opname fisik.
- `SHIFT`: Buka shift laci kasir dan tutup kasir.
- **Filter & Export**: Filter jenis aksi, pencarian kata kunci, dan export ke CSV.

### 5. 📦 Manajemen Produk & Stok (Inventory)
- CRUD Produk lengkap dengan Modal (HPP), Harga Jual, dan indikator persentase margin laba.
- **Peringatan Stok Menipis (Low Stock Alert)** otomatis jika stok di bawah batas minimum.
- **Cetak Label Barcode Rak**: Menampilkan stiker barcode produk siap cetak.
- **Mutasi Stok Cepat**: Tambah stok masuk (kulakan) atau stok keluar (rusak/kadaluarsa).

### 6. 💰 Manajemen Laci Kas & Shift Kasir
- **Buka Kasir**: Input modal awal (float cash).
- **Arus Kas Kecil (Petty Cash)**: Catat uang keluar operasional (beli es, galon, plastik) atau uang masuk.
- **Tutup Kasir (End Shift)**: Bandingkan uang fisik di laci dengan sistem, deteksi selisih (seimbang, lebih, atau kurang).
- **Cetak Z-Report**: Ringkasan pertanggungjawaban shift kasir.

### 7. 📊 Laporan & Analitik Penjualan
- Omzet harian, Laba Kotor (Gross Profit = Penjualan - HPP), Total Transaksi, Nilai Rata-rata Keranjang (AOV).
- Top 5 Produk Terlaris (Qty dan Omzet).
- Riwayat transaksi lengkap dengan opsi Cetak Ulang Struk (Reprint) dan Batalkan Transaksi (VOID).
- Export laporan ke file Excel / CSV.

### 8. 👥 Manajemen Pelanggan & Hutang
- Buku catatan kas bon / piutang pelanggan.
- Formulir pembayaran cicilan / pelunasan bon dengan bukti bayar.

### 9. ⚙️ Pengaturan & Backup Sistem
- Pengaturan Profil Toko (Nama, Alamat, Telp, Catatan Kaki Struk).
- Konfigurasi Pajak PPN (Aktif/Nonaktif & Persentase).
- Ukuran Kertas Struk (58mm vs 80mm).
- **Backup Data JSON**: Unduh seluruh database sistem ke file `.json`.
- **Restore Data JSON**: Unggah file cadangan untuk memulihkan seluruh data toko kapan saja.
- Reset ke data pabrik (demo awal).

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi sudah selesai dibangun dan server saat ini sedang berjalan!

### Perintah Utama:
```bash
# Menjalankan server aplikasi lokal:
npm run start
# Atau
npm run server
```

### Akses Aplikasi:
1. **Di Komputer Kasir / Laptop**:
   Buka browser dan kunjungi: **`http://localhost:3000`**
2. **Di HP Android / Tablet (Satu Wi-Fi)**:
   Buka browser HP atau scan QR Code di menu Pengaturan: **`http://10.197.151.67:3000`**
   *(Gunakan opsi "Add to Home Screen" di browser Chrome HP untuk pengalaman seperti aplikasi native kasir!)*

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Tailwind CSS, Lucide React Icons.
- **Scanner**: Html5Qrcode (Kamera Android & Webcam) + Barcode Gun Listener.
- **QRIS Engine**: Qrcode Canvas Generator.
- **Audio Synthesizer**: Web Audio API (100% Offline Beep & Chime).
- **Audit Logging**: Immutable Structured Audit Trail Emitter.
- **Storage**: LocalStorage & JSON Backup Engine.
- **Backend**: Node.js & Express Server (Local Wi-Fi Network Sharing).
