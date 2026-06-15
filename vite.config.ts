import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
// import { tanstackStart } from "@tanstack/react-start/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    TanStackRouterVite(),
    react(),
    // tanstackStart(),
  ],
});
