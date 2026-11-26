import { useState } from "react";
import { ATTACK_PRESETS } from "../lib/guardrails";
import { Terminal, Play } from "lucide-react";

export default function AttackButtons({ onAttack, disabled }) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [activePreset, setActivePreset] = useState(null);

  function handlePreset(preset, index) {
    if (disabled) return;
    setActivePreset(index);
    onAttack(preset.prompt);
    setTimeout(() => setActivePreset(null), 600);
  }

  function handleCustom() {
    if (!customPrompt.trim() || disabled) return;
    onAttack(customPrompt.trim());
    setCustomPrompt("");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Test Payloads
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">
            Select a preset or send a custom prompt to both variants simultaneously
          </span>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {ATTACK_PRESETS.map((preset, i) => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset, i)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              activePreset === i
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Custom prompt */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Terminal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustom()}
            disabled={disabled}
            placeholder={
              disabled
                ? "Execution halted — circuit breaker active"
                : "Enter custom prompt or adversarial payload..."
            }
            className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0972d3] focus:ring-1 focus:ring-[#0972d3] disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleCustom}
          disabled={!customPrompt.trim() || disabled}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#0972d3] hover:bg-[#085bb5] text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play size={13} />
          Run
        </button>
      </div>
    </div>
  );
}
