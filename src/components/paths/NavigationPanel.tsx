import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchPlaces, getRoute, type PlaceHit } from "@/lib/paths/api";
import { X, ArrowDown, Car, PersonStanding, Bike, Loader2, Home, Navigation, Play, Square } from "lucide-react";
import { useUIStore } from "@/lib/paths/UIStore";
import { motion, AnimatePresence } from "framer-motion";

export default function NavigationPanel() {
  const { navOpen: open, setNavOpen: onClose, setRouteData: onRoute } = useUIStore();
  const [from, setFrom] = useState<PlaceHit | null>(null);
  const [to, setTo] = useState<PlaceHit | null>(null);
  const [mode, setMode] = useState<"driving" | "walking" | "cycling">("driving");
  const [result, setResult] = useState<{ distance: number; duration: number; steps: { instruction: string; distance: number }[] } | null>(null);
  const [activeNav, setActiveNav] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // function to speak
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // stop previous
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  const startNav = () => {
    setActiveNav(true);
    setCurrentStepIndex(0);
    if (result && result.steps.length > 0) {
      speak(`Starting navigation. ${result.steps[0].instruction.replace(/_/g, " ")}`);
    }
  };

  const nextStep = () => {
    if (!result) return;
    if (currentStepIndex < result.steps.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      speak(result.steps[next].instruction.replace(/_/g, " "));
    } else {
      speak("You have arrived at your destination.");
      setActiveNav(false);
    }
  };

  // Reset result when closed
  useEffect(() => {
    if (!open) {
      setResult(null);
      useUIStore.setState({ route: null, routeEnds: { from: null, to: null } });
    }
  }, [open]);

  // Recalculate route if travel mode changes after a route is already plotted
  useEffect(() => {
    if (result && from && to) {
      compute();
    }
  }, [mode]);

  const { data: routeData, isLoading: loading, refetch } = useQuery({
    queryKey: ["route", from?.id, to?.id, mode],
    queryFn: () => getRoute({ lat: from!.lat, lng: from!.lng }, { lat: to!.lat, lng: to!.lng }, mode),
    enabled: false, // only run on click
    staleTime: Infinity, // routes don't change often
  });

  const compute = async () => {
    if (!from || !to) return;
    const { data: r } = await refetch();
    if (!r) { onRoute(null, { from: null, to: null }); return; }
    setResult({ distance: r.distance, duration: r.duration, steps: r.steps });
    onRoute(r.geometry, { from: { lat: from.lat, lng: from.lng }, to: { lat: to.lat, lng: to.lng } });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 left-0 z-30 w-[360px] bg-panel border-r border-line shadow-2xl flex flex-col"
        >
      <header className="px-4 py-3 border-b border-line flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Navigation</div>
          <div className="font-serif text-xl leading-tight">A point to another point.</div>
        </div>
        <button onClick={() => onClose(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
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

          {activeNav ? (
            <div className="p-6 flex flex-col items-center justify-center space-y-6 bg-accent/5 h-[300px]">
              <Navigation className="size-12 text-accent" />
              <div className="text-2xl font-serif text-center capitalize leading-tight">
                {result.steps[currentStepIndex]?.instruction.replace(/_/g, " ")}
              </div>
              <div className="text-muted-foreground font-mono text-lg">
                in {Math.round(result.steps[currentStepIndex]?.distance || 0)} m
              </div>
              <div className="flex gap-4 w-full mt-4">
                <button onClick={() => { setActiveNav(false); window.speechSynthesis.cancel(); }} className="flex-1 py-3 border border-line text-[11px] tracking-widest uppercase font-mono hover:bg-panel-2 flex items-center justify-center gap-2"><Square className="size-3.5" /> Stop</button>
                <button onClick={nextStep} className="flex-1 py-3 bg-accent text-accent-foreground text-[11px] tracking-widest uppercase font-mono hover:opacity-90 flex items-center justify-center gap-2">Next <Play className="size-3.5" /></button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-line">
                 <button onClick={startNav} className="w-full py-2.5 bg-jade/20 text-jade font-mono uppercase tracking-widest text-[11px] hover:bg-jade/30 flex items-center justify-center gap-2"><Navigation className="size-3.5" /> Start Navigation</button>
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
            </>
          )}
        </div>
      )}
        </motion.div>
      )}
    </AnimatePresence>
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
  const homePlace = useUIStore(s => s.homePlace);

  const { data: searchHits = [] } = useQuery({
    queryKey: ["search", q],
    queryFn: ({ signal }) => searchPlaces(q, signal),
    enabled: q.trim().length > 0 && value?.name !== q,
    staleTime: 60_000,
  });

  const isHomeMatch = homePlace && (!q || "home".startsWith(q.toLowerCase()) || homePlace.name.toLowerCase().includes(q.toLowerCase()));
  const hits = (!value && isHomeMatch && homePlace) 
    ? [homePlace, ...searchHits.filter(h => h.id !== homePlace.id)] 
    : searchHits;

  const showDropdown = !value && hits.length > 0;

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
      {showDropdown && (
        <ul className="mt-1 border border-line-soft divide-y divide-line-soft max-h-40 overflow-y-auto shadow-lg bg-panel z-10 relative">
          {hits.map((h) => (
            <li key={h.id}>
              <button onClick={() => { onChange(h); setQ(""); }} className="w-full text-left px-2 py-1.5 hover:bg-panel-2 flex items-start gap-2">
                {h.id === homePlace?.id && <Home className="size-4 text-orange-500 mt-0.5 shrink-0" />}
                <div className="overflow-hidden w-full">
                  <div className="text-sm">{h.id === homePlace?.id ? "Home" : h.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{h.id === homePlace?.id ? h.name : h.displayName}</div>
                </div>
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
