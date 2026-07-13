import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { addOccupant, getRoom, removeOccupant } from "../api.js";
import { BLOCKS, GENDER_META, CAPACITY_LABEL } from "../blocks.js";
import { rememberEntry, forgetEntry } from "../myEntries.js";
import { BRANCHES, HOME_STATES, OTHER, QUIZ_FIELDS } from "../options.js";

function Confetti() {
  const pieces = Array.from({ length: 16 });
  const colors = ["var(--violet)", "var(--pink)", "var(--sky)", "var(--amber)", "var(--mint)"];
  return (
    <div className="absolute inset-x-0 top-0 h-0 overflow-visible pointer-events-none">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${(i / pieces.length) * 100}%`,
            background: colors[i % colors.length],
            animation: `confettiFall ${0.8 + (i % 5) * 0.15}s ease-in ${(i % 4) * 0.05}s both`,
          }}
        />
      ))}
    </div>
  );
}

export default function Add() {
  const location = useLocation();
  const [form, setForm] = useState({
    block: location.state?.block || "HB4",
    room: location.state?.room || "",
    roomCapacity: null,
    name: "",
    branch: "",
    branchOther: "",
    homeState: "",
    homeStateOther: "",
    reddit: "",
    instagram: "",
    discord: "",
    phone: "",
    sleepSchedule: "",
    tidiness: "",
    noisePref: "",
    socialStyle: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [error, setError] = useState("");
  const [lockedCapacity, setLockedCapacity] = useState(null);
  const [savedEntry, setSavedEntry] = useState(null);
  const [undoing, setUndoing] = useState(false);

  useEffect(() => {
    if (!location.state?.block || !location.state?.room) return;
    getRoom(location.state.block, location.state.room)
      .then((data) => {
        if (data.capacityConfirmed) setLockedCapacity(data.capacity);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomValid = /^\d{3,}$/.test(form.room.trim());
  const floorPreview = roomValid ? form.room.trim().slice(0, -2) : null;
  const roomOnFloorPreview = roomValid ? form.room.trim().slice(-2) : null;
  const capacityOptions = BLOCKS[form.block].capacities;
  const needsCapacityChoice = capacityOptions.length > 1 && !lockedCapacity;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectBlock(key) {
    setForm((f) => ({ ...f, block: key, roomCapacity: null }));
    setLockedCapacity(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (needsCapacityChoice && !form.roomCapacity) {
      setError(`Say whether room ${form.room || "this"} is a ${capacityOptions.map((c) => CAPACITY_LABEL[c]).join(" or ")} room.`);
      return;
    }
    setStatus("submitting");
    try {
      const payload = {
        ...form,
        branch: form.branch === OTHER ? form.branchOther.trim() : form.branch,
        homeState: form.homeState === OTHER ? form.homeStateOther.trim() : form.homeState,
      };
      const result = await addOccupant(payload);
      const entry = { id: result.id, deleteToken: result.deleteToken, block: form.block, room: form.room };
      rememberEntry(entry);
      setSavedEntry(entry);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  async function handleUndo() {
    if (!savedEntry) return;
    setUndoing(true);
    try {
      await removeOccupant(savedEntry.id, savedEntry.deleteToken);
      forgetEntry(savedEntry.id);
      setStatus("idle");
      setSavedEntry(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUndoing(false);
    }
  }

  if (status === "done") {
    const shareText = `I just added myself to HostelMate for room ${form.room} in ${form.block} 🏠 Add yourself too so we all know who's on our floor before move-in day: ${window.location.origin}/add`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center relative">
        <Confetti />
        <span className="text-6xl inline-block animate-popIn">🎉</span>
        <h1 className="font-display text-3xl mt-4 animate-riseIn">You're on the wall!</h1>
        <p className="mt-3 animate-riseIn" style={{ color: "var(--ink-soft)", animationDelay: ".1s" }}>
          Room {form.room} in {form.block} now knows you're coming. Check the browse page to see it live.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold text-white shadow-[0_4px_0_rgba(0,80,44,0.6)] hover:-translate-y-0.5 transition-transform animate-popIn"
          style={{ background: "#25D366" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-6.99A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.4c0-4.55 3.7-8.25 8.26-8.25a8.2 8.2 0 0 1 5.84 2.42 8.19 8.19 0 0 1 2.42 5.84c0 4.55-3.71 8.25-8.27 8.25zm4.53-6.19c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.08s.9 2.42 1.02 2.58c.13.17 1.77 2.7 4.28 3.79.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28z"/>
          </svg>
          Share on WhatsApp
        </a>

        <div className="mt-4 flex flex-wrap justify-center gap-3 animate-riseIn" style={{ animationDelay: ".2s" }}>
          <Link to="/browse" state={{ block: form.block }} className="rounded-full px-6 py-3 font-bold text-white" style={{ background: "var(--violet)" }}>
            View {form.block} rooms →
          </Link>
          <button
            type="button"
            onClick={handleUndo}
            disabled={undoing}
            className="rounded-full px-6 py-3 font-bold border-2 disabled:opacity-60"
            style={{ borderColor: "var(--line-strong)", color: "var(--ink-soft)" }}
          >
            {undoing ? "Removing…" : "Wrong room? Undo"}
          </button>
        </div>
        {error && (
          <p className="mt-4 text-sm font-semibold" style={{ color: "var(--coral-ink)" }}>⚠️ {error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-14">
      <span className="inline-block text-3xl animate-popIn">🔑</span>
      <h1 className="font-display text-3xl mt-3 animate-riseIn">Add your room</h1>
      <p className="mt-2 animate-riseIn" style={{ color: "var(--ink-soft)", animationDelay: ".08s" }}>
        Add at least one of Reddit, Instagram, or Discord so people can actually reach you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl p-6 flex flex-col gap-5" style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(BLOCKS).map(([key, meta]) => {
            const gender = GENDER_META[meta.gender];
            return (
              <button
                type="button"
                key={key}
                onClick={() => selectBlock(key)}
                className="rounded-xl px-4 py-3 font-bold border-2 text-left transition-all"
                style={{
                  borderColor: form.block === key ? "var(--violet)" : "var(--line-strong)",
                  background: form.block === key ? "var(--surface-2)" : "transparent",
                }}
              >
                <div className="flex items-center gap-2">{meta.ac ? "❄️" : "🌀"} {meta.label}</div>
                <div className="text-xs font-normal mt-0.5" style={{ color: "var(--ink-soft)" }}>{meta.roomType}</div>
                <div className="text-xs font-normal mt-1" style={{ color: "var(--ink-soft)" }}>{gender.icon} {gender.label}</div>
              </button>
            );
          })}
        </div>

        <div>
          <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Room number *</label>
          <input
            required
            value={form.room}
            onChange={(e) => update("room", e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 710"
            className="mt-1 w-full rounded-lg px-3 py-2.5 border-2 font-mono text-lg"
            style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
          />
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
            {roomValid ? `→ floor ${floorPreview}, room ${roomOnFloorPreview}` : "First digits are the floor, last two are the room (e.g. 710 = floor 7, room 10)."}
          </p>
        </div>

        {lockedCapacity && (
          <p className="text-xs -mt-2" style={{ color: "var(--ink-soft)" }}>
            🔒 Room {form.room} is already set as a {CAPACITY_LABEL[lockedCapacity]} ({lockedCapacity}-person) room.
          </p>
        )}

        {needsCapacityChoice && (
          <div className="animate-popIn">
            <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>
              Is this room a {capacityOptions.map((c) => CAPACITY_LABEL[c]).join(" or ")}? *
            </label>
            <div className="mt-1 flex gap-3">
              {capacityOptions.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => update("roomCapacity", c)}
                  className="flex-1 rounded-lg px-4 py-2.5 font-bold border-2 transition-all"
                  style={{
                    borderColor: form.roomCapacity === c ? "var(--violet)" : "var(--line-strong)",
                    background: form.roomCapacity === c ? "var(--surface-2)" : "transparent",
                  }}
                >
                  {CAPACITY_LABEL[c]} <span className="font-normal" style={{ color: "var(--ink-soft)" }}>({c} people)</span>
                </button>
              ))}
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>
              Only asked once per room — whoever adds themselves first locks this in for everyone after.
            </p>
          </div>
        )}

        <div>
          <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Your name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="What should your roomie call you?"
            className="mt-1 w-full rounded-lg px-3 py-2.5 border-2"
            style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Branch (optional)</label>
            <select
              value={form.branch}
              onChange={(e) => update("branch", e.target.value)}
              className="mt-1 w-full rounded-lg px-3 py-2.5 border-2"
              style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
            >
              <option value="">Select branch…</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value={OTHER}>Other</option>
            </select>
            {form.branch === OTHER && (
              <input
                value={form.branchOther}
                onChange={(e) => update("branchOther", e.target.value)}
                placeholder="Type your branch/course"
                className="mt-2 w-full rounded-lg px-3 py-2.5 border-2 animate-popIn"
                style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
              />
            )}
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Home state (optional)</label>
            <select
              value={form.homeState}
              onChange={(e) => update("homeState", e.target.value)}
              className="mt-1 w-full rounded-lg px-3 py-2.5 border-2"
              style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
            >
              <option value="">Select state…</option>
              {HOME_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value={OTHER}>Other / Outside India</option>
            </select>
            {form.homeState === OTHER && (
              <input
                value={form.homeStateOther}
                onChange={(e) => update("homeStateOther", e.target.value)}
                placeholder="Type your state/country"
                className="mt-2 w-full rounded-lg px-3 py-2.5 border-2 animate-popIn"
                style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
              />
            )}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--surface-2)" }}>
          <p className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>🧬 Roommate vibe (optional)</p>
          <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>Answer a few to show roommates a quick compatibility read — not a hard filter.</p>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            {QUIZ_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-bold" style={{ color: "var(--ink-soft)" }}>{field.label}</label>
                <select
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  className="mt-1 w-full rounded-lg px-3 py-2 border-2 text-sm"
                  style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }}
                >
                  <option value="">Skip</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Instagram</label>
            <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@you" className="mt-1 w-full rounded-lg px-3 py-2.5 border-2" style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }} />
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Discord</label>
            <input value={form.discord} onChange={(e) => update("discord", e.target.value)} placeholder="you#0000" className="mt-1 w-full rounded-lg px-3 py-2.5 border-2" style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }} />
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Reddit</label>
            <input value={form.reddit} onChange={(e) => update("reddit", e.target.value)} placeholder="u/you" className="mt-1 w-full rounded-lg px-3 py-2.5 border-2" style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }} />
          </div>
        </div>

        <div>
          <label className="text-xs font-extrabold uppercase" style={{ color: "var(--ink-soft)" }}>Phone (optional)</label>
          <input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 98xxxxxx21" className="mt-1 w-full rounded-lg px-3 py-2.5 border-2" style={{ borderColor: "var(--line-strong)", background: "var(--bg)" }} />
        </div>

        {error && (
          <p className="rounded-lg px-4 py-3 text-sm font-semibold animate-popIn" style={{ background: "var(--surface-2)", color: "var(--coral-ink)" }}>
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full px-6 py-3 font-bold text-white shadow-[0_4px_0_var(--violet-ink)] hover:-translate-y-0.5 transition-transform disabled:opacity-60"
          style={{ background: "var(--violet)" }}
        >
          {status === "submitting" ? "Adding you…" : "Add me to the room →"}
        </button>
      </form>
    </div>
  );
}
