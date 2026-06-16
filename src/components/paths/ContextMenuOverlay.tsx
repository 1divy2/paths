import { useUIStore } from "@/lib/paths/UIStore";
import { useEffect, useRef } from "react";
import { Navigation, Ruler, Bookmark, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ContextMenuOverlay() {
  const { contextMenu, setContextMenu, handlePick, setMeasurementMode, setMeasurementPoints } = useUIStore();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [contextMenu, setContextMenu]);

  return (
    <AnimatePresence>
      {contextMenu && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed z-50 bg-panel/90 backdrop-blur-md border border-line rounded-lg shadow-2xl py-1 min-w-[200px] overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-3 py-2 text-[10px] font-mono text-muted-foreground border-b border-line mb-1 uppercase tracking-widest">
            {contextMenu.lat.toFixed(4)}, {contextMenu.lng.toFixed(4)}
          </div>
          <button
            onClick={() => {
              handlePick({
                id: `ctx-${contextMenu.lat}-${contextMenu.lng}`,
                name: "Selected Point",
                displayName: `${contextMenu.lat.toFixed(4)}, ${contextMenu.lng.toFixed(4)}`,
                lat: contextMenu.lat, lng: contextMenu.lng, kind: "click"
              });
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 flex items-center gap-2 text-foreground transition-colors"
          >
            <MapPin className="size-3.5 text-accent" />
            Select Place
          </button>
          <button
            onClick={() => {
              setMeasurementMode(true);
              setMeasurementPoints([[contextMenu.lng, contextMenu.lat]]);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 flex items-center gap-2 text-foreground transition-colors"
          >
            <Ruler className="size-3.5 text-green-500" />
            Measure from here
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
