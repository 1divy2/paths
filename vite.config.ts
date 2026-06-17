import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tanstackStart(),
    tailwindcss(),
    tsconfigPaths(),
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   workbox: {
    //     globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/basemaps\.cartocdn\.com\/.*/i,
    //         handler: "CacheFirst",
    //         options: {
    //           cacheName: "carto-cache",
    //           expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
    //           cacheableResponse: { statuses: [0, 200] },
    //         },
    //       },
    //     ],
    //   },
    // }),
  ],
});
