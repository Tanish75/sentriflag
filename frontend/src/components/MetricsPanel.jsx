import { TrendingDown, TrendingUp, Activity } from "lucide-react";

function StatCard({ label, value, sub, color = "slate" }) {
  const colorMap = {
    amber: "text-amber-400",
    red: "text-red-400",
    emerald: "text-emerald-400",
    slate: "text-slate-300",
  };

  return (
    <div className="bg-slate-800/50 rounded-lg px-3 py-2.5 text-center">
      <p className={`text-lg font-bold font-mono ${colorMap[color]}`}>{value}</p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-slate-600 text-xs">{sub}</p>}
    </div>
  );
}

function BarComparison({ labelA, labelB, valueA, valueB, unit = "" }) {
  const max = Math.max(valueA, valueB, 1);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-amber-400 w-4">A</span>
        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-amber-500/70 rounded-full transition-all duration-500"
            style={{ width: `${pctA}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 w-16 text-right font-mono">
          {valueA}{unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-400 w-4">B</span>
        <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-red-500/70 rounded-full transition-all duration-500"
            style={{ width: `${pctB}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 w-16 text-right font-mono">
          {valueB}{unit}
        </span>
      </div>
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

  const safetyA = blockRateA;
  const safetyB = blockRateB;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={16} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-white">Live Metrics</h3>
        <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          live
        </span>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-2">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide">Variant A</p>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Requests" value={metricsA.totalRequests} />
            <StatCard label="Blocked" value={metricsA.blockedCount} color="amber" />
            <StatCard label="Block Rate" value={`${blockRateA}%`} color={blockRateA > 50 ? "emerald" : "amber"} />
            <StatCard label="Avg Latency" value={`${metricsA.avgLatency}ms`} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wide">Variant B</p>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Requests" value={metricsB.totalRequests} />
            <StatCard label="Blocked" value={metricsB.blockedCount} color="red" />
            <StatCard label="Block Rate" value={`${blockRateB}%`} color={blockRateB > 50 ? "emerald" : "red"} />
            <StatCard label="Avg Latency" value={`${metricsB.avgLatency}ms`} />
          </div>
        </div>
      </div>

      {/* Bar comparisons */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Total Requests</p>
          <BarComparison
            valueA={metricsA.totalRequests}
            valueB={metricsB.totalRequests}
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Block Rate</p>
          <BarComparison valueA={blockRateA} valueB={blockRateB} unit="%" />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Avg Latency</p>
          <BarComparison
            valueA={metricsA.avgLatency}
            valueB={metricsB.avgLatency}
            unit="ms"
          />
        </div>
      </div>
    </div>
  );
}
