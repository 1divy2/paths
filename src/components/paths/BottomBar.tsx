import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQuakes, type Quake } from "@/lib/paths/api";
import {
  Activity,
  Layers,
  Globe,
  Network,
  Landmark,
  Users,
  ArrowRightLeft,
  Skull,
  Music,
  Waves,
  Sparkles,
  Sprout,
  Hammer,
  Castle,
  Cable,
  Landmark as Bank,
  Flame,
  Navigation,
} from "lucide-react";
import { useLayerManager } from "@/lib/paths/LayerManager";
import { useUIStore } from "@/lib/paths/UIStore";

export default function BottomBar() {
  const { style, setStyle, projection, setProjection } = useLayerManager();
  const setStoreQuakes = useUIStore((state) => state.setQuakes);
  const {
    showAlliances,
    setShowAlliances,
    showLostCities,
    setShowLostCities,
    showPopulation,
    setShowPopulation,
    showMigration,
    setShowMigration,
    showFolklore,
    setShowFolklore,
    showMusic,
    setShowMusic,
    showOceans,
    setShowOceans,
    showCosmic,
    setShowCosmic,
    showBiology,
    setShowBiology,
    showFootprint,
    setShowFootprint,
    showArchitecture,
    setShowArchitecture,
    showUnderground,
    setShowUnderground,
    showEconomics,
    setShowEconomics,
    showExtremes,
    setShowExtremes,
    showJourneys,
    setShowJourneys,
    showQuakes,
    setShowQuakes,
    handlePick,
  } = useUIStore();

  const { data: quakes = [] } = useQuery({
    queryKey: ["quakes"],
    queryFn: getQuakes,
    refetchInterval: 5 * 60_000,
    staleTime: 60_000,
  });

  // Sync with global store when updated
  useEffect(() => {
    if (quakes.length > 0) {
      setStoreQuakes(quakes);
    }
  }, [quakes, setStoreQuakes]);

  const top = quakes
    .slice()
    .sort((a, b) => b.time - a.time)
    .slice(0, 12);

  return (
    <footer className="h-12 bg-panel border-t border-line flex items-stretch">
      {/* Live label */}
      <div className="flex items-center gap-2 px-4 border-r border-line">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-cinnabar opacity-60 animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-cinnabar" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Activity className="inline size-3 -mt-0.5" /> Live Earth · significant quakes / 7d
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-panel to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-panel to-transparent z-10 pointer-events-none" />
        <ul className="flex items-center h-full gap-6 animate-[ticker_90s_linear_infinite] whitespace-nowrap px-4">
          {[...top, ...top].map((q, i) => (
            <li key={`${q.id}-${i}`}>
              <button
                onClick={() =>
                  handlePick({
                    id: q.id,
                    name: q.place,
                    displayName: `M${q.mag.toFixed(1)} Earthquake`,
                    lat: q.lat,
                    lng: q.lng,
                    kind: "quake",
                  })
                }
                className="font-mono text-[11px] text-muted-foreground hover:text-accent"
              >
                <span className="text-amber font-semibold tabular-nums">M{q.mag.toFixed(1)}</span>
                <span className="text-muted-foreground"> · {q.place}</span>
                <span className="text-line ml-2">·</span>
                <span className="ml-2 text-muted-foreground">{relTime(q.time)}</span>
              </button>
            </li>
          ))}
        </ul>
        <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 px-3 border-l border-line">
        <button
          onClick={() => setShowLostCities(!showLostCities)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showLostCities ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Landmark className="size-3" /> Lost Cities
        </button>
        <button
          onClick={() => setShowAlliances(!showAlliances)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showAlliances ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Network className="size-3" /> Alliances
        </button>
        <button
          onClick={() => setShowPopulation(!showPopulation)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showPopulation ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Users className="size-3" /> Pop Density
        </button>
        <button
          onClick={() => setShowMigration(!showMigration)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showMigration ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <ArrowRightLeft className="size-3" /> Migration
        </button>
        <button
          onClick={() => setShowFolklore(!showFolklore)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showFolklore ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Skull className="size-3" /> Folklore
        </button>
        <button
          onClick={() => setShowMusic(!showMusic)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showMusic ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Music className="size-3" /> Music
        </button>

        <div className="w-px h-6 bg-line mx-1" />

        <button
          onClick={() => setShowOceans(!showOceans)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showOceans ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Waves className="size-3" /> Oceans
        </button>
        <button
          onClick={() => setShowCosmic(!showCosmic)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showCosmic ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Sparkles className="size-3" /> Cosmic
        </button>

        <div className="w-px h-6 bg-line mx-1" />

        <button
          onClick={() => setShowBiology(!showBiology)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showBiology ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Sprout className="size-3" /> Biology
        </button>
        <button
          onClick={() => setShowFootprint(!showFootprint)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showFootprint ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Hammer className="size-3" /> Footprint
        </button>

        <div className="w-px h-6 bg-line mx-1" />

        <button
          onClick={() => setShowArchitecture(!showArchitecture)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showArchitecture ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Castle className="size-3" /> Architecture
        </button>
        <button
          onClick={() => setShowUnderground(!showUnderground)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showUnderground ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Cable className="size-3" /> Underground
        </button>

        <div className="w-px h-6 bg-line mx-1" />

        <button
          onClick={() => setShowEconomics(!showEconomics)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showEconomics ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Bank className="size-3" /> Economics
        </button>
        <button
          onClick={() => setShowExtremes(!showExtremes)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showExtremes ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Flame className="size-3" /> Extremes
        </button>
        <button
          onClick={() => setShowJourneys(!showJourneys)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 flex items-center gap-1 border ${showJourneys ? "border-accent text-accent bg-accent/10" : "border-line text-muted-foreground hover:border-accent"}`}
        >
          <Navigation className="size-3" /> Journeys
        </button>

        <div className="w-px h-6 bg-line mx-1" />

        <button
          onClick={() => setShowQuakes(!showQuakes)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 ml-2 border ${showQuakes ? "border-accent text-accent" : "border-line text-muted-foreground"}`}
        >
          Quakes
        </button>
        <div className="flex border border-line">
          <button
            onClick={() => setProjection(projection === "globe" ? "mercator" : "globe")}
            className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 ${projection === "globe" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Globe className="inline size-3 -mt-0.5" /> 3D
          </button>
        </div>
      </div>
    </footer>
  );
}

function relTime(t: number) {
  const s = (Date.now() - t) / 1000;
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
