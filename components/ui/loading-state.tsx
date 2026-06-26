"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
}

/**
 * Generic loading spinner with configurable message.
 */
export default function LoadingState({
  message = "Memuat...",
}: LoadingStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant text-[14px] font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}
