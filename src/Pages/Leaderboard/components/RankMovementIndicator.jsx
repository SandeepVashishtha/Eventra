import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const RankMovementIndicator = memo(({ liveDifference }) => {
  const diff = liveDifference ?? 0;

  if (diff > 0) {
    return (
      <motion.span
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-500"
        aria-label={`Rank improved by ${diff} position${diff > 1 ? "s" : ""}`}
      >
        <ArrowUp className="h-2.5 w-2.5 animate-bounce" />
        <span className="sr-only">Up</span>
        {diff}
      </motion.span>
    );
  }
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    return (
      <motion.span
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-500"
        aria-label={`Rank dropped by ${absDiff} position${absDiff > 1 ? "s" : ""}`}
      >
        <ArrowDown className="h-2.5 w-2.5" />
        <span className="sr-only">Down</span>
        {absDiff}
      </motion.span>
    );
  }
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold text-slate-400"
      aria-label="No rank change"
    >
      <Minus className="h-2 w-2" aria-hidden="true" />
    </span>
  );
});

RankMovementIndicator.displayName = "RankMovementIndicator";

export default RankMovementIndicator;
