const KEY = "hostelmate:mine";

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function writeAll(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries));
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
