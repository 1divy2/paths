import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
  Popup,
  type MapRef,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import {
  LOST_CITIES,
  ALLIANCES,
  POPULATION_DENSITY,
  MIGRATION_FLOWS,
  FOLKLORE,
  MUSIC_HERITAGE,
  OCEAN_CURRENTS,
  SHIPWRECKS,
  SPACEPORTS,
  CRATERS,
  LIGHT_POLLUTION,
  BIOMES,
  ANCIENT_TREES,
  ENDANGERED_SPECIES,
  MEGA_ENGINEERING,
  NUCLEAR_SITES,
  RESOURCE_EXTRACTION,
  ANCIENT_WONDERS,
  MODERN_MARVELS,
  ABANDONED_PLACES,
  UNDERSEA_CABLES,
  CAVE_SYSTEMS,
  SUBTERRANEAN_TRANSIT,
  WEALTH_CENTERS,
  ENERGY_GRIDS,
  GLOBAL_LITERACY,
  EXTREME_CLIMATES,
  ANOMALIES,
  DEEP_SPACE,
  JOURNEYS,
} from "@/lib/paths/data";

// CARTO dark-matter — free, OSM-based, no API key
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const VOYAGER_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const SATELLITE_STYLE = "/satellite.json";
const HISTORICAL_STYLE =
  "https://unpkg.com/@openhistoricalmap/map-styles@latest/dist/historical/historical.json";

import { Coffee, Fuel, Bed, Banknote } from "lucide-react";

export type LayerMode = "atlas" | "terrain" | "cultural" | "economic" | "transport";

import { useLayerManager } from "@/lib/paths/LayerManager";
import { useUIStore } from "@/lib/paths/UIStore";
import { useQuery } from "@tanstack/react-query";
import { getPOIs, type POI, type LatLng, type Quake, type PlaceHit } from "@/lib/paths/api";
import length from "@turf/length";
import { lineString } from "@turf/helpers";
import { MapPin, Navigation, Droplet, Users, Trees, Mountain, Search } from "lucide-react";

type Props = {
  selected: PlaceHit | null;
  onPick: (ll: LatLng) => void;
  hover: PlaceHit | null;
  quakes: Quake[];
  showQuakes: boolean;
  flyTo: {
    lat: number;
    lng: number;
    zoom?: number;
    bbox?: [number, number, number, number];
  } | null;
  route: { type: "LineString"; coordinates: [number, number][] } | null;
  routeEndpoints: { from: LatLng | null; to: LatLng | null };
};

export default function MapView({
  selected,
  onPick,
  hover,
  quakes,
  showQuakes,
  flyTo,
  route,
  routeEndpoints,
}: Props) {
  const { style, projection, epochYear } = useLayerManager();
  const {
    trail,
    showAlliances,
    showLostCities,
    showPopulation,
    showMigration,
    showFolklore,
    showMusic,
    showOceans,
    showCosmic,
    showBiology,
    showFootprint,
    showArchitecture,
    showUnderground,
    showEconomics,
    showExtremes,
    showJourneys,
    connections,
    omniscienceLayer,
    showTraffic,
    show3D,
    measurementMode,
    measurementPoints,
    setMeasurementPoints,
    showTimeline,
    locationHistory,
    addLocationHistory,
    contextMenu,
    setContextMenu,
    mapViewport,
    setMapViewport,
  } = useUIStore();
  const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_API_KEY;
  const ref = useRef<MapRef | null>(null);
  const [cursor, setCursor] = useState("crosshair");
  const [bounds, setBounds] = useState<{ _sw: LatLng; _ne: LatLng } | null>(null);

  const { poiCategory } = useUIStore();

  const updateBounds = useCallback(() => {
    if (!ref.current) return;
    const b = ref.current.getBounds();
    if (b) {
      setBounds({
        _sw: { lat: b.getSouth(), lng: b.getWest() },
        _ne: { lat: b.getNorth(), lng: b.getEast() },
      });
      const center = ref.current.getCenter();
      setMapViewport({
        lat: center.lat,
        lng: center.lng,
        zoom: ref.current.getZoom(),
        pitch: ref.current.getPitch(),
        bearing: ref.current.getBearing(),
      });
    }
  }, [setMapViewport]);

  useEffect(() => {
    updateBounds();
  }, [updateBounds]);

  const { data: pois = [] } = useQuery({
    queryKey: [
      "pois",
      poiCategory,
      bounds?._sw.lat.toFixed(2),
      bounds?._sw.lng.toFixed(2),
      bounds?._ne.lat.toFixed(2),
      bounds?._ne.lng.toFixed(2),
    ],
    queryFn: () => getPOIs(bounds!, poiCategory!),
    enabled: !!poiCategory && !!bounds,
    staleTime: 60000,
  });

  useEffect(() => {
    if (!flyTo || !ref.current) return;
    if (flyTo.bbox) {
      ref.current.fitBounds(
        [
          [flyTo.bbox[0], flyTo.bbox[1]],
          [flyTo.bbox[2], flyTo.bbox[3]],
        ],
        { padding: 50, duration: 2000 },
      );
    } else {
      ref.current.flyTo({
        center: [flyTo.lng, flyTo.lat],
        zoom: flyTo.zoom ?? 8,
        speed: 1.4,
        curve: 1.6,
      });
    }
  }, [flyTo]);

  useEffect(() => {
    if (!route || !ref.current || route.coordinates.length === 0) return;

    const lats = route.coordinates.map((c) => c[1]);
    const lngs = route.coordinates.map((c) => c[0]);
    const minLng = Math.min(...lngs);
    const minLat = Math.min(...lats);
    const maxLng = Math.max(...lngs);
    const maxLat = Math.max(...lats);

    ref.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 100, duration: 1500 },
    );
  }, [route]);

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (contextMenu) setContextMenu(null);
      if (measurementMode) {
        setMeasurementPoints([...measurementPoints, [e.lngLat.lng, e.lngLat.lat]]);
        return;
      }
      onPick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    },
    [onPick, measurementMode, measurementPoints, setMeasurementPoints, contextMenu, setContextMenu],
  );

  const handleContextMenu = useCallback(
    (e: MapLayerMouseEvent) => {
      e.originalEvent.preventDefault();
      setContextMenu({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      });
    },
    [setContextMenu],
  );

  const measurementDistance = useMemo(() => {
    if (measurementPoints.length < 2) return 0;
    return length(lineString(measurementPoints), { units: "kilometers" });
  }, [measurementPoints]);

  const quakeGeo = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: quakes.map((q) => ({
        type: "Feature" as const,
        properties: { mag: q.mag, place: q.place, id: q.id },
        geometry: { type: "Point" as const, coordinates: [q.lng, q.lat] },
      })),
    }),
    [quakes],
  );

  const routeGeo = useMemo(
    () =>
      route
        ? {
            type: "Feature" as const,
            properties: {},
            geometry: route,
          }
        : null,
    [route],
  );

  const trailGeo = useMemo(() => {
    if (trail.length < 2) return null;
    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: trail.map((t) => [t.lng, t.lat]),
      },
    };
  }, [trail]);

  const visibleLostCities = useMemo(() => {
    if (!showLostCities) return null;
    return {
      type: "FeatureCollection",
      features: LOST_CITIES.features.filter((f) => epochYear <= f.properties.yearDestroyed + 100),
    };
  }, [epochYear, showLostCities]);

  useEffect(() => {
    if (!ref.current) return;
    if (show3D) {
      ref.current.easeTo({ pitch: 60, bearing: -20, duration: 1000 });
    } else {
      ref.current.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
    }
  }, [show3D]);

  const connectionLines = useMemo(() => {
    if (!selected || connections.length === 0) return null;
    return {
      type: "FeatureCollection",
      features: connections.map((c) => ({
        type: "Feature",
        properties: { name: c.name },
        geometry: {
          type: "LineString",
          coordinates: [
            [selected.lng, selected.lat],
            [c.lng, c.lat],
          ],
        },
      })),
    };
  }, [selected, connections]);

  return (
    <div className="relative w-full h-full bg-background">
      {measurementMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-panel border border-accent text-accent px-4 py-2 rounded-full font-mono text-[11px] shadow-2xl z-20 flex items-center gap-4 pointer-events-auto">
          <span>Measure: Click map</span>
          {measurementPoints.length > 1 && (
            <span className="font-bold text-foreground">{measurementDistance.toFixed(2)} km</span>
          )}
          {measurementPoints.length > 0 && (
            <button
              onClick={() => setMeasurementPoints([])}
              className="text-muted-foreground hover:text-red-500 uppercase tracking-widest text-[9px]"
            >
              Clear
            </button>
          )}
        </div>
      )}
      <Map
        ref={ref}
        mapStyle={
          style === "satellite"
            ? SATELLITE_STYLE
            : style === "voyager"
              ? VOYAGER_STYLE
              : style === "historic"
                ? HISTORICAL_STYLE
                : MAP_STYLE
        }
        initialViewState={mapViewport || { longitude: 10, latitude: 25, zoom: 1.8 }}
        projection={projection as any}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseEnter={() => setCursor("crosshair")}
        cursor={cursor}
        onMoveEnd={updateBounds}
        attributionControl={{ compact: true }}
        maxZoom={18}
        terrain={show3D ? { source: "terrain-source", exaggeration: 1.5 } : undefined}
      >
        <NavigationControl position="bottom-right" showCompass={false} />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation={false}
          onGeolocate={(e: any) => {
            if (e.coords) {
              addLocationHistory(e.coords.latitude, e.coords.longitude);
            }
          }}
        />

        {showTraffic && TOMTOM_KEY && (
          <Source
            id="traffic-source"
            type="raster"
            tiles={[
              `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`,
            ]}
            tileSize={256}
          >
            <Layer
              id="traffic-layer"
              type="raster"
              source="traffic-source"
              paint={{ "raster-opacity": 0.8 }}
            />
          </Source>
        )}

        {show3D && (
          <>
            <Source
              id="terrain-source"
              type="raster-dem"
              tiles={["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"]}
              encoding="terrarium"
              tileSize={256}
              maxzoom={14}
            />
            <Layer
              id="3d-buildings"
              source="carto"
              source-layer="building"
              type="fill-extrusion"
              minzoom={14}
              paint={{
                "fill-extrusion-color": "#2a2a2a",
                "fill-extrusion-height": ["get", "render_height"],
                "fill-extrusion-base": ["get", "render_min_height"],
                "fill-extrusion-opacity": 0.8,
              }}
            />
          </>
        )}

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

        {trailGeo && (
          <Source id="trail" type="geojson" data={trailGeo as any}>
            <Layer
              id="trail-line"
              type="line"
              paint={{
                "line-color": "#eb5e28", // cinnabar
                "line-width": 1.5,
                "line-dasharray": [2, 4],
                "line-opacity": 0.6,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        )}

        {showAlliances && (
          <Source id="alliances" type="geojson" data={ALLIANCES as any}>
            <Layer
              id="alliances-line"
              type="line"
              paint={{
                "line-color": ["get", "color"],
                "line-width": 3,
                "line-opacity": 0.7,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        )}

        {showLostCities && visibleLostCities && (
          <Source id="lost-cities" type="geojson" data={visibleLostCities as any}>
            <Layer
              id="lost-cities-point"
              type="circle"
              paint={{
                "circle-radius": 6,
                "circle-color": "#a8a29e",
                "circle-stroke-color": "#1a1410",
                "circle-stroke-width": 2,
              }}
            />
            <Layer
              id="lost-cities-label"
              type="symbol"
              layout={{
                "text-field": ["get", "name"],
                "text-font": ["Open Sans Regular"],
                "text-size": 10,
                "text-offset": [0, 1.2],
                "text-anchor": "top",
              }}
              paint={{
                "text-color": "#d6d3d1",
              }}
            />
          </Source>
        )}

        {showPopulation && (
          <Source id="population" type="geojson" data={POPULATION_DENSITY as any}>
            <Layer
              id="population-extrusion"
              type="fill-extrusion"
              paint={{
                "fill-extrusion-color": ["get", "color"],
                "fill-extrusion-height": ["get", "height"],
                "fill-extrusion-base": 0,
                "fill-extrusion-opacity": 0.8,
              }}
            />
          </Source>
        )}

        {showMigration && (
          <Source id="migration" type="geojson" data={MIGRATION_FLOWS as any}>
            <Layer
              id="migration-line"
              type="line"
              paint={{
                "line-color": "#10b981", // emerald
                "line-width": 4,
                "line-opacity": 0.5,
                "line-dasharray": [0, 2, 4],
              }}
            />
          </Source>
        )}

        {showFolklore && (
          <Source id="folklore" type="geojson" data={FOLKLORE as any}>
            <Layer
              id="folklore-point"
              type="circle"
              paint={{
                "circle-radius": 5,
                "circle-color": "#8b5cf6", // violet
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
              }}
            />
            <Layer
              id="folklore-label"
              type="symbol"
              layout={{
                "text-field": ["get", "name"],
                "text-font": ["Open Sans Regular"],
                "text-size": 11,
                "text-offset": [0, 1.2],
                "text-anchor": "top",
              }}
              paint={{ "text-color": "#8b5cf6", "text-halo-color": "#000", "text-halo-width": 1 }}
            />
          </Source>
        )}

        {showMusic && (
          <Source id="music" type="geojson" data={MUSIC_HERITAGE as any}>
            <Layer
              id="music-point"
              type="circle"
              paint={{
                "circle-radius": 6,
                "circle-color": "#ec4899", // pink
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
              }}
            />
            <Layer
              id="music-label"
              type="symbol"
              layout={{
                "text-field": ["concat", ["get", "genre"], "\n(", ["get", "origin"], ")"],
                "text-font": ["Open Sans Regular"],
                "text-size": 10,
                "text-offset": [0, 1.2],
                "text-anchor": "top",
              }}
              paint={{ "text-color": "#ec4899", "text-halo-color": "#000", "text-halo-width": 1 }}
            />
          </Source>
        )}

        {showOceans && (
          <>
            <Source id="ocean-currents" type="geojson" data={OCEAN_CURRENTS as any}>
              <Layer
                id="ocean-currents-line"
                type="line"
                paint={{
                  "line-color": ["get", "color"],
                  "line-width": 4,
                  "line-opacity": 0.5,
                }}
                layout={{ "line-cap": "round", "line-join": "round" }}
              />
            </Source>
            <Source id="shipwrecks" type="geojson" data={SHIPWRECKS as any}>
              <Layer
                id="shipwrecks-point"
                type="circle"
                paint={{
                  "circle-radius": 4,
                  "circle-color": "#06b6d4", // cyan
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="shipwrecks-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#06b6d4" }}
              />
            </Source>
          </>
        )}

        {showCosmic && (
          <>
            <Source id="light-pollution" type="geojson" data={LIGHT_POLLUTION as any}>
              <Layer
                id="light-pollution-heatmap"
                type="heatmap"
                paint={{
                  "heatmap-weight": ["get", "intensity"],
                  "heatmap-intensity": 1,
                  "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0,
                    "rgba(0,0,0,0)",
                    0.2,
                    "rgba(255,255,0,0.2)",
                    0.5,
                    "rgba(255,165,0,0.5)",
                    1,
                    "rgba(255,0,0,0.8)",
                  ],
                  "heatmap-radius": 30,
                  "heatmap-opacity": 0.7,
                }}
              />
            </Source>
            <Source id="spaceports" type="geojson" data={SPACEPORTS as any}>
              <Layer
                id="spaceports-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#eab308", // yellow
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="spaceports-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#eab308" }}
              />
            </Source>
            <Source id="craters" type="geojson" data={CRATERS as any}>
              <Layer
                id="craters-point"
                type="circle"
                paint={{
                  "circle-radius": 8,
                  "circle-color": "transparent",
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#a8a29e", // stone
                }}
              />
              <Layer
                id="craters-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#a8a29e" }}
              />
            </Source>
          </>
        )}

        {showBiology && (
          <>
            <Source id="biomes" type="geojson" data={BIOMES as any}>
              <Layer
                id="biomes-fill"
                type="fill"
                paint={{
                  "fill-color": ["get", "color"],
                  "fill-opacity": 0.2,
                }}
              />
              <Layer
                id="biomes-line"
                type="line"
                paint={{
                  "line-color": ["get", "color"],
                  "line-width": 2,
                  "line-dasharray": [2, 2],
                }}
              />
            </Source>
            <Source id="ancient-trees" type="geojson" data={ANCIENT_TREES as any}>
              <Layer
                id="ancient-trees-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#22c55e", // green
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="ancient-trees-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#22c55e" }}
              />
            </Source>
            <Source id="endangered" type="geojson" data={ENDANGERED_SPECIES as any}>
              <Layer
                id="endangered-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#f97316", // orange
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="endangered-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#f97316" }}
              />
            </Source>
          </>
        )}

        {showFootprint && (
          <>
            <Source id="mega-engineering" type="geojson" data={MEGA_ENGINEERING as any}>
              <Layer
                id="mega-engineering-point"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#3b82f6", // blue
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="mega-engineering-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#3b82f6", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="nuclear-sites" type="geojson" data={NUCLEAR_SITES as any}>
              <Layer
                id="nuclear-sites-point"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#ef4444", // red
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#000",
                  "circle-opacity": 0.8,
                }}
              />
              <Layer
                id="nuclear-sites-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#ef4444", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="resource-extraction" type="geojson" data={RESOURCE_EXTRACTION as any}>
              <Layer
                id="resource-extraction-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#a8a29e", // stone
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#000",
                }}
              />
              <Layer
                id="resource-extraction-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#a8a29e", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
          </>
        )}

        {showArchitecture && (
          <>
            <Source id="ancient-wonders" type="geojson" data={ANCIENT_WONDERS as any}>
              <Layer
                id="ancient-wonders-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#fbbf24", // amber
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="ancient-wonders-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#fbbf24", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="modern-marvels" type="geojson" data={MODERN_MARVELS as any}>
              <Layer
                id="modern-marvels-point"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#e2e8f0", // slate-200
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#0f172a", // slate-900
                }}
              />
              <Layer
                id="modern-marvels-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                }}
                paint={{
                  "text-color": "#e2e8f0",
                  "text-halo-color": "#0f172a",
                  "text-halo-width": 1,
                }}
              />
            </Source>
            <Source id="abandoned-places" type="geojson" data={ABANDONED_PLACES as any}>
              <Layer
                id="abandoned-places-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#78716c", // stone
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#444",
                }}
              />
              <Layer
                id="abandoned-places-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#78716c", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
          </>
        )}

        {showUnderground && (
          <>
            <Source id="undersea-cables" type="geojson" data={UNDERSEA_CABLES as any}>
              <Layer
                id="undersea-cables-line"
                type="line"
                paint={{
                  "line-color": "#0ea5e9", // sky blue
                  "line-width": 2,
                  "line-opacity": 0.6,
                  "line-dasharray": [2, 2],
                }}
              />
              <Layer
                id="undersea-cables-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "symbol-placement": "line",
                  "text-size": 10,
                  "text-offset": [0, 1],
                }}
                paint={{ "text-color": "#0ea5e9", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="cave-systems" type="geojson" data={CAVE_SYSTEMS as any}>
              <Layer
                id="cave-systems-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#6d28d9", // purple
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#000",
                }}
              />
              <Layer
                id="cave-systems-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#6d28d9", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="subterranean-transit" type="geojson" data={SUBTERRANEAN_TRANSIT as any}>
              <Layer
                id="subterranean-transit-point"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#ef4444", // red
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="subterranean-transit-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#ef4444", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
          </>
        )}

        {showEconomics && (
          <>
            <Source id="wealth-centers" type="geojson" data={WEALTH_CENTERS as any}>
              <Layer
                id="wealth-centers-point"
                type="circle"
                paint={{
                  "circle-radius": 8,
                  "circle-color": "#22c55e", // green
                  "circle-opacity": 0.8,
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="wealth-centers-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.5],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#22c55e", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="energy-grids" type="geojson" data={ENERGY_GRIDS as any}>
              <Layer
                id="energy-grids-point"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#facc15", // yellow
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#000",
                }}
              />
              <Layer
                id="energy-grids-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#facc15", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="global-literacy" type="geojson" data={GLOBAL_LITERACY as any}>
              <Layer
                id="global-literacy-point"
                type="circle"
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#60a5fa", // blue
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="global-literacy-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#60a5fa", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
          </>
        )}

        {showExtremes && (
          <>
            <Source id="extreme-climates" type="geojson" data={EXTREME_CLIMATES as any}>
              <Layer
                id="extreme-climates-point"
                type="circle"
                paint={{
                  "circle-radius": 7,
                  "circle-color": "#f97316", // orange
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#000",
                }}
              />
              <Layer
                id="extreme-climates-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#f97316", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="anomalies" type="geojson" data={ANOMALIES as any}>
              <Layer
                id="anomalies-fill"
                type="fill"
                filter={["==", ["geometry-type"], "Polygon"]}
                paint={{
                  "fill-color": "#ef4444", // red
                  "fill-opacity": 0.3,
                }}
              />
              <Layer
                id="anomalies-point"
                type="circle"
                filter={["==", ["geometry-type"], "Point"]}
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#ef4444",
                  "circle-stroke-width": 2,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="anomalies-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#ef4444", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
            <Source id="deep-space" type="geojson" data={DEEP_SPACE as any}>
              <Layer
                id="deep-space-point"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#c084fc", // purple
                  "circle-stroke-width": 1,
                  "circle-stroke-color": "#fff",
                }}
              />
              <Layer
                id="deep-space-label"
                type="symbol"
                layout={{
                  "text-field": ["get", "name"],
                  "text-font": ["Open Sans Regular"],
                  "text-size": 10,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#c084fc", "text-halo-color": "#000", "text-halo-width": 1 }}
              />
            </Source>
          </>
        )}

        {showJourneys && (
          <Source id="journeys" type="geojson" data={JOURNEYS as any}>
            <Layer
              id="journeys-line"
              type="line"
              paint={{
                "line-color": ["get", "color"],
                "line-width": 3,
                "line-opacity": 0.8,
                "line-dasharray": [1, 2],
              }}
            />
            <Layer
              id="journeys-label"
              type="symbol"
              layout={{
                "text-field": ["get", "name"],
                "text-font": ["Open Sans Regular"],
                "symbol-placement": "line",
                "text-size": 12,
                "text-offset": [0, 1],
              }}
              paint={{
                "text-color": ["get", "color"],
                "text-halo-color": "#000",
                "text-halo-width": 2,
              }}
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
            <div className="size-4 bg-cinnabar rounded-full shadow-[0_0_15px_rgba(232,90,60,0.6)] border-2 border-[#1a1410]" />
          </Marker>
        )}

        {pois.map((poi) => (
          <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="bottom">
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="bg-panel border border-line px-2 py-1 rounded shadow-lg flex items-center gap-1.5 transition-transform group-hover:scale-110">
                {poi.category === "restaurants" && <Coffee className="size-3 text-orange-400" />}
                {poi.category === "gas_stations" && <Fuel className="size-3 text-blue-400" />}
                {poi.category === "hotels" && <Bed className="size-3 text-purple-400" />}
                {poi.category === "atms" && <Banknote className="size-3 text-green-400" />}
                <span className="text-[10px] font-mono whitespace-nowrap hidden group-hover:block max-w-[150px] truncate">
                  {poi.name}
                </span>
              </div>
              <div className="w-1 h-1 bg-white rounded-full mt-1 opacity-50" />
            </div>
          </Marker>
        ))}

        {connectionLines && (
          <Source id="connections" type="geojson" data={connectionLines as any}>
            <Layer
              id="connections-line"
              type="line"
              paint={{
                "line-color": "#0ea5e9", // sky blue
                "line-width": 2,
                "line-opacity": 0.5,
                "line-dasharray": [2, 4],
              }}
            />
          </Source>
        )}

        {/* Render connected place points */}
        {connections.map((c, i) => (
          <Marker key={`conn-${i}`} longitude={c.lng} latitude={c.lat}>
            <div
              className="relative group cursor-pointer"
              onClick={() => useUIStore.getState().handlePick(c)}
            >
              <div className="size-2 rounded-full bg-sky-500 ring-2 ring-background" />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-line px-1.5 py-0.5 font-mono text-[10px] text-sky-500 rounded">
                {c.name}
              </div>
            </div>
          </Marker>
        ))}

        {/* Render Omniscience Layer */}
        {omniscienceLayer?.places.map((c, i) => (
          <Marker key={`omni-${i}`} longitude={c.lng} latitude={c.lat}>
            <div
              className="relative group cursor-pointer"
              onClick={() => useUIStore.getState().handlePick(c)}
            >
              <div className="size-3 rounded-none bg-accent rotate-45 ring-2 ring-background" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-line px-1.5 py-0.5 font-mono text-[10px] text-accent rounded z-10">
                {c.name}
              </div>
            </div>
          </Marker>
        ))}

        {selected && (
          <Marker longitude={selected.lng} latitude={selected.lat} anchor="center">
            <div className="flex flex-col items-center pointer-events-none">
              <div className="relative flex items-center justify-center mt-6">
                <div className="absolute size-10 rounded-full bg-accent/30 animate-ping" />
                <div className="absolute size-5 rounded-full bg-accent/40 animate-pulse" />
                <div className="relative size-2.5 rounded-full bg-accent ring-2 ring-background z-10" />
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-wider bg-panel border border-line px-2 py-1 text-accent shadow-2xl pointer-events-auto rounded-sm backdrop-blur-sm bg-panel/80">
                {selected.name}
              </div>
            </div>
          </Marker>
        )}

        {hover && hover.id !== selected?.id && (
          <Popup
            longitude={hover.lng}
            latitude={hover.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={10}
          >
            {hover.name}
          </Popup>
        )}

        {measurementPoints.length > 0 && (
          <Source
            id="measurement"
            type="geojson"
            data={{
              type: "FeatureCollection",
              features: [
                ...(measurementPoints.length > 1
                  ? [
                      {
                        type: "Feature" as const,
                        properties: {},
                        geometry: {
                          type: "LineString" as const,
                          coordinates: measurementPoints,
                        },
                      },
                    ]
                  : []),
                ...measurementPoints.map((p) => ({
                  type: "Feature" as const,
                  properties: {},
                  geometry: {
                    type: "Point" as const,
                    coordinates: p,
                  },
                })),
              ],
            }}
          >
            {measurementPoints.length > 1 && (
              <Layer
                id="measurement-line"
                type="line"
                paint={{
                  "line-color": "#eab308",
                  "line-width": 3,
                  "line-dasharray": [2, 2],
                }}
              />
            )}
            <Layer
              id="measurement-points"
              type="circle"
              paint={{
                "circle-radius": 4,
                "circle-color": "#eab308",
                "circle-stroke-width": 2,
                "circle-stroke-color": "#000",
              }}
            />
          </Source>
        )}

        {showTimeline && locationHistory.length > 1 && (
          <Source
            id="location-history"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: locationHistory.map((h) => [h.lng, h.lat]),
              },
            }}
          >
            <Layer
              id="location-history-line"
              type="line"
              paint={{
                "line-color": "#3b82f6",
                "line-width": 4,
                "line-opacity": 0.6,
                "line-dasharray": [1, 2],
              }}
            />
          </Source>
        )}

        {/* Dynamic Layers from LayerManager */}
        {Object.values(useLayerManager().layers).map(
          (layer) =>
            layer.visible && (
              <Source
                key={`source-${layer.id}`}
                id={`source-${layer.id}`}
                type={layer.type as any}
                data={layer.data}
                url={layer.url}
              >
                <Layer
                  id={`layer-${layer.id}`}
                  type={
                    layer.type === "geojson" &&
                    layer.data?.features?.[0]?.geometry?.type === "Point"
                      ? "circle"
                      : layer.type === "geojson"
                        ? "line"
                        : ("fill" as any)
                  }
                  source-layer={layer.sourceLayer}
                  paint={layer.paint}
                  layout={layer.layout}
                />
              </Source>
            ),
        )}
      </Map>
    </div>
  );
}
