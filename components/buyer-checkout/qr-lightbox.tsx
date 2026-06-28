"use client";

interface QrLightboxProps {
  qrUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrLightbox({ qrUrl, isOpen, onClose }: QrLightboxProps) {
  if (!isOpen || !qrUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease] p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl p-8 shadow-float max-w-md w-full animate-[slideUp_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container transition-colors z-10"
        >
          <span className="material-symbols-outlined text-[24px] text-on-surface-variant">close</span>
        </button>
        <h3 className="text-[17px] font-semibold text-on-surface text-center mb-5">
          Scan QRIS untuk Membayar
        </h3>
        <div className="bg-white border border-outline-variant/20 rounded-xl p-3 flex items-center justify-center">
          <img
            src={qrUrl}
            alt="QR Code Pembayaran"
            className="w-full h-auto object-contain"
            style={{ maxHeight: "70vh" }}
          />
        </div>
        <p className="text-[13px] text-on-surface-variant text-center mt-5">
          Scan menggunakan e-wallet atau mobile banking kamu
        </p>
      </div>
    </div>
  );
}
