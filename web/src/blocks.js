export const BLOCKS = {
  HB1: { label: "HB1", roomType: "Double or Triple • Common bath • Non-AC", ac: false, gender: "female", accent: "violet", capacities: [2, 3] },
  HB2: { label: "HB2", roomType: "Double or Triple • details TBD", ac: false, gender: "male", accent: "mint", capacities: [2, 3] },
  HB3: { label: "HB3", roomType: "Double • Attached bath • AC", ac: true, gender: "female", accent: "amber", capacities: [2] },
  HB4: { label: "HB4", roomType: "Double • Attached bath • AC", ac: true, gender: "male", accent: "sky", capacities: [2] },
  HB5: { label: "HB5", roomType: "Double • Attached bath • Non-AC", ac: false, gender: "male", accent: "pink", capacities: [2] },
};

export const CAPACITY_LABEL = { 1: "Single", 2: "Double", 3: "Triple", 4: "Quad" };

export const GENDER_META = {
  female: { label: "Female", icon: "♀" },
  male: { label: "Male", icon: "♂" },
  unspecified: { label: "Unconfirmed", icon: "?" },
};

export const STATUS_META = {
  empty: { label: "Open", var: "mint" },
  partial: { label: "Partial", var: "amber", glow: true },
  full: { label: "Full", var: "coral", glow: true },
};
