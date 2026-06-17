import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPlaces, SEEDS, type PlaceHit } from "@/lib/paths/api";
import { Search, Compass, Sparkles, Route as RouteIcon, X, Home, Layers } from "lucide-react";
import { useUIStore } from "@/lib/paths/UIStore";
import { motion, AnimatePresence } from "framer-motion";

export default function LeftPanel() {
  const {
    handlePick,
    setHover,
    trail,
    clearTrail,
    setNavOpen,
    omniscienceLayer,
    setOmniscienceLayer,
    homePlace,
  } = useUIStore();
  const [q, setQ] = useState("");

  const { data: rawHits = [], isLoading: loading } = useQuery({
    queryKey: ["search", q],
    queryFn: async ({ signal }) => {
      return searchPlaces(q, signal);
    },
    enabled: q.trim().length > 0,
    staleTime: 60_000,
  });

  const hits = rawHits as any[];

  return (
    <aside className="flex flex-col h-full bg-panel border-r border-line overflow-hidden">
      {/* Wordmark */}
      <header className="px-4 pt-4 pb-3 border-b border-line">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-2xl tracking-tight leading-none">
            PaTHs<span className="text-accent">.</span>
          </h1>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            v.0 · open earth
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-2 leading-relaxed">
          A reading room for the planet. Click anywhere — the world will tell you about itself.
        </p>
      </header>

      {/* Search */}
      <div className="px-4 py-3 border-b border-line">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a place, river, mountain…"
            className="w-full bg-background border border-line pl-8 pr-7 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
            {homePlace && (
              <button
                onClick={() => handlePick(homePlace)}
                className="p-1 rounded text-orange-500 hover:text-orange-400 bg-orange-500/10"
                title={`Go to Home: ${homePlace.name}`}
              >
                <Home className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="font-mono text-[10px] text-muted-foreground mt-2">indexing…</div>
        )}

        {hits.length > 0 && (
          <div className="mt-2">
            <ul className="max-h-64 overflow-y-auto border border-line-soft divide-y divide-line-soft overflow-x-hidden">
              <AnimatePresence>
                {hits.map((h) => (
                  <motion.li
                    key={h.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button
                      onClick={() => {
                        handlePick(h);
                        setQ("");
                      }}
                      onMouseEnter={() => setHover(h)}
                      onMouseLeave={() => setHover(null)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 transition-colors group flex items-start gap-2"
                    >
                      <span className="text-muted-foreground group-hover:text-accent mt-0.5">
                        •
                      </span>
                      <div>
                        <div className="font-serif leading-tight">{h.name}</div>
                        <div className="font-mono text-[9px] text-muted-foreground mt-0.5 truncate max-w-[240px] uppercase tracking-widest">
                          {h.displayName}
                        </div>
                        {h.reason && (
                          <div className="font-mono text-[9px] text-muted-foreground mt-1.5 leading-snug border-l-2 border-accent/50 pl-2">
                            {h.reason}
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </div>

      {/* Omniscience Layer */}
      {omniscienceLayer && (
        <div className="px-4 py-3 border-b border-line bg-accent/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
              <Layers className="size-3" /> Custom Layer
            </div>
            <button
              onClick={() => setOmniscienceLayer(null)}
              className="font-mono text-[10px] text-muted-foreground hover:text-cinnabar"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="text-sm font-serif leading-snug text-accent mb-2">
            "{omniscienceLayer.title}"
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            {omniscienceLayer.places.length} AI-plotted locations actively rendering on the map.
          </div>
        </div>
      )}

      {/* Trail */}
      <div className="px-4 py-3 border-b border-line">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Compass className="size-3" /> Exploration Trail
          </div>
          {trail.length > 0 && (
            <button
              onClick={clearTrail}
              className="font-mono text-[10px] text-muted-foreground hover:text-cinnabar"
            >
              clear
            </button>
          )}
        </div>
        {trail.length === 0 ? (
          <p className="font-mono text-[10px] text-muted-foreground italic">
            No steps yet. Click somewhere on Earth.
          </p>
        ) : (
          <ol className="space-y-1">
            {trail.map((p, i) => (
              <li key={`${p.id}-${i}`} className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-accent mt-0.5 w-5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  onClick={() => handlePick(p)}
                  className="text-sm text-left hover:text-accent leading-tight"
                >
                  {p.name}
                  <span className="block font-mono text-[10px] text-muted-foreground">
                    {p.kind}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Discovery seeds */}
      <div className="px-4 py-3 border-b border-line">
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          <Sparkles className="size-3" /> If you don't know where to start
        </div>
        <ul className="space-y-1.5">
          {SEEDS.slice(0, 6).map((s) => (
            <li key={s.name}>
              <button
                onClick={() =>
                  handlePick({
                    id: s.name,
                    name: s.name,
                    displayName: s.name,
                    kind: "curiosity",
                    lat: s.lat,
                    lng: s.lng,
                  })
                }
                className="w-full text-left group"
              >
                <div className="text-sm leading-tight group-hover:text-accent">{s.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground italic">{s.note}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigate */}
      <div className="mt-auto px-4 py-3 border-t border-line">
        <button
          onClick={() => setNavOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 bg-background border border-line hover:border-accent hover:text-accent transition-colors"
        >
          <span className="flex items-center gap-2 text-sm">
            <RouteIcon className="size-3.5" /> Navigate between two points
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">A → B</span>
        </button>
      </div>
    </aside>
  );
}
