import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/hostelmate";

export const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS occupants (
      id SERIAL PRIMARY KEY,
      block TEXT NOT NULL,
      room TEXT NOT NULL,
      floor TEXT NOT NULL,
      name TEXT NOT NULL,
      reddit TEXT,
      instagram TEXT,
      discord TEXT,
      phone TEXT,
      branch TEXT,
      home_state TEXT,
      delete_token TEXT NOT NULL,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_occupants_block_room ON occupants(block, room);`);
  // the production table already existed before ip_address was added, so migrate it in.
  await pool.query(`ALTER TABLE occupants ADD COLUMN IF NOT EXISTS ip_address TEXT;`);

  // capacity is decided by whoever adds themselves first to a given room,
  // since blocks like HB1/HB2 mix Double and Triple rooms with no way to tell from the room number alone.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      block TEXT NOT NULL,
      room TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      PRIMARY KEY (block, room)
    );
  `);
}

export const BLOCKS = {
  HB1: { label: "HB1", roomType: "Double or Triple • Common bath • Non-AC", ac: false, gender: "female", capacities: [2, 3] },
  HB2: { label: "HB2", roomType: "Double or Triple • details TBD", ac: false, gender: "male", capacities: [2, 3] },
  HB3: { label: "HB3", roomType: "Double • Attached • AC", ac: true, gender: "female", capacities: [2] },
  HB4: { label: "HB4", roomType: "Double • Attached • AC", ac: true, gender: "male", capacities: [2] },
  HB5: { label: "HB5", roomType: "Double • Attached • Non-AC", ac: false, gender: "male", capacities: [2] },
};

// "710" -> { floor: "7", roomOnFloor: "10" }; "1205" -> { floor: "12", roomOnFloor: "05" }
// "0710" normalizes the same as "710" so leading zeros can't split one physical room into two records.
export function parseRoomCode(raw) {
  const trimmed = String(raw).trim();
  if (!/^\d{3,}$/.test(trimmed)) return null;
  const roomOnFloor = trimmed.slice(-2);
  const floorRaw = trimmed.slice(0, -2);
  if (!floorRaw) return null;
  const floor = String(Number(floorRaw));
  const code = floor + roomOnFloor;
  return { floor, roomOnFloor, code };
}
