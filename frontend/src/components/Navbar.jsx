import { Link, useLocation } from "react-router-dom";
import { Shield, ExternalLink, Zap } from "lucide-react";
import { useFlagsmith } from "../App";

export default function Navbar() {
  const location = useLocation();
  const { emergencyShutdown } = useFlagsmith();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Flag Dashboard" },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield
              size={22}
              className="text-red-500 group-hover:text-red-400 transition-colors"
              fill="currentColor"
              fillOpacity={0.15}
            />
            {emergencyShutdown && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <span className="font-bold text-white tracking-tight">
            Sentri<span className="text-red-500">Flag</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Flagsmith badge */}
          <a
            href="https://app.flagsmith.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-all group"
          >
            <Zap size={11} className="text-amber-400" />
            Powered by Flagsmith
            <ExternalLink size={10} className="opacity-50 group-hover:opacity-100" />
          </a>

          {/* Arena CTA */}
          <Link
            to="/arena"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
          >
            Open Arena
          </Link>
        </div>
      </div>
    </nav>
  );
}
