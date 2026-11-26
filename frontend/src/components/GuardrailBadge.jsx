const BADGE_CONFIG = {
  permissive: {
    label: "⚠️ Permissive",
    classes: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    dot: "bg-amber-400",
  },
  moderate: {
    label: "🛡️ Moderate",
    classes: "bg-orange-500/15 border-orange-500/40 text-orange-300",
    dot: "bg-orange-400",
  },
  zero_trust: {
    label: "🔴 Zero-Trust",
    classes: "bg-red-500/15 border-red-500/40 text-red-300",
    dot: "bg-red-500",
  },
};

export default function GuardrailBadge({ level, size = "sm" }) {
  const config = BADGE_CONFIG[level] || BADGE_CONFIG["moderate"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-medium ${config.classes} ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dot}`} />
      {config.label}
    </span>
  );
}
