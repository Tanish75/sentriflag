import { useState, useEffect, createContext, useContext } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { initFlagsmith, getVal, hasFlag } from "./lib/flagsmithClient";
import Navbar from "./components/Navbar";
import KillSwitchBanner from "./components/KillSwitchBanner";
import Home from "./pages/Home";
import Arena from "./pages/Arena";
import FlagDashboard from "./pages/FlagDashboard";

export const FlagContext = createContext({});

export function useFlagsmith() {
  return useContext(FlagContext);
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-500 text-xl">🛡</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">SentriFlag</p>
        <p className="text-slate-400 text-sm mt-1">Connecting to Flagsmith...</p>
      </div>
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [flags, setFlags] = useState({
    emergencyShutdown: false,
    variantAGuardrail: "permissive",
    variantBGuardrail: "zero_trust",
    activeModel: "gpt-4o-mini",
    jailbreakSensitivity: 0.7,
  });

  function readFlags() {
    setFlags({
      emergencyShutdown: hasFlag("agent_emergency_shutdown"),
      variantAGuardrail: getVal("variant_a_guardrail", "permissive"),
      variantBGuardrail: getVal("variant_b_guardrail", "zero_trust"),
      activeModel: getVal("active_model", "gpt-4o-mini"),
      jailbreakSensitivity: parseFloat(getVal("jailbreak_sensitivity", "0.7")),
    });
  }

  useEffect(() => {
    initFlagsmith(() => {
      readFlags();
    })
      .then(() => {
        readFlags();
        setReady(true);
      })
      .catch((err) => {
        console.error("Flagsmith init failed:", err);
        setReady(true); // fallback to defaults
      });
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <FlagContext.Provider value={flags}>
      <Router>
        <div className="min-h-screen bg-slate-950 text-white font-sans">
          {flags.emergencyShutdown && <KillSwitchBanner />}
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/arena" element={<Arena />} />
            <Route path="/dashboard" element={<FlagDashboard />} />
          </Routes>
        </div>
      </Router>
    </FlagContext.Provider>
  );
}
