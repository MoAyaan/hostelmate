import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import Add from "./pages/Add.jsx";

function Nav() {
  const [scrolled, setScrolled] = useState(false);
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
        <div className="hidden sm:flex items-center gap-7">
          <NavLink to="/browse" className={linkClass}>Browse rooms</NavLink>
          <NavLink to="/add" className={linkClass}>Add yourself</NavLink>
        </div>
        <NavLink
          to="/add"
          className="rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-[0_3px_0_var(--pink-ink)] hover:-translate-y-0.5 transition-transform"
          style={{ background: "var(--pink)" }}
        >
          + Add me
        </NavLink>
      </div>
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

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/add" element={<Add />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
