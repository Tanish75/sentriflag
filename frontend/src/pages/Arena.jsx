import { useState } from "react";
import { useFlagsmith } from "../App";
import AgentPanel from "../components/AgentPanel";
import AttackButtons from "../components/AttackButtons";
import MetricsPanel from "../components/MetricsPanel";
import { Flag, RotateCcw } from "lucide-react";

const EMPTY_METRICS = { totalRequests: 0, blockedCount: 0, avgLatency: 0, totalLatency: 0 };

function FlagPill({ name, value }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-300 text-xs shadow-2xs">
      <Flag size={11} className="text-[#0972d3]" />
      <span className="font-mono text-slate-600">{name}</span>
      <span className="text-slate-400">=</span>
      <span className="font-mono font-semibold text-slate-900">{String(value)}</span>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col gap-4 h-[calc(100vh-49px)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Security Arena</h1>
          <p className="text-slate-500 text-xs">
            Side-by-side guardrail evaluation workspace
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FlagPill name="variant_a_guardrail" value={variantAGuardrail} />
          <FlagPill name="variant_b_guardrail" value={variantBGuardrail} />
          {emergencyShutdown && (
            <FlagPill name="agent_emergency_shutdown" value="true" />
          )}
          <button
            onClick={clearSession}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition-colors"
            title="Reset session"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>
      </div>

      {/* Test Payloads */}
      <AttackButtons onAttack={handleAttack} disabled={emergencyShutdown} />

      {/* Agent Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="min-h-[320px] lg:min-h-0">
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
        <div className="min-h-[320px] lg:min-h-0">
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

      {/* Telemetry */}
      <MetricsPanel metricsA={metricsA} metricsB={metricsB} />
    </div>
  );
}
