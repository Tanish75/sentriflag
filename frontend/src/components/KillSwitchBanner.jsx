import { AlertOctagon, Flag } from "lucide-react";

export default function KillSwitchBanner() {
  return (
    <div className="bg-[#d13212] text-white border-b border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <AlertOctagon size={16} className="shrink-0" />
          <span>
            Emergency Circuit Breaker Engaged — All agent execution pipelines are currently halted.
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/20 font-mono text-xs">
          <Flag size={11} />
          <span>agent_emergency_shutdown = true</span>
        </div>
      </div>
    </div>
  );
}
