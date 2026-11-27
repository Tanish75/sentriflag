import { useEffect, useState } from "react";
import { useFlagsmith } from "../App";
import { getVal, hasFlag, refreshFlags, FLAGSMITH_CONSOLE_URL, isSelfHosted } from "../lib/flagsmithClient";
import { ExternalLink, RefreshCw, Flag } from "lucide-react";

const FLAG_DEFINITIONS = [
  {
    key: "agent_emergency_shutdown",
    type: "Boolean",
    description: "Circuit breaker — immediately halts all agent execution pipelines when enabled.",
    impact: "Critical",
  },
  {
    key: "variant_a_guardrail",
    type: "Remote Config",
    description: 'Security policy assigned to Agent Variant A ("permissive", "moderate", "zero_trust").',
    impact: "High",
  },
  {
    key: "variant_b_guardrail",
    type: "Remote Config",
    description: 'Security policy assigned to Agent Variant B ("permissive", "moderate", "zero_trust").',
    impact: "High",
  },
  {
    key: "active_model",
    type: "Remote Config",
    description: 'Target LLM identifier used for latency simulation and telemetry (e.g., "gpt-4o-mini").',
    impact: "Medium",
  },
  {
    key: "jailbreak_sensitivity",
    type: "Remote Config",
    description: "Numeric threshold (0.0–1.0) governing heuristic threat sensitivity.",
    impact: "Medium",
  },
];

const IMPACT_STYLES = {
  Critical: "bg-red-50 text-red-800 border-red-200",
  High: "bg-amber-50 text-amber-800 border-amber-200",
  Medium: "bg-slate-100 text-slate-700 border-slate-300",
};

export default function FlagDashboard() {
  const contextFlags = useFlagsmith();
  const [liveValues, setLiveValues] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  function readAllFlags() {
    return {
      agent_emergency_shutdown: hasFlag("agent_emergency_shutdown"),
      variant_a_guardrail: getVal("variant_a_guardrail", "permissive"),
      variant_b_guardrail: getVal("variant_b_guardrail", "zero_trust"),
      active_model: getVal("active_model", "gpt-4o-mini"),
      jailbreak_sensitivity: getVal("jailbreak_sensitivity", "0.7"),
    };
  }

  useEffect(() => {
    setLiveValues(readAllFlags());
    const interval = setInterval(() => {
      setLiveValues(readAllFlags());
      setLastRefresh(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function manualRefresh() {
    setRefreshing(true);
    await refreshFlags();
    setLiveValues(readAllFlags());
    setLastRefresh(new Date());
    setRefreshing(false);
  }

  const displayValues = liveValues || {
    agent_emergency_shutdown: contextFlags.emergencyShutdown,
    variant_a_guardrail: contextFlags.variantAGuardrail,
    variant_b_guardrail: contextFlags.variantBGuardrail,
    active_model: contextFlags.activeModel,
    jailbreak_sensitivity: contextFlags.jailbreakSensitivity,
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            SentriFlag / Flag Registry
          </p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Flagsmith Configuration Registry
          </h1>
          <p className="text-slate-600 text-xs mt-1">
            Live feature flags and remote config values synchronized every 3 seconds (
            <span className="font-mono font-semibold text-slate-700">
              {isSelfHosted ? `Self-Hosted: ${FLAGSMITH_CONSOLE_URL}` : "Flagsmith Cloud"}
            </span>
            ).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-mono text-slate-500 mr-1">
            Synced {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={manualRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <a
            href={FLAGSMITH_CONSOLE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0972d3] hover:bg-[#085bb5] text-white text-xs font-semibold transition-colors"
          >
            Edit in Flagsmith
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
                <th className="py-3 px-5 font-semibold">Feature Key</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Current Value</th>
                <th className="py-3 px-4 font-semibold">Impact</th>
                <th className="py-3 px-5 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {FLAG_DEFINITIONS.map((def) => {
                const val = displayValues[def.key];
                const isBool = def.type === "Boolean";
                return (
                  <tr key={def.key} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Flag size={12} className="text-[#0972d3]" />
                        {def.key}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      {def.type}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isBool ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                            val
                              ? "bg-red-50 text-red-800 border-red-200"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              val ? "bg-red-600" : "bg-slate-400"
                            }`}
                          />
                          {val ? "TRUE (Active)" : "FALSE"}
                        </span>
                      ) : (
                        <span className="font-mono text-xs bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded">
                          {val !== null && val !== undefined ? String(val) : "—"}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${IMPACT_STYLES[def.impact]}`}
                      >
                        {def.impact}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 max-w-md">
                      {def.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
