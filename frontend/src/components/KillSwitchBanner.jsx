import { motion } from "framer-motion";
import { AlertTriangle, Flag } from "lucide-react";

export default function KillSwitchBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-red-950 border-b-2 border-red-600"
    >
      {/* Animated background pulse */}
      <motion.div
        className="absolute inset-0 bg-red-600/10"
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <AlertTriangle size={16} className="text-red-400" fill="currentColor" fillOpacity={0.3} />
        </motion.div>

        <span className="text-red-100 text-sm font-semibold tracking-wide">
          🔴 EMERGENCY SHUTDOWN ACTIVE — All AI Agents Offline
        </span>

        <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-red-900/50 border border-red-700/50 text-xs font-mono text-red-300">
          <Flag size={10} />
          agent_emergency_shutdown = true
        </span>

        <span className="text-red-300 text-xs hidden md:block">
          via Flagsmith Kill Switch
        </span>
      </div>
    </motion.div>
  );
}
