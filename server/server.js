import express from "express";
import cors from "cors";
import { db, BLOCKS, ROOM_CAPACITY, parseRoomCode } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

function statusFor(count) {
  if (count >= ROOM_CAPACITY) return "full";
  if (count === 1) return "partial";
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

// GET /api/blocks — summary per block
app.get("/api/blocks", (req, res) => {
  const rows = db.prepare(`SELECT block, room, COUNT(*) as cnt FROM occupants GROUP BY block, room`).all();

  const summary = Object.fromEntries(
    Object.keys(BLOCKS).map((b) => [b, { roomCount: 0, full: 0, partial: 0 }])
  );

  for (const row of rows) {
    const s = summary[row.block];
    if (!s) continue;
    s.roomCount += 1;
    if (row.cnt >= ROOM_CAPACITY) s.full += 1;
    else if (row.cnt === 1) s.partial += 1;
  }

  res.json({
    blocks: Object.entries(BLOCKS).map(([key, meta]) => ({
      block: key,
      label: meta.label,
      roomType: meta.roomType,
      ac: meta.ac,
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

  const rooms = new Map();
  for (const row of rows) {
    if (!rooms.has(row.room)) rooms.set(row.room, { room: row.room, floor: row.floor, occupants: [] });
    rooms.get(row.room).occupants.push(serializeOccupant(row));
  }

  const floors = new Map();
  for (const room of rooms.values()) {
    const status = statusFor(room.occupants.length);
    const entry = { ...room, status, capacity: ROOM_CAPACITY };
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

  res.json({
    block,
    room: parsed.code,
    floor: parsed.floor,
    status: statusFor(rows.length),
    capacity: ROOM_CAPACITY,
    occupants: rows.map(serializeOccupant),
  });
});

// POST /api/occupants — add yourself to a room
app.post("/api/occupants", (req, res) => {
  const { block: blockRaw, room: roomRaw, name, reddit, instagram, discord, phone } = req.body || {};
  const block = String(blockRaw || "").toUpperCase();

  if (!BLOCKS[block]) return res.status(400).json({ error: "Pick a valid block (HB4 or HB5)." });
  if (!name || !String(name).trim()) return res.status(400).json({ error: "Add your name so roommates recognize you." });
  if (!reddit && !instagram && !discord) {
    return res.status(400).json({ error: "Add at least one of Reddit, Instagram, or Discord." });
  }

  const parsed = parseRoomCode(roomRaw);
  if (!parsed) return res.status(400).json({ error: "Room number should look like 710 (floor 7, room 10)." });

  const existing = db
    .prepare(`SELECT COUNT(*) as cnt FROM occupants WHERE block = ? AND room = ?`)
    .get(block, parsed.code);

  if (existing.cnt >= ROOM_CAPACITY) {
    return res.status(409).json({ error: `Room ${parsed.code} already has ${ROOM_CAPACITY} people in it — it's full.` });
  }

  const info = db
    .prepare(
      `INSERT INTO occupants (block, room, floor, name, reddit, instagram, discord, phone)
       VALUES (@block, @room, @floor, @name, @reddit, @instagram, @discord, @phone)`
    )
    .run({
      block,
      room: parsed.code,
      floor: parsed.floor,
      name: String(name).trim(),
      reddit: reddit ? String(reddit).trim() : null,
      instagram: instagram ? String(instagram).trim() : null,
      discord: discord ? String(discord).trim() : null,
      phone: phone ? String(phone).trim() : null,
    });

  const count = existing.cnt + 1;
  res.status(201).json({ ok: true, id: info.lastInsertRowid, status: statusFor(count) });
});

const PORT = process.env.PORT || 8790;
app.listen(PORT, () => console.log(`hostel-mate api listening on :${PORT}`));
