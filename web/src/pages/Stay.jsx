const CAMPUS = "Manipal Academy of Higher Education, Bengaluru Campus, Govindapura, Yelahanka, Bengaluru 560063";

function directionsUrl(destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(CAMPUS)}&destination=${encodeURIComponent(destination)}`;
}

const HOTELS = [
  {
    name: "Hotel Dhruv Palace",
    area: "Jakkur",
    rating: "9.1",
    ratingOutOf: "10",
    ratingSource: "Booking.com",
    price: "From ~₹2,250/night",
    blurb: "Budget-friendly, walking distance to Jakkur Lake. Best-rated of this list.",
    accent: "mint",
    mapQuery: "Hotel Dhruv Palace, Jakkur, Bengaluru",
  },
  {
    name: "Hotel Attide",
    area: "Bellary Road, opp. Jakkur Aerodrome, Yelahanka",
    rating: "3.98",
    ratingOutOf: "5",
    ratingSource: "MakeMyTrip",
    price: "From ~₹1,000/night (varies a lot by room)",
    blurb: "Right in the Jakkur/Yelahanka pocket the campus sits in — boutique-style rooms.",
    accent: "violet",
    mapQuery: "Attide Hotel, Bellary Road, Yelahanka, Bengaluru",
  },
  {
    name: "Ramanashree California Resort",
    area: "Yelahanka",
    rating: "3.9",
    ratingOutOf: "5",
    ratingSource: "Justdial",
    price: "From ~₹2,276/night",
    blurb: "Resort-style stay with a pool, tennis & basketball courts.",
    accent: "amber",
    mapQuery: "Ramanashree California Resort, Yelahanka, Bengaluru",
  },
  {
    name: "Royal Orchid Resort & Convention Centre",
    area: "Jakkur Flying Club, Yelahanka",
    rating: "4.0",
    ratingOutOf: "5",
    ratingSource: "TripAdvisor",
    price: "From ~₹4,459/night",
    blurb: "8-acre resort property with a spa and gym on-site.",
    accent: "sky",
    mapQuery: "Royal Orchid Resort & Convention Centre, Yelahanka, Bengaluru",
  },
  {
    name: "Ramada by Wyndham Bengaluru Yelahanka",
    area: "Doddaballapur Main Rd, Yelahanka",
    rating: "4.0",
    ratingOutOf: "5",
    ratingSource: "TripAdvisor",
    price: "Check current rates",
    blurb: "5+ acres of landscaped gardens and an outdoor pool.",
    accent: "coral",
    mapQuery: "Ramada by Wyndham Bengaluru Yelahanka",
  },
  {
    name: "Royal Ace Boutique Hotel",
    area: "Bagalur Cross, near Airport Rd",
    rating: "8.1",
    ratingOutOf: "10",
    ratingSource: "Booking.com",
    price: "From ~$80/night (~₹6,700)",
    blurb: "Further out toward the airport — a backup if closer options are full.",
    accent: "pink",
    mapQuery: "Royal Ace Boutique Hotel, Bagalur, Bengaluru",
  },
];

export default function Stay() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <span className="text-4xl inline-block animate-popIn">🏨</span>
      <h1 className="font-display text-3xl mt-3 animate-riseIn">Where Parents Can Stay</h1>
      <p className="mt-2 animate-riseIn max-w-2xl" style={{ color: "var(--ink-soft)", animationDelay: ".08s" }}>
        Hotels in the Yelahanka/Jakkur area, near campus, for move-in day or visiting weekends. Ratings and prices are pulled from booking sites and change often — tap through to confirm before booking.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        {HOTELS.map((h, i) => (
          <div
            key={h.name}
            className="rounded-2xl p-6 relative overflow-hidden animate-riseIn"
            style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)", animationDelay: `${i * 0.06}s` }}
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20" style={{ background: `var(--${h.accent})` }} />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl leading-tight">{h.name}</h2>
                <span
                  className="shrink-0 text-xs font-extrabold rounded-full px-2.5 py-1 whitespace-nowrap"
                  style={{ background: `color-mix(in srgb, var(--${h.accent}) 20%, transparent)`, color: `var(--${h.accent}-ink)` }}
                >
                  ★ {h.rating}/{h.ratingOutOf}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>📍 {h.area}</p>
              <p className="text-sm mt-3" style={{ color: "var(--ink-soft)" }}>{h.blurb}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div>
                  <p className="font-mono font-bold text-sm">{h.price}</p>
                  <p className="text-[10px]" style={{ color: "var(--ink-soft)" }}>Rating via {h.ratingSource}</p>
                </div>
                <a
                  href={directionsUrl(h.mapQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-full px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: "var(--violet)", boxShadow: "0 3px 0 var(--violet-ink)" }}
                >
                  Directions →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl p-5 text-sm" style={{ background: "var(--surface-2)", color: "var(--ink-soft)" }}>
        <b>Why "Directions" instead of a fixed distance?</b> Actual driving distance/time depends on traffic and route, so instead of printing a number that goes stale, each card opens live Google Maps directions from campus straight to the hotel.
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: "var(--ink-soft)" }}>
        Ratings, prices, and reviews sourced from Booking.com, TripAdvisor, Justdial, and MakeMyTrip listings — always double-check current rates before booking. Not an endorsement of any property.
      </p>
    </div>
  );
}
