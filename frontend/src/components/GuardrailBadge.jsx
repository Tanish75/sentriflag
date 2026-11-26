const BADGE_CONFIG = {
  permissive: {
    label: "Permissive",
    classes: "bg-amber-50 border-amber-300 text-amber-800",
    dot: "bg-amber-500",
  },
  moderate: {
    label: "Moderate",
    classes: "bg-blue-50 border-blue-300 text-blue-800",
    dot: "bg-blue-600",
  },
  zero_trust: {
    label: "Zero-Trust",
    classes: "bg-red-50 border-red-300 text-red-800",
    dot: "bg-red-600",
  },
};

export default function GuardrailBadge({ level }) {
  const config = BADGE_CONFIG[level] || BADGE_CONFIG["moderate"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded px-2 py-0.5 text-xs font-medium font-mono ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
