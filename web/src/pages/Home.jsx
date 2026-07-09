import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlocks, getRoom } from "../api.js";
import { BLOCKS, GENDER_META } from "../blocks.js";

function Blob({ className, color, style }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-40 pointer-events-none ${className}`}
      style={{ background: color, animation: "blobFloat 9s ease-in-out infinite", ...style }}
    />
  );
}

function StatCard({ value, label, delay }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now() + delay;
    function step(ts) {
      const p = Math.max(0, Math.min((ts - start) / 900, 1));
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, delay]);
  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}>
      <div className="font-display text-3xl" style={{ color: "var(--violet)" }}>{n}</div>
      <div className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>{label}</div>
    </div>
  );
}

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [quickBlock, setQuickBlock] = useState("HB4");
  const [quickRoom, setQuickRoom] = useState("");
  const [quickResult, setQuickResult] = useState(null);
  const [quickError, setQuickError] = useState("");

  useEffect(() => {
    getBlocks().then(setSummary).catch(() => {});
  }, []);

  const totals = summary
    ? summary.blocks.reduce(
        (acc, b) => ({
          rooms: acc.rooms + b.roomCount,
          full: acc.full + b.full,
          partial: acc.partial + b.partial,
        }),
        { rooms: 0, full: 0, partial: 0 }
      )
    : { rooms: 0, full: 0, partial: 0 };

  async function handleQuickSearch(e) {
    e.preventDefault();
    setQuickError("");
    setQuickResult(null);
    if (!quickRoom.trim()) return;
    try {
      const data = await getRoom(quickBlock, quickRoom.trim());
      setQuickResult(data);
    } catch (err) {
      setQuickError(err.message);
    }
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-20">
        <Blob className="w-72 h-72 -top-10 -left-10" color="var(--violet)" />
        <Blob className="w-64 h-64 top-20 right-0" color="var(--pink)" style={{ animationDelay: "2s" }} />
        <Blob className="w-56 h-56 bottom-0 left-1/3" color="var(--sky)" style={{ animationDelay: "4s" }} />

        <div className="max-w-6xl mx-auto px-6 relative">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide animate-popIn"
            style={{ background: "var(--amber)", color: "var(--amber-ink)" }}
          >
            🏠 HB1–HB5 · MIT Bangalore
          </span>

          <h1 className="font-display mt-5 leading-[1.05]" style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}>
            <span className="block animate-riseIn" style={{ animationDelay: ".05s" }}>Know your roommate</span>
            <span
              className="block animate-riseIn px-3 rounded-2xl inline-block mt-1"
              style={{ background: "var(--violet)", color: "white", animationDelay: ".18s" }}
            >
              before move-in day.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg animate-riseIn" style={{ color: "var(--ink-soft)", animationDelay: ".3s" }}>
            Drop your room number and socials, see who else is already in your room, and stop finding out about your roomie at 11pm on move-in night.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 animate-riseIn" style={{ animationDelay: ".4s" }}>
            <Link
              to="/add"
              className="rounded-full px-6 py-3 font-bold text-white shadow-[0_4px_0_var(--violet-ink)] hover:-translate-y-0.5 transition-transform"
              style={{ background: "var(--violet)" }}
            >
              Add your room →
            </Link>
            <Link
              to="/browse"
              className="rounded-full px-6 py-3 font-bold border-2 hover:-translate-y-0.5 transition-transform"
              style={{ borderColor: "var(--ink)", color: "var(--ink)" }}
            >
              Browse all blocks
            </Link>
          </div>

          {/* quick search */}
          <form
            onSubmit={handleQuickSearch}
            className="mt-10 rounded-2xl p-4 flex flex-wrap gap-3 items-end max-w-2xl"
            style={{ background: "var(--surface)", boxShadow: "var(--shadow-pop)" }}
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="quick-block" className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Block</label>
              <select
                id="quick-block"
                value={quickBlock}
                onChange={(e) => setQuickBlock(e.target.value)}
                className="rounded-lg px-3 py-2 border-2 font-mono"
                style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
              >
                {Object.keys(BLOCKS).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="quick-room" className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Room no.</label>
              <input
                id="quick-room"
                value={quickRoom}
                onChange={(e) => setQuickRoom(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="e.g. 710"
                inputMode="numeric"
                maxLength={6}
                className="rounded-lg px-3 py-2 border-2 font-mono w-32"
                style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
              />
            </div>
            <button
              type="submit"
              className="rounded-lg px-5 py-2.5 font-bold text-white shadow-[0_3px_0_var(--violet-ink)]"
              style={{ background: "var(--violet)" }}
            >
              Look up →
            </button>
            {quickError && <p className="basis-full text-sm font-semibold" style={{ color: "var(--coral-ink)" }}>{quickError}</p>}
            {quickResult && (
              <div className="basis-full mt-2 rounded-xl p-3 animate-popIn" style={{ background: "var(--surface-2)" }}>
                <p className="text-sm font-bold">
                  Room {quickResult.room} ({quickResult.block}) — {quickResult.occupants.length}/{quickResult.capacity} filled
                </p>
                {quickResult.occupants.length === 0 ? (
                  <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>Nobody's added this room yet — be the first!</p>
                ) : (
                  <ul className="text-sm mt-1 flex flex-col gap-0.5">
                    {quickResult.occupants.map((o) => (
                      <li key={o.id}>👤 {o.name} {o.instagram && `· IG ${o.instagram}`} {o.discord && `· Discord ${o.discord}`} {o.reddit && `· ${o.reddit}`}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-6xl mx-auto px-6 -mt-4 mb-16">
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          <StatCard value={totals.rooms} label="rooms on record" delay={0} />
          <StatCard value={totals.partial} label="looking for a roomie" delay={100} />
          <StatCard value={totals.full} label="fully matched" delay={200} />
        </div>
      </section>

      {/* BLOCKS */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="font-display text-3xl">Pick your block</h2>
        <p className="mt-2" style={{ color: "var(--ink-soft)" }}>Five hostel blocks, each with its own AC situation.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(BLOCKS).map(([key, meta], i) => {
            const s = summary?.blocks.find((b) => b.block === key);
            const accentVar = `var(--${meta.accent})`;
            const gender = GENDER_META[meta.gender];
            return (
              <Link
                key={key}
                to="/browse"
                state={{ block: key }}
                className="group rounded-3xl p-7 relative overflow-hidden transition-transform hover:-translate-y-1"
                style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}
              >
                <div
                  className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20 group-hover:scale-110 transition-transform"
                  style={{ background: accentVar }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-12 h-12 rounded-2xl grid place-items-center text-2xl"
                      style={{ background: accentVar, transform: `rotate(${i % 2 ? 6 : -6}deg)`, animation: "floatY 5s ease-in-out infinite", ["--rot"]: `${i % 2 ? 6 : -6}deg` }}
                    >
                      {meta.ac ? "❄️" : "🌀"}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl">{meta.label}</h3>
                      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>{meta.roomType}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs font-extrabold uppercase tracking-wide rounded-full px-2.5 py-1 shrink-0"
                    style={{ background: "var(--surface-2)", color: "var(--ink-soft)" }}
                  >
                    {gender.icon} {gender.label}
                  </span>
                </div>
                <div className="mt-5 flex gap-4 text-sm font-bold flex-wrap">
                  <span style={{ color: "var(--ink-soft)" }}>{s?.roomCount ?? 0} rooms logged</span>
                  <span style={{ color: "var(--amber-ink)" }}>{s?.partial ?? 0} partial</span>
                  <span style={{ color: "var(--coral-ink)" }}>{s?.full ?? 0} full</span>
                </div>
                <span className="inline-block mt-5 font-bold" style={{ color: accentVar }}>Browse {meta.label} →</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl mb-8">Three steps. No awkward door-knocking.</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { emoji: "🔑", title: "Add your room", body: "Room number, name, and at least one social — Reddit, Insta, or Discord." },
            { emoji: "🎨", title: "See the status", body: "Rooms show up Open, Partial, or Full — colour coded so it's obvious at a glance." },
            { emoji: "💬", title: "Reach out", body: "Found your roommate already in the room? Slide into their DMs before day one." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-2xl p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}>
              <span className="text-3xl inline-block" style={{ animation: "wiggle 3s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>{s.emoji}</span>
              <h3 className="font-display text-xl mt-3">{s.title}</h3>
              <p className="text-sm mt-2" style={{ color: "var(--ink-soft)" }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
