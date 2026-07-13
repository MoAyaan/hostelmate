import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { pool, initDb, BLOCKS, parseRoomCode } from "./db.js";

const app = express();
app.set("trust proxy", 1); // Render sits behind a proxy; needed so rate limiting sees the real client IP
app.use(cors());
app.use(express.json({ limit: "20kb" }));

const LIMITS = { name: 80, handle: 60, phone: 30, freeText: 100 };

// Mirrors web/src/options.js QUIZ_FIELDS — kept in sync manually since it's a small, stable list.
const QUIZ_VALUES = {
  sleepSchedule: new Set(["early_bird", "night_owl", "flexible"]),
  tidiness: new Set(["very_tidy", "average", "relaxed"]),
  noisePref: new Set(["need_quiet", "some_noise_ok", "dont_mind"]),
  socialStyle: new Set(["loves_guests", "occasional_guests", "prefers_privacy"]),
  smoking: new Set(["smoker", "non_smoker", "okay_either_way"]),
  alcohol: new Set(["drinks", "doesnt_drink", "no_preference"]),
  sharing: new Set(["happy_to_share", "keep_separate", "occasional_sharing"]),
};

function quizValue(field, value) {
  return QUIZ_VALUES[field].has(value) ? value : null;
}

function clip(value, max) {
  if (!value) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts from this connection — wait a bit and try again." },
});

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
    branch: row.branch || null,
    homeState: row.home_state || null,
    sleepSchedule: row.sleep_schedule || null,
    tidiness: row.tidiness || null,
    noisePref: row.noise_pref || null,
    socialStyle: row.social_style || null,
    smoking: row.smoking || null,
    alcohol: row.alcohol || null,
    sharing: row.sharing || null,
  };
}

async function getRoomCapacity(block, room) {
  const { rows } = await pool.query(`SELECT capacity FROM rooms WHERE block = $1 AND room = $2`, [block, room]);
  return rows[0] ? rows[0].capacity : null;
}

// "@Handle", "u/Handle", "  handle " all normalize to the same "handle" for comparison
function normalizeHandle(value) {
  if (!value) return null;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed.replace(/^u\//, "").replace(/^@/, "") || null;
}

// "+91 98xxxxxx21", "098xxxxxx21", "98xxxxxx21" all normalize to the same last-10-digits
function normalizePhone(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, "");
  return digits ? digits.slice(-10) : null;
}

// GET /api/blocks — summary per block
app.get("/api/blocks", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.block as block, o.room as room, COUNT(*) as cnt, r.capacity as capacity
       FROM occupants o JOIN rooms r ON r.block = o.block AND r.room = o.room
       GROUP BY o.block, o.room, r.capacity`
    );

    const summary = Object.fromEntries(
      Object.keys(BLOCKS).map((b) => [b, { roomCount: 0, full: 0, partial: 0 }])
    );

    for (const row of rows) {
      const s = summary[row.block];
      if (!s) continue;
      const cnt = Number(row.cnt);
      s.roomCount += 1;
      if (cnt >= row.capacity) s.full += 1;
      else if (cnt > 0) s.partial += 1;
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
  } catch (err) {
    next(err);
  }
});

// GET /api/rooms?block=HB4 — rooms grouped by floor
app.get("/api/rooms", async (req, res, next) => {
  try {
    const block = String(req.query.block || "").toUpperCase();
    if (!BLOCKS[block]) return res.status(400).json({ error: "Unknown block" });

    const { rows } = await pool.query(
      `SELECT * FROM occupants WHERE block = $1 ORDER BY floor, room, id`,
      [block]
    );
    const capResult = await pool.query(`SELECT room, capacity FROM rooms WHERE block = $1`, [block]);
    const capMap = new Map(capResult.rows.map((r) => [r.room, r.capacity]));

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
  } catch (err) {
    next(err);
  }
});

// GET /api/room?block=HB4&room=710 — single room lookup
app.get("/api/room", async (req, res, next) => {
  try {
    const block = String(req.query.block || "").toUpperCase();
    const roomRaw = String(req.query.room || "");
    if (!BLOCKS[block]) return res.status(400).json({ error: "Unknown block" });
    const parsed = parseRoomCode(roomRaw);
    if (!parsed) return res.status(400).json({ error: "Room number should look like 710 (floor 7, room 10)" });

    const { rows } = await pool.query(
      `SELECT * FROM occupants WHERE block = $1 AND room = $2 ORDER BY id`,
      [block, parsed.code]
    );
    const capacity = (await getRoomCapacity(block, parsed.code)) ?? BLOCKS[block].capacities[0];

    res.json({
      block,
      room: parsed.code,
      floor: parsed.floor,
      status: statusFor(rows.length, capacity),
      capacity,
      capacityConfirmed: rows.length > 0,
      occupants: rows.map(serializeOccupant),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/recent?limit=8 — most recently added rooms, for a "who just joined" feed
app.get("/api/recent", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);
    const { rows } = await pool.query(
      `SELECT id, block, room, name, created_at FROM occupants ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    res.json({
      recent: rows.map((r) => ({
        id: r.id,
        block: r.block,
        room: r.room,
        name: r.name,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/occupants — add yourself to a room
app.post("/api/occupants", writeLimiter, async (req, res, next) => {
  try {
    const {
      block: blockRaw,
      room: roomRaw,
      roomCapacity,
      name,
      reddit,
      instagram,
      discord,
      phone,
      branch,
      homeState,
      sleepSchedule,
      tidiness,
      noisePref,
      socialStyle,
      smoking,
      alcohol,
      sharing,
    } = req.body || {};
    const block = String(blockRaw || "").toUpperCase();

    if (!BLOCKS[block]) return res.status(400).json({ error: "Pick a valid block." });
    if (!name || !String(name).trim()) return res.status(400).json({ error: "Add your name so roommates recognize you." });
    if (!reddit && !instagram && !discord) {
      return res.status(400).json({ error: "Add at least one of Reddit, Instagram, or Discord." });
    }

    const parsed = parseRoomCode(roomRaw);
    if (!parsed) return res.status(400).json({ error: "Room number should look like 710 (floor 7, room 10)." });

    const { rows: roomOccupants } = await pool.query(
      `SELECT reddit, instagram, discord, phone FROM occupants WHERE block = $1 AND room = $2`,
      [block, parsed.code]
    );

    const incoming = {
      reddit: normalizeHandle(reddit),
      instagram: normalizeHandle(instagram),
      discord: normalizeHandle(discord),
      phone: normalizePhone(phone),
    };
    const alreadyIn = roomOccupants.some(
      (o) =>
        (incoming.reddit && incoming.reddit === normalizeHandle(o.reddit)) ||
        (incoming.instagram && incoming.instagram === normalizeHandle(o.instagram)) ||
        (incoming.discord && incoming.discord === normalizeHandle(o.discord)) ||
        (incoming.phone && incoming.phone === normalizePhone(o.phone))
    );
    if (alreadyIn) {
      return res.status(409).json({ error: `Looks like you're already listed in room ${parsed.code}. Remove your old entry first if you need to fix something.` });
    }

    const options = BLOCKS[block].capacities;
    let capacity = await getRoomCapacity(block, parsed.code);

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

    const { rows: existingRows } = await pool.query(
      `SELECT COUNT(*) as cnt FROM occupants WHERE block = $1 AND room = $2`,
      [block, parsed.code]
    );
    const existingCount = Number(existingRows[0].cnt);

    if (existingCount >= capacity) {
      return res.status(409).json({ error: `Room ${parsed.code} already has ${capacity} people in it — it's full.` });
    }

    const deleteToken = crypto.randomBytes(16).toString("hex");

    const client = await pool.connect();
    let insertedId;
    try {
      await client.query("BEGIN");
      await client.query(
        `INSERT INTO rooms (block, room, capacity) VALUES ($1, $2, $3) ON CONFLICT (block, room) DO NOTHING`,
        [block, parsed.code, capacity]
      );
      const insertResult = await client.query(
        `INSERT INTO occupants (block, room, floor, name, reddit, instagram, discord, phone, branch, home_state, delete_token, ip_address, sleep_schedule, tidiness, noise_pref, social_style, smoking, alcohol, sharing)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING id`,
        [
          block,
          parsed.code,
          parsed.floor,
          clip(name, LIMITS.name),
          clip(reddit, LIMITS.handle),
          clip(instagram, LIMITS.handle),
          clip(discord, LIMITS.handle),
          clip(phone, LIMITS.phone),
          clip(branch, LIMITS.freeText),
          clip(homeState, LIMITS.freeText),
          deleteToken,
          req.ip || null,
          quizValue("sleepSchedule", sleepSchedule),
          quizValue("tidiness", tidiness),
          quizValue("noisePref", noisePref),
          quizValue("socialStyle", socialStyle),
          quizValue("smoking", smoking),
          quizValue("alcohol", alcohol),
          quizValue("sharing", sharing),
        ]
      );
      await client.query("COMMIT");
      insertedId = insertResult.rows[0].id;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    const count = existingCount + 1;
    res.status(201).json({
      ok: true,
      id: insertedId,
      status: statusFor(count, capacity),
      capacity,
      deleteToken,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/occupants/:id — remove yourself (e.g. picked the wrong room)
app.delete("/api/occupants/:id", writeLimiter, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { deleteToken } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "That's not a valid entry." });
    }

    const { rows } = await pool.query(`SELECT id, delete_token FROM occupants WHERE id = $1`, [id]);
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "That entry is already gone." });
    if (!deleteToken || row.delete_token !== deleteToken) {
      return res.status(403).json({ error: "That's not your entry to remove." });
    }

    await pool.query(`DELETE FROM occupants WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Never leak stack traces to clients
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end. Try again in a moment." });
});

const PORT = process.env.PORT || 8790;
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`hostel-mate api listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
