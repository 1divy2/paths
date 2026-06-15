import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Map, {
  Marker, Source, Layer, NavigationControl, Popup, type MapRef, type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import type { LatLng, PlaceHit, Quake } from "@/lib/atlas/api";

// CARTO dark-matter — free, OSM-based, no API key
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const VOYAGER_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export type LayerMode = "atlas" | "terrain" | "cultural" | "economic" | "transport";

type Props = {
  selected: PlaceHit | null;
  onPick: (ll: LatLng) => void;
  hover: PlaceHit | null;
  quakes: Quake[];
  showQuakes: boolean;
  flyTo: { lat: number; lng: number; zoom?: number } | null;
  route: { type: "LineString"; coordinates: [number, number][] } | null;
  routeEndpoints: { from: LatLng | null; to: LatLng | null };
  style: "atlas" | "voyager";
};

export default function MapView({
  selected, onPick, hover, quakes, showQuakes, flyTo, route, routeEndpoints, style,
}: Props) {
  const ref = useRef<MapRef | null>(null);
  const [cursor, setCursor] = useState("crosshair");

  useEffect(() => {
    if (!flyTo || !ref.current) return;
    ref.current.flyTo({ center: [flyTo.lng, flyTo.lat], zoom: flyTo.zoom ?? 8, speed: 1.4, curve: 1.6 });
  }, [flyTo]);

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    onPick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  }, [onPick]);

  const quakeGeo = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: quakes.map((q) => ({
      type: "Feature" as const,
      properties: { mag: q.mag, place: q.place, id: q.id },
      geometry: { type: "Point" as const, coordinates: [q.lng, q.lat] },
    })),
  }), [quakes]);

  const routeGeo = useMemo(() => route ? ({
    type: "Feature" as const, properties: {}, geometry: route,
  }) : null, [route]);

  return (
    <Map
      ref={ref}
      mapStyle={style === "voyager" ? VOYAGER_STYLE : MAP_STYLE}
      initialViewState={{ longitude: 10, latitude: 25, zoom: 1.8 }}
      onClick={handleClick}
      onMouseEnter={() => setCursor("crosshair")}
      cursor={cursor}
      attributionControl={{ compact: true }}
      maxZoom={18}
    >
      <NavigationControl position="bottom-right" showCompass={false} />

      {showQuakes && (
        <Source id="quakes" type="geojson" data={quakeGeo}>
          <Layer
            id="quake-glow"
            type="circle"
            paint={{
              "circle-radius": ["interpolate", ["linear"], ["get", "mag"], 4, 6, 8, 28],
              "circle-color": "#e85a3c",
              "circle-opacity": 0.18,
              "circle-blur": 0.6,
            }}
          />
          <Layer
            id="quake-core"
            type="circle"
            paint={{
              "circle-radius": ["interpolate", ["linear"], ["get", "mag"], 4, 2.5, 8, 7],
              "circle-color": "#ffb347",
              "circle-stroke-color": "#1a1410",
              "circle-stroke-width": 1,
            }}
          />
        </Source>
      )}

      {routeGeo && (
        <Source id="route" type="geojson" data={routeGeo as any}>
          <Layer
            id="route-casing"
            type="line"
            paint={{ "line-color": "#1a1410", "line-width": 6, "line-opacity": 0.9 }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
          <Layer
            id="route-line"
            type="line"
            paint={{ "line-color": "#f3b54a", "line-width": 3 }}
            layout={{ "line-cap": "round", "line-join": "round" }}
          />
        </Source>
      )}

      {routeEndpoints.from && (
        <Marker longitude={routeEndpoints.from.lng} latitude={routeEndpoints.from.lat}>
          <div className="size-3 rounded-full bg-jade ring-2 ring-background" />
        </Marker>
      )}
      {routeEndpoints.to && (
        <Marker longitude={routeEndpoints.to.lng} latitude={routeEndpoints.to.lat}>
          <div className="size-3 rounded-full bg-cinnabar ring-2 ring-background" />
        </Marker>
      )}

      {selected && (
        <Marker longitude={selected.lng} latitude={selected.lat} anchor="bottom">
          <div className="flex flex-col items-center">
            <div className="font-mono text-[10px] uppercase tracking-wider bg-panel border border-line px-1.5 py-0.5 mb-1 text-accent">
              {selected.name}
            </div>
            <div className="size-2 rotate-45 bg-accent" />
          </div>
        </Marker>
      )}

      {hover && hover.id !== selected?.id && (
        <Popup longitude={hover.lng} latitude={hover.lat} closeButton={false} closeOnClick={false} anchor="bottom" offset={10}>
          {hover.name}
        </Popup>
      )}
    </Map>
  );
}
