const rawBase = import.meta.env.VITE_API_BASE || "";
const origin = rawBase ? (rawBase.startsWith("http") ? rawBase : `https://${rawBase}`) : "";
const BASE = `${origin}/api`;

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export const getBlocks = () => request("/blocks");
export const getRooms = (block) => request(`/rooms?block=${encodeURIComponent(block)}`);
export const getRoom = (block, room) =>
  request(`/room?block=${encodeURIComponent(block)}&room=${encodeURIComponent(room)}`);
export const addOccupant = (payload) =>
  request("/occupants", { method: "POST", body: JSON.stringify(payload) });
export const removeOccupant = (id, deleteToken) =>
  request(`/occupants/${encodeURIComponent(id)}`, { method: "DELETE", body: JSON.stringify({ deleteToken }) });
