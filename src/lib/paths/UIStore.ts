import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PlaceHit, Quake, LatLng, POI } from "@/lib/paths/api";

interface UIState {
  homePlace: PlaceHit | null;
  selected: PlaceHit | null;
  hover: PlaceHit | null;
  trail: PlaceHit[];
  mapViewport: { lat: number; lng: number; zoom: number; pitch: number; bearing: number } | null;
  flyTo: {
    lat: number;
    lng: number;
    zoom?: number;
    bbox?: [number, number, number, number];
  } | null;
  quakes: Quake[];
  showQuakes: boolean;
  navOpen: boolean;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  route: { type: "LineString"; coordinates: [number, number][] } | null;
  routeEnds: { from: LatLng | null; to: LatLng | null };
  poiCategory: "restaurants" | "gas_stations" | "hotels" | "atms" | null;
  showTraffic: boolean;
  show3D: boolean;
  measurementMode: boolean;
  measurementPoints: [number, number][];
  showAlliances: boolean;
  showLostCities: boolean;
  showPopulation: boolean;
  showMigration: boolean;
  showFolklore: boolean;
  showMusic: boolean;
  showOceans: boolean;
  showCosmic: boolean;
  showBiology: boolean;
  showFootprint: boolean;
  showArchitecture: boolean;
  showUnderground: boolean;
  showEconomics: boolean;
  showExtremes: boolean;
  showJourneys: boolean;

  connections: (PlaceHit & { reason?: string })[];
  omniscienceLayer: { title: string; places: (PlaceHit & { reason?: string })[] } | null;

  savedLists: Record<string, { place: PlaceHit; note: string; addedAt: number }[]>;
  reviews: Record<string, { rating: number; text: string; date: number }>;
  locationHistory: { lat: number; lng: number; timestamp: number }[];
  showTimeline: boolean;
  contextMenu: { x: number; y: number; lat: number; lng: number } | null;
  themeMode: "dark" | "light";

  setHomePlace: (place: PlaceHit | null) => void;
  setSelected: (place: PlaceHit | null) => void;
  setHover: (place: PlaceHit | null) => void;
  addToTrail: (place: PlaceHit) => void;
  clearTrail: () => void;
  setMapViewport: (viewport: {
    lat: number;
    lng: number;
    zoom: number;
    pitch: number;
    bearing: number;
  }) => void;
  setFlyTo: (
    target: {
      lat: number;
      lng: number;
      zoom?: number;
      bbox?: [number, number, number, number];
    } | null,
  ) => void;
  setQuakes: (quakes: Quake[]) => void;
  setShowQuakes: (show: boolean) => void;
  setNavOpen: (open: boolean) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setPoiCategory: (cat: "restaurants" | "gas_stations" | "hotels" | "atms" | null) => void;
  setRouteData: (
    route: { type: "LineString"; coordinates: [number, number][] } | null,
    ends: { from: LatLng | null; to: LatLng | null },
  ) => void;
  setShowTraffic: (show: boolean) => void;
  setShow3D: (show: boolean) => void;
  setShowTimeline: (show: boolean) => void;
  setMeasurementMode: (mode: boolean) => void;
  setMeasurementPoints: (points: [number, number][]) => void;
  setContextMenu: (menu: { x: number; y: number; lat: number; lng: number } | null) => void;
  setThemeMode: (mode: "dark" | "light") => void;
  setShowAlliances: (show: boolean) => void;
  setShowLostCities: (show: boolean) => void;
  setShowPopulation: (show: boolean) => void;
  setShowMigration: (show: boolean) => void;
  setShowFolklore: (show: boolean) => void;
  setShowMusic: (show: boolean) => void;
  setShowOceans: (show: boolean) => void;
  setShowCosmic: (show: boolean) => void;
  setShowBiology: (show: boolean) => void;
  setShowFootprint: (show: boolean) => void;
  setShowArchitecture: (show: boolean) => void;
  setShowUnderground: (show: boolean) => void;
  setShowEconomics: (show: boolean) => void;
  setShowExtremes: (show: boolean) => void;
  setShowJourneys: (show: boolean) => void;

  setConnections: (connections: (PlaceHit & { reason?: string })[]) => void;
  setOmniscienceLayer: (
    layer: { title: string; places: (PlaceHit & { reason?: string })[] } | null,
  ) => void;

  saveToList: (listName: string, place: PlaceHit, note: string) => void;
  removeFromList: (listName: string, placeId: string) => void;
  addReview: (placeId: string, rating: number, text: string) => void;
  addLocationHistory: (lat: number, lng: number) => void;

  handlePick: (place: PlaceHit) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      homePlace: null,
      selected: null,
      hover: null,
      trail: [],
      mapViewport: null,
      flyTo: null,

      quakes: [],
      showQuakes: true,
      navOpen: false,
      leftPanelOpen: true,
      rightPanelOpen: false,
      route: null,
      routeEnds: { from: null, to: null },
      poiCategory: null,
      showTraffic: false,
      show3D: false,
      showTimeline: false,
      measurementMode: false,
      measurementPoints: [],
      contextMenu: null,
      themeMode: "light",
      showAlliances: false,
      showLostCities: true,
      showPopulation: false,
      showMigration: false,
      showFolklore: false,
      showMusic: false,
      showOceans: false,
      showCosmic: false,
      showBiology: false,
      showFootprint: false,
      showArchitecture: false,
      showUnderground: false,
      showEconomics: false,
      showExtremes: false,
      showJourneys: false,

      connections: [],
      omniscienceLayer: null,

      savedLists: { Favorites: [], "Want to Go": [] },
      reviews: {},
      locationHistory: [],

      setHomePlace: (place) => set({ homePlace: place }),
      setSelected: (place) => set({ selected: place }),
      setHover: (place) => set({ hover: place }),
      addToTrail: (place) =>
        set((state) => {
          const trail = state.trail;
          if (trail.some((t) => t.id === place.id)) return { trail };
          return { trail: [place, ...trail].slice(0, 50) };
        }),
      clearTrail: () => set({ trail: [] }),
      setMapViewport: (viewport) => set({ mapViewport: viewport }),
      setFlyTo: (target) => set({ flyTo: target }),
      setQuakes: (quakes) => set({ quakes }),
      setShowQuakes: (show) => set({ showQuakes: show }),
      setNavOpen: (navOpen) => set({ navOpen, leftPanelOpen: navOpen ? false : true }),
      setLeftPanelOpen: (leftPanelOpen) => set({ leftPanelOpen, navOpen: false }),
      setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
      setPoiCategory: (poiCategory) => set({ poiCategory }),
      setRouteData: (route, routeEnds) => set({ route, routeEnds }),
      setShowTraffic: (showTraffic) => set({ showTraffic }),
      setShow3D: (show3D) => set({ show3D }),
      setShowTimeline: (showTimeline) => set({ showTimeline }),
      setMeasurementMode: (mode) => set({ measurementMode: mode, measurementPoints: [] }),
      setMeasurementPoints: (points) => set({ measurementPoints: points }),
      setContextMenu: (contextMenu) => set({ contextMenu }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setShowAlliances: (show) => set({ showAlliances: show }),
      setShowLostCities: (show) => set({ showLostCities: show }),
      setShowPopulation: (show) => set({ showPopulation: show }),
      setShowMigration: (show) => set({ showMigration: show }),
      setShowFolklore: (show) => set({ showFolklore: show }),
      setShowMusic: (show) => set({ showMusic: show }),
      setShowOceans: (show) => set({ showOceans: show }),
      setShowCosmic: (show) => set({ showCosmic: show }),
      setShowBiology: (show) => set({ showBiology: show }),
      setShowFootprint: (show) => set({ showFootprint: show }),
      setShowArchitecture: (show) => set({ showArchitecture: show }),
      setShowUnderground: (show) => set({ showUnderground: show }),
      setShowEconomics: (show) => set({ showEconomics: show }),
      setShowExtremes: (show) => set({ showExtremes: show }),
      setShowJourneys: (show) => set({ showJourneys: show }),

      setConnections: (connections) => set({ connections }),
      setOmniscienceLayer: (layer) => set({ omniscienceLayer: layer }),

      saveToList: (listName, place, note) =>
        set((state) => {
          const list = state.savedLists[listName] || [];
          if (list.some((i) => i.place.id === place.id)) return state;
          return {
            savedLists: {
              ...state.savedLists,
              [listName]: [...list, { place, note, addedAt: Date.now() }],
            },
          };
        }),

      removeFromList: (listName, placeId) =>
        set((state) => {
          const list = state.savedLists[listName] || [];
          return {
            savedLists: {
              ...state.savedLists,
              [listName]: list.filter((i) => i.place.id !== placeId),
            },
          };
        }),

      addReview: (placeId, rating, text) =>
        set((state) => ({
          reviews: { ...state.reviews, [placeId]: { rating, text, date: Date.now() } },
        })),

      addLocationHistory: (lat, lng) =>
        set((state) => {
          const last = state.locationHistory[state.locationHistory.length - 1];
          if (last && Math.abs(last.lat - lat) < 0.0001 && Math.abs(last.lng - lng) < 0.0001)
            return state;
          return {
            locationHistory: [...state.locationHistory, { lat, lng, timestamp: Date.now() }],
          };
        }),

      handlePick: (place) => {
        set({ selected: place, connections: [] });
        get().addToTrail(place);

        let zoom = 15;
        if (place.kind === "country" || place.kind === "state") zoom = 5;
        else if (place.kind === "county" || place.kind === "region") zoom = 8;
        else if (place.kind === "city" || place.kind === "town") zoom = 12;

        set({ flyTo: { lat: place.lat, lng: place.lng, zoom, bbox: place.bbox } });
      },
    }),
    {
      name: "paths-ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        homePlace: state.homePlace,
        selected: state.selected,
        trail: state.trail,
        mapViewport: state.mapViewport,
        showQuakes: state.showQuakes,
        navOpen: state.navOpen,
        leftPanelOpen: state.leftPanelOpen,
        rightPanelOpen: state.rightPanelOpen,
        poiCategory: state.poiCategory,
        showTraffic: state.showTraffic,
        show3D: state.show3D,
        themeMode: state.themeMode,
        savedLists: state.savedLists,
        reviews: state.reviews,
        locationHistory: state.locationHistory,
        showLostCities: state.showLostCities,
        showAlliances: state.showAlliances,
        showPopulation: state.showPopulation,
        showMigration: state.showMigration,
        showFolklore: state.showFolklore,
        showMusic: state.showMusic,
        showOceans: state.showOceans,
        showCosmic: state.showCosmic,
        showBiology: state.showBiology,
        showFootprint: state.showFootprint,
        showArchitecture: state.showArchitecture,
        showUnderground: state.showUnderground,
        showEconomics: state.showEconomics,
        showExtremes: state.showExtremes,
        showJourneys: state.showJourneys,
      }),
    },
  ),
);
