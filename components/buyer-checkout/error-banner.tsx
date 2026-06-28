"use client";

interface ErrorBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-error-container/20 border border-error/20 text-[13px] text-error font-medium">
      <span className="material-symbols-outlined text-[18px]">error</span>
      {message}
      <button onClick={onDismiss} className="ml-auto">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
}
