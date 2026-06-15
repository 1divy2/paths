import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useState } from "react";
import LeftPanel from "@/components/paths/LeftPanel";
import RightPanel from "@/components/paths/RightPanel";
import BottomBar from "@/components/paths/BottomBar";
import NavigationPanel from "@/components/paths/NavigationPanel";
import type { PlaceHit, Quake, LatLng } from "@/lib/paths/api";

const MapView = lazy(() => import("@/components/paths/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaTHs — A reading room for the planet" },
      { name: "description", content: "PaTHs is a discovery-first world map. Click anywhere on Earth and read what makes it that place." },
      { property: "og:title", content: "PaTHs — A reading room for the planet" },
      { property: "og:description", content: "Click anywhere on Earth and read what makes it that place." },
    ],
  }),
  ssr: false,
  component: PathsApp,
});

function PathsApp() {
  const [selected, setSelected] = useState<PlaceHit | null>(null);
  const [hover, setHover] = useState<PlaceHit | null>(null);
  const [trail, setTrail] = useState<PlaceHit[]>([]);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [showQuakes, setShowQuakes] = useState(true);
  const [style, setStyle] = useState<"paths" | "voyager">("paths");
  const [navOpen, setNavOpen] = useState(false);
  const [route, setRoute] = useState<{ type: "LineString"; coordinates: [number, number][] } | null>(null);
  const [routeEnds, setRouteEnds] = useState<{ from: LatLng | null; to: LatLng | null }>({ from: null, to: null });

  const handlePick = useCallback((p: PlaceHit) => {
    setSelected(p);
    setTrail((t) => (t[t.length - 1]?.id === p.id ? t : [...t, p].slice(-12)));
    setFlyTo({ lat: p.lat, lng: p.lng, zoom: p.kind === "country" ? 5 : p.kind === "wiki" ? 14 : 10 });
  }, []);

  const handleMapClick = useCallback((ll: LatLng) => {
    handlePick({
      id: `click-${ll.lat}-${ll.lng}`,
      name: "Unnamed point",
      displayName: `${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)}`,
      lat: ll.lat, lng: ll.lng, kind: "click",
    });
  }, [handlePick]);

  return (
    <div className="h-screen w-screen overflow-hidden grid" style={{ gridTemplateColumns: "320px 1fr 380px", gridTemplateRows: "1fr 48px" }}>
      {/* Left */}
      <div className="row-span-1 col-start-1 col-end-2 row-start-1 row-end-2 min-h-0">
        <LeftPanel
          onPick={handlePick}
          onHover={setHover}
          trail={trail}
          onClearTrail={() => setTrail([])}
          onOpenNav={() => setNavOpen(true)}
        />
      </div>

      {/* Map */}
      <div className="relative col-start-2 col-end-3 row-start-1 row-end-2 min-h-0 bg-background">
        <Suspense fallback={<div className="absolute inset-0 grid place-items-center font-mono text-xs text-muted-foreground">unfolding the world…</div>}>
          <MapView
            selected={selected}
            onPick={handleMapClick}
            hover={hover}
            quakes={quakes}
            showQuakes={showQuakes}
            flyTo={flyTo}
            route={route}
            routeEndpoints={routeEnds}
            style={style}
          />
        </Suspense>
        <NavigationPanel
          open={navOpen}
          onClose={() => setNavOpen(false)}
          onRoute={(r) => {
            if (!r) { setRoute(null); setRouteEnds({ from: null, to: null }); return; }
            setRoute(r.geometry);
            setRouteEnds({ from: r.from, to: r.to });
            // fit
            const lats = r.geometry.coordinates.map((c) => c[1]);
            const lngs = r.geometry.coordinates.map((c) => c[0]);
            setFlyTo({ lat: (Math.min(...lats) + Math.max(...lats)) / 2, lng: (Math.min(...lngs) + Math.max(...lngs)) / 2, zoom: 7 });
          }}
        />
      </div>

      {/* Right */}
      <div className="col-start-3 col-end-4 row-start-1 row-end-2 min-h-0">
        <RightPanel place={selected} onAddTrail={(p) => setTrail((t) => [...t, p])} onPick={handlePick} />
      </div>

      {/* Bottom */}
      <div className="col-start-1 col-end-4 row-start-2 row-end-3">
        <BottomBar
          showQuakes={showQuakes}
          onToggleQuakes={setShowQuakes}
          style={style}
          onSetStyle={setStyle}
          onQuakes={setQuakes}
          onPickQuake={(q) => handlePick({ id: q.id, name: q.place, displayName: q.place, kind: "earthquake", lat: q.lat, lng: q.lng })}
        />
      </div>
    </div>
  );
}
