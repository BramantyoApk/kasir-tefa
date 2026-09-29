# 🌐 Panduan Lengkap: Akses Online & Integrasi Database KasirPro (Bukan Localhost)

Aplikasi **KasirPro** telah dirancang dengan arsitektur **Hybrid Offline-First + Central REST Database**.
Artinya, aplikasi dapat dibuka di banyak perangkat (Laptop kasir, HP Android, iPad/Tablet) dan tersinkronisasi secara otomatis.

Berikut adalah **4 Metode Praktis** untuk mengakses KasirPro tanpa terbatas pada `localhost`:

---

## 📱 Metode 1: Akses Lewat Jaringan Wi-Fi Toko (HP Android & Tablet) — *Paling Mudah & Cepat*

Jika laptop kasir dan smartphone/tablet Anda terhubung ke Wi-Fi atau Hotspot yang sama:

1. **Jalankan Server di Laptop Kasir:**
   ```bash
   npm start
   ```
2. **Lihat Alamat IP Komputer Anda:**
   - Server akan menampilkan alamat seperti: `http://10.197.151.67:3000`
   - Atau buka menu **Pengaturan > Integrasi Database & REST API** di kasir untuk melihat IP & scan QR Code.
3. **Buka di HP Android:**
   - Buka browser Chrome di HP.
   - Ketik alamat IP tersebut (misal `http://10.197.151.67:3000`) atau scan QR Code langsung dari layar laptop.
   - Aplikasi kasir akan langsung terbuka dengan tata letak responsif HP, touch-friendly, dan kamera barcode scanner aktif!

> **💡 Catatan Firewall Windows:**
> Jika HP loading terus-menerus, buka **Windows Defender Firewall with Advanced Security** > Buat **Inbound Rule** baru > Pilih **Port** > Masukkan **3000** (TCP) > Izinkan Koneksi (Allow Connection).

---

## 🌍 Metode 2: Akses Dari Mana Saja di Luar Toko (Gratis via Cloudflare Tunnel)

Metode ini memungkinkan Anda membuka kasir dari luar kota, rumah, atau saat menggunakan kuota data seluler (4G/5G) tanpa perlu membeli domain atau sewa server.

1. **Buka PowerShell / CMD di Laptop Kasir, ketik:**
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
   *(Atau alternatif: `npx localtunnel --port 3000`)*
2. Cloudflare akan memberikan link HTTPS publik gratis, contoh:
   ```text
   https://kasir-toko-anda.trycloudflare.com
   ```
3. Bagikan link tersebut ke kasir cabang atau buka dari HP di mana pun Anda berada.
4. Semua data penjualan dan stok langsung tersimpan ke database laptop kasir utama secara realtime!

---

## ☁️ Metode 3: Deploy Online 24 Jam Nonstop di Cloud Gratis (Render.com / Railway)

Jika Anda ingin kasir online terus menerus di internet tanpa perlu laptop kasir di toko menyala terus:

### A. Deploy ke Render.com (Gratis)
1. Buat akun di [Render.com](https://render.com) (gratis).
2. Upload kode proyek ini ke GitHub Anda.
3. Di dashboard Render, klik **New Web Service** > Hubungkan dengan repositori GitHub Anda.
4. Masukkan konfigurasi berikut:
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Klik **Create Web Service**.
6. Dalam 2-3 menit, Anda akan mendapatkan URL HTTPS online resmi seperti `https://kasirpro.onrender.com` yang bisa diakses kapan pun dan dari mana pun!

### B. Deploy ke Vercel
File konfigurasi `vercel.json` sudah disediakan dalam repositori ini. Cukup hubungkan GitHub Anda ke Vercel untuk deploy otomatis.

---

## 🗄️ Metode 4: Integrasi Database Eksternal (Supabase / Remote PostgreSQL / REST API)

Bagi Anda yang ingin mengintegrasikan data transaksi toko dengan Cloud Database eksternal:

1. Buka menu **Pengaturan** di aplikasi kasir.
2. Klik tab **Integrasi Database & REST API**.
3. Pada bagian **Integrasi Cloud Database**, aktifkan toggle **Aktifkan Sinkronisasi Cloud**.
4. Pilih provider (misal: **Supabase**).
5. Masukkan **URL REST Endpoint** dan **API Key / Secret Token**.
6. Klik **Tes Koneksi Cloud** untuk memastikan server tersambung.
7. Klik **Simpan Pengaturan Cloud**. Setiap transaksi dan mutasi stok akan langsung disalin ke Cloud Database Anda!

---

## 🔌 Dokumentasi REST API untuk Developer & Integrasi

KasirPro menyediakan REST API siap pakai untuk integrasi dengan sistem lain (ERP, E-Commerce, Barcode Scanner IoT, dll):

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/network-info` | Informasi IP, port, status server & host |
| `GET` | `/api/db` | Mengambil seluruh database toko (JSON) |
| `POST` | `/api/db/sync` | Sinkronisasi dua arah multi-perangkat |
| `GET / POST` | `/api/products` | Baca & tambah produk baru beserta varian harga |
| `PUT / DELETE` | `/api/products/:id` | Edit atau hapus produk dari database |
| `GET / POST` | `/api/transactions` | Riwayat penjualan & struk transaksi |
| `GET / POST` | `/api/audit-logs` | Seluruh catatan log mutasi produk & aksi kasir |
| `POST` | `/api/db/reset` | Reset database bersih total (0 data) |

---
*KasirPro — Modern Point of Sale System 100% Siap Pakai & Multi-Device.*
