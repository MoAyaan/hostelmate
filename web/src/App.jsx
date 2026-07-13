import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import Add from "./pages/Add.jsx";
import Guide from "./pages/Guide.jsx";
import Checklist from "./pages/Checklist.jsx";
import Stay from "./pages/Stay.jsx";
import { getRoom } from "./api.js";
import { getAllEntries } from "./myEntries.js";
import { wasNotified, markNotified } from "./roomAlerts.js";
import { FEATURES_VERSION, FEATURES, wasFeaturesVersionSeen, markFeaturesVersionSeen } from "./newFeatures.js";

function NewFeaturesBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!wasFeaturesVersionSeen(FEATURES_VERSION));
  }, []);

  if (!show) return null;

  function dismiss() {
    markFeaturesVersionSeen(FEATURES_VERSION);
    setShow(false);
  }

  return (
    <div
      className="relative animate-riseIn"
      style={{
        background: "linear-gradient(90deg, color-mix(in srgb, var(--violet) 30%, var(--surface)), color-mix(in srgb, var(--pink) 30%, var(--surface)))",
        borderBottom: "3px solid var(--pink)",
        animation: "neonBorder 2.4s ease-in-out infinite, neonPulse 2.4s ease-in-out infinite",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-4 flex-wrap">
        <span
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white"
          style={{ background: "linear-gradient(90deg, var(--violet), var(--pink))" }}
        >
          New
        </span>
        <p className="text-sm font-bold flex-1 min-w-[220px]" style={{ color: "var(--ink)" }}>
          {FEATURES.join("  •  ")}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold"
          style={{ background: "color-mix(in srgb, var(--ink) 15%, transparent)", color: "var(--ink)" }}
        >
          Dismiss ✕
        </button>
      </div>
    </div>
  );
}

function RoomFullBanner() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const entries = getAllEntries();
    if (entries.length === 0) return;

    const uniqueRooms = [...new Map(entries.map((e) => [`${e.block}-${e.room}`, e])).values()];
    let cancelled = false;

    (async () => {
      for (const e of uniqueRooms) {
        const key = `${e.block}-${e.room}`;
        if (wasNotified(key)) continue;
        try {
          const data = await getRoom(e.block, e.room);
          if (data.status === "full") {
            if (!cancelled) setAlert({ block: e.block, room: e.room, key });
            break;
          }
        } catch {
          // ignore lookup failures — just skip this room for now
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!alert) return null;

  return (
    <div
      className="animate-riseIn"
      style={{ background: "var(--mint)", boxShadow: "var(--mint-glow)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold" style={{ color: "var(--mint-ink)" }}>
          🎉 Room {alert.room} in {alert.block} is now full — everyone's found their roomie!
        </p>
        <button
          type="button"
          onClick={() => {
            markNotified(alert.key);
            setAlert(null);
          }}
          className="rounded-full px-3 py-1 text-xs font-extrabold shrink-0"
          style={{ background: "color-mix(in srgb, var(--mint-ink) 15%, transparent)", color: "var(--mint-ink)" }}
        >
          Dismiss ✕
        </button>
      </div>
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `text-sm font-bold transition-colors ${isActive ? "text-[var(--violet)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"}`;

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur transition-shadow"
      style={{
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        boxShadow: scrolled ? "0 8px 24px -18px rgba(0,0,0,0.35)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between transition-all" style={{ paddingBlock: scrolled ? 10 : 16 }}>
        <NavLink to="/" className="flex items-center gap-2 font-display text-xl">
          <span
            className="w-9 h-9 rounded-xl grid place-items-center text-white text-lg font-display shadow-[0_4px_0_var(--violet-ink)]"
            style={{ background: "var(--violet)", transform: "rotate(-6deg)" }}
          >
            H
          </span>
          HostelMate
        </NavLink>
        <div className="hidden lg:flex items-center gap-5">
          <NavLink to="/browse" className={linkClass}>Browse rooms</NavLink>
          <NavLink to="/add" className={linkClass}>Add yourself</NavLink>
          <NavLink to="/guide" className={linkClass}>Guide</NavLink>
          <NavLink to="/checklist" className={linkClass}>Checklist</NavLink>
          <NavLink to="/stay" className={linkClass}>Parent Stay</NavLink>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/add"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_var(--pink-ink)] hover:-translate-y-0.5 transition-transform"
            style={{ background: "var(--pink)" }}
          >
            + Add me
          </NavLink>
          <button
            type="button"
            className="lg:hidden w-10 h-10 rounded-full grid place-items-center border-2"
            style={{ borderColor: "var(--line-strong)" }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="lg:hidden flex flex-col gap-4 px-6 pb-5 animate-riseIn" style={{ borderTop: "1px solid var(--line)" }}>
          <NavLink to="/browse" className={linkClass} onClick={() => setMenuOpen(false)}>Browse rooms</NavLink>
          <NavLink to="/add" className={linkClass} onClick={() => setMenuOpen(false)}>Add yourself</NavLink>
          <NavLink to="/guide" className={linkClass} onClick={() => setMenuOpen(false)}>Guide</NavLink>
          <NavLink to="/checklist" className={linkClass} onClick={() => setMenuOpen(false)}>Checklist</NavLink>
          <NavLink to="/stay" className={linkClass} onClick={() => setMenuOpen(false)}>Parent Stay</NavLink>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-16 py-10 border-t" style={{ borderColor: "var(--line)" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3 text-sm" style={{ color: "var(--ink-soft)" }}>
        <span className="font-display">HostelMate — MIT Bangalore</span>
        <span>Built by hostellers, for hostellers. Not an official MIT Bangalore service.</span>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <span className="text-5xl inline-block animate-popIn">🧭</span>
      <h1 className="font-display text-3xl mt-4 animate-riseIn">Wrong door.</h1>
      <p className="mt-3 animate-riseIn" style={{ color: "var(--ink-soft)", animationDelay: ".1s" }}>
        That page doesn't exist — but your room might. Try Browse or Home instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 animate-riseIn" style={{ animationDelay: ".2s" }}>
        <Link to="/" className="rounded-full px-6 py-3 font-bold text-white" style={{ background: "var(--violet)" }}>
          Go home →
        </Link>
        <Link to="/browse" className="rounded-full px-6 py-3 font-bold border-2" style={{ borderColor: "var(--line-strong)", color: "var(--ink)" }}>
          Browse rooms
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NewFeaturesBanner />
      <RoomFullBanner />
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/add" element={<Add />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/stay" element={<Stay />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
