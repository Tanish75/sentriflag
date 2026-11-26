import { useEffect, useState } from "react";
import { useFlagsmith } from "../App";
import { getVal, hasFlag } from "../lib/flagsmithClient";
import { Flag, ExternalLink, RefreshCw, ToggleLeft, ToggleRight, Hash } from "lucide-react";

const FLAG_DEFINITIONS = [
  {
    key: "agent_emergency_shutdown",
    type: "boolean",
    description: "Kill switch — immediately takes all AI agents offline when enabled.",
    impact: "Critical",
  },
  {
    key: "variant_a_guardrail",
    type: "remote_config",
    description: 'Sets the security policy for Variant A agent. Values: "permissive", "moderate", "zero_trust"',
    impact: "High",
  },
  {
    key: "variant_b_guardrail",
    type: "remote_config",
    description: 'Sets the security policy for Variant B agent. Values: "permissive", "moderate", "zero_trust"',
    impact: "High",
  },
  {
    key: "active_model",
    type: "remote_config",
    description: 'AI model name shown in both agent panels. E.g. "gpt-4o-mini", "claude-3-haiku"',
    impact: "Medium",
  },
  {
    key: "jailbreak_sensitivity",
    type: "remote_config",
    description: "Threshold (0.0–1.0) used in jailbreak detection scoring. Higher = stricter.",
    impact: "Medium",
  },
];

const IMPACT_COLORS = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/30",
  High: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  Medium: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

function FlagCard({ def, value, lastUpdated }) {
  const isBoolean = def.type === "boolean";
  const isActive = isBoolean ? value === true : Boolean(value);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Flag size={13} className="text-amber-400" />
            <span className="font-mono text-sm text-white">{def.key}</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{def.description}</p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${IMPACT_COLORS[def.impact]}`}
          >
            {def.impact}
          </span>
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            {isBoolean ? "Boolean" : "Remote Config"}
          </span>
        </div>
      </div>

      {/* Value display */}
      <div
        className={`flex items-center gap-3 mt-3 pt-3 border-t ${
          isBoolean && value
            ? "border-red-800/40"
            : "border-slate-800"
        }`}
      >
        {isBoolean ? (
          <>
            <div
              className={`w-10 h-5 rounded-full flex items-center transition-colors ${
                value ? "bg-red-600" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${
                  value ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
            <span
              className={`text-sm font-semibold ${value ? "text-red-400" : "text-slate-400"}`}
            >
              {value ? "ENABLED" : "disabled"}
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Hash size={12} className="text-slate-500" />
            <span className="font-mono text-sm text-white bg-slate-800 px-2.5 py-1 rounded-md">
              {value !== null && value !== undefined ? String(value) : "—"}
            </span>
          </div>
        )}

        <span className="ml-auto text-xs text-slate-600">
          {lastUpdated}
        </span>
      </div>
    </div>
  );
}

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
    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      setLiveValues(readAllFlags());
      setLastRefresh(new Date());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function manualRefresh() {
    setRefreshing(true);
    setLiveValues(readAllFlags());
    setLastRefresh(new Date());
    setTimeout(() => setRefreshing(false), 500);
  }

  const displayValues = liveValues || {
    agent_emergency_shutdown: contextFlags.emergencyShutdown,
    variant_a_guardrail: contextFlags.variantAGuardrail,
    variant_b_guardrail: contextFlags.variantBGuardrail,
    active_model: contextFlags.activeModel,
    jailbreak_sensitivity: contextFlags.jailbreakSensitivity,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Control Plane Observability</h1>
          <p className="text-slate-400 text-sm">
            Real-time state synchronization with Flagsmith feature registry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={manualRefresh}
            className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all ${
              refreshing ? "animate-spin" : ""
            }`}
          >
            <RefreshCw size={14} />
          </button>
          <a
            href="https://app.flagsmith.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/15 transition-colors"
          >
            <ExternalLink size={12} />
            Open Flagsmith
          </a>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs text-slate-400">
          Active Flagsmith client subscription: Remote updates synchronize with zero client reload
        </span>
      </div>

      {/* Flag cards */}
      <div className="grid gap-4">
        {FLAG_DEFINITIONS.map((def) => (
          <FlagCard
            key={def.key}
            def={def}
            value={displayValues[def.key]}
            lastUpdated={lastRefresh.toLocaleTimeString()}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-8 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
        <p className="text-slate-400 text-xs leading-relaxed text-center">
          Configuration adjustments made within the{" "}
          <a
            href="https://app.flagsmith.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            Flagsmith Console
          </a>{" "}
          propagate to live evaluation pipelines instantly, adjusting security postures in the{" "}
          <a href="#/arena" className="text-red-400 hover:underline">
            Security Arena
          </a>{" "}
          without application recompilation or redeployment.
        </p>
      </div>
    </div>
  );
}
