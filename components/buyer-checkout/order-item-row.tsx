"use client";

import { FILL_STYLE, formatRupiah } from "@/utils/format";

interface CheckoutItem {
  id?: string;
  name: string;
  florist: string;
  price: number;
  qty: number;
  image: string;
  flowerType?: string;
  wrappingColor?: string;
  wrappingLabel?: string;
  addons?: { name: string; qty?: number; price: number; icon: string; image?: string }[];
}

export default function OrderItemRow({ item }: { item: CheckoutItem }) {
  return (
    <div className="flex gap-4 py-4 border-b border-outline-variant/20 last:border-0">
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-semibold text-on-surface truncate">{item.name}</h4>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{item.florist}</p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {item.flowerType && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary-container/20 text-[9px] font-medium text-on-primary-container">
              <span className="material-symbols-outlined text-[11px]" style={FILL_STYLE}>local_florist</span>
              {item.flowerType}
            </span>
          )}
          {item.wrappingColor && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-container text-[9px] font-medium text-on-surface-variant">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-outline-variant/30" style={{ backgroundColor: item.wrappingColor }} />
              {item.wrappingLabel}
            </span>
          )}
          {item.addons?.map((a, i) => (
            <span key={`${a.name}-${i}`} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-secondary-container/20 text-[9px] font-medium text-on-secondary-container">
              {a.image ? (
                <img src={a.image} alt={a.name} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[11px]">{a.icon}</span>
              )}
              {a.name}{a.qty && a.qty > 1 ? ` ×${a.qty}` : ""}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[14px] font-bold text-on-surface">{formatRupiah(item.price)}</p>
        <p className="text-[11px] text-on-surface-variant">×{item.qty}</p>
      </div>
    </div>
  );
}
