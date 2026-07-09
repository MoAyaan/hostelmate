import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { addOccupant, getRoom, removeOccupant } from "../api.js";
import { BLOCKS, GENDER_META, CAPACITY_LABEL } from "../blocks.js";
import { rememberEntry, forgetEntry } from "../myEntries.js";

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
    reddit: "",
    instagram: "",
    discord: "",
    phone: "",
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
      const result = await addOccupant(form);
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
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center relative">
        <Confetti />
        <span className="text-6xl inline-block animate-popIn">🎉</span>
        <h1 className="font-display text-3xl mt-4 animate-riseIn">You're on the wall!</h1>
        <p className="mt-3 animate-riseIn" style={{ color: "var(--ink-soft)", animationDelay: ".1s" }}>
          Room {form.room} in {form.block} now knows you're coming. Check the browse page to see it live.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-riseIn" style={{ animationDelay: ".2s" }}>
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
