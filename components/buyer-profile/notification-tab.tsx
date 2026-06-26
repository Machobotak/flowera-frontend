"use client";

import React, { useState } from "react";

export default function NotificationTab() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promos, setPromos] = useState(true);
  const [chat, setChat] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? "bg-primary" : "bg-outline-variant/40"
      }`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
        checked ? "translate-x-[22px]" : "translate-x-0.5"
      }`} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-headline text-[24px] font-semibold text-on-surface">Pengaturan Notifikasi</h2>
        <p className="text-[13px] text-on-surface-variant mt-1">Atur jenis notifikasi yang ingin kamu terima</p>
      </div>

      <div className="bg-white rounded-2xl border border-outline-variant/30 shadow-soft divide-y divide-outline-variant/20">
        {[
          { label: "Update Pesanan", desc: "Pemberitahuan status pesanan, pengiriman, dan selesai", checked: orderUpdates, onChange: setOrderUpdates },
          { label: "Promo & Diskon", desc: "Penawaran khusus, voucher, dan campaign menarik", checked: promos, onChange: setPromos },
          { label: "Chat & Pesan", desc: "Pesan dari florist atau customer service", checked: chat, onChange: setChat },
          { label: "Notifikasi SMS", desc: "Terima notifikasi melalui SMS", checked: smsNotif, onChange: setSmsNotif },
          { label: "Notifikasi Email", desc: "Terima notifikasi melalui email", checked: emailNotif, onChange: setEmailNotif },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-5">
            <div>
              <p className="text-[14px] font-semibold text-on-surface">{item.label}</p>
              <p className="text-[12px] text-on-surface-variant mt-0.5">{item.desc}</p>
            </div>
            <ToggleSwitch checked={item.checked} onChange={item.onChange} />
          </div>
        ))}
      </div>
    </div>
  );
}
