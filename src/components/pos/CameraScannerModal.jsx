import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { usePos } from '../../context/PosContext';
import { playBeep, playErrorSound } from '../../utils/audio';
import { X, Camera, RefreshCw, AlertCircle } from 'lucide-react';

export const CameraScannerModal = ({ isOpen, onClose }) => {
  const { products, addToCart } = usePos();
  const [scannerError, setScannerError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode = null;

    if (isOpen) {
      setScannerError(null);
      setScanResult(null);

      const scannerElementId = 'reader-qr-camera';

      // Initialize Html5Qrcode
      try {
        html5QrCode = new Html5Qrcode(scannerElementId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        html5QrCode
          .start(
            { facingMode: 'environment' }, // Back camera on mobile Android
            config,
            (decodedText) => {
              // Successfully scanned
              playBeep();
              const matched = products.find(
                (p) => p.barcode === decodedText || p.id.toLowerCase() === decodedText.toLowerCase()
              );

              if (matched) {
                addToCart(matched, 1);
                setScanResult({
                  success: true,
                  text: `Berhasil menambahkan: ${matched.name}`,
                });
              } else {
                playErrorSound();
                setScanResult({
                  success: false,
                  text: `Kode "${decodedText}" tidak terdaftar di sistem!`,
                });
              }

              // Auto clear notification after 2 seconds
              setTimeout(() => setScanResult(null), 2500);
            },
            (errorMessage) => {
              // Standard continuous frame scan parse - ignore non-matching frames
            }
          )
          .catch((err) => {
            console.error('Camera start error:', err);
            setScannerError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser Anda.');
          });
      } catch (err) {
        setScannerError('Gagal menginisialisasi kamera scanner.');
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch((err) => console.log('Stop camera scanner error:', err));
        scannerRef.current = null;
      }
    };
  }, [isOpen, products, addToCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">Scanner Kamera Barcode</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Area */}
        <div className="p-4 bg-black flex flex-col items-center justify-center relative min-h-[300px]">
          <div id="reader-qr-camera" className="w-full max-w-xs overflow-hidden rounded-2xl" />

          {/* Error Message */}
          {scannerError && (
            <div className="p-4 bg-rose-900/80 border border-rose-700 text-rose-100 rounded-xl text-xs flex items-center gap-2 m-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Scan Result Feedback Toast */}
          {scanResult && (
            <div
              className={`absolute bottom-6 left-6 right-6 p-3 rounded-xl text-xs font-bold text-center shadow-lg transition-all animate-in zoom-in-90 ${
                scanResult.success
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {scanResult.text}
            </div>
          )}
        </div>

        {/* Footer Instructions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            Arahkan kamera ke barcode produk atau QR code. Barang akan otomatis ditambahkan ke keranjang.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Tutup Scanner
          </button>
        </div>

      </div>
    </div>
  );
};
