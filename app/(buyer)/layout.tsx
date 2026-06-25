"use client";

import React from "react";
import BuyerNavbar from "@/components/layout/navbar/buyer-navbar";
import Footer from "@/components/layout/footer";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BuyerNavbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
