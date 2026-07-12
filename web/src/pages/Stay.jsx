const CAMPUS = "Manipal Academy of Higher Education, Bengaluru Campus, Govindapura, Yelahanka, Bengaluru 560063";

function directionsUrl(destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(CAMPUS)}&destination=${encodeURIComponent(destination)}`;
}

const HOTELS = [
  {
    name: "Villa8485 Airways Homestay",
    area: "Govindapura, right by campus",
    rating: null,
    blurb: "Homestay marketed specifically for MAHE Bengaluru families — likely the closest option to the gate.",
    accent: "mint",
    mapQuery: "Villa8485 Airways Homestay, Govindapura, Yelahanka, Bengaluru",
  },
  {
    name: "Hotel Dhruv Palace",
    area: "Jakkur",
    rating: "4.0/5 · TripAdvisor, 4.3/5 · Justdial",
    blurb: "Budget-friendly, popular with families visiting Jakkur/Yelahanka.",
    accent: "violet",
    mapQuery: "Hotel Dhruv Palace, Jakkur, Bengaluru",
  },
  {
    name: "Hotel Attide",
    area: "Bellary Road, opp. Jakkur Aerodrome, Yelahanka",
    rating: "4.0/5 · TripAdvisor",
    blurb: "Boutique business hotel with a restobar; reviews on service are mixed.",
    accent: "amber",
    mapQuery: "Hotel Attide, Bellary Road, Yelahanka, Bengaluru",
  },
  {
    name: "Clarion Hotel Bangalore",
    area: "Attur Layout, near Attur Lake, Yelahanka",
    rating: "4.35/5 · MakeMyTrip, 9.6/10 · Expedia",
    blurb: "4-star international chain overlooking Attur Lake — one of the higher-rated options nearby.",
    accent: "sky",
    mapQuery: "Clarion Hotel Bangalore, Attur Layout, Yelahanka, Bengaluru",
  },
  {
    name: "Ramada by Wyndham Bengaluru Yelahanka",
    area: "Doddaballapur Main Rd, Yelahanka",
    rating: "4.0/5 · TripAdvisor",
    blurb: "Upscale chain hotel with pool and gym; praised for spacious rooms.",
    accent: "coral",
    mapQuery: "Ramada by Wyndham Bengaluru Yelahanka",
  },
  {
    name: "Royal Orchid Resort & Convention Centre",
    area: "Allalasandra, near Jakkur Flying Club, Yelahanka",
    rating: "4.0/5 · TripAdvisor, 4.1/5 · Justdial",
    blurb: "8-acre resort with a convention centre, pool and gardens — good for larger family groups.",
    accent: "pink",
    mapQuery: "Royal Orchid Resort and Convention Centre, Jakkur Flying Club, Yelahanka, Bengaluru",
  },
  {
    name: "Ramanashree California Resort",
    area: "Doddaballapur Road, Yelahanka",
    rating: "3.9/5 · Justdial, 7.1/10 · Agoda",
    blurb: "Resort-style stay with a pool and sports courts; also a popular event venue.",
    accent: "amber",
    mapQuery: "Ramanashree California Resort, Doddaballapur Road, Yelahanka, Bengaluru",
  },
  {
    name: "Park Inn & Suites by Radisson",
    area: "Singanayakanahalli, Doddaballapur Main Rd, Yelahanka",
    rating: null,
    blurb: "International Radisson-group brand, roughly 15 min from Yelahanka rail station.",
    accent: "sky",
    mapQuery: "Park Inn and Suites by Radisson Bengaluru Yelahanka, Singanayakanahalli, Doddaballapur Road, Bengaluru",
  },
  {
    name: "Chairman's Resort",
    area: "Jakkur Main Road, Navya Nagar",
    rating: null,
    blurb: "Garden resort with a spa, rooftop terrace and tennis courts — quieter, resort-like feel.",
    accent: "mint",
    mapQuery: "Chairman's Resort, Jakkur Main Road, Bengaluru",
  },
  {
    name: "Liwa Habitat",
    area: "Opposite Jakkur Aerodrome, Yashodanagar",
    rating: "4.0/5 · TripAdvisor, 3.9/5 · Justdial",
    blurb: "3-star hotel with complimentary breakfast — good value for a Jakkur/Yelahanka stay.",
    accent: "violet",
    mapQuery: "Liwa Habitat, Opposite Jakkur Aerodrome, Bengaluru",
  },
  {
    name: "Liwa – The Transit Hotel",
    area: "Near GKVK / L&T, opp. Jakkur Aerodrome",
    rating: null,
    blurb: "Sister property to Liwa Habitat — 52 AC rooms, airport/transit-style stay right by Jakkur.",
    accent: "sky",
    mapQuery: "Liwa The Transit Hotel, Jakkur Aerodrome Road, Bengaluru",
  },
  {
    name: "Blue Spring Hotels and Resort",
    area: "Singanayakanahalli, Doddaballapur Road, Yelahanka",
    rating: "3.9/5 · Justdial",
    blurb: "3-star resort with a pool and greenery; some reviews flag inconsistent housekeeping.",
    accent: "coral",
    mapQuery: "Blue Spring Hotels and Resort, Singanayakanahalli, Doddaballapur Road, Yelahanka, Bengaluru",
  },
  {
    name: "Silverkey Hotel Yelahanka",
    area: "Attur Layout / Yelahanka New Town",
    rating: "3.9/5 · Justdial",
    blurb: "Small 24-room budget hotel, straightforward stay near Yelahanka New Town.",
    accent: "amber",
    mapQuery: "Silverkey Hotel Yelahanka, Attur Layout, Yelahanka, Bengaluru",
  },
  {
    name: "FabHotel Rotano Suites",
    area: "B.B. Main Road, Yelahanka Old Town",
    rating: "6.5/10 · Booking.com",
    blurb: "Budget chain hotel; guests note clean, quiet rooms and good value.",
    accent: "pink",
    mapQuery: "FabHotel Rotano Suites, Yelahanka Old Town, Bengaluru",
  },
  {
    name: "FabHotel Ample Premium Suites",
    area: "Vinayaka Nagar, Bagalur Cross, near IAF post, Yelahanka",
    rating: null,
    blurb: "Budget chain option right by Bagalur Cross, close to the airport-road side of campus.",
    accent: "violet",
    mapQuery: "FabHotel Ample Premium Suites, Bagalur Cross, Yelahanka, Bengaluru",
  },
  {
    name: "Premium Hoppers Stop",
    area: "UVAS BGS Layout, Jakkur Main Road",
    rating: "4.1/5 · Justdial",
    blurb: "Small 19-room apartment-style budget hotel right on Jakkur Main Road.",
    accent: "mint",
    mapQuery: "Premium Hoppers Stop, Jakkur Main Road, Bengaluru",
  },
  {
    name: "Royal Ace Boutique Hotel",
    area: "Bagalur Cross / Air Force Station Road, Yelahanka",
    rating: "4.7/5 · Justdial, 8.1/10 · Booking.com",
    blurb: "Boutique hotel convenient for airport-side travel — reviews vary a lot by platform.",
    accent: "sky",
    mapQuery: "Royal Ace Boutique Hotel, Bagalur Cross, Yelahanka, Bengaluru",
  },
  {
    name: "Keerthis Royal Suites",
    area: "Vidyanagar Cross, Chikkajala, Yelahanka",
    rating: "8.1/10 · Booking.com",
    blurb: "Further north toward the airport road — a fallback if closer hotels are full.",
    accent: "coral",
    mapQuery: "Keerthis Royal Suites, Chikkajala, Yelahanka, Bengaluru",
  },
];

export default function Stay() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <span className="text-4xl inline-block animate-popIn">🏨</span>
      <h1 className="font-display text-3xl mt-3 animate-riseIn">Where Parents Can Stay</h1>
      <p className="mt-2 animate-riseIn max-w-2xl" style={{ color: "var(--ink-soft)", animationDelay: ".08s" }}>
        Hotels, resorts and homestays in the Yelahanka/Jakkur area, near campus, for move-in day or visiting weekends. Ratings are pulled from booking sites and change often, and vary a lot between platforms — tap through to confirm current details before booking.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-6">
        {HOTELS.map((h, i) => (
          <div
            key={h.name}
            className="rounded-2xl p-6 relative overflow-hidden animate-riseIn"
            style={{ background: "var(--surface)", boxShadow: "var(--shadow-card)", animationDelay: `${i * 0.05}s` }}
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20" style={{ background: `var(--${h.accent})` }} />
            <div className="relative">
              <h2 className="font-display text-xl leading-tight">{h.name}</h2>
              <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>📍 {h.area}</p>
              {h.rating && (
                <span
                  className="inline-block mt-2 text-xs font-extrabold rounded-full px-2.5 py-1"
                  style={{ background: `color-mix(in srgb, var(--${h.accent}) 20%, transparent)`, color: `var(--${h.accent}-ink)` }}
                >
                  ★ {h.rating}
                </span>
              )}
              <p className="text-sm mt-3" style={{ color: "var(--ink-soft)" }}>{h.blurb}</p>
              <div className="mt-4 flex items-center justify-end">
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
        <b>Why no prices?</b> Room rates change constantly and differ by season, booking site, and room type, so a fixed number here would go stale fast. Tap "Directions" to open Google Maps, then check the hotel's own site or a booking platform for current rates.
      </div>

      <p className="mt-6 text-xs text-center" style={{ color: "var(--ink-soft)" }}>
        Ratings sourced from TripAdvisor, Justdial, Booking.com, MakeMyTrip, and Agoda listings — always double-check current details before booking. Not an endorsement of any property.
      </p>
    </div>
  );
}
