import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback } from "react";
import LeftPanel from "@/components/paths/LeftPanel";
import RightPanel from "@/components/paths/RightPanel";
import BottomBar from "@/components/paths/BottomBar";
import NavigationPanel from "@/components/paths/NavigationPanel";
import MapStyleWidget from "@/components/paths/MapStyleWidget";
import ContextMenuOverlay from "@/components/paths/ContextMenuOverlay";
import AuthWidget from "@/components/paths/AuthWidget";
import FirebaseSync from "@/components/paths/FirebaseSync";
import { ChevronLeft, ChevronRight, Coffee, Fuel, Bed, Banknote, X } from "lucide-react";
import type { LatLng } from "@/lib/paths/api";
import { useUIStore } from "@/lib/paths/UIStore";

const MapView = lazy(() => import("@/components/paths/MapView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PaTHs — A reading room for the planet" },
      {
        name: "description",
        content:
          "PaTHs is a discovery-first world map. Click anywhere on Earth and read what makes it that place.",
      },
      { property: "og:title", content: "PaTHs — A reading room for the planet" },
      {
        property: "og:description",
        content: "Click anywhere on Earth and read what makes it that place.",
      },
    ],
  }),
  ssr: false,
  component: PathsApp,
});

function PathsApp() {
  const {
    selected,
    hover,
    trail,
    flyTo,
    quakes,
    showQuakes,
    navOpen,
    route,
    routeEnds,
    leftPanelOpen,
    rightPanelOpen,
    poiCategory,
    setHover,
    clearTrail,
    setNavOpen,
    handlePick,
    setRouteData,
    setShowQuakes,
    setQuakes,
    setLeftPanelOpen,
    setRightPanelOpen,
    setPoiCategory,
  } = useUIStore();

  const handleMapClick = useCallback(
    (ll: LatLng) => {
      handlePick({
        id: `click-${ll.lat}-${ll.lng}`,
        name: "Unnamed point",
        displayName: `${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)}`,
        lat: ll.lat,
        lng: ll.lng,
        kind: "click",
      });
    },
    [handlePick],
  );

  return (
    <div
      className="h-screen w-screen overflow-hidden grid transition-[grid-template-columns] duration-300 ease-in-out relative"
      style={{
        gridTemplateColumns: `${leftPanelOpen ? "320px" : "0px"} 1fr ${rightPanelOpen ? "380px" : "0px"}`,
        gridTemplateRows: "1fr 48px",
      }}
    >
      <ContextMenuOverlay />
      <FirebaseSync />

      {/* Left */}
      <div className="row-span-1 col-start-1 col-end-2 row-start-1 row-end-2 min-h-0 overflow-hidden">
        <LeftPanel />
      </div>

      {/* Map */}
      <div className="relative col-start-2 col-end-3 row-start-1 row-end-2 min-h-0 bg-background overflow-hidden">
        <Suspense
          fallback={
            <div className="absolute inset-0 grid place-items-center font-mono text-xs text-muted-foreground">
              unfolding the world…
            </div>
          }
        >
          <MapView
            selected={selected}
            onPick={handleMapClick}
            hover={hover}
            quakes={quakes}
            showQuakes={showQuakes}
            flyTo={flyTo}
            route={route}
            routeEndpoints={routeEnds}
          />
        </Suspense>
        <NavigationPanel />

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {[
            { id: "restaurants", icon: Coffee, label: "Restaurants" },
            { id: "gas_stations", icon: Fuel, label: "Gas" },
            { id: "hotels", icon: Bed, label: "Hotels" },
            { id: "atms", icon: Banknote, label: "ATMs" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setPoiCategory(poiCategory === cat.id ? null : (cat.id as any))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-lg transition-colors font-mono text-[10px] uppercase tracking-widest ${
                poiCategory === cat.id
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-panel text-muted-foreground border-line hover:text-foreground"
              }`}
            >
              <cat.icon className="size-3" />
              {cat.label}
              {poiCategory === cat.id && <X className="size-3 ml-1" />}
            </button>
          ))}
        </div>

        <MapStyleWidget />
        <AuthWidget />

        {/* Sidebar Toggles */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-12 bg-panel border border-line border-l-0 rounded-r-md text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-opacity"
        >
          {leftPanelOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-12 bg-panel border border-line border-r-0 rounded-l-md text-muted-foreground hover:text-foreground opacity-70 hover:opacity-100 transition-opacity"
        >
          {rightPanelOpen ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>

      {/* Right */}
      <div className="col-start-3 col-end-4 row-start-1 row-end-2 min-h-0 overflow-hidden">
        <RightPanel />
      </div>

      {/* Bottom */}
      <div className="col-start-1 col-end-4 row-start-2 row-end-3">
        <BottomBar />
      </div>
    </div>
  );
}
