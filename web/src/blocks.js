export const BLOCKS = {
  HB1: { label: "HB1", roomType: "Double • Common bath • Non-AC", ac: false, gender: "female", accent: "violet" },
  HB2: { label: "HB2", roomType: "Triple • details TBD", ac: false, gender: "unspecified", accent: "mint" },
  HB3: { label: "HB3", roomType: "Double • Attached bath • AC", ac: true, gender: "female", accent: "amber" },
  HB4: { label: "HB4", roomType: "Double • Attached bath • AC", ac: true, gender: "male", accent: "sky" },
  HB5: { label: "HB5", roomType: "Double • Attached bath • Non-AC", ac: false, gender: "male", accent: "pink" },
};

export const GENDER_META = {
  female: { label: "Female", icon: "♀" },
  male: { label: "Male", icon: "♂" },
  unspecified: { label: "Unconfirmed", icon: "?" },
};

export const STATUS_META = {
  empty: { label: "Open", var: "mint" },
  partial: { label: "Partial", var: "amber" },
  full: { label: "Full", var: "coral" },
};
