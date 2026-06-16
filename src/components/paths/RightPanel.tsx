import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  reverseGeocode, wikiSummary, wikiNearby, getWeather, getCountry,
  WEATHER_CODE, type PlaceHit, type Country, type Weather, type WikiSummary,
} from "@/lib/paths/api";
import { Loader2, MapPin, Globe2, Cloud, Languages, Coins, Users, Ruler, ExternalLink, Plus, BrainCircuit, Zap, Network, Home, Pencil, Check, Eye } from "lucide-react";
import { useUIStore } from "@/lib/paths/UIStore";
import { generateLocationDeepDive, generateVibeCheck, findConnectedPlaces } from "@/lib/paths/ai";
import { motion, AnimatePresence } from "framer-motion";

export default function RightPanel() {
  const [isEditingHome, setIsEditingHome] = useState(false);
  const [editName, setEditName] = useState("");
  const { 
    selected: place, handlePick, addToTrail, connections, setConnections, setHover, 
    homePlace, setHomePlace, savedLists, saveToList, removeFromList, reviews, addReview 
  } = useUIStore();

  const [reviewText, setReviewText] = useState("");
  const [selectedList, setSelectedList] = useState("Favorites");

  useEffect(() => {
    setIsEditingHome(false);
  }, [place?.id]);

  const { data: resolved, isLoading: isGeocoding } = useQuery({
    queryKey: ["geocode", place?.lat, place?.lng],
    queryFn: ({ signal }) => reverseGeocode(place!.lat, place!.lng, signal),
    enabled: place?.kind === "click",
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (resolved && place?.kind === "click" && resolved.id !== place.id) {
      const merged = { ...resolved, lat: place.lat, lng: place.lng };
      useUIStore.getState().setSelected(merged);
      useUIStore.setState(state => {
        const trail = [...state.trail];
        const idx = trail.findIndex(t => t.id === place.id);
        if (idx !== -1) {
          trail[idx] = merged;
          localStorage.setItem("trail", JSON.stringify(trail));
        }
        return { trail };
      });
    }
  }, [resolved, place]);

  const p = place;

  const { data: wiki, isLoading: isWikiLoading } = useQuery({
    queryKey: ["wiki", p?.name],
    queryFn: ({ signal }) => wikiSummary(p!.name, signal),
    enabled: !!p?.name,
    staleTime: 24 * 60 * 60 * 1000,
  });
  
  const { data: weather, isLoading: isWeatherLoading } = useQuery({
    queryKey: ["weather", p?.lat, p?.lng],
    queryFn: ({ signal }) => getWeather(p!.lat, p!.lng, signal),
    enabled: !!p,
    staleTime: 10 * 60 * 1000,
  });
  
  const { data: nearby = [], isLoading: isNearbyLoading } = useQuery({
    queryKey: ["nearby", p?.lat, p?.lng],
    queryFn: ({ signal }) => wikiNearby(p!.lat, p!.lng, signal),
    enabled: !!p,
    staleTime: 24 * 60 * 60 * 1000,
  });
  
  const { data: country, isLoading: isCountryLoading } = useQuery({
    queryKey: ["country", p?.countryCode],
    queryFn: ({ signal }) => getCountry(p!.countryCode!, signal),
    enabled: !!p?.countryCode,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: deepDive, isLoading: isDeepDiveLoading, isFetching: isDeepDiveFetching, refetch: fetchDeepDive } = useQuery({
    queryKey: ["deepDive", p?.lat, p?.lng, p?.name],
    queryFn: () => generateLocationDeepDive({ data: { name: p!.name, lat: p!.lat, lng: p!.lng } }),
    enabled: false,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const { data: vibeCheck, isFetching: isVibeFetching, refetch: fetchVibeCheck } = useQuery({
    queryKey: ["vibeCheck", p?.lat, p?.lng, p?.name],
    queryFn: () => generateVibeCheck({ data: { name: p!.name, lat: p!.lat, lng: p!.lng } }),
    enabled: false,
    staleTime: 60 * 1000, // vibes change fast!
  });

  const { isFetching: isConnectionsFetching, refetch: fetchConnections } = useQuery({
    queryKey: ["connections", p?.lat, p?.lng, p?.name],
    queryFn: async () => {
      const res = await findConnectedPlaces({ data: { name: p!.name, lat: p!.lat, lng: p!.lng } });
      setConnections(res);
      return res;
    },
    enabled: false,
  });

  const loading = isGeocoding || isWikiLoading || isWeatherLoading || isNearbyLoading || isCountryLoading;

  if (!place) {
    return (
      <aside className="h-full bg-panel border-l border-line p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Location Intelligence</div>
          <p className="font-serif text-xl leading-snug text-muted-foreground">
            Nothing selected. The map is waiting. Click a country, a coast, a dot in the middle of nowhere — and a dossier will appear here.
          </p>
          <div className="mt-8 border-t border-line-soft pt-4 space-y-2 font-mono text-[10px] text-muted-foreground">
            <p><span className="text-accent">tip</span> — clicks reverse-geocode through OpenStreetMap.</p>
            <p><span className="text-accent">tip</span> — facts come from Wikipedia, Open-Meteo, REST Countries, USGS.</p>
            <p><span className="text-accent">tip</span> — no Google. No API keys. Just open data.</p>
          </div>
        </motion.div>
      </aside>
    );
  }

  if (!p) return null;

  return (
    <aside className="h-full bg-panel border-l border-line overflow-y-auto flex flex-col relative">
      <AnimatePresence mode="wait">
        <motion.div 
          key={p?.id || "loading"}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full"
        >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-line">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <MapPin className="size-3" /> {p.kind}
          {country && <span className="ml-auto text-base leading-none">{country.flag}</span>}
        </div>
        {isEditingHome && homePlace?.id === p.id ? (
          <div className="flex items-center gap-2 mt-1.5">
            <input 
              className="font-serif text-3xl leading-tight bg-transparent border-b border-line focus:outline-none focus:border-accent w-full"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setHomePlace({ ...homePlace, name: editName });
                  setIsEditingHome(false);
                } else if (e.key === 'Escape') {
                  setIsEditingHome(false);
                }
              }}
              autoFocus
            />
            <button onClick={() => {
              setHomePlace({ ...homePlace, name: editName });
              setIsEditingHome(false);
            }} className="text-accent hover:text-orange-500">
              <Check className="size-5" />
            </button>
          </div>
        ) : (
          <h2 className="font-serif text-3xl leading-tight mt-1.5 flex items-center gap-2 group">
            {homePlace?.id === p.id ? homePlace.name : p.name}
            {homePlace?.id === p.id && (
              <button 
                onClick={() => {
                  setEditName(homePlace.name);
                  setIsEditingHome(true);
                }}
                title="Rename Home"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-accent"
              >
                <Pencil className="size-4" />
              </button>
            )}
          </h2>
        )}
        <div className="font-mono text-[10px] text-muted-foreground mt-1 truncate">{p.displayName}</div>
        <div className="font-mono text-[10px] text-muted-foreground mt-2 flex gap-3">
          <span>{p.lat.toFixed(4)}°, {p.lng.toFixed(4)}°</span>
          {weather && <span>· {weather.timezone}</span>}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={() => addToTrail(p!)}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
          >
            <Plus className="size-3" /> add to trail
          </button>
          
          <button
            onClick={() => {
              if (homePlace?.id === p!.id) setHomePlace(null);
              else setHomePlace(p!);
            }}
            className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest hover:underline ${homePlace?.id === p!.id ? 'text-orange-500' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Home className="size-3" /> {homePlace?.id === p!.id ? 'remove home' : 'set as home'}
          </button>

          <a
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${p.lat},${p.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:underline ml-2"
          >
            <Eye className="size-3" /> street view
          </a>
        </div>
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

      {/* Lists & Reviews (User Contributions) */}
      <section className="px-5 py-4 border-b border-line bg-panel-2">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Saved Places & Reviews</div>
        
        <div className="flex gap-2 mb-3">
          <select 
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            className="flex-1 bg-panel border border-line text-[11px] font-mono px-2 py-1.5 focus:outline-none focus:border-accent"
          >
            <option value="Favorites">Favorites</option>
            <option value="Want to Go">Want to Go</option>
          </select>
          <button 
            onClick={() => {
              saveToList(selectedList, p!, "Added from Right Panel");
            }}
            className="bg-accent text-accent-foreground px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:opacity-90"
          >
            Save
          </button>
        </div>

        {Object.entries(savedLists).map(([listName, items]) => {
          const item = items.find(i => i.place.id === p!.id);
          if (!item) return null;
          return (
            <div key={listName} className="flex items-center justify-between bg-panel border border-line px-3 py-2 mb-2 text-[11px] font-mono">
              <span className="text-accent">In {listName}</span>
              <button onClick={() => removeFromList(listName, p!.id)} className="text-muted-foreground hover:text-red-500">Remove</button>
            </div>
          );
        })}

        <div className="mt-4">
          <textarea
            placeholder="Write a review or private note..."
            className="w-full bg-panel border border-line text-[11px] font-mono p-2 mb-2 min-h-[60px] focus:outline-none focus:border-accent"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <button
            onClick={() => {
              if (reviewText.trim()) {
                addReview(p!.id, 5, reviewText);
                setReviewText("");
              }
            }}
            className="w-full bg-panel border border-line px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest hover:border-accent"
          >
            {reviews[p!.id] ? "Update Review" : "Post Review"}
          </button>
          
          {reviews[p!.id] && (
            <div className="mt-3 border-l-2 border-accent pl-3 py-1">
              <div className="text-[10px] font-mono text-muted-foreground mb-1">Your Review:</div>
              <div className="font-serif text-[13px]">{reviews[p!.id].text}</div>
            </div>
          )}
        </div>
      </section>

      {/* Atlas Synthesis (Deep Dive) & Vibe Check */}
      {(wiki || country) && (
        <section className="px-5 py-4 border-b border-line bg-accent/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
              <BrainCircuit className="size-3" /> Atlas Synthesis
            </div>
            <div className="flex gap-2">
              {!vibeCheck && !isVibeFetching && (
                <button 
                  onClick={() => fetchVibeCheck()}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-orange-500 border border-line hover:border-orange-500 px-2 py-0.5 flex items-center gap-1"
                >
                  <Zap className="size-3" /> Get Vibe
                </button>
              )}
              {connections.length === 0 && !isConnectionsFetching && (
                <button 
                  onClick={() => fetchConnections()}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-sky-500 border border-line hover:border-sky-500 px-2 py-0.5 flex items-center gap-1"
                >
                  <Network className="size-3" /> Graph
                </button>
              )}
              {!deepDive && !isDeepDiveFetching && (
                <button 
                  onClick={() => fetchDeepDive()}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent border border-line hover:border-accent px-2 py-0.5"
                >
                  Deep Dive
                </button>
              )}
            </div>
          </div>
          
          {isVibeFetching && (
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground my-2">
              <Loader2 className="size-3 animate-spin" /> Checking the pulse of the city…
            </div>
          )}
          {vibeCheck && (
            <div className="font-sans text-[13px] leading-relaxed text-orange-500/90 whitespace-pre-wrap mb-4 pl-3 border-l-2 border-orange-500/50">
              {vibeCheck}
            </div>
          )}

          {isDeepDiveFetching && (
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground my-2">
              <Loader2 className="size-3 animate-spin" /> Synthesizing planetary context…
            </div>
          )}
          {deepDive && (
            <div className="font-serif text-[14px] leading-relaxed text-foreground whitespace-pre-wrap mt-2">
              {deepDive}
            </div>
          )}

          {isConnectionsFetching && (
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground my-2">
              <Loader2 className="size-3 animate-spin" /> Mining knowledge graph connections…
            </div>
          )}
          {connections.length > 0 && (
            <div className="mt-4 border-t border-sky-500/20 pt-3">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-sky-500 mb-2">
                <Network className="size-3" /> Connected Places
              </div>
              <ul className="space-y-2">
                {connections.map((c) => (
                  <li key={c.name}>
                    <button
                      onClick={() => handlePick(c)}
                      onMouseEnter={() => setHover(c)}
                      onMouseLeave={() => setHover(null)}
                      className="w-full text-left group"
                    >
                      <div className="text-sm text-sky-500 group-hover:underline leading-tight">{c.name}</div>
                      <div className="font-sans text-[11px] text-muted-foreground mt-0.5 leading-snug">{c.reason}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
                  onClick={() => handlePick({ id: n.title, name: n.title, displayName: n.title, kind: "wiki", lat: n.lat, lng: n.lng })}
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
        </motion.div>
      </AnimatePresence>
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
