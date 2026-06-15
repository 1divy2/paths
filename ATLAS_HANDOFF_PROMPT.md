# ATLAS — World Exploration Engine
## Complete Handoff Prompt for Google Antigravity (or any AI coding agent)

> Copy this entire file into your new coder's context. It contains the full product brief, every functional + non-functional requirement, the tech stack, the data architecture, the component map, the visual design system, and the build order. No prior context is required.

---

## 0. ROLE YOU (THE AI CODER) ARE PLAYING

You are simultaneously acting as:
- **Principal Geospatial Systems Architect**
- **Senior Product Designer**
- **Mapping Engineer**
- **Data Visualization Specialist**
- **UX Research Lead**

Build with conviction. No generic SaaS aesthetics. No "Hello World" map demo.

---

## 1. PRODUCT VISION

**ATLAS is a world exploration engine — a living atlas that makes users curious about the planet.**

When a user opens ATLAS, they should not think *"another map."*
They should think *"I just spent 30 minutes exploring places I never knew existed."*

### What ATLAS IS
- A discovery-first platform answering **"What is this place?"**
- An information-dense, editorial-quality interface
- A gateway to knowledge about geography, culture, climate, history, demographics, and live planetary events
- A tool that rewards curiosity (random place jumps, "curiosity seeds", exploration trails)

### What ATLAS is NOT
- ❌ A Google Maps clone
- ❌ A navigation/GPS app (navigation exists, but as a *secondary* tool)
- ❌ A route planner / delivery tracker
- ❌ A generic map website with pins and a search bar

### Secondary requirement (personal use)
A working **A → B navigation tool** with driving / walking / cycling modes. It must be a tab/panel, **not the homepage**.

---

## 2. TECH STACK (LOCKED)

| Layer | Choice | Reason |
|---|---|---|
| Framework | **TanStack Start v1** (React 19, Vite 7) | SSR + file-based routing + server fns |
| Language | **TypeScript strict** | Required by template |
| Styling | **Tailwind CSS v4** via `src/styles.css` (`@import "tailwindcss"`, no `tailwind.config.js`) | Template default |
| UI primitives | **shadcn/ui** + Radix | Already wired in `src/components/ui/*` |
| Map renderer | **MapLibre GL** + **react-map-gl** (`/maplibre` entry) | Free, no token, WebGL |
| Map tiles | **CARTO** (Dark Matter + Voyager raster/vector) | Free, keyless, beautiful |
| Icons | **lucide-react** | Already installed |
| Fonts | **Fraunces** (serif display) + **JetBrains Mono** (body/UI) — load from Google Fonts in `__root.tsx` | Editorial, anti-generic |
| State | React local state + URL params via TanStack Router | No Redux needed |
| Animation | `framer-motion` (add via `bun add framer-motion`) | For panel transitions |

**Do NOT use:** Mapbox (requires token), Google Maps (paid), react-router-dom, next.js patterns, `src/pages/`.

---

## 3. DATA SOURCES (ALL FREE, KEYLESS)

All APIs are called client-side from `src/lib/atlas/api.ts`. No backend, no API keys, no Lovable Cloud needed.

| Purpose | API | Endpoint pattern |
|---|---|---|
| Place search / geocoding | **Nominatim** (OSM) | `https://nominatim.openstreetmap.org/search?q={q}&format=json&addressdetails=1&limit=8` |
| Reverse geocoding | **Nominatim** | `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json` |
| Place summary / extract | **Wikipedia REST** | `https://en.wikipedia.org/api/rest_v1/page/summary/{title}` |
| Nearby Wikipedia articles | **Wikipedia GeoSearch** | `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord={lat}|{lon}&gsradius=10000&gslimit=20&format=json&origin=*` |
| Live weather + timezone | **Open-Meteo** | `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto` |
| Country demographics/economics | **REST Countries** | `https://restcountries.com/v3.1/alpha/{cca2}` |
| Live earthquakes | **USGS** | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson` |
| Routing (drive/walk/bike) | **OSRM public** | `https://router.project-osrm.org/route/v1/{profile}/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson&steps=true` |

**Required**: send `User-Agent: ATLAS-Explorer/1.0` header to Nominatim. Debounce search input by 350ms. Abort in-flight requests on new input.

---

## 4. FILE / COMPONENT MAP

```
src/
├── routes/
│   ├── __root.tsx          # HTML shell, font links, MapLibre CSS import
│   └── index.tsx           # ATLAS shell: <MapView> + <LeftPanel> + <RightPanel> + <BottomBar> + <NavigationPanel>
├── components/atlas/
│   ├── MapView.tsx         # MapLibre canvas, layers, markers, popups, flyTo
│   ├── LeftPanel.tsx       # Search, exploration trail, curiosity seeds, "Navigate" button
│   ├── RightPanel.tsx      # Location intelligence dossier (Wiki + weather + country)
│   ├── BottomBar.tsx       # Live USGS earthquake ticker
│   └── NavigationPanel.tsx # A→B routing UI (overlay panel, not homepage)
├── lib/atlas/
│   └── api.ts              # All fetchers + types (Place, Quake, Route, WikiSummary, CountryInfo)
└── styles.css              # Tailwind v4 tokens (semantic colors, fonts, shadows)
```

---

## 5. FUNCTIONAL REQUIREMENTS (FR)

### FR-1 — Map Canvas
- Full-viewport MapLibre map (CARTO Dark Matter default, Voyager toggle).
- Pan, zoom, rotate, pitch enabled. NavigationControl in bottom-right.
- Click map → reverse-geocode → open right panel with that location.
- Hover on marker → minimal popup with name + coords.
- `flyTo({center, zoom: 9, duration: 1800, essential: true})` when a place is selected.

### FR-2 — Search (LeftPanel)
- Input with debounce (350ms), abortable.
- Shows up to 8 Nominatim results: name, type (city/country/landmark), country flag emoji.
- Hovering a result previews on the map (temporary marker, no fly).
- Clicking adds to **Exploration Trail** + flies map + opens right panel.

### FR-3 — Location Intelligence Dossier (RightPanel)
For any selected place, fetch + display **in parallel**:
1. **Wikipedia summary**: thumbnail, extract (3-line clamp + "read more"), link to article.
2. **Live weather**: temp, condition (mapped from WMO code), wind, humidity, local time.
3. **Country info** (if applicable): flag, capital, population, area, languages, currencies, region, drives-on-side, timezones.
4. **Nearby points of interest**: 6 closest Wikipedia geo-articles as clickable chips.
5. **Raw coordinates** + elevation (Open-Meteo elevation field).

Loading skeletons per section. Graceful "no data" states.

### FR-4 — Exploration Trail
- Ordered list of every place the user has opened in this session.
- Click an item → re-fly + reopen its dossier.
- "Clear trail" button. Persist to `localStorage` under key `atlas.trail`.

### FR-5 — Curiosity Seeds
- Hardcoded array of 8–12 surprising places (Socotra, Yakutsk, Svalbard, Easter Island, Tristan da Cunha, Kowloon Walled City site, Lake Natron, Kawah Ijen, Derweze gas crater, Hashima Island, etc.).
- Each is a clickable card with one-line teaser.
- Plus a **"Surprise me"** button → picks a random seed.

### FR-6 — Live Earthquakes (BottomBar)
- Fetch USGS significant-week feed on mount + every 5 min.
- Horizontal scrolling marquee/ticker: `M{mag} · {place} · {time ago}`.
- Map renders a heatmap layer of quakes (circle radius scaled by magnitude, color ramp by depth).
- Click a ticker item → fly to that quake.

### FR-7 — Navigation (Secondary Tool)
- Opened via "Navigate" button in LeftPanel. Slides in as overlay panel.
- Two inputs (From / To) each with Nominatim autocomplete.
- Mode toggle: Drive / Walk / Bike (maps to OSRM `driving`/`foot`/`bike`).
- Calls OSRM, draws route as line layer (color by mode), shows distance + duration + turn-by-turn steps.
- "Use my location" button (browser geolocation, opt-in).
- "Clear route" removes the layer.

### FR-8 — Layer Switcher
- Top-right control: toggle between Dark Matter / Voyager basemaps, toggle Earthquakes layer on/off.

### FR-9 — Deep-linkable State
- Selected place lat/lon/zoom synced to URL search params (`?lat=&lon=&z=&p=name`).
- Opening such a URL restores the dossier.

---

## 6. NON-FUNCTIONAL REQUIREMENTS (NFR)

| # | Requirement |
|---|---|
| NFR-1 | **Performance**: First map paint < 1.5s on broadband. No layout shift after fonts load (use `font-display: swap` + size-adjust). |
| NFR-2 | **Accessibility**: All interactive elements keyboard-reachable. Focus rings visible. `aria-label`s on icon-only buttons. Color contrast AA on dark theme. |
| NFR-3 | **Responsive**: Works 1280px+ desktop fully. On <768px, panels collapse to bottom sheets (mobile-first stacked). |
| NFR-4 | **Resilience**: Every fetch wrapped in try/catch. Failed API → inline error chip, never breaks UI. |
| NFR-5 | **No secrets**: Project ships with zero env vars. All APIs are public/keyless. |
| NFR-6 | **Type safety**: `strict: true` TS. No `any` except at fetch boundaries (then narrowed via Zod or manual typing). |
| NFR-7 | **No external auth, no DB, no backend**. Pure client app. |
| NFR-8 | **SEO**: Single H1 ("ATLAS — World Exploration Engine"), meta description < 160 chars, OG image, JSON-LD `WebApplication`. |
| NFR-9 | **Animation discipline**: One signature transition (panel slide), avoid micro-interaction spam. |
| NFR-10 | **Privacy**: Geolocation only on explicit user click. No analytics, no tracking. |

---

## 7. VISUAL DESIGN SYSTEM

**Aesthetic direction:** *Editorial cartography meets terminal HUD.* Think *Monocle magazine* × *NASA mission control* × *Are.na*.

### Tokens (`src/styles.css`, OKLCH)
```css
:root {
  --background: oklch(0.13 0.02 250);       /* near-black ink */
  --foreground: oklch(0.96 0.01 90);        /* warm paper */
  --surface:    oklch(0.18 0.02 250);       /* panel bg */
  --surface-2:  oklch(0.22 0.02 250);
  --border:     oklch(0.28 0.02 250);
  --muted:      oklch(0.62 0.02 250);
  --primary:    oklch(0.78 0.18 75);        /* signal amber */
  --primary-foreground: oklch(0.15 0.02 75);
  --accent:     oklch(0.72 0.20 25);        /* alert red (quakes) */
  --success:    oklch(0.78 0.18 155);
  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;
  --shadow-panel: 0 10px 40px -12px oklch(0 0 0 / 0.6);
}
```

### Type rules
- Headings: Fraunces, optical-size 144, weight 400–500, tight tracking.
- Body / UI / numbers: JetBrains Mono, 13px base, 1.45 line-height.
- All-caps mono labels for sections (`tracking-[0.18em] text-xs text-muted`).
- Numbers are always tabular (`font-variant-numeric: tabular-nums`).

### Layout
- Map is the canvas; panels float over it with `backdrop-blur` + 1px hairline border.
- Left panel: 360px fixed, full-height, left-aligned.
- Right panel: 420px, slides in only when a place is selected.
- Bottom bar: 36px tall, full width, monospace ticker.
- 16px gutter everywhere; 8px inside panels.
- No rounded-2xl SaaS cards. Use `rounded-sm` (2px) or `rounded-none`.

### Forbidden
- Purple→pink gradients. Glassmorphism overdose. Generic hero sections. Marketing landing page. Inter font. Emoji-heavy UI. Floating action buttons.

---

## 8. BUILD ORDER (do it in this sequence)

1. `bun add maplibre-gl react-map-gl framer-motion` (lucide-react + tanstack already there).
2. Add Google Fonts link + `import "maplibre-gl/dist/maplibre-gl.css"` in `src/routes/__root.tsx`.
3. Write tokens into `src/styles.css`.
4. Build `src/lib/atlas/api.ts` with all 7 fetchers + types. Include AbortController support.
5. Build `MapView.tsx` (MapLibre + react-map-gl, click handler, flyTo via ref, quake source/layer, route source/layer).
6. Build `RightPanel.tsx` — Suspense-friendly sections, skeletons, error chips.
7. Build `LeftPanel.tsx` — search + trail (localStorage) + seeds + Navigate button.
8. Build `BottomBar.tsx` — USGS fetch + marquee.
9. Build `NavigationPanel.tsx` — OSRM call + step list.
10. Wire everything in `src/routes/index.tsx`. Sync state to URL params.
11. Add SEO `head()` in the index route.
12. Polish: keyboard nav, mobile bottom-sheet collapse, loading states.

---

## 9. ACCEPTANCE CHECKLIST

- [ ] Opening `/` shows a full-screen dark map centered on the world (lat 20, lon 0, zoom 2).
- [ ] Typing "Socotra" returns results in <1s; clicking flies the map and opens a rich dossier.
- [ ] Dossier shows Wikipedia extract + photo + live weather + Yemen country info + nearby POIs.
- [ ] Earthquake ticker scrolls at the bottom and quakes render on the map.
- [ ] Clicking "Navigate", entering Paris → Berlin, choosing Drive, draws a route with ~1050 km / ~10h.
- [ ] Reloading a URL with `?lat=12.4&lon=53.8&z=8&p=Socotra` restores the same view + dossier.
- [ ] No console errors. No API keys. Lighthouse Performance ≥ 85.
- [ ] Visual feels like *Monocle × mission-control*, not like a Bootstrap dashboard.

---

## 10. FINAL TONE REMINDER

> The map is a **gateway to knowledge**, not navigation.
> Build curiosity. Build discovery. Build understanding.
> Every panel, every font choice, every animation should reward exploration.

Ship it.
