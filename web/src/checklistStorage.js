const KEY = "hostelmate:checklist";

export function readChecked() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function writeChecked(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // storage disabled — checklist just won't persist across visits on this device
  }
}
