import { useState } from "react";
import { ATTACK_PRESETS } from "../lib/guardrails";
import { Zap, Terminal } from "lucide-react";

const ICON_MAP = {
  "🔍": "🔍",
  "🤖": "🤖",
  "💉": "💉",
  "👤": "👤",
  "🗄️": "🗄️",
};

const PRESET_COLORS = [
  "hover:bg-purple-500/15 hover:border-purple-500/40 hover:text-purple-300 border-slate-700/50 text-slate-400",
  "hover:bg-orange-500/15 hover:border-orange-500/40 hover:text-orange-300 border-slate-700/50 text-slate-400",
  "hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-300 border-slate-700/50 text-slate-400",
  "hover:bg-blue-500/15 hover:border-blue-500/40 hover:text-blue-300 border-slate-700/50 text-slate-400",
  "hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-300 border-slate-700/50 text-slate-400",
];

export default function AttackButtons({ onAttack }) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [lastUsed, setLastUsed] = useState(null);

  function handlePreset(preset, index) {
    setLastUsed(index);
    onAttack(preset.prompt);
    setTimeout(() => setLastUsed(null), 1500);
  }

  function handleCustom() {
    if (!customPrompt.trim()) return;
    onAttack(customPrompt.trim());
    setCustomPrompt("");
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Adversarial Test Vectors</h3>
        <span className="ml-auto text-xs text-slate-500">
          Dispatches concurrently across active evaluation panels
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ATTACK_PRESETS.map((preset, i) => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset, i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${PRESET_COLORS[i % PRESET_COLORS.length]} ${
              lastUsed === i ? "scale-95 opacity-70" : ""
            }`}
          >
            <span>{preset.icon || "⚡"}</span>
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom prompt */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Terminal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustom()}
            placeholder="Enter custom payload string or adversarial injection..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
          />
        </div>
        <button
          onClick={handleCustom}
          disabled={!customPrompt.trim()}
          className="px-4 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Dispatch
        </button>
      </div>
    </div>
  );
}
