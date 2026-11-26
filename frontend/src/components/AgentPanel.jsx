import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shield, AlertOctagon, Clock, Cpu, ChevronDown } from "lucide-react";
import { evaluateGuardrail } from "../lib/guardrails";
import { generateResponse } from "../lib/mockAI";
import GuardrailBadge from "./GuardrailBadge";

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isBlocked = msg.blocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2.5 text-sm ${
          isUser
            ? "bg-slate-700 text-white"
            : isBlocked
            ? "bg-red-950/60 border border-red-700/50 text-red-200"
            : "bg-slate-800 text-slate-100"
        }`}
      >
        {/* Threat tags */}
        {isBlocked && msg.threats?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {msg.threats.map((t) => (
              <span
                key={t}
                className="inline-block px-1.5 py-0.5 rounded text-xs bg-red-900/60 border border-red-700/50 text-red-300 font-mono"
              >
                {t.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}

        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

        {/* Metadata footer */}
        <div className="flex items-center gap-2 mt-1.5 text-xs opacity-60">
          {msg.latency && (
            <span className="flex items-center gap-0.5">
              <Clock size={9} />
              {msg.latency}ms
            </span>
          )}
          <span>{msg.timestamp}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-slate-800 rounded-lg px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
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
  const inputRef = useRef(null);

  const isA = variantLabel === "A";
  const accentColor = isA ? "amber" : "red";

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

    // Report metrics up
    if (onMetricsUpdate) {
      onMetricsUpdate({ blocked: aiResult.blocked, latency: aiResult.latency });
    }
  }

  // Handle external prompt (from AttackButtons)
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
    <div
      className={`flex flex-col h-full rounded-xl border ${
        emergencyShutdown
          ? "border-slate-700 opacity-60 grayscale"
          : isA
          ? "border-amber-500/25 bg-slate-900/50"
          : "border-red-500/25 bg-slate-900/50"
      } overflow-hidden relative`}
    >
      {/* Emergency overlay */}
      {emergencyShutdown && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-xl">
          <AlertOctagon size={40} className="text-slate-500 mb-3" />
          <p className="text-slate-400 font-semibold">OFFLINE</p>
          <p className="text-slate-600 text-xs mt-1">Emergency shutdown active</p>
        </div>
      )}

      {/* Panel header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${
          isA ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${
              isA ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {variantLabel}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Variant {variantLabel}</p>
            <p className="text-slate-500 text-xs flex items-center gap-1">
              <Cpu size={9} />
              {model}
            </p>
          </div>
        </div>
        <GuardrailBadge level={guardrailLevel} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-6">
            <Shield size={28} className="text-slate-700" />
            <p className="text-slate-500 text-sm">Send a prompt or use an attack preset below</p>
            <p className="text-slate-600 text-xs">
              Guardrail:{" "}
              <span className="font-mono text-slate-500">{guardrailLevel}</span>
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
      <div className="p-3 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={emergencyShutdown || isTyping}
            placeholder={
              emergencyShutdown
                ? "Agent offline..."
                : isTyping
                ? "Processing..."
                : "Enter prompt..."
            }
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || emergencyShutdown || isTyping}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              isA
                ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-400"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
