import { useEffect, useState } from "react";
import { searchPlaces, type PlaceHit, SEEDS } from "@/lib/atlas/api";
import { Search, Compass, Sparkles, Route as RouteIcon, X } from "lucide-react";

type Props = {
  onPick: (p: PlaceHit) => void;
  onHover: (p: PlaceHit | null) => void;
  trail: PlaceHit[];
  onClearTrail: () => void;
  onOpenNav: () => void;
};

export default function LeftPanel({ onPick, onHover, trail, onClearTrail, onOpenNav }: Props) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setHits([]); return; }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await searchPlaces(q, ctrl.signal);
        setHits(r);
      } catch {}
      setLoading(false);
    }, 280);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  return (
    <aside className="flex flex-col h-full bg-panel border-r border-line overflow-hidden">
      {/* Wordmark */}
      <header className="px-4 pt-4 pb-3 border-b border-line">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-2xl tracking-tight leading-none">
            Atlas<span className="text-accent">.</span>
          </h1>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">v.0 · open earth</span>
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
          {q && <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button>}
        </div>

        {loading && <div className="font-mono text-[10px] text-muted-foreground mt-2">indexing…</div>}

        {hits.length > 0 && (
          <ul className="mt-2 max-h-64 overflow-y-auto border border-line-soft divide-y divide-line-soft">
            {hits.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => { onPick(h); setHits([]); setQ(""); }}
                  onMouseEnter={() => onHover(h)}
                  onMouseLeave={() => onHover(null)}
                  className="w-full text-left px-2.5 py-2 hover:bg-panel-2 group"
                >
                  <div className="text-sm leading-tight">{h.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate mt-0.5">
                    <span className="text-accent">{h.kind}</span> · {h.displayName}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Trail */}
      <div className="px-4 py-3 border-b border-line">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Compass className="size-3" /> Exploration Trail
          </div>
          {trail.length > 0 && (
            <button onClick={onClearTrail} className="font-mono text-[10px] text-muted-foreground hover:text-cinnabar">clear</button>
          )}
        </div>
        {trail.length === 0 ? (
          <p className="font-mono text-[10px] text-muted-foreground italic">No steps yet. Click somewhere on Earth.</p>
        ) : (
          <ol className="space-y-1">
            {trail.map((p, i) => (
              <li key={`${p.id}-${i}`} className="flex items-start gap-2">
                <span className="font-mono text-[10px] text-accent mt-0.5 w-5 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <button onClick={() => onPick(p)} className="text-sm text-left hover:text-accent leading-tight">
                  {p.name}
                  <span className="block font-mono text-[10px] text-muted-foreground">{p.kind}</span>
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
                onClick={() => onPick({ id: s.name, name: s.name, displayName: s.name, kind: "curiosity", lat: s.lat, lng: s.lng })}
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
          onClick={onOpenNav}
          className="w-full flex items-center justify-between px-3 py-2 bg-background border border-line hover:border-accent hover:text-accent transition-colors"
        >
          <span className="flex items-center gap-2 text-sm"><RouteIcon className="size-3.5" /> Navigate between two points</span>
          <span className="font-mono text-[10px] text-muted-foreground">A → B</span>
        </button>
      </div>
    </aside>
  );
}
