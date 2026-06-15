import { useEffect, useState } from "react";
import {
  reverseGeocode, wikiSummary, wikiNearby, getWeather, getCountry,
  WEATHER_CODE, type PlaceHit, type Country, type Weather, type WikiSummary,
} from "@/lib/atlas/api";
import { Loader2, MapPin, Globe2, Cloud, Languages, Coins, Users, Ruler, ExternalLink, Plus } from "lucide-react";

type Props = {
  place: PlaceHit | null;
  onAddTrail: (p: PlaceHit) => void;
  onPick: (p: PlaceHit) => void;
};

export default function RightPanel({ place, onAddTrail, onPick }: Props) {
  const [resolved, setResolved] = useState<PlaceHit | null>(null);
  const [wiki, setWiki] = useState<WikiSummary | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [nearby, setNearby] = useState<{ title: string; dist: number; lat: number; lng: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!place) return;
    const ctrl = new AbortController();
    setLoading(true); setWiki(null); setWeather(null); setCountry(null); setNearby([]); setResolved(null);

    (async () => {
      // resolve precise name if it came from a click
      let p = place;
      if (place.kind === "click") {
        const r = await reverseGeocode(place.lat, place.lng, ctrl.signal);
        if (r) p = r;
      }
      setResolved(p);

      const [w, wx, nb] = await Promise.all([
        wikiSummary(p.name, ctrl.signal).catch(() => null),
        getWeather(p.lat, p.lng, ctrl.signal).catch(() => null),
        wikiNearby(p.lat, p.lng, ctrl.signal).catch(() => []),
      ]);
      setWiki(w); setWeather(wx); setNearby(nb);
      if (p.countryCode) {
        const c = await getCountry(p.countryCode, ctrl.signal).catch(() => null);
        setCountry(c);
      }
      setLoading(false);
    })();

    return () => ctrl.abort();
  }, [place]);

  if (!place) {
    return (
      <aside className="h-full bg-panel border-l border-line p-6 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Location Intelligence</div>
        <p className="font-serif text-xl leading-snug text-muted-foreground">
          Nothing selected. The map is waiting. Click a country, a coast, a dot in the middle of nowhere — and a dossier will appear here.
        </p>
        <div className="mt-8 border-t border-line-soft pt-4 space-y-2 font-mono text-[10px] text-muted-foreground">
          <p><span className="text-accent">tip</span> — clicks reverse-geocode through OpenStreetMap.</p>
          <p><span className="text-accent">tip</span> — facts come from Wikipedia, Open-Meteo, REST Countries, USGS.</p>
          <p><span className="text-accent">tip</span> — no Google. No API keys. Just open data.</p>
        </div>
      </aside>
    );
  }

  const p = resolved ?? place;

  return (
    <aside className="h-full bg-panel border-l border-line overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-line">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <MapPin className="size-3" /> {p.kind}
          {country && <span className="ml-auto text-base leading-none">{country.flag}</span>}
        </div>
        <h2 className="font-serif text-3xl leading-tight mt-1.5">{p.name}</h2>
        <div className="font-mono text-[10px] text-muted-foreground mt-1 truncate">{p.displayName}</div>
        <div className="font-mono text-[10px] text-muted-foreground mt-2 flex gap-3">
          <span>{p.lat.toFixed(4)}°, {p.lng.toFixed(4)}°</span>
          {weather && <span>· {weather.timezone}</span>}
        </div>
        <button
          onClick={() => onAddTrail(p)}
          className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
        >
          <Plus className="size-3" /> add to trail
        </button>
      </div>

      {loading && (
        <div className="px-5 py-6 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> gathering everything we know about this place…
        </div>
      )}

      {/* Wikipedia extract */}
      {wiki && (
        <section className="px-5 py-4 border-b border-line">
          <div className="flex items-start gap-3">
            {wiki.thumbnail && (
              <img src={wiki.thumbnail} alt="" className="w-20 h-20 object-cover border border-line grayscale-[0.2]" />
            )}
            <div className="flex-1">
              <p className="font-serif text-[15px] leading-snug">{wiki.extract}</p>
              <a href={wiki.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 font-mono text-[10px] text-accent hover:underline">
                read more on Wikipedia <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Weather */}
      {weather && (
        <section className="px-5 py-4 border-b border-line">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            <Cloud className="size-3" /> Right now
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Temperature" value={`${Math.round(weather.tempC)}°C`} />
            <Stat label="Conditions" value={WEATHER_CODE[weather.code] ?? "—"} />
            <Stat label="Wind" value={`${Math.round(weather.windKph)} km/h`} />
          </div>
        </section>
      )}

      {/* Country */}
      {country && (
        <section className="px-5 py-4 border-b border-line">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            <Globe2 className="size-3" /> {country.name} · {country.subregion ?? country.region}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Population" icon={<Users className="size-3" />} value={fmtPop(country.population)} />
            <Stat label="Area" icon={<Ruler className="size-3" />} value={`${fmtPop(country.area)} km²`} />
            <Stat label="Capital" value={country.capital ?? "—"} />
            <Stat label="Drives on" value={country.drives} />
            <Stat label="Languages" icon={<Languages className="size-3" />} value={country.languages.slice(0, 3).join(" · ") || "—"} />
            <Stat label="Currency" icon={<Coins className="size-3" />} value={country.currencies[0] ?? "—"} />
          </div>
        </section>
      )}

      {/* Nearby connections */}
      {nearby.length > 0 && (
        <section className="px-5 py-4 border-b border-line">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Nearby, on the record
          </div>
          <ul className="divide-y divide-line-soft">
            {nearby.slice(0, 10).map((n) => (
              <li key={n.title}>
                <button
                  onClick={() => onPick({ id: n.title, name: n.title, displayName: n.title, kind: "wiki", lat: n.lat, lng: n.lng })}
                  className="w-full text-left py-1.5 group flex items-baseline gap-3"
                >
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums w-12">{Math.round(n.dist)}m</span>
                  <span className="text-sm group-hover:text-accent">{n.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && !wiki && !weather && !country && (
        <div className="px-5 py-6 font-mono text-[10px] text-muted-foreground italic">
          Sparse data for this exact point. Try zooming in or clicking a nearby labeled place.
        </div>
      )}
    </aside>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="border-l-2 border-line pl-2.5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="text-sm mt-0.5 leading-tight">{value}</div>
    </div>
  );
}

function fmtPop(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + " k";
  return String(n);
}
