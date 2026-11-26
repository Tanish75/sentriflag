import { useState, useRef, useEffect } from "react";
import { Send, Shield, AlertOctagon, Clock, Cpu } from "lucide-react";
import { evaluateGuardrail } from "../lib/guardrails";
import { generateResponse } from "../lib/mockAI";
import GuardrailBadge from "./GuardrailBadge";

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isBlocked = msg.blocked;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-md px-3.5 py-2.5 text-[13px] ${
          isUser
            ? "bg-[#161d26] text-white"
            : isBlocked
            ? "bg-red-50 border border-red-200 text-red-950"
            : "bg-slate-100 border border-slate-200 text-slate-800"
        }`}
      >
        {isBlocked && msg.threats?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {msg.threats.map((t) => (
              <span
                key={t}
                className="inline-block px-1.5 py-0.5 rounded text-[11px] bg-red-100 border border-red-300 text-red-800 font-mono"
              >
                {t.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

        <div
          className={`flex items-center gap-2.5 mt-1.5 text-[11px] ${
            isUser ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {msg.latency && (
            <span className="flex items-center gap-1 font-mono">
              <Clock size={10} />
              {msg.latency}ms
            </span>
          )}
          <span>{msg.timestamp}</span>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 border border-slate-200 rounded-md px-3.5 py-2.5 flex items-center gap-1.5">
        <span className="text-xs text-slate-500 font-mono">Evaluating</span>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function AgentPanel({
  variantLabel,
  guardrailLevel,
  model,
  emergencyShutdown,
  externalPrompt,
  onExternalPromptHandled,
  onMetricsUpdate,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(promptText) {
    const text = promptText || input.trim();
    if (!text || isTyping || emergencyShutdown) return;

    setInput("");
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const userMsg = { role: "user", content: text, timestamp };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const guardrailResult = evaluateGuardrail(text, guardrailLevel);
    const aiResult = await generateResponse(text, guardrailResult, guardrailLevel, model);

    const aiMsg = {
      role: "assistant",
      content: aiResult.response,
      blocked: aiResult.blocked,
      threats: aiResult.threats,
      latency: aiResult.latency,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);

    if (onMetricsUpdate) {
      onMetricsUpdate({ blocked: aiResult.blocked, latency: aiResult.latency });
    }
  }

  useEffect(() => {
    if (externalPrompt) {
      sendMessage(externalPrompt);
      onExternalPromptHandled?.();
    }
  }, [externalPrompt]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden relative">
      {emergencyShutdown && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px]">
          <AlertOctagon size={32} className="text-[#d13212] mb-2" />
          <p className="text-slate-900 font-semibold text-sm">Circuit Breaker Engaged</p>
          <p className="text-slate-500 text-xs mt-1">
            Execution halted via Flagsmith kill switch
          </p>
        </div>
      )}

      {/* Panel Header */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#161d26] text-white flex items-center justify-center font-mono font-semibold text-xs">
            {variantLabel}
          </div>
          <div>
            <p className="text-slate-900 text-sm font-semibold leading-tight">
              Agent Variant {variantLabel}
            </p>
            <p className="text-slate-500 text-[11px] flex items-center gap-1 font-mono">
              <Cpu size={10} />
              {model}
            </p>
          </div>
        </div>
        <GuardrailBadge level={guardrailLevel} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-white">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-1.5 text-center px-6">
            <Shield size={24} className="text-slate-300 mb-1" />
            <p className="text-slate-600 text-sm font-medium">Ready for evaluation</p>
            <p className="text-slate-400 text-xs">
              Policy: <span className="font-mono text-slate-600">{guardrailLevel}</span>
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={emergencyShutdown || isTyping}
            placeholder={
              emergencyShutdown
                ? "Agent offline..."
                : isTyping
                ? "Evaluating..."
                : `Send prompt to Variant ${variantLabel}...`
            }
            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0972d3] focus:ring-1 focus:ring-[#0972d3] disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || emergencyShutdown || isTyping}
            className="px-3 py-1.5 rounded bg-[#161d26] hover:bg-slate-800 text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
