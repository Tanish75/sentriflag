import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, GitBranch, Flag, ChevronRight, Terminal, AlertTriangle, Lock } from "lucide-react";

const STAT_CARDS = [
  { icon: "⚡", label: "Attack Vectors", value: "5", desc: "Jailbreaks, Injections, & PII leaks" },
  { icon: "🛡️", label: "Guardrail Levels", value: "3", desc: "Permissive, Moderate, Zero-Trust" },
  { icon: "🔴", label: "Circuit Breakers", value: "1", desc: "Instant Flagsmith-driven kill switch" },
];

const HOW_IT_WORKS = [
  {
    icon: <Flag size={20} className="text-amber-400" />,
    title: "Decoupled Policy Engine",
    desc: "Guardrail postures, model endpoints, and sensitivity levels are evaluated at runtime via Flagsmith. Update security policies instantly without pipeline redeployments.",
  },
  {
    icon: <GitBranch size={20} className="text-purple-400" />,
    title: "Adversarial A/B Benchmarking",
    desc: "Evaluate opposing defense strategies concurrently against identical payloads. Compare block rates, false positive trade-offs, and inference latencies side-by-side.",
  },
  {
    icon: <Terminal size={20} className="text-emerald-400" />,
    title: "Multi-Vector Threat Detection",
    desc: "Deterministic classifiers isolate DAN jailbreaks, hidden prompt extraction, credential leaks, and SQL injection patterns before payloads reach model execution.",
  },
];

function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-16">
      {/* Hero */}
      <FadeIn>
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Runtime Security Control Plane
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            AI Agent Guardrail
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">
              Policy Orchestration
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Stress-test defensive postures against real-time jailbreaks and prompt injections.
            Dynamically adjust security policies and trigger emergency circuit breakers via{" "}
            <span className="text-white font-medium">Flagsmith</span> feature flags.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              to="/arena"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-900/30 hover:shadow-red-800/40"
            >
              Open Arena
              <ChevronRight size={16} />
            </Link>
            <a
              href="https://app.flagsmith.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium transition-all"
            >
              <Zap size={14} className="text-amber-400" />
              Flagsmith Dashboard
            </a>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-3 gap-4 mb-14">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center hover:border-slate-700 transition-colors"
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-sm font-medium text-slate-300 mb-1">{s.label}</div>
              <div className="text-xs text-slate-500">{s.desc}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* How it works */}
      <FadeIn delay={0.2}>
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-6 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                  {step.icon}
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Architectural Overview */}
      <FadeIn delay={0.3}>
        <div className="bg-gradient-to-br from-slate-900 to-red-950/20 border border-red-900/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Lock size={18} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-white font-semibold mb-1">Architecture: Deep Flagsmith Integration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Flagsmith operates as the central control plane for SentriFlag. Runtime security tiers,
                heuristic sensitivity thresholds, and emergency circuit breakers are evaluated continuously
                through the client SDK. Decoupling policy enforcement from code deployment enables security teams
                to respond to zero-day threat patterns in milliseconds.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </main>
  );
}
