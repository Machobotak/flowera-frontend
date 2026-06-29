import Link from "next/link";

export default function ComingSoonPage() {
  return (
    <main className="pt-8 pb-16 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-28 h-28 rounded-full bg-surface-container flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-on-surface-variant/30 text-[56px]">
            construction
          </span>
        </div>

        <h1 className="font-headline text-[28px] font-semibold text-on-surface mb-3">
          Segera Hadir
        </h1>

        <p className="text-[15px] text-on-surface-variant leading-relaxed mb-2">
          Fitur ini sedang dalam pengembangan.
        </p>
        <p className="text-[13px] text-on-surface-variant/60 leading-relaxed">
          Tim kami sedang bekerja keras untuk menghadirkannya segera.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-xl text-[14px] font-semibold hover:shadow-float transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
