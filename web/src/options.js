// B.Tech entries reflect only programs MIT Bengaluru actually offers (per the counseling.manipal.edu branch list).
export const BRANCHES = [
  "B.Tech - Computer Science & Engineering",
  "B.Tech - CSE (NZ Dual Degree, Auckland)",
  "B.Tech - Computer Science & Financial Technology",
  "B.Tech - Mathematics and Computing",
  "B.Tech - Electronics & Communication Engineering",
  "B.Tech - Electronics Engineering",
  "B.Tech - Robotics and Artificial Intelligence",
  "BBA",
  "BCA",
  "B.Com",
  "B.Des",
  "BA",
  "BSc",
  "MBA",
  "M.Tech",
];

export const HOME_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const OTHER = "__other__";

// Optional roommate-vibe quiz — shown to give people a quick compatibility read, not a hard filter.
export const SLEEP_SCHEDULES = [
  { value: "early_bird", label: "Early bird" },
  { value: "night_owl", label: "Night owl" },
  { value: "flexible", label: "Flexible" },
];

export const TIDINESS_LEVELS = [
  { value: "very_tidy", label: "Very tidy" },
  { value: "average", label: "Average" },
  { value: "relaxed", label: "Relaxed about mess" },
];

export const NOISE_PREFS = [
  { value: "need_quiet", label: "Need it quiet to focus" },
  { value: "some_noise_ok", label: "Some noise is fine" },
  { value: "dont_mind", label: "Doesn't bother me" },
];

export const SOCIAL_STYLES = [
  { value: "loves_guests", label: "Love having friends over" },
  { value: "occasional_guests", label: "Occasional guests" },
  { value: "prefers_privacy", label: "Prefer privacy" },
];

export const SMOKING_PREFS = [
  { value: "smoker", label: "Smoker" },
  { value: "non_smoker", label: "Non-smoker" },
  { value: "okay_either_way", label: "Okay either way" },
];

export const ALCOHOL_PREFS = [
  { value: "drinks", label: "Drinks socially" },
  { value: "doesnt_drink", label: "Doesn't drink" },
  { value: "no_preference", label: "No preference" },
];

export const SHARING_PREFS = [
  { value: "happy_to_share", label: "Happy to share toiletries etc." },
  { value: "keep_separate", label: "Prefer to keep things separate" },
  { value: "occasional_sharing", label: "Occasional sharing is fine" },
];

export const QUIZ_FIELDS = [
  { key: "sleepSchedule", label: "Sleep schedule", options: SLEEP_SCHEDULES },
  { key: "tidiness", label: "Tidiness", options: TIDINESS_LEVELS },
  { key: "noisePref", label: "Noise preference", options: NOISE_PREFS },
  { key: "socialStyle", label: "Social style", options: SOCIAL_STYLES },
  { key: "smoking", label: "Smoking", options: SMOKING_PREFS },
  { key: "alcohol", label: "Alcohol", options: ALCOHOL_PREFS },
  { key: "sharing", label: "Sharing toiletries", options: SHARING_PREFS },
];
