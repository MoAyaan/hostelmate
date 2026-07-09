import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const db = new Database(path.join(__dirname, "hostel.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS occupants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block TEXT NOT NULL,
    room TEXT NOT NULL,
    floor TEXT NOT NULL,
    name TEXT NOT NULL,
    reddit TEXT,
    instagram TEXT,
    discord TEXT,
    phone TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_occupants_block_room ON occupants(block, room);
`);

export const BLOCKS = {
  HB1: { label: "HB1", roomType: "Double • Common bath • Non-AC", ac: false, gender: "female", capacity: 2 },
  HB2: { label: "HB2", roomType: "Triple • details TBD", ac: false, gender: "unspecified", capacity: 3 },
  HB3: { label: "HB3", roomType: "Double • Attached • AC", ac: true, gender: "female", capacity: 2 },
  HB4: { label: "HB4", roomType: "Double • Attached • AC", ac: true, gender: "male", capacity: 2 },
  HB5: { label: "HB5", roomType: "Double • Attached • Non-AC", ac: false, gender: "male", capacity: 2 },
};

// "710" -> { floor: "7", roomOnFloor: "10" }; "1205" -> { floor: "12", roomOnFloor: "05" }
export function parseRoomCode(raw) {
  const code = String(raw).trim();
  if (!/^\d{3,}$/.test(code)) return null;
  const roomOnFloor = code.slice(-2);
  const floor = code.slice(0, -2);
  if (!floor) return null;
  return { floor, roomOnFloor, code };
}
