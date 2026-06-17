import { create } from "zustand";

export type ProjectionType = "mercator" | "globe";

export interface MapLayer {
  id: string;
  name: string;
  type: "geojson" | "vector" | "raster";
  visible: boolean;
  opacity?: number;
  data?: any; // For geojson
  url?: string; // For vector/raster
  paint?: any;
  layout?: any;
  sourceLayer?: string;
  category: "base" | "overlay" | "interactive";
}

interface LayerManagerState {
  projection: ProjectionType;
  style: "paths" | "voyager" | "satellite" | "historic";
  epochYear: number;
  layers: Record<string, MapLayer>;
  setProjection: (proj: ProjectionType) => void;
  setStyle: (style: "paths" | "voyager" | "satellite" | "historic") => void;
  setEpochYear: (year: number) => void;
  toggleLayer: (id: string, visible?: boolean) => void;
  addLayer: (layer: MapLayer) => void;
  removeLayer: (id: string) => void;
  updateLayerData: (id: string, data: any) => void;
}

export const useLayerManager = create<LayerManagerState>((set) => ({
  projection: "mercator",
  style: "paths",
  epochYear: 2024,
  layers: {},

  setProjection: (proj) => set({ projection: proj }),
  setStyle: (style) => set({ style }),
  setEpochYear: (year) => set({ epochYear: year }),

  toggleLayer: (id, visible) =>
    set((state) => {
      const layer = state.layers[id];
      if (!layer) return state;
      return {
        layers: {
          ...state.layers,
          [id]: {
            ...layer,
            visible: visible !== undefined ? visible : !layer.visible,
          },
        },
      };
    }),

  addLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer.id]: layer },
    })),

  removeLayer: (id) =>
    set((state) => {
      const newLayers = { ...state.layers };
      delete newLayers[id];
      return { layers: newLayers };
    }),

  updateLayerData: (id, data) =>
    set((state) => {
      const layer = state.layers[id];
      if (!layer) return state;
      return {
        layers: {
          ...state.layers,
          [id]: { ...layer, data },
        },
      };
    }),
}));
