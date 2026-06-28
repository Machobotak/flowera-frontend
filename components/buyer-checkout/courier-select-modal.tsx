"use client";

import { formatRupiah } from "@/utils/format";
import type { AvailableShipping, ShippingOption } from "@/types/checkout";

interface CourierSelectModalProps {
  storeId: number | null;
  storeName: string;
  shippingOptions: AvailableShipping[];
  selected: ShippingOption | undefined;
  onSelect: (storeId: number, option: AvailableShipping) => void;
  onClose: () => void;
}

export default function CourierSelectModal({
  storeId,
  storeName,
  shippingOptions,
  selected,
  onSelect,
  onClose,
}: CourierSelectModalProps) {
  if (storeId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-float w-full sm:max-w-md max-h-[80vh] overflow-hidden animate-[slideUp_0.3s_ease] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
          <div>
            <h3 className="text-[16px] font-semibold text-on-surface">Pilih Kurir</h3>
            <p className="text-[12px] text-on-surface-variant mt-0.5">{storeName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[22px] text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Options list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {shippingOptions.map((opt, idx) => {
            const isSelected =
              selected?.courier_code === opt.courier_code &&
              selected?.courier_service === opt.courier_service;

            return (
              <button
                key={`${opt.courier_code}-${opt.courier_service}-${idx}`}
                type="button"
                onClick={() => { onSelect(storeId, opt); onClose(); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary-container/10"
                    : "border-outline-variant/20 hover:border-primary/40 active:scale-[0.98]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "border-primary" : "border-outline-variant"
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-on-surface block">
                    {opt.courier_name}
                  </span>
                  <span className="text-[12px] text-on-surface-variant">
                    {opt.courier_service} · Estimasi {opt.shipping_etd}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-primary flex-shrink-0">
                  {formatRupiah(opt.shipping_cost)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
