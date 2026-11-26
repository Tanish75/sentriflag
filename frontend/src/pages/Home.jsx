import { Link } from "react-router-dom";
import { useFlagsmith } from "../App";
import { ArrowRight, ExternalLink, ShieldAlert, CheckCircle2 } from "lucide-react";
import GuardrailBadge from "../components/GuardrailBadge";

const POLICY_MATRIX = [
  {
    tier: "permissive",
    threshold: "3+ simultaneous vectors",
    heuristics: "Warning telemetry only",
    useCase: "Low-risk internal tools & debugging",
  },
  {
    tier: "moderate",
    threshold: "Any 1 detected vector",
    heuristics: "Standard pattern matching",
    useCase: "General customer-facing assistants",
  },
  {
    tier: "zero_trust",
    threshold: "Any vector + structural anomalies",
    heuristics: "Strict length (>600 chars) & special char filter",
    useCase: "High-security financial & PII environments",
  },
];

const VECTOR_COVERAGE = [
  { name: "System Prompt Extraction", desc: "Detects attempts to leak hidden system instructions or developer rules." },
  { name: "DAN & Roleplay Jailbreaks", desc: "Identifies persona-override framing and restriction-bypass prompts." },
  { name: "Prompt Injection", desc: "Catches delimiter spoofing (###IGNORE###, <|im_start|>system, override)." },
  { name: "PII & Credential Exfiltration", desc: "Flags requests targeting passwords, user records, or private tokens." },
  { name: "SQL Injection Payloads", desc: "Blocks embedded database syntax (UNION SELECT, DROP TABLE, OR 1=1)." },
];

export default function Home() {
  const { emergencyShutdown, variantAGuardrail, variantBGuardrail, activeModel } = useFlagsmith();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Panel */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
              SentriFlag / Overview
            </p>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Agent Guardrail Control Plane
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Benchmark competing guardrail policies against adversarial payloads and manage instant
              circuit breakers through Flagsmith feature flags—without modifying code or redeploying.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/arena"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0972d3] hover:bg-[#085bb5] text-white text-sm font-semibold transition-colors"
            >
              Open Security Arena
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-medium transition-colors"
            >
              Flag Registry
            </Link>
          </div>
        </div>
      </section>

      {/* Active Environment Summary (AWS Resource Summary Style) */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Active Environment State</h2>
          <a
            href="https://app.flagsmith.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0972d3] hover:underline flex items-center gap-1 font-medium"
          >
            Manage in Flagsmith
            <ExternalLink size={11} />
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-1">Variant A Policy</p>
            <GuardrailBadge level={variantAGuardrail} />
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-1">Variant B Policy</p>
            <GuardrailBadge level={variantBGuardrail} />
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-1">Target Model</p>
            <p className="text-sm font-mono font-semibold text-slate-900">{activeModel}</p>
          </div>
          <div className="p-4">
            <p className="text-xs text-slate-500 mb-1">Circuit Breaker</p>
            {emergencyShutdown ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d13212]">
                <ShieldAlert size={14} />
                ENGAGED (Offline)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                Nominal (Online)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Guardrail Policy Matrix Table */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">Guardrail Policy Matrix</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-5 font-semibold">Policy Tier</th>
                <th className="py-2.5 px-5 font-semibold">Blocking Threshold</th>
                <th className="py-2.5 px-5 font-semibold">Heuristic Inspection</th>
                <th className="py-2.5 px-5 font-semibold">Recommended Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {POLICY_MATRIX.map((row) => (
                <tr key={row.tier} className="hover:bg-slate-50/70">
                  <td className="py-3 px-5">
                    <GuardrailBadge level={row.tier} />
                  </td>
                  <td className="py-3 px-5 font-mono text-xs text-slate-700">{row.threshold}</td>
                  <td className="py-3 px-5 text-slate-600 text-xs">{row.heuristics}</td>
                  <td className="py-3 px-5 text-slate-600 text-xs">{row.useCase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Threat Vector Coverage */}
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-semibold text-slate-800">Supported Attack Vectors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
          {VECTOR_COVERAGE.map((v) => (
            <div key={v.name} className="border border-slate-200 rounded p-3.5 bg-slate-50/50">
              <h3 className="text-xs font-semibold text-slate-900 mb-1">{v.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
