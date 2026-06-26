<div align="center">

# 🗺️ Paths

<br/>

<img src="https://raw.githubusercontent.com/maplibre/maplibre-gl-js/main/docs/assets/logo.svg" alt="MapLibre Logo" width="120" />

**Explore the World. Discover POIs. Experience Lightning-Fast Maps.**

[![Deploy with Cloudflare](https://img.shields.io/badge/Deploy%20with-Cloudflare-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-Bleeding%20Edge-FF4154?logo=react&logoColor=white)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

---

</div>

<br/>

**Paths** is a modern, full-stack mapping application designed for seamless exploration, point-of-interest discovery, and route planning. Built with a bleeding-edge stack featuring **TanStack Start**, **MapLibre GL**, and **Firebase**, Paths delivers a blazing-fast, highly interactive mapping experience right in your browser.

## ✨ Key Features

- 🌍 **Interactive Map Engine:** High-performance vector maps powered by MapLibre GL JS and `react-map-gl`. Fluid panning and zooming experience.
- 🧠 **AI Semantic Search:** Natural language search powered by the ultra-fast Groq SDK (Llama 3.1) to find precisely the locations you're looking for.
- 📍 **Points of Interest (POI):** Instantly discover local amenities including coffee shops, fuel stations, accommodations, and banks/ATMs with a single click.
- 🔄 **Real-time Syncing:** User data, preferences, and saved locations are synced seamlessly across devices using Firebase Auth and Firestore.
- 📶 **Offline Capable:** Configured with `vite-plugin-pwa` for progressive web app capabilities, ensuring reliable performance even with spotty connections.
- 💅 **Beautiful UI:** A sleek, responsive, and highly accessible interface built with Tailwind CSS v4, Framer Motion micro-animations, and Radix UI primitives.

<br/>

## 🛠️ The Technology Stack

### Frontend Architecture
- **Framework:** [TanStack Start](https://tanstack.com/start) (utilizing the newest Vite 7 Environment API) + React 19
- **Routing:** [TanStack Router](https://tanstack.com/router) for 100% type-safe routing
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (with local persistence)
- **Styling:** Tailwind CSS v4 + Lucide React for crisp iconography
- **Animation:** Framer Motion

### Geospatial & Mapping
- **Renderer:** MapLibre GL JS & React Map GL
- **Processing:** Turf.js (length, helpers) for on-the-fly geospatial calculations

### Backend & Cloud Infrastructure
- **BaaS:** Firebase (Authentication, Firestore Realtime Database)
- **AI Processing:** Groq SDK (Lightning-fast LLM inference)
- **Deployment:** Cloudflare Workers (Edge computing for minimal latency)

<br/>

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
- Node.js (v20+ recommended)
- `npm` or `pnpm`
- A Firebase Project (with Authentication and Firestore enabled)
- A Groq API Key (for the semantic search features)

### Installation Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/1divy2/paths.git
   cd paths
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and securely add your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   *The application will compile and be available at `http://localhost:5173`.*

<br/>

## ☁️ Deployment

Paths is specially configured to be deployed as a **Cloudflare Worker** to fully leverage the TanStack Start edge SSR and API features. 

To deploy manually via the CLI:

1. Ensure your `wrangler.json` is configured correctly for Workers Assets.
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy to the edge using Wrangler:
   ```bash
   npx wrangler deploy
   ```
> **Important:** Ensure you have securely set your production environment variables (especially your Groq and Firebase keys) in the Cloudflare Dashboard under **Workers & Pages -> Settings -> Variables**.

<br/>

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome! Feel free to check the [issues page](https://github.com/1divy2/paths/issues) if you want to contribute.

## 📄 License

This project is licensed under the MIT License.
