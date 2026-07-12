const SECTIONS = [
  { id: "curfew", label: "Curfew & Timings", icon: "⏰" },
  { id: "mess", label: "Mess", icon: "🍽️" },
  { id: "laundry", label: "Laundry", icon: "🧺" },
  { id: "rules", label: "Hostel Rules", icon: "📋" },
  { id: "emergency", label: "Emergency", icon: "🚨" },
];

function Section({ id, icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl p-6 sm:p-7" style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)" }}>
      <h2 className="font-display text-2xl flex items-center gap-3">
        <span className="text-3xl">{icon}</span> {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
      <span className="font-bold text-sm" style={{ color: "var(--ink-soft)" }}>{label}</span>
      <span className="font-mono text-sm font-bold text-right">{value}</span>
    </div>
  );
}

function Pill({ children, tone = "mint" }) {
  return (
    <span
      className="inline-block text-xs font-extrabold uppercase tracking-wide rounded-full px-2.5 py-1"
      style={{ background: `color-mix(in srgb, var(--${tone}) 20%, transparent)`, color: `var(--${tone}-ink)` }}
    >
      {children}
    </span>
  );
}

export default function Guide() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl">Hostel Guide</h1>
      <p className="mt-2" style={{ color: "var(--ink-soft)" }}>
        Curfew, mess, laundry, and the rules that actually matter — pulled straight from the official MAHE hostel documents.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full px-4 py-2 text-sm font-bold border-2 transition-all hover:-translate-y-0.5"
            style={{ borderColor: "var(--line-strong)" }}
          >
            {s.icon} {s.label}
          </a>
        ))}
      </nav>

      <div className="mt-8 flex flex-col gap-6">
        <Section id="curfew" icon="⏰" title="Curfew & Timings">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-extrabold uppercase mb-1" style={{ color: "var(--ink-soft)" }}>On-campus</p>
              <Row label="Curfew" value="9:30 PM – 6:00 AM" />
              <Row label="Report inside block" value="Before 11:00 PM" />
              <Row label="Attendance window" value="9:30 – 11:30 PM" />
              <Row label="Silent hours" value="12:30 – 6:00 AM" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase mb-1" style={{ color: "var(--ink-soft)" }}>Off-campus</p>
              <Row label="Curfew" value="9:30 PM – 6:00 AM" />
              <Row label="Report inside block" value="Before 9:30 PM" />
              <Row label="Attendance window" value="9:30 – 10:00 PM" />
              <Row label="Last shuttle from campus" value="8:30 PM" />
            </div>
          </div>
          <p className="mt-4 text-sm" style={{ color: "var(--ink-soft)" }}>
            Traffic, breakdowns, or "I was on a call with approval" don't excuse a late curfew violation — the only exceptions are medical emergencies or pre-approved travel. Leave requests need <b>24–48 hrs advance notice</b> through the hostel app, with mandatory parent approval. No night/curfew passes are issued.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            Food delivery (Swiggy/Zomato/etc.) must arrive by <b>10:30 PM</b>. After 10 PM, only internal vendors can deliver, straight to the hostel reception.
          </p>
        </Section>

        <Section id="mess" icon="🍽️" title="Mess">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-extrabold uppercase mb-1" style={{ color: "var(--ink-soft)" }}>Mon – Sat</p>
              <Row label="Breakfast" value="7:30 – 9:30 AM" />
              <Row label="Lunch" value="12:00 – 2:15 PM" />
              <Row label="Snacks" value="4:15 – 6:00 PM" />
              <Row label="Dinner" value="7:30 – 9:15 PM" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase mb-1" style={{ color: "var(--ink-soft)" }}>Sun & Public Holidays</p>
              <Row label="Breakfast" value="7:30 – 10:00 AM" />
              <Row label="Lunch" value="12:15 – 2:30 PM" />
              <Row label="Snacks" value="4:15 – 6:00 PM" />
              <Row label="Dinner" value="7:30 – 9:30 PM" />
            </div>
          </div>
          <ul className="mt-5 flex flex-col gap-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            <li>• Facial recognition/biometric check-in required every session — only mess members can use the facility.</li>
            <li>• Switching your mess provider (CIS / BlueDove) is only possible <b>24th–26th of each month</b>, via the ZOLO app.</li>
            <li>• Outside food isn't allowed in the Food Court/Mess. Sick and need a parcel? Contact your mess provider or warden directly.</li>
            <li>• Night orders (10 PM – 4 AM) go through the Change Pay platform — Chef's Touch or BlueDove Hospitality.</li>
          </ul>
        </Section>

        <Section id="laundry" icon="🧺" title="Laundry">
          <Row label="Included washes" value="30 / academic year" />
          <Row label="Max load" value="6 kg per wash" />
          <Row label="Extra wash cost" value="₹236 each" />
          <Row label="Delivery time" value="24 hrs (48 hrs on holidays)" />
          <Row label="Kiosk hours" value="11:30 AM–2:30 PM · 4:30–7:30 PM" />
          <Row label="Missed the kiosk?" value="Laundromat 9 AM – 8 PM" />
          <p className="mt-4 text-sm" style={{ color: "var(--ink-soft)" }}>
            You get one laundry bag + card per year (₹50 to replace if lost). Unused washes don't carry over — they expire at the end of the academic year, so use them.
          </p>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-soft)" }}>
            Laundry issue? First contact: <b>+91 97733 43115</b>, second: <b>+91 97733 02415</b> (8:30 AM – 5:00 PM).
          </p>
        </Section>

        <Section id="rules" icon="📋" title="Hostel Rules — the parts that actually trip people up">
          <div>
            <h3 className="font-bold mb-2">Appliances</h3>
            <div className="rounded-xl overflow-x-auto" style={{ background: "var(--surface-2)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left" style={{ color: "var(--ink-soft)" }}>
                    <th className="p-3 font-bold">Appliance</th>
                    <th className="p-3 font-bold">Limit</th>
                    <th className="p-3 font-bold">Cost/year</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr><td className="p-3">Electric Kettle</td><td className="p-3">1200 W</td><td className="p-3">₹1,000</td></tr>
                  <tr><td className="p-3">Egg Boiler</td><td className="p-3">500 W</td><td className="p-3">₹500</td></tr>
                  <tr><td className="p-3">Portable Blender</td><td className="p-3">50 W / 500 mL</td><td className="p-3">₹100</td></tr>
                  <tr><td className="p-3">Table Fan</td><td className="p-3">60 W</td><td className="p-3">₹1,000</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--ink-soft)" }}>
              Payment due within 1 month of arrival or by <b>31 Aug 2026</b>, whichever's earlier. Free to keep without payment: table lamp, device chargers, shaver, hair dryer/straightener, comb, and inhalers/nebulizers (medical only).
            </p>
            <p className="mt-2 text-sm">
              <Pill tone="coral">Banned outright</Pill>{" "}
              <span className="text-sm" style={{ color: "var(--ink-soft)" }}>TV/projector, fridge, washing machine, iron box, cooler, any cooking appliance (hotplate, induction, microwave, rice cooker...), immersion coils, electric massagers — and anything not on the permitted list above.</span>
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2">Items</h3>
            <p className="text-sm"><Pill tone="mint">Allowed</Pill> <span style={{ color: "var(--ink-soft)" }}>dumbbells, scissors, a small/butter knife, harmless personal items, UNO cards, sealed kombucha, speakers (can be confiscated if they disturb others), eggs, aerated drinks (max 3 per student at a time, sealed).</span></p>
            <p className="text-sm mt-2"><Pill tone="coral">Not allowed</Pill> <span style={{ color: "var(--ink-soft)" }}>other playing cards, candles/agarbatti/diyas, energy drinks or empty cans, alcohol/cigarettes/vapes (zero tolerance).</span></p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2">Room rules</h3>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              No posters/wall art, no altering the room layout, no cooking. Alternate-day cleaning is mandatory. Surprise room audits can happen anytime — including silent hours — with no advance notice, and may involve sniffer dogs.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2">Fines worth knowing</h3>
            <Row label="Curfew violation (2nd+ time)" value="₹500" />
            <Row label="Facilitating unauthorized entry" value="₹1,500 – 3,000" />
            <Row label="Tampering with fire alarm/extinguisher" value="₹3,000" />
            <Row label="Substance possession (1st time)" value="₹10,000 + suspension" />
            <p className="mt-2 text-xs" style={{ color: "var(--ink-soft)" }}>Ragging and repeated violations are zero-tolerance and can mean expulsion. Full protocol table is in the official Hostel Rules document.</p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold mb-2">ID card</h3>
            <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
              Carry it always. Lost it? Report and reapply within <b>4 days</b>. Lending or duplicating your card is a mandatory-suspension offense — no exceptions, even for friends.
            </p>
          </div>
        </Section>

        <Section id="emergency" icon="🚨" title="Emergency Contacts">
          <div className="grid sm:grid-cols-2 gap-3">
            <a href="tel:100" className="rounded-xl p-4 flex items-center justify-between" style={{ background: "var(--surface-2)" }}>
              <span className="font-bold">Police</span><span className="font-mono font-bold" style={{ color: "var(--violet)" }}>100 →</span>
            </a>
            <a href="tel:108" className="rounded-xl p-4 flex items-center justify-between" style={{ background: "var(--surface-2)" }}>
              <span className="font-bold">Ambulance</span><span className="font-mono font-bold" style={{ color: "var(--violet)" }}>108 →</span>
            </a>
            <a href="tel:112" className="rounded-xl p-4 flex items-center justify-between" style={{ background: "var(--surface-2)" }}>
              <span className="font-bold">National Helpline</span><span className="font-mono font-bold" style={{ color: "var(--violet)" }}>112 →</span>
            </a>
            <a href="tel:+916364631781" className="rounded-xl p-4 flex items-center justify-between" style={{ background: "var(--surface-2)" }}>
              <span className="font-bold">MAHE Security (24/7)</span><span className="font-mono font-bold" style={{ color: "var(--violet)" }}>Call →</span>
            </a>
            <a href="tel:+919606079848" className="rounded-xl p-4 flex items-center justify-between" style={{ background: "var(--surface-2)" }}>
              <span className="font-bold">Fire Emergency</span><span className="font-mono font-bold" style={{ color: "var(--violet)" }}>Call →</span>
            </a>
          </div>
        </Section>
      </div>

      <p className="mt-8 text-xs text-center" style={{ color: "var(--ink-soft)" }}>
        Sourced from official MAHE hostel/mess/laundry documents. Rules can change — always defer to the latest official communication from your warden or the hostel app.
      </p>
    </div>
  );
}
