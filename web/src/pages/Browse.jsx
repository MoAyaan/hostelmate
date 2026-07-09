import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getRooms, removeOccupant } from "../api.js";
import { BLOCKS, STATUS_META } from "../blocks.js";
import { findEntry, forgetEntry } from "../myEntries.js";

function RoomTag({ room, onSelect, isSelected }) {
  const meta = STATUS_META[room.status];
  const bg = `var(--${meta.var})`;
  const filled = room.status !== "empty";
  return (
    <button
      onClick={() => onSelect(room)}
      className="relative rounded-xl px-3 py-3 font-mono font-bold text-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{
        background: filled ? bg : "var(--surface)",
        color: filled ? (room.status === "partial" ? "var(--amber-ink)" : "#fff") : "var(--ink)",
        border: `2px solid ${filled ? "transparent" : "var(--line-strong)"}`,
        outline: isSelected ? "3px solid var(--violet)" : "none",
        outlineOffset: "2px",
      }}
      title={`Room ${room.room} — ${meta.label}`}
    >
      {room.room}
      {room.status === "partial" && (
        <span
          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full"
          style={{ background: "var(--amber)", boxShadow: "0 0 0 2px var(--surface)", animation: "pulseRing 1.8s ease-out infinite" }}
        />
      )}
    </button>
  );
}

function RoomDetail({ room, block, onChanged }) {
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState("");
  if (!room) return null;
  const meta = STATUS_META[room.status];

  async function handleRemove(occupantId) {
    const entry = findEntry(occupantId);
    if (!entry) return;
    setRemoveError("");
    setRemovingId(occupantId);
    try {
      await removeOccupant(occupantId, entry.deleteToken);
      forgetEntry(occupantId);
      onChanged();
    } catch (err) {
      setRemoveError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="rounded-2xl p-5 animate-popIn" style={{ background: "var(--surface)", boxShadow: "var(--shadow-pop)" }}>
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xl">Room {room.room} <span style={{ color: "var(--ink-soft)" }} className="font-mono text-sm">· floor {room.floor}</span></h4>
        <span
          className="text-xs font-extrabold uppercase rounded-full px-3 py-1"
          style={{ background: `var(--${meta.var})`, color: room.status === "partial" ? "var(--amber-ink)" : "#fff" }}
        >
          {meta.label} · {room.occupants.length}/{room.capacity}
        </span>
      </div>
      {room.occupants.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>Nobody's claimed this room yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {room.occupants.map((o) => {
            const mine = findEntry(o.id);
            return (
              <li key={o.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
                <span className="w-9 h-9 rounded-full grid place-items-center font-display text-white shrink-0" style={{ background: "var(--violet)" }}>
                  {o.name.charAt(0).toUpperCase()}
                </span>
                <div className="text-sm flex-1">
                  <p className="font-bold">{o.name}</p>
                  {(o.branch || o.homeState) && (
                    <p style={{ color: "var(--ink-soft)" }}>
                      {[o.branch, o.homeState].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p style={{ color: "var(--ink-soft)" }}>
                    {[o.instagram && `IG ${o.instagram}`, o.discord && `Discord ${o.discord}`, o.reddit && o.reddit].filter(Boolean).join(" · ") || "No socials shared"}
                  </p>
                </div>
                {mine && (
                  <button
                    type="button"
                    onClick={() => handleRemove(o.id)}
                    disabled={removingId === o.id}
                    className="shrink-0 text-xs font-bold rounded-full px-2.5 py-1 disabled:opacity-60"
                    style={{ color: "var(--coral-ink)", background: "color-mix(in srgb, var(--coral) 18%, transparent)" }}
                    title="Wrong room? Remove yourself"
                  >
                    {removingId === o.id ? "…" : "✕ Remove"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {removeError && (
        <p className="mt-3 text-xs font-semibold" style={{ color: "var(--coral-ink)" }}>⚠️ {removeError}</p>
      )}
      {room.occupants.length < room.capacity && (
        <Link
          to="/add"
          state={{ block, room: room.room }}
          className="inline-block mt-4 rounded-full px-5 py-2 text-sm font-bold text-white shadow-[0_3px_0_var(--violet-ink)]"
          style={{ background: "var(--violet)" }}
        >
          Add yourself to this room →
        </Link>
      )}
    </div>
  );
}

export default function Browse() {
  const location = useLocation();
  const [block, setBlock] = useState(location.state?.block || "HB4");
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    getRooms(block)
      .then((data) => setFloors(data.floors))
      .catch(() => setFloors([]))
      .finally(() => setLoading(false));
  }, [block]);

  async function refresh() {
    const data = await getRooms(block);
    setFloors(data.floors);
    setSelected((current) => {
      if (!current) return current;
      return data.floors.flatMap((f) => f.rooms).find((r) => r.room === current.room) || null;
    });
  }

  const counts = useMemo(() => {
    const all = floors.flatMap((f) => f.rooms);
    return {
      empty: all.filter((r) => r.status === "empty").length,
      partial: all.filter((r) => r.status === "partial").length,
      full: all.filter((r) => r.status === "full").length,
    };
  }, [floors]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl">Browse rooms</h1>
      <p className="mt-2" style={{ color: "var(--ink-soft)" }}>Only rooms someone's actually added show up here.</p>

      <div className="mt-6 flex gap-3 flex-wrap">
        {Object.entries(BLOCKS).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setBlock(key)}
            className="rounded-full px-5 py-2.5 font-bold border-2 transition-all"
            style={{
              background: block === key ? "var(--ink)" : "transparent",
              color: block === key ? "var(--bg)" : "var(--ink)",
              borderColor: block === key ? "var(--ink)" : "var(--line-strong)",
            }}
          >
            {meta.ac ? "❄️" : "🌀"} {meta.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-sm font-bold flex-wrap">
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--mint)" }} />{counts.empty} open</span>
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--amber)" }} />{counts.partial} partial</span>
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--coral)" }} />{counts.full} full</span>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        <div>
          {loading && <p style={{ color: "var(--ink-soft)" }}>Loading…</p>}
          {!loading && floors.length === 0 && (
            <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}>
              <p className="text-lg font-bold">No rooms logged in {block} yet.</p>
              <p className="mt-1" style={{ color: "var(--ink-soft)" }}>Be the first to add your room number.</p>
              <Link to="/add" state={{ block }} className="inline-block mt-4 rounded-full px-5 py-2.5 font-bold text-white" style={{ background: "var(--violet)" }}>
                Add your room →
              </Link>
            </div>
          )}
          <div className="flex flex-col gap-6">
            {floors.map((f, fi) => (
              <div key={f.floor} className="animate-riseIn" style={{ animationDelay: `${fi * 0.05}s` }}>
                <h3 className="font-display text-lg mb-2" style={{ color: "var(--ink-soft)" }}>Floor {f.floor}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {f.rooms.map((r) => (
                    <RoomTag key={r.room} room={r} onSelect={setSelected} isSelected={selected?.room === r.room} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          {selected ? (
            <RoomDetail room={selected} block={block} onChanged={refresh} />
          ) : (
            <div className="rounded-2xl p-6 text-sm" style={{ background: "var(--surface-2)", color: "var(--ink-soft)" }}>
              Tap a room number to see who's already in it.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
