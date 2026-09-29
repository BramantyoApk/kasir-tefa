import { formatRupiah, formatDateTime } from './formatters';

// 1. Export Laporan Penjualan ke PDF (Native Clean A4 Layout with auto-print & save as PDF)
export const exportSalesReportPdf = ({ storeName, storeAddress, storePhone, transactions, totalOmzet, totalGrossProfit, validTransactionsCount }) => {
  if (!transactions || transactions.length === 0) {
    alert('Belum ada data transaksi untuk diekspor!');
    return false;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Pop-up browser terblokir. Izinkan pop-up untuk mencetak atau menyimpan PDF.');
    return false;
  }

  const now = new Date();
  const printDateStr = formatDateTime(now.toISOString());

  const rowsHtml = transactions.map((t) => {
    const isVoid = t.status === 'VOID';
    return `
      <tr style="${isVoid ? 'color: #94a3b8; text-decoration: line-through; background-color: #fff1f2;' : ''}">
        <td style="padding: 8px 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${t.id}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${formatDateTime(t.date)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${t.customer?.name || 'Umum'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${t.cashier || 'Kasir'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${t.paymentMethod || 'TUNAI'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-family: monospace; color: #059669;">${formatRupiah(t.total || t.grandTotal || 0)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(t.amountPaid || t.total || t.grandTotal || 0)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(t.change || 0)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 10px;">
          <span style="padding: 3px 8px; border-radius: 9999px; ${isVoid ? 'background-color: #ffe4e6; color: #e11d48;' : 'background-color: #d1fae5; color: #065f46;'}">${t.status}</span>
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Penjualan - ${storeName || 'Kasir Toko'}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
        .store-name { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
        .meta { color: #64748b; font-size: 11px; margin-top: 4px; }
        .kpi-grid { display: flex; gap: 12px; margin-bottom: 16px; }
        .kpi-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
        .kpi-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
        .kpi-val { font-size: 16px; font-weight: 800; margin-top: 4px; font-family: monospace; color: #0f172a; }
        .kpi-val.green { color: #059669; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
        th { background: #0f172a; color: white; padding: 9px 10px; text-align: left; font-size: 10px; text-transform: uppercase; font-weight: bold; }
        .toolbar { margin-bottom: 15px; text-align: right; }
        .btn-print { background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; }
        .btn-print:hover { background: #047857; }
        @media print {
          .toolbar { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
      </div>

      <div class="header">
        <div>
          <h1 class="store-name">${storeName || 'Kasir Toko'}</h1>
          <div class="meta">${storeAddress ? storeAddress + ' | ' : ''}Telp: ${storePhone || '-'}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 14px; color: #059669;">LAPORAN PENJUALAN</div>
          <div class="meta">Waktu Cetak: ${printDateStr}</div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Total Omzet Bersih</div>
          <div class="kpi-val green">${formatRupiah(totalOmzet)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Estimasi Laba Kotor</div>
          <div class="kpi-val green">${formatRupiah(totalGrossProfit)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Transaksi Selesai</div>
          <div class="kpi-val">${validTransactionsCount} Nota</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>No Nota</th>
            <th>Waktu</th>
            <th>Pelanggan</th>
            <th>Kasir</th>
            <th style="text-align: center;">Metode</th>
            <th style="text-align: right;">Total Tagihan</th>
            <th style="text-align: right;">Bayar (Uang)</th>
            <th style="text-align: right;">Kembalian</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <script>
        setTimeout(() => { window.print(); }, 400);
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
};

// 2. Export Struk Transaksi ke PDF
export const exportReceiptPdf = ({ storeName, storeAddress, storePhone, receiptFooter, transaction }) => {
  if (!transaction) return false;

  const printWindow = window.open('', '_blank', 'width=450,height=600');
  if (!printWindow) {
    alert('Pop-up browser terblokir. Izinkan pop-up untuk mencetak atau menyimpan PDF.');
    return false;
  }

  const itemsHtml = transaction.items.map((item) => `
    <div style="margin-bottom: 5px;">
      <div style="font-weight: bold;">${item.name}</div>
      <div style="display: flex; justify-content: space-between; color: #334155; font-size: 11px;">
        <span>${item.qty} x ${formatRupiah(item.price)}</span>
        <span style="font-weight: bold; color: #000;">${formatRupiah(item.subtotal)}</span>
      </div>
      ${item.discount > 0 ? `<div style="color: #e11d48; font-size: 10px;">Diskon: -${formatRupiah(item.discount)}</div>` : ''}
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Struk - ${transaction.id}</title>
      <style>
        @page { size: 80mm auto; margin: 2mm; }
        body { font-family: 'Courier New', Courier, monospace; font-size: 11px; margin: 0; padding: 12px; color: #000; width: 72mm; margin: 0 auto; line-height: 1.3; }
        .text-center { text-align: center; }
        .dashed { border-bottom: 1px dashed #000; margin: 6px 0; }
        .flex-between { display: flex; justify-content: space-between; }
        .bold { font-weight: bold; }
        .toolbar { text-align: center; margin-bottom: 10px; }
        .btn-print { background: #0f172a; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 11px; cursor: pointer; }
        @media print {
          .toolbar { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      </div>

      <div class="text-center">
        <div style="font-size: 14px; font-weight: bold;">${storeName || 'KASIR TOKO'}</div>
        <div style="font-size: 10px; color: #475569;">${storeAddress || ''}</div>
        <div style="font-size: 10px; color: #475569;">Telp: ${storePhone || '-'}</div>
      </div>

      <div class="dashed"></div>

      <div class="flex-between"><span>No Nota</span><span class="bold">${transaction.id}</span></div>
      <div class="flex-between"><span>Waktu</span><span>${formatDateTime(transaction.date)}</span></div>
      <div class="flex-between"><span>Kasir</span><span>${transaction.cashier}</span></div>
      <div class="flex-between"><span>Pelanggan</span><span>${transaction.customer?.name || 'Umum'}</span></div>

      <div class="dashed"></div>

      ${itemsHtml}

      <div class="dashed"></div>

      <div class="flex-between"><span>Subtotal:</span><span>${formatRupiah(transaction.subtotal)}</span></div>
      ${transaction.discount > 0 ? `<div class="flex-between" style="color: #e11d48;"><span>Diskon:</span><span>-${formatRupiah(transaction.discount)}</span></div>` : ''}
      ${transaction.tax > 0 ? `<div class="flex-between"><span>PPN:</span><span>${formatRupiah(transaction.tax)}</span></div>` : ''}
      
      <div class="flex-between bold" style="font-size: 13px; margin: 4px 0;">
        <span>TOTAL:</span><span>${formatRupiah(transaction.total)}</span>
      </div>

      <div class="flex-between">
        <span>Bayar (${transaction.paymentMethod}):</span>
        <span class="bold">${formatRupiah(transaction.amountPaid || transaction.total)}</span>
      </div>

      ${transaction.paymentMethod === 'TUNAI' ? `
        <div class="flex-between">
          <span>Kembalian:</span>
          <span class="bold">${formatRupiah(transaction.change || 0)}</span>
        </div>
      ` : ''}

      <div class="dashed"></div>

      <div class="text-center" style="font-size: 10px; color: #475569; white-space: pre-line; margin-top: 6px;">
        ${receiptFooter || 'Terima kasih atas kunjungan Anda!'}
      </div>

      <script>
        setTimeout(() => { window.print(); }, 400);
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
};

// 3. Export Daftar Produk ke PDF
export const exportProductsPdf = ({ storeName, products }) => {
  if (!products || products.length === 0) {
    alert('Belum ada produk untuk diekspor!');
    return false;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Pop-up browser terblokir. Izinkan pop-up untuk mencetak atau menyimpan PDF.');
    return false;
  }

  const rowsHtml = products.map((p) => `
    <tr>
      <td style="padding: 8px 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${p.barcode || '-'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${p.name}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0;">${p.category || 'Umum'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatRupiah(p.costPrice || 0)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-family: monospace; color: #059669;">${formatRupiah(p.price)}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${p.stock} ${p.unit || 'pcs'}</td>
      <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 11px;">
        ${p.variants && p.variants.length > 0 ? `${p.variants.length} Varian (${p.variants.map(v => v.name).join(', ')})` : 'Standar'}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Daftar Produk - ${storeName || 'KasirPro'}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; margin: 0; padding: 15px; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 16px; }
        .store-name { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #0f172a; color: white; padding: 9px 10px; text-align: left; font-size: 10px; text-transform: uppercase; font-weight: bold; }
        .toolbar { margin-bottom: 15px; text-align: right; }
        .btn-print { background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; }
        @media print { .toolbar { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan sebagai PDF</button>
      </div>

      <div class="header">
        <div>
          <h1 class="store-name">${storeName || 'Kasir Toko'}</h1>
          <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Daftar Produk & Inventori Toko (${products.length} Item)</div>
        </div>
        <div style="text-align: right; color: #64748b; font-size: 11px;">
          Waktu Cetak: ${formatDateTime(new Date().toISOString())}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th style="text-align: right;">Modal (HPP)</th>
            <th style="text-align: right;">Harga Jual</th>
            <th style="text-align: center;">Stok</th>
            <th style="text-align: center;">Varian</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <script>
        setTimeout(() => { window.print(); }, 400);
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
};
