import { BarChart2 } from "lucide-react";

function StatBox({ label, value, highlight = "default" }) {
  const styles = {
    default: "text-slate-900",
    amber: "text-amber-700",
    red: "text-[#d13212]",
    emerald: "text-emerald-700",
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded px-3 py-2">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-base font-semibold font-mono mt-0.5 ${styles[highlight]}`}>{value}</p>
    </div>
  );
}

export default function MetricsPanel({ metricsA, metricsB }) {
  const blockRateA =
    metricsA.totalRequests > 0
      ? Math.round((metricsA.blockedCount / metricsA.totalRequests) * 100)
      : 0;
  const blockRateB =
    metricsB.totalRequests > 0
      ? Math.round((metricsB.blockedCount / metricsB.totalRequests) * 100)
      : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-slate-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Session Telemetry
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Real-time comparison</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Variant A Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">Variant A</span>
            <span className="text-[11px] font-mono text-slate-500">
              {metricsA.blockedCount}/{metricsA.totalRequests} blocked
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Requests" value={metricsA.totalRequests} />
            <StatBox
              label="Block Rate"
              value={`${blockRateA}%`}
              highlight={blockRateA >= 50 ? "emerald" : "amber"}
            />
            <StatBox label="Avg Latency" value={`${metricsA.avgLatency}ms`} />
          </div>
        </div>

        {/* Variant B Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">Variant B</span>
            <span className="text-[11px] font-mono text-slate-500">
              {metricsB.blockedCount}/{metricsB.totalRequests} blocked
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="Requests" value={metricsB.totalRequests} />
            <StatBox
              label="Block Rate"
              value={`${blockRateB}%`}
              highlight={blockRateB >= 50 ? "emerald" : "red"}
            />
            <StatBox label="Avg Latency" value={`${metricsB.avgLatency}ms`} />
          </div>
        </div>
      </div>
    </div>
  );
}
