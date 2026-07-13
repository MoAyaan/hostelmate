const KEY = "hostelmate:notifiedFull";

function readNotified() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY)) || []);
  } catch {
    return new Set();
  }
}

export function wasNotified(key) {
  return readNotified().has(key);
}

export function markNotified(key) {
  try {
    const set = readNotified();
    set.add(key);
    localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    // storage disabled — worst case the banner may reappear on a later visit
  }
}
