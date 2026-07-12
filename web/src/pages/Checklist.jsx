import { useEffect, useState } from "react";
import { readChecked, writeChecked } from "../checklistStorage.js";

const DOCUMENTS = [
  { id: "reg-form", label: "MAHE Registration Form (printed, filled)", note: "Available on your application portal 2 days before class commencement — print it, fill it, keep it with your originals." },
  { id: "10th", label: "10th Standard marks card" },
  { id: "12th", label: "12th Standard marks card" },
  { id: "transfer-cert", label: "Transfer / School Leaving Certificate" },
  { id: "conduct-cert", label: "Conduct / Character Certificate" },
  { id: "photocopies", label: "One photocopy set of the above 4 documents" },
  { id: "apaar", label: "Copy of APAAR ID" },
  { id: "dob-cert", label: "Date of Birth Certificate", note: "Only needed if your 10th marks card doesn't show your DOB." },
  { id: "aadhar", label: "Copy of Aadhaar card (yours)" },
  { id: "parent-pan", label: "Copy of PAN card (parent's)" },
  { id: "oci", label: "Copy of OCI card", note: "If applicable." },
  { id: "aiu", label: "AIU Equivalency certificate", note: "Only for international boards." },
  { id: "photos-passport", label: "2 passport-size photographs" },
  { id: "anti-ragging", label: "Anti-ragging undertaking (signed)" },
  { id: "anti-substance", label: "Anti-substance-abuse declaration (signed)" },
];

const ESSENTIALS = [
  { id: "govt-id", label: "Government ID proof — original + 2 copies" },
  { id: "photos-stamp", label: "2 stamp-size photos" },
  { id: "bed-linen", label: "Bed linen & blanket" },
  { id: "toiletries", label: "Personal toiletries & towels" },
  { id: "medications", label: "Medications (basic/prescribed)" },
  { id: "pillow", label: "Personal pillow & pillow cover" },
  { id: "hangers", label: "Cloth hangers" },
  { id: "umbrella", label: "Umbrella / raincoat" },
];

function Confetti() {
  const pieces = Array.from({ length: 24 });
  const colors = ["var(--violet)", "var(--pink)", "var(--sky)", "var(--amber)", "var(--mint)"];
  return (
    <div className="fixed inset-x-0 top-0 h-0 overflow-visible pointer-events-none z-50">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="absolute w-2.5 h-2.5 rounded-sm"
          style={{
            left: `${(i / pieces.length) * 100}%`,
            background: colors[i % colors.length],
            animation: `confettiFall ${1 + (i % 5) * 0.2}s ease-in ${(i % 6) * 0.06}s both`,
          }}
        />
      ))}
    </div>
  );
}

function ChecklistGroup({ title, items, checked, onToggle, delay }) {
  const doneCount = items.filter((i) => checked[i.id]).length;
  const complete = doneCount === items.length;
  return (
    <div
      className="rounded-2xl p-6 animate-riseIn transition-all"
      style={{
        background: "var(--surface)",
        boxShadow: complete ? "var(--mint-glow, var(--shadow-card))" : "var(--shadow-card)",
        animationDelay: delay,
        border: complete ? "2px solid var(--mint)" : "2px solid transparent",
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2">
          {title} {complete && <span className="animate-popIn">✅</span>}
        </h2>
        <span
          className="text-xs font-extrabold uppercase rounded-full px-3 py-1 transition-colors"
          style={{
            background: complete ? "color-mix(in srgb, var(--mint) 25%, transparent)" : "var(--surface-2)",
            color: complete ? "var(--mint-ink)" : "var(--ink-soft)",
          }}
        >
          {doneCount}/{items.length}
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={item.id} className="animate-riseIn" style={{ animationDelay: `${parseFloat(delay) + i * 0.03}s` }}>
            <label className="flex items-start gap-3 rounded-lg px-2 py-2.5 cursor-pointer hover:bg-[var(--surface-2)] transition-colors">
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => onToggle(item.id)}
                className="mt-1 w-5 h-5 shrink-0 accent-[var(--violet)] transition-transform active:scale-90"
              />
              <span>
                <span className={`font-semibold transition-all ${checked[item.id] ? "line-through" : ""}`} style={{ color: checked[item.id] ? "var(--ink-soft)" : "var(--ink)" }}>
                  {item.label}
                </span>
                {item.note && <span className="block text-xs mt-0.5" style={{ color: "var(--ink-soft)" }}>{item.note}</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Checklist() {
  const [checked, setChecked] = useState({});
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    setChecked(readChecked());
  }, []);

  function toggle(id) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      writeChecked(next);
      return next;
    });
  }

  const total = DOCUMENTS.length + ESSENTIALS.length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = total ? (done / total) * 100 : 0;
  const allDone = total > 0 && done === total;

  useEffect(() => {
    if (allDone && !celebrated) setCelebrated(true);
    if (!allDone && celebrated) setCelebrated(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 relative overflow-hidden">
      {celebrated && <Confetti />}
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none -top-10 -right-16"
        style={{ background: "var(--violet)", animation: "blobFloat 9s ease-in-out infinite" }}
      />

      <span className="text-3xl inline-block animate-popIn" style={{ animation: allDone ? "wiggle 1.2s ease-in-out infinite, popIn .45s cubic-bezier(.2,1.4,.4,1) both" : undefined }}>
        {allDone ? "🎉" : "🧳"}
      </span>
      <h1 className="font-display text-3xl mt-3 animate-riseIn">{allDone ? "You're all packed!" : "Before You Arrive"}</h1>
      <p className="mt-2 animate-riseIn" style={{ color: "var(--ink-soft)", animationDelay: ".08s" }}>
        {allDone
          ? "Everything's ticked off. Safe travels — see you on campus!"
          : "Everything to gather before move-in day. Tick things off as you pack — it's saved on this device so you can check back anytime."}
      </p>

      <div className="mt-6 rounded-full h-3 overflow-hidden relative" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: allDone ? "var(--mint)" : "var(--violet)",
            boxShadow: allDone ? "var(--mint-glow, none)" : "none",
          }}
        />
      </div>
      <p className="mt-2 text-xs font-bold" style={{ color: "var(--ink-soft)" }}>{done} of {total} packed</p>

      <div className="mt-6 flex flex-col gap-6">
        <ChecklistGroup title="Registration Documents" items={DOCUMENTS} checked={checked} onToggle={toggle} delay=".1s" />
        <ChecklistGroup title="Move-in Essentials" items={ESSENTIALS} checked={checked} onToggle={toggle} delay=".2s" />
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: "var(--ink-soft)" }}>
        Based on the official MAHE onboarding checklist — always double-check against the latest email from admissions before you leave home.
      </p>
    </div>
  );
}
