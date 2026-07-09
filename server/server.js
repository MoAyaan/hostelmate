import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { db, BLOCKS, parseRoomCode } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

function statusFor(count, capacity) {
  if (count >= capacity) return "full";
  if (count > 0) return "partial";
  return "empty";
}

function serializeOccupant(row) {
  return {
    id: row.id,
    name: row.name,
    reddit: row.reddit || null,
    instagram: row.instagram || null,
    discord: row.discord || null,
    phone: row.phone || null,
  };
}

function getRoomCapacity(block, room) {
  const row = db.prepare(`SELECT capacity FROM rooms WHERE block = ? AND room = ?`).get(block, room);
  return row ? row.capacity : null;
}

// "@Handle", "u/Handle", "  handle " all normalize to the same "handle" for comparison
function normalizeHandle(value) {
  if (!value) return null;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed.replace(/^u\//, "").replace(/^@/, "") || null;
}

// GET /api/blocks — summary per block
app.get("/api/blocks", (req, res) => {
  const rows = db
    .prepare(
      `SELECT o.block as block, o.room as room, COUNT(*) as cnt, r.capacity as capacity
       FROM occupants o JOIN rooms r ON r.block = o.block AND r.room = o.room
       GROUP BY o.block, o.room`
    )
    .all();

  const summary = Object.fromEntries(
    Object.keys(BLOCKS).map((b) => [b, { roomCount: 0, full: 0, partial: 0 }])
  );

  for (const row of rows) {
    const s = summary[row.block];
    if (!s) continue;
    s.roomCount += 1;
    if (row.cnt >= row.capacity) s.full += 1;
    else if (row.cnt > 0) s.partial += 1;
  }

  res.json({
    blocks: Object.entries(BLOCKS).map(([key, meta]) => ({
      block: key,
      label: meta.label,
      roomType: meta.roomType,
      ac: meta.ac,
      capacities: meta.capacities,
      ...summary[key],
    })),
  });
});

// GET /api/rooms?block=HB4 — rooms grouped by floor
app.get("/api/rooms", (req, res) => {
  const block = String(req.query.block || "").toUpperCase();
  if (!BLOCKS[block]) return res.status(400).json({ error: "Unknown block" });

  const rows = db
    .prepare(`SELECT * FROM occupants WHERE block = ? ORDER BY floor, room, id`)
    .all(block);
  const capRows = db.prepare(`SELECT room, capacity FROM rooms WHERE block = ?`).all(block);
  const capMap = new Map(capRows.map((r) => [r.room, r.capacity]));

  const rooms = new Map();
  for (const row of rows) {
    if (!rooms.has(row.room)) rooms.set(row.room, { room: row.room, floor: row.floor, occupants: [] });
    rooms.get(row.room).occupants.push(serializeOccupant(row));
  }

  const floors = new Map();
  for (const room of rooms.values()) {
    const capacity = capMap.get(room.room) ?? BLOCKS[block].capacities[0];
    const status = statusFor(room.occupants.length, capacity);
    const entry = { ...room, status, capacity };
    if (!floors.has(room.floor)) floors.set(room.floor, []);
    floors.get(room.floor).push(entry);
  }

  const result = [...floors.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([floor, rooms]) => ({
      floor,
      rooms: rooms.sort((a, b) => Number(a.room) - Number(b.room)),
    }));

  res.json({ block, floors: result });
});

// GET /api/room?block=HB4&room=710 — single room lookup
app.get("/api/room", (req, res) => {
  const block = String(req.query.block || "").toUpperCase();
  const roomRaw = String(req.query.room || "");
  if (!BLOCKS[block]) return res.status(400).json({ error: "Unknown block" });
  const parsed = parseRoomCode(roomRaw);
  if (!parsed) return res.status(400).json({ error: "Room number should look like 710 (floor 7, room 10)" });

  const rows = db
    .prepare(`SELECT * FROM occupants WHERE block = ? AND room = ? ORDER BY id`)
    .all(block, parsed.code);
  const capacity = getRoomCapacity(block, parsed.code) ?? BLOCKS[block].capacities[0];

  res.json({
    block,
    room: parsed.code,
    floor: parsed.floor,
    status: statusFor(rows.length, capacity),
    capacity,
    capacityConfirmed: rows.length > 0,
    occupants: rows.map(serializeOccupant),
  });
});

// POST /api/occupants — add yourself to a room
app.post("/api/occupants", (req, res) => {
  const { block: blockRaw, room: roomRaw, roomCapacity, name, reddit, instagram, discord, phone } = req.body || {};
  const block = String(blockRaw || "").toUpperCase();

  if (!BLOCKS[block]) return res.status(400).json({ error: "Pick a valid block." });
  if (!name || !String(name).trim()) return res.status(400).json({ error: "Add your name so roommates recognize you." });
  if (!reddit && !instagram && !discord) {
    return res.status(400).json({ error: "Add at least one of Reddit, Instagram, or Discord." });
  }

  const parsed = parseRoomCode(roomRaw);
  if (!parsed) return res.status(400).json({ error: "Room number should look like 710 (floor 7, room 10)." });

  const roomOccupants = db
    .prepare(`SELECT reddit, instagram, discord FROM occupants WHERE block = ? AND room = ?`)
    .all(block, parsed.code);

  const incoming = { reddit: normalizeHandle(reddit), instagram: normalizeHandle(instagram), discord: normalizeHandle(discord) };
  const alreadyIn = roomOccupants.some(
    (o) =>
      (incoming.reddit && incoming.reddit === normalizeHandle(o.reddit)) ||
      (incoming.instagram && incoming.instagram === normalizeHandle(o.instagram)) ||
      (incoming.discord && incoming.discord === normalizeHandle(o.discord))
  );
  if (alreadyIn) {
    return res.status(409).json({ error: `Looks like you're already listed in room ${parsed.code}. Remove your old entry first if you need to fix something.` });
  }

  const options = BLOCKS[block].capacities;
  let capacity = getRoomCapacity(block, parsed.code);

  if (capacity == null) {
    if (options.length === 1) {
      capacity = options[0];
    } else {
      const chosen = Number(roomCapacity);
      if (!options.includes(chosen)) {
        return res.status(400).json({ error: `Say whether room ${parsed.code} is a ${options.join(" or ")}-person room.` });
      }
      capacity = chosen;
    }
  }

  const existing = db
    .prepare(`SELECT COUNT(*) as cnt FROM occupants WHERE block = ? AND room = ?`)
    .get(block, parsed.code);

  if (existing.cnt >= capacity) {
    return res.status(409).json({ error: `Room ${parsed.code} already has ${capacity} people in it — it's full.` });
  }

  const deleteToken = crypto.randomBytes(16).toString("hex");

  const insertOccupant = db.prepare(
    `INSERT INTO occupants (block, room, floor, name, reddit, instagram, discord, phone, delete_token)
     VALUES (@block, @room, @floor, @name, @reddit, @instagram, @discord, @phone, @deleteToken)`
  );
  const insertRoom = db.prepare(`INSERT OR IGNORE INTO rooms (block, room, capacity) VALUES (?, ?, ?)`);

  const info = db.transaction(() => {
    insertRoom.run(block, parsed.code, capacity);
    return insertOccupant.run({
      block,
      room: parsed.code,
      floor: parsed.floor,
      name: String(name).trim(),
      reddit: reddit ? String(reddit).trim() : null,
      instagram: instagram ? String(instagram).trim() : null,
      discord: discord ? String(discord).trim() : null,
      phone: phone ? String(phone).trim() : null,
      deleteToken,
    });
  })();

  const count = existing.cnt + 1;
  res.status(201).json({
    ok: true,
    id: info.lastInsertRowid,
    status: statusFor(count, capacity),
    capacity,
    deleteToken,
  });
});

// DELETE /api/occupants/:id — remove yourself (e.g. picked the wrong room)
app.delete("/api/occupants/:id", (req, res) => {
  const id = Number(req.params.id);
  const { deleteToken } = req.body || {};

  const row = db.prepare(`SELECT id, delete_token FROM occupants WHERE id = ?`).get(id);
  if (!row) return res.status(404).json({ error: "That entry is already gone." });
  if (!deleteToken || row.delete_token !== deleteToken) {
    return res.status(403).json({ error: "That's not your entry to remove." });
  }

  db.prepare(`DELETE FROM occupants WHERE id = ?`).run(id);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 8790;
app.listen(PORT, () => console.log(`hostel-mate api listening on :${PORT}`));
