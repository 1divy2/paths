import { useEffect, useState } from "react";
import { searchPlaces, getRoute, type PlaceHit, type LatLng } from "@/lib/atlas/api";
import { X, ArrowDown, Car, PersonStanding, Bike, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onRoute: (r: { geometry: { type: "LineString"; coordinates: [number, number][] }; distance: number; duration: number; from: LatLng; to: LatLng } | null) => void;
};

export default function NavigationPanel({ open, onClose, onRoute }: Props) {
  const [from, setFrom] = useState<PlaceHit | null>(null);
  const [to, setTo] = useState<PlaceHit | null>(null);
  const [mode, setMode] = useState<"driving" | "walking" | "cycling">("driving");
  const [result, setResult] = useState<{ distance: number; duration: number; steps: { instruction: string; distance: number }[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setResult(null);
  }, [open]);

  const compute = async () => {
    if (!from || !to) return;
    setLoading(true);
    const r = await getRoute({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng }, mode);
    setLoading(false);
    if (!r) { onRoute(null); return; }
    setResult({ distance: r.distance, duration: r.duration, steps: r.steps });
    onRoute({ geometry: r.geometry, distance: r.distance, duration: r.duration, from: { lat: from.lat, lng: from.lng }, to: { lat: to.lat, lng: to.lng } });
  };

  if (!open) return null;

  return (
    <div className="absolute inset-y-0 left-0 z-30 w-[360px] bg-panel border-r border-line shadow-2xl flex flex-col">
      <header className="px-4 py-3 border-b border-line flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Navigation</div>
          <div className="font-serif text-xl leading-tight">A point to another point.</div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
      </header>

      <div className="p-4 space-y-3 border-b border-line">
        <PlaceField label="From" value={from} onChange={setFrom} dotClass="bg-jade" />
        <div className="flex justify-center"><ArrowDown className="size-3.5 text-muted-foreground" /></div>
        <PlaceField label="To" value={to} onChange={setTo} dotClass="bg-cinnabar" />

        <div className="flex border border-line">
          <ModeBtn active={mode === "driving"} onClick={() => setMode("driving")}><Car className="size-3.5" /> Drive</ModeBtn>
          <ModeBtn active={mode === "walking"} onClick={() => setMode("walking")}><PersonStanding className="size-3.5" /> Walk</ModeBtn>
          <ModeBtn active={mode === "cycling"} onClick={() => setMode("cycling")}><Bike className="size-3.5" /> Cycle</ModeBtn>
        </div>

        <button
          onClick={compute}
          disabled={!from || !to || loading}
          className="w-full bg-accent text-accent-foreground font-mono text-[11px] uppercase tracking-widest py-2 hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="size-3.5 animate-spin" />}
          plot route
        </button>
      </div>

      {result && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-3 border-b border-line grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Distance</div>
              <div className="font-serif text-2xl">{(result.distance / 1000).toFixed(1)} km</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Duration</div>
              <div className="font-serif text-2xl">{fmtDur(result.duration)}</div>
            </div>
          </div>
          <ol className="divide-y divide-line-soft">
            {result.steps.map((s, i) => (
              <li key={i} className="px-4 py-2 flex gap-3">
                <span className="font-mono text-[10px] text-accent tabular-nums w-6 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <div className="text-sm capitalize leading-tight">{s.instruction.replace(/_/g, " ")}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{s.distance < 1000 ? `${Math.round(s.distance)} m` : `${(s.distance / 1000).toFixed(1)} km`}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 font-mono text-[10px] uppercase tracking-widest py-2 flex items-center justify-center gap-1.5 ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function PlaceField({ label, value, onChange, dotClass }: { label: string; value: PlaceHit | null; onChange: (p: PlaceHit | null) => void; dotClass: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<PlaceHit[]>([]);

  useEffect(() => {
    if (!q.trim() || value?.name === q) { setHits([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try { setHits(await searchPlaces(q, ctrl.signal)); } catch {}
    }, 280);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q, value]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className={`size-2 rounded-full ${dotClass}`} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <input
        value={value ? value.name : q}
        onChange={(e) => { onChange(null); setQ(e.target.value); }}
        placeholder="Type a place…"
        className="w-full bg-background border border-line px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-accent"
      />
      {hits.length > 0 && (
        <ul className="mt-1 border border-line-soft divide-y divide-line-soft max-h-40 overflow-y-auto">
          {hits.map((h) => (
            <li key={h.id}>
              <button onClick={() => { onChange(h); setQ(""); setHits([]); }} className="w-full text-left px-2 py-1.5 hover:bg-panel-2">
                <div className="text-sm">{h.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground truncate">{h.displayName}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function fmtDur(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m} min`;
}
