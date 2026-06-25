const BrandMark = ({ compact = false }) => (
  <div className="flex min-w-0 items-center gap-3">
    <div
      className={`flex flex-none items-center justify-center overflow-hidden rounded-2xl bg-white/90 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-900/80 dark:ring-zinc-700/60 ${
        compact ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12"
      }`}
    >
      <img
        src="/Eventra.png"
        alt="Eventra"
        className="block flex-none object-contain"
        style={{ width: compact ? 40 : 44, height: compact ? 40 : 44 }}
        loading="lazy"
      />
    </div>
    <span
      className={`truncate font-black tracking-tight text-zinc-900 dark:text-white ${
        compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
      }`}
    >
      Eventra
    </span>
  </div>
);

export default BrandMark;
