import { useState } from "react";
import { Layers } from "lucide-react";
import { useLayerManager } from "@/lib/paths/LayerManager";
import { useUIStore } from "@/lib/paths/UIStore";

export default function MapStyleWidget() {
  const { style, setStyle } = useLayerManager();
  const {
    navOpen,
    showTraffic,
    setShowTraffic,
    show3D,
    setShow3D,
    measurementMode,
    setMeasurementMode,
    showTimeline,
    setShowTimeline,
  } = useUIStore();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`absolute bottom-6 z-20 flex flex-col gap-2 pointer-events-auto transition-all duration-300 ${navOpen ? "left-[380px]" : "left-4"}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <div className="bg-panel border border-line rounded-md shadow-2xl p-1 mb-1 flex flex-col gap-1 w-32 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => setStyle("paths")}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${style === "paths" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            Ink
          </button>
          <button
            onClick={() => setStyle("satellite")}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${style === "satellite" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            Satellite
          </button>
          <button
            onClick={() => setStyle("voyager")}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${style === "voyager" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            Voyager
          </button>
          <button
            onClick={() => setStyle("historic")}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${style === "historic" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            Historic
          </button>
          <div className="h-px w-full bg-line my-1" />
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${showTraffic ? "bg-accent text-accent-foreground border border-accent" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            Traffic
          </button>
          <button
            onClick={() => setShow3D(!show3D)}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${show3D ? "bg-accent text-accent-foreground border border-accent" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            3D Buildings
          </button>
          <div className="h-px w-full bg-line my-1" />
          <button
            onClick={() => setMeasurementMode(!measurementMode)}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${measurementMode ? "bg-accent text-accent-foreground border border-accent" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            Measure
          </button>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className={`text-left px-3 py-2 text-[11px] font-mono uppercase tracking-widest rounded-sm ${showTimeline ? "bg-accent text-accent-foreground border border-accent" : "text-muted-foreground hover:bg-panel-2 hover:text-foreground"}`}
          >
            Timeline
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-panel border border-line rounded-md shadow-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
        title="Change map style"
      >
        <Layers className="size-5" />
      </button>
    </div>
  );
}
