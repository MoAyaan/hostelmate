const KEY = "hostelmate:mine";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {
    // storage disabled/full (e.g. private browsing) — the room was still added server-side,
    // the person just won't see a "Remove" button for it later on this device.
  }
}

export function rememberEntry(entry) {
  const entries = readAll();
  entries.push(entry);
  writeAll(entries);
}

export function forgetEntry(id) {
  writeAll(readAll().filter((e) => e.id !== id));
}

export function findEntry(id) {
  return readAll().find((e) => e.id === id) || null;
}

export function getAllEntries() {
  return readAll();
}
