// Bump FEATURES_VERSION whenever there's a new batch of features worth announcing —
// that's what makes the banner reappear for everyone, even people who dismissed an earlier version.
export const FEATURES_VERSION = "2026-07-13b";

export const FEATURES = [
  "Roommate vibe quiz — sleep schedule, tidiness, smoking, alcohol, and more",
  "Already added yourself? Go to Browse and fill in your vibe answers anytime",
  "Parent Stay page — real hotels near campus, ordered closest to farthest",
  "Room-full alerts — get notified in-app when your room fills up",
];

const KEY = "hostelmate:seenFeaturesVersion";

export function wasFeaturesVersionSeen(version) {
  try {
    return localStorage.getItem(KEY) === version;
  } catch {
    return false;
  }
}

export function markFeaturesVersionSeen(version) {
  try {
    localStorage.setItem(KEY, version);
  } catch {
    // storage disabled — worst case the banner reappears next visit
  }
}
