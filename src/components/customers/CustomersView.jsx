import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  X, 
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const CustomersView = () => {
  const { customers, addCustomer, payCustomerDebt } = usePos();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustNote, setNewCustNote] = useState('');

  // Payment Debt Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [targetCust, setTargetCust] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('TUNAI');
  const [payNote, setPayNote] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.phone && c.phone.includes(search))
  );

  const totalDebtAll = customers.reduce((sum, c) => sum + (c.debt || 0), 0);
  const totalWithDebt = customers.filter(c => (c.debt || 0) > 0).length;

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert('Nama pelanggan wajib diisi!');
      return;
    }

    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim() || '-',
      note: newCustNote.trim(),
      debt: 0
    });

    setNewCustName('');
    setNewCustPhone('');
    setNewCustNote('');
    setShowAddModal(false);
  };

  const handleConfirmPayDebt = (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      alert('Masukkan nominal pelunasan yang valid!');
      return;
    }

    payCustomerDebt(targetCust.id, Number(payAmount), payMethod, payNote);
    setShowPayModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Pelanggan & Buku Kas Bon (Piutang)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data kontak pelanggan setia dan pencatatan hutang/bon teratur
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggan Baru</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Pelanggan Terdaftar</span>
          <div className="text-2xl font-extrabold text-slate-900">
            {customers.length} Orang
          </div>
          <div className="text-[11px] text-slate-400">Termasuk pelanggan walk-in umum</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm space-y-1">
          <span className="text-xs font-bold text-rose-700">Total Piutang Belum Lunas (Kas Bon)</span>
          <div className="text-2xl font-extrabold text-rose-600 font-mono">
            {formatRupiah(totalDebtAll)}
          </div>
          <div className="text-[11px] text-rose-600">
            {totalWithDebt} pelanggan memiliki catatan tagihan bon
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pelanggan atau nomor telepon / WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3.5">Nama Pelanggan</th>
                <th className="px-4 py-3.5">No. Telepon / WA</th>
                <th className="px-4 py-3.5 text-right">Saldo Hutang/Bon</th>
                <th className="px-4 py-3.5 text-center">Aksi Pelunasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.map((c) => {
                const hasDebt = (c.debt || 0) > 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {c.name}
                      {c.id === 'CUST-001' && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-normal bg-slate-100 text-slate-500">
                          Bawaan
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {c.phone}
                    </td>

                    <td className={`px-4 py-3 text-right font-mono font-bold ${
                      hasDebt ? 'text-rose-600 text-sm' : 'text-slate-400'
                    }`}>
                      {formatRupiah(c.debt || 0)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {hasDebt ? (
                        <button
                          onClick={() => {
                            setTargetCust(c);
                            setPayAmount(c.debt);
                            setPayMethod('TUNAI');
                            setPayNote('');
                            setShowPayModal(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
                        >
                          Bayar Bon / Cicil
                        </button>
                      ) : (
                        <span className="text-slate-300 text-xs">Lunas / Bersih</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Tambah Pelanggan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Pelanggan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Joko Santoso"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nomor HP / WhatsApp:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alamat / Catatan Khusus:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Blok B No. 12"
                  value={newCustNote}
                  onChange={(e) => setNewCustNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY DEBT MODAL */}
      {showPayModal && targetCust && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Pelunasan Kas Bon</h3>
                <p className="text-xs text-slate-500">{targetCust.name}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Hutang Saat Ini:</span>
              <span className="font-extrabold text-rose-600 font-mono text-sm">
                {formatRupiah(targetCust.debt)}
              </span>
            </div>

            <form onSubmit={handleConfirmPayDebt} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nominal Pembayaran (Rp):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={targetCust.debt}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Metode Bayar:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['TUNAI', 'TRANSFER'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        payMethod === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Pelunasan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Cicilan bon ke-1"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Terima Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
