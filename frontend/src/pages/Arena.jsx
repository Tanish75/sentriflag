import { useState, useCallback, useRef } from "react";
import { useFlagsmith } from "../App";
import AgentPanel from "../components/AgentPanel";
import AttackButtons from "../components/AttackButtons";
import MetricsPanel from "../components/MetricsPanel";
import GuardrailBadge from "../components/GuardrailBadge";
import { Flag, RefreshCw } from "lucide-react";

const EMPTY_METRICS = { totalRequests: 0, blockedCount: 0, avgLatency: 0, totalLatency: 0 };

function FlagPill({ name, value }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
      <Flag size={10} className="text-amber-400" />
      <span className="font-mono text-slate-400">{name}</span>
      <span className="text-slate-500">=</span>
      <span className="font-mono text-white">{String(value)}</span>
    </div>
  );
}

export default function Arena() {
  const flags = useFlagsmith();
  const { emergencyShutdown, variantAGuardrail, variantBGuardrail, activeModel } = flags;

  const [promptA, setPromptA] = useState(null);
  const [promptB, setPromptB] = useState(null);

  const [metricsA, setMetricsA] = useState({ ...EMPTY_METRICS });
  const [metricsB, setMetricsB] = useState({ ...EMPTY_METRICS });

  const [resetKey, setResetKey] = useState(0);

  function handleAttack(prompt) {
    setPromptA(prompt);
    setPromptB(prompt);
  }

  function handleMetricsUpdate(variant, { blocked, latency }) {
    const setter = variant === "A" ? setMetricsA : setMetricsB;
    setter((prev) => {
      const totalRequests = prev.totalRequests + 1;
      const blockedCount = prev.blockedCount + (blocked ? 1 : 0);
      const totalLatency = prev.totalLatency + latency;
      const avgLatency = Math.round(totalLatency / totalRequests);
      return { totalRequests, blockedCount, avgLatency, totalLatency };
    });
  }

  function clearSession() {
    setMetricsA({ ...EMPTY_METRICS });
    setMetricsB({ ...EMPTY_METRICS });
    setResetKey((k) => k + 1);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4 h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Security Arena</h1>
          <p className="text-slate-500 text-xs mt-0.5">Live A/B guardrail experiment — controlled by Flagsmith</p>
        </div>

        {/* Live flag pills */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <FlagPill name="variant_a_guardrail" value={variantAGuardrail} />
          <FlagPill name="variant_b_guardrail" value={variantBGuardrail} />
          {emergencyShutdown && (
            <FlagPill name="agent_emergency_shutdown" value="true" />
          )}
          <button
            onClick={clearSession}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Clear session"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Attack buttons */}
      <AttackButtons onAttack={handleAttack} />

      {/* Agent panels */}
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 min-h-0">
          <AgentPanel
            key={`A-${resetKey}`}
            variantLabel="A"
            guardrailLevel={variantAGuardrail}
            model={activeModel}
            emergencyShutdown={emergencyShutdown}
            externalPrompt={promptA}
            onExternalPromptHandled={() => setPromptA(null)}
            onMetricsUpdate={(data) => handleMetricsUpdate("A", data)}
          />
        </div>
        <div className="flex-1 min-h-0">
          <AgentPanel
            key={`B-${resetKey}`}
            variantLabel="B"
            guardrailLevel={variantBGuardrail}
            model={activeModel}
            emergencyShutdown={emergencyShutdown}
            externalPrompt={promptB}
            onExternalPromptHandled={() => setPromptB(null)}
            onMetricsUpdate={(data) => handleMetricsUpdate("B", data)}
          />
        </div>
      </div>

      {/* Metrics */}
      <MetricsPanel metricsA={metricsA} metricsB={metricsB} />
    </div>
  );
}
