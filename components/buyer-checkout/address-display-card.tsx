"use client";

import type { UserAddress } from "@/types/address";

interface AddressDisplayCardProps {
  address: UserAddress;
  onEdit?: () => void;
}

export default function AddressDisplayCard({ address, onEdit }: AddressDisplayCardProps) {
  return (
    <section className="bg-white rounded-xl border border-outline-variant/40 p-5 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-body text-[13px] font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
          Alamat Tujuan
        </h4>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[12px] text-primary font-semibold hover:underline"
          >
            Ubah
          </button>
        )}
      </div>
      <div className="text-[13px] text-on-surface-variant space-y-0.5 pl-7">
        <p className="font-semibold text-on-surface">{address.nama_penerima} · {address.no_hp}</p>
        <p>{address.address}</p>
        <p>
          {[address.city_name, address.province_name, address.zip_code]
            .filter(Boolean)
            .join(" ")}
        </p>
      </div>
    </section>
  );
}
