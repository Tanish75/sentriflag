import { Link, useLocation } from "react-router-dom";
import { Shield, ExternalLink } from "lucide-react";
import { useFlagsmith } from "../App";

export default function Navbar() {
  const location = useLocation();
  const { emergencyShutdown } = useFlagsmith();

  const navLinks = [
    { to: "/", label: "Overview" },
    { to: "/arena", label: "Security Arena" },
    { to: "/dashboard", label: "Flag Registry" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161d26] text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-8 h-full">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <Shield size={18} className="text-[#ff9900]" />
            <span className="font-semibold text-[15px] tracking-tight text-white">
              SentriFlag
            </span>
            <span className="hidden md:inline-block text-[11px] font-mono text-slate-400 border border-slate-700 rounded px-1.5 py-0.5 ml-1">
              v1.0
            </span>
          </Link>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 h-full">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`h-full flex items-center px-3 text-[13px] font-medium border-b-2 transition-colors ${
                    active
                      ? "border-[#ff9900] text-white"
                      : "border-transparent text-slate-300 hover:text-white hover:border-slate-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 border border-slate-700 rounded px-2.5 py-1">
            <span
              className={`w-2 h-2 rounded-full ${
                emergencyShutdown ? "bg-red-500 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span>{emergencyShutdown ? "Circuit Open" : "Flagsmith Synced"}</span>
          </div>

          <a
            href="https://app.flagsmith.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#0972d3] hover:bg-[#085bb5] text-white text-xs font-semibold transition-colors"
          >
            Flagsmith Console
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </header>
  );
}
