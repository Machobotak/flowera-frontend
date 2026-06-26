"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  AccountSidebar,
  ProfileTab,
  AddressTab,
  PasswordTab,
  BankTab,
  NotificationTab,
  PrivacyTab,
} from "@/components/buyer-profile";
import type { AccountTab } from "@/components/buyer-profile";

/* ──────────────────────────── Page ──────────────────────────── */

function AccountPageContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as AccountTab | null;
  const validTabs: AccountTab[] = ["profile", "bank", "address", "password", "notification", "privacy"];
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "profile";
  const [activeTab, setActiveTab] = useState<AccountTab>(initialTab);

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab />;
      case "bank": return <BankTab />;
      case "address": return <AddressTab />;
      case "password": return <PasswordTab />;
      case "notification": return <NotificationTab />;
      case "privacy": return <PrivacyTab />;
    }
  };

  return (
    <main className="pt-8 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <section className="flex-grow min-w-0">{renderTab()}</section>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <main className="pt-8 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
