// All free APIs — no keys required.
// Nominatim (OSM) for search + reverse geocode
// Wikipedia REST for summaries
// Open-Meteo for weather + timezone
// REST Countries for country data
// USGS for earthquakes
// OSRM public for routing

export type LatLng = { lat: number; lng: number };

export type PlaceHit = {
  id: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  kind: string;
  countryCode?: string;
  bbox?: [number, number, number, number]; // [w, s, e, n]
};

const UA = { "Accept-Language": "en" };

export async function searchPlaces(q: string, signal?: AbortSignal): Promise<PlaceHit[]> {
  if (!q.trim()) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: UA, signal });
  const j = await r.json();
  return (j as any[]).map((h) => ({
    id: String(h.place_id),
    name: h.name || h.display_name.split(",")[0],
    displayName: h.display_name,
    lat: parseFloat(h.lat),
    lng: parseFloat(h.lon),
    kind: h.type || h.category || "place",
    countryCode: h.address?.country_code?.toUpperCase(),
    bbox: h.boundingbox
      ? [
          parseFloat(h.boundingbox[2]),
          parseFloat(h.boundingbox[0]),
          parseFloat(h.boundingbox[3]),
          parseFloat(h.boundingbox[1]),
        ]
      : undefined,
  }));
}

export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<PlaceHit | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&lat=${lat}&lon=${lng}`;
  const r = await fetch(url, { headers: UA, signal });
  if (!r.ok) return null;
  const h = await r.json();
  if (!h || h.error) return null;
  const addr = h.address || {};
  const name =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.county ||
    addr.state ||
    addr.country ||
    h.name ||
    "Unknown";
  return {
    id: String(h.place_id),
    name,
    displayName: h.display_name,
    lat: parseFloat(h.lat),
    lng: parseFloat(h.lon),
    kind: h.type || "place",
    countryCode: addr.country_code?.toUpperCase(),
  };
}

export type WikiSummary = {
  title: string;
  extract: string;
  thumbnail?: string;
  url: string;
};

export async function wikiSummary(
  title: string,
  signal?: AbortSignal,
): Promise<WikiSummary | null> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const r = await fetch(url, { signal });
  if (!r.ok) return null;
  const j = await r.json();
  if (j.type === "disambiguation" || !j.extract) return null;
  return {
    title: j.title,
    extract: j.extract,
    thumbnail: j.thumbnail?.source,
    url: j.content_urls?.desktop?.page,
  };
}

export async function wikiNearby(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<{ title: string; dist: number; lat: number; lng: number }[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lng}&gsradius=10000&gslimit=15&format=json&origin=*`;
  const r = await fetch(url, { signal });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.query?.geosearch || []).map((g: any) => ({
    title: g.title,
    dist: g.dist,
    lat: g.lat,
    lng: g.lon,
  }));
}

export type Weather = {
  tempC: number;
  windKph: number;
  code: number;
  timezone: string;
  utcOffset: number;
  isDay: boolean;
};

export async function getWeather(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<Weather | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,weather_code,is_day&timezone=auto`;
  const r = await fetch(url, { signal });
  if (!r.ok) return null;
  const j = await r.json();
  const c = j.current;
  return {
    tempC: c.temperature_2m,
    windKph: c.wind_speed_10m,
    code: c.weather_code,
    timezone: j.timezone,
    utcOffset: j.utc_offset_seconds,
    isDay: !!c.is_day,
  };
}

export type Country = {
  cca2: string;
  name: string;
  official: string;
  capital?: string;
  region: string;
  subregion?: string;
  population: number;
  area: number;
  languages: string[];
  currencies: string[];
  flag: string;
  borders: string[];
  drives: string;
  timezones: string[];
};

const countryCache = new Map<string, Country>();

export async function getCountry(cca2: string, signal?: AbortSignal): Promise<Country | null> {
  const key = cca2.toUpperCase();
  if (countryCache.has(key)) return countryCache.get(key)!;

  try {
    const r = await fetch("/countries.json", { signal });
    if (!r.ok) return null;

    const data = await r.json();

    // Cache all countries for subsequent lookups
    for (const [k, v] of Object.entries(data)) {
      countryCache.set(k, v as Country);
    }

    return countryCache.get(key) || null;
  } catch (err) {
    console.error("Failed to load countries:", err);
    return null;
  }
}

export type Quake = {
  id: string;
  mag: number;
  place: string;
  time: number;
  lat: number;
  lng: number;
  depth: number;
};

export async function getQuakes(): Promise<Quake[]> {
  const r = await fetch(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson",
  );
  if (!r.ok) return [];
  const j = await r.json();
  return (j.features || []).map((f: any) => ({
    id: f.id,
    mag: f.properties.mag,
    place: f.properties.place,
    time: f.properties.time,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    depth: f.geometry.coordinates[2],
  }));
}

export async function getRoute(
  a: LatLng,
  b: LatLng,
  mode: "driving" | "walking" | "cycling" = "driving",
) {
  const profile = mode === "driving" ? "car" : mode === "walking" ? "foot" : "bike";
  const url = `https://routing.openstreetmap.de/routed-${profile}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson&steps=true`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const rt = j.routes?.[0];
  if (!rt) return null;
  return {
    geometry: rt.geometry as { type: "LineString"; coordinates: [number, number][] },
    distance: rt.distance as number,
    duration: rt.duration as number,
    steps: (rt.legs?.[0]?.steps || []).map((s: any) => ({
      instruction: `${s.maneuver.type}${s.name ? " onto " + s.name : ""}`,
      distance: s.distance,
    })),
  };
}

export type POI = {
  id: number;
  lat: number;
  lng: number;
  name: string;
  category: string;
  tags: Record<string, string>;
};

export async function getPOIs(
  bounds: { _sw: LatLng; _ne: LatLng },
  category: "restaurants" | "gas_stations" | "hotels" | "atms",
): Promise<POI[]> {
  const queryMap = {
    restaurants: `["amenity"~"restaurant|cafe|fast_food"]`,
    gas_stations: `["amenity"="fuel"]`,
    hotels: `["tourism"~"hotel|motel|hostel"]`,
    atms: `["amenity"~"atm|bank"]`,
  };

  const query = `
    [out:json][timeout:10];
    (
      nwr${queryMap[category]}(${bounds._sw.lat},${bounds._sw.lng},${bounds._ne.lat},${bounds._ne.lng});
    );
    out center;
  `;

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.osm.ch/api/interpreter",
  ];

  for (const endpoint of endpoints) {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    try {
      const r = await fetch(url);
      if (!r.ok) continue; // Try next endpoint
      const j = await r.json();
      return (j.elements || [])
        .filter((e: any) => e.tags)
        .map((e: any) => ({
          id: e.id,
          lat: e.lat || e.center?.lat,
          lng: e.lon || e.center?.lon,
          name: e.tags.name || e.tags.brand || e.tags.operator || category.replace("_", " "),
          category,
          tags: e.tags,
        }))
        .filter((e: any) => e.lat && e.lng);
    } catch (err) {
      console.error(`Failed to fetch POIs from ${endpoint}:`, err);
      // Try next endpoint
    }
  }
  return [];
}

export const WEATHER_CODE: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Showers",
  81: "Heavy showers",
  82: "Violent showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Storm w/ hail",
  99: "Severe storm",
};

// Curiosity seeds — random places to explore on first load
export const SEEDS: { name: string; lat: number; lng: number; note: string }[] = [
  { name: "Socotra", lat: 12.46, lng: 53.82, note: "Alien botany in the Arabian Sea" },
  { name: "Svalbard", lat: 78.22, lng: 15.65, note: "Where the seed vault lives" },
  { name: "Timbuktu", lat: 16.77, lng: -3.0, note: "Manuscripts older than empires" },
  { name: "Pitcairn Island", lat: -25.07, lng: -130.1, note: "Population: ~50" },
  { name: "Kowloon, Hong Kong", lat: 22.31, lng: 114.18, note: "Densest place that ever was" },
  { name: "Hashima Island", lat: 32.63, lng: 129.73, note: "An abandoned coal city" },
  { name: "Ittoqqortoormiit", lat: 70.48, lng: -21.97, note: "Hardest town to reach in Greenland" },
  { name: "Tristan da Cunha", lat: -37.1, lng: -12.28, note: "Most remote inhabited archipelago" },
  { name: "Yakutsk", lat: 62.03, lng: 129.73, note: "Coldest city on Earth" },
  { name: "La Rinconada", lat: -14.63, lng: -69.45, note: "Highest permanent settlement" },
];
