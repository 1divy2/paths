import { useEffect, useState } from "react";
import { getQuakes, type Quake } from "@/lib/atlas/api";
import { Activity, Layers } from "lucide-react";

type Props = {
  showQuakes: boolean;
  onToggleQuakes: (v: boolean) => void;
  style: "atlas" | "voyager";
  onSetStyle: (s: "atlas" | "voyager") => void;
  onQuakes: (q: Quake[]) => void;
  onPickQuake: (q: Quake) => void;
};

export default function BottomBar({ showQuakes, onToggleQuakes, style, onSetStyle, onQuakes, onPickQuake }: Props) {
  const [quakes, setQuakes] = useState<Quake[]>([]);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const q = await getQuakes();
      if (cancel) return;
      setQuakes(q);
      onQuakes(q);
    };
    load();
    const t = setInterval(load, 5 * 60_000);
    return () => { cancel = true; clearInterval(t); };
  }, [onQuakes]);

  const top = quakes.slice().sort((a, b) => b.time - a.time).slice(0, 12);

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
              <button onClick={() => onPickQuake(q)} className="font-mono text-[11px] text-muted-foreground hover:text-accent">
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
          onClick={() => onToggleQuakes(!showQuakes)}
          className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${showQuakes ? "border-accent text-accent" : "border-line text-muted-foreground"}`}
        >
          Quakes
        </button>
        <div className="flex border border-line">
          <button onClick={() => onSetStyle("atlas")} className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 ${style === "atlas" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
            <Layers className="inline size-3 -mt-0.5" /> Ink
          </button>
          <button onClick={() => onSetStyle("voyager")} className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 ${style === "voyager" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}>
            Voyager
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
