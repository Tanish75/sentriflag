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
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-[#0972d3] rounded-full animate-spin" />
      <p className="text-slate-700 font-medium text-sm">Initializing Flagsmith control plane...</p>
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
    const timer = setTimeout(() => {
      readFlags();
      setReady(true);
    }, 2000);

    initFlagsmith(() => {
      readFlags();
    })
      .then(() => {
        clearTimeout(timer);
        readFlags();
        setReady(true);
      })
      .catch((err) => {
        console.error("Flagsmith init failed:", err);
        clearTimeout(timer);
        setReady(true);
      });

    return () => clearTimeout(timer);
  }, []);

  if (!ready) return <LoadingScreen />;

  return (
    <FlagContext.Provider value={flags}>
      <Router>
        <div className="min-h-screen bg-[#f4f6f8] text-slate-900 font-sans flex flex-col">
          {flags.emergencyShutdown && <KillSwitchBanner />}
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/arena" element={<Arena />} />
              <Route path="/dashboard" element={<FlagDashboard />} />
            </Routes>
          </div>
        </div>
      </Router>
    </FlagContext.Provider>
  );
}
