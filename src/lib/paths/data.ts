export const LOST_CITIES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Troy",
        yearDestroyed: -1180,
        description: "Legendary city of the Trojan War",
      },
      geometry: { type: "Point", coordinates: [26.2388, 39.9575] },
    },
    {
      type: "Feature",
      properties: {
        name: "Pompeii",
        yearDestroyed: 79,
        description: "Roman city buried in volcanic ash",
      },
      geometry: { type: "Point", coordinates: [14.484, 40.751] },
    },
    {
      type: "Feature",
      properties: {
        name: "Carthage",
        yearDestroyed: -146,
        description: "Phoenician city-state destroyed by Rome",
      },
      geometry: { type: "Point", coordinates: [10.323, 36.852] },
    },
    {
      type: "Feature",
      properties: {
        name: "Tenochtitlan",
        yearDestroyed: 1521,
        description: "Aztec capital, now Mexico City",
      },
      geometry: { type: "Point", coordinates: [-99.133, 19.432] },
    },
    {
      type: "Feature",
      properties: {
        name: "Babylon",
        yearDestroyed: -275,
        description: "Ancient Mesopotamian city",
      },
      geometry: { type: "Point", coordinates: [44.42, 32.53] },
    },
    {
      type: "Feature",
      properties: {
        name: "Vijayanagara",
        yearDestroyed: 1565,
        description: "Capital of the historic Hindu empire",
      },
      geometry: { type: "Point", coordinates: [76.46, 15.33] },
    },
  ],
};

// Simplified arcs for Alliances
export const ALLIANCES = {
  type: "FeatureCollection",
  features: [
    // NATO Arcs (simplified connecting Brussels to Washington DC, London, etc)
    {
      type: "Feature",
      properties: { alliance: "NATO", color: "#3b82f6" },
      geometry: {
        type: "LineString",
        coordinates: [
          [4.3517, 50.8503],
          [-77.0369, 38.9072],
        ],
      },
    },
    {
      type: "Feature",
      properties: { alliance: "NATO", color: "#3b82f6" },
      geometry: {
        type: "LineString",
        coordinates: [
          [4.3517, 50.8503],
          [-0.1276, 51.5074],
        ],
      },
    },
    {
      type: "Feature",
      properties: { alliance: "NATO", color: "#3b82f6" },
      geometry: {
        type: "LineString",
        coordinates: [
          [4.3517, 50.8503],
          [13.405, 52.52],
        ],
      },
    },
    // BRICS Arcs
    {
      type: "Feature",
      properties: { alliance: "BRICS", color: "#eab308" },
      geometry: {
        type: "LineString",
        coordinates: [
          [37.6173, 55.7558],
          [116.4074, 39.9042],
        ],
      }, // Moscow -> Beijing
    },
    {
      type: "Feature",
      properties: { alliance: "BRICS", color: "#eab308" },
      geometry: {
        type: "LineString",
        coordinates: [
          [116.4074, 39.9042],
          [77.209, 28.6139],
        ],
      }, // Beijing -> New Delhi
    },
    {
      type: "Feature",
      properties: { alliance: "BRICS", color: "#eab308" },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.209, 28.6139],
          [28.0473, -26.2041],
        ],
      }, // New Delhi -> Pretoria
    },
    {
      type: "Feature",
      properties: { alliance: "BRICS", color: "#eab308" },
      geometry: {
        type: "LineString",
        coordinates: [
          [28.0473, -26.2041],
          [-47.9292, -15.7801],
        ],
      }, // Pretoria -> Brasilia
    },
  ],
};

// Simplified 3D Extrusion data for high-density population centers
export const POPULATION_DENSITY = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Tokyo", density: 6158, height: 6158 * 10, color: "#ef4444" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [139.5, 35.5],
            [139.9, 35.5],
            [139.9, 35.8],
            [139.5, 35.8],
            [139.5, 35.5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Dhaka", density: 23234, height: 23234 * 10, color: "#b91c1c" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [90.3, 23.6],
            [90.5, 23.6],
            [90.5, 23.9],
            [90.3, 23.9],
            [90.3, 23.6],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Manila", density: 43064, height: 43064 * 10, color: "#7f1d1d" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [120.9, 14.5],
            [121.1, 14.5],
            [121.1, 14.7],
            [120.9, 14.7],
            [120.9, 14.5],
          ],
        ],
      },
    },
  ],
};

export const MIGRATION_FLOWS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { route: "Trans-Atlantic", volume: 100 },
      geometry: {
        type: "LineString",
        coordinates: [
          [-0.1276, 51.5074],
          [-74.006, 40.7128],
        ],
      },
    },
    {
      type: "Feature",
      properties: { route: "Mediterranean", volume: 80 },
      geometry: {
        type: "LineString",
        coordinates: [
          [13.1939, 32.8872],
          [12.4964, 41.9028],
        ],
      }, // Tripoli to Rome
    },
  ],
};

export const FOLKLORE = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Loch Ness Monster", kind: "Cryptid" },
      geometry: { type: "Point", coordinates: [-4.45, 57.3229] },
    },
    {
      type: "Feature",
      properties: { name: "Chupacabra", kind: "Cryptid" },
      geometry: { type: "Point", coordinates: [-66.5901, 18.2208] },
    }, // Puerto Rico
    {
      type: "Feature",
      properties: { name: "Yeti", kind: "Cryptid" },
      geometry: { type: "Point", coordinates: [86.925, 27.9881] },
    }, // Himalayas
  ],
};

export const MUSIC_HERITAGE = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { genre: "Jazz", origin: "New Orleans" },
      geometry: { type: "Point", coordinates: [-90.0715, 29.9511] },
    },
    {
      type: "Feature",
      properties: { genre: "Techno", origin: "Detroit" },
      geometry: { type: "Point", coordinates: [-83.0458, 42.3314] },
    },
    {
      type: "Feature",
      properties: { genre: "Grunge", origin: "Seattle" },
      geometry: { type: "Point", coordinates: [-122.3321, 47.6062] },
    },
    {
      type: "Feature",
      properties: { genre: "Bossa Nova", origin: "Rio de Janeiro" },
      geometry: { type: "Point", coordinates: [-43.1729, -22.9068] },
    },
  ],
};

export const OCEAN_CURRENTS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Gulf Stream", color: "#3b82f6" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-80, 25],
          [-75, 35],
          [-50, 45],
          [-20, 50],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Kuroshio Current", color: "#3b82f6" },
      geometry: {
        type: "LineString",
        coordinates: [
          [125, 20],
          [130, 30],
          [140, 40],
          [150, 45],
        ],
      },
    },
  ],
};

export const SHIPWRECKS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "RMS Titanic", year: 1912, depth: 3800 },
      geometry: { type: "Point", coordinates: [-49.9469, 41.7325] },
    },
    {
      type: "Feature",
      properties: { name: "Vasa", year: 1628, depth: 32 },
      geometry: { type: "Point", coordinates: [18.0933, 59.3277] },
    },
  ],
};

export const SPACEPORTS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Kennedy Space Center" },
      geometry: { type: "Point", coordinates: [-80.6043, 28.5728] },
    },
    {
      type: "Feature",
      properties: { name: "Baikonur Cosmodrome" },
      geometry: { type: "Point", coordinates: [63.305, 45.9645] },
    },
    {
      type: "Feature",
      properties: { name: "Guiana Space Centre" },
      geometry: { type: "Point", coordinates: [-52.6815, 5.2372] },
    },
  ],
};

export const CRATERS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Chicxulub", age: "66M years" },
      geometry: { type: "Point", coordinates: [-89.5, 21.4] },
    },
    {
      type: "Feature",
      properties: { name: "Meteor Crater", age: "50k years" },
      geometry: { type: "Point", coordinates: [-111.0222, 35.0274] },
    },
    {
      type: "Feature",
      properties: { name: "Vredefort", age: "2B years" },
      geometry: { type: "Point", coordinates: [27.4667, -27.0] },
    },
  ],
};

export const LIGHT_POLLUTION = {
  type: "FeatureCollection",
  features: [
    // Represented as heat nodes for light pollution
    {
      type: "Feature",
      properties: { intensity: 0.9 },
      geometry: { type: "Point", coordinates: [-74.006, 40.7128] },
    }, // NYC
    {
      type: "Feature",
      properties: { intensity: 0.9 },
      geometry: { type: "Point", coordinates: [139.6917, 35.6895] },
    }, // Tokyo
    {
      type: "Feature",
      properties: { intensity: 0.8 },
      geometry: { type: "Point", coordinates: [-0.1276, 51.5074] },
    }, // London
    {
      type: "Feature",
      properties: { intensity: 0.1 },
      geometry: { type: "Point", coordinates: [0, -90] },
    }, // South Pole (dark)
  ],
};

export const ANCIENT_TREES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Methuselah (4,850+ years)", kind: "Great Basin Bristlecone Pine" },
      geometry: { type: "Point", coordinates: [-118.17, 37.38] },
    },
    {
      type: "Feature",
      properties: { name: "Hyperion (Tallest)", kind: "Coast Redwood" },
      geometry: { type: "Point", coordinates: [-124.0, 41.2] },
    },
    {
      type: "Feature",
      properties: { name: "Pando (Clonal Colony)", kind: "Quaking Aspen" },
      geometry: { type: "Point", coordinates: [-111.75, 38.52] },
    },
  ],
};

export const ENDANGERED_SPECIES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Amur Leopard", population: "≈ 120" },
      geometry: { type: "Point", coordinates: [131.0, 43.5] },
    },
    {
      type: "Feature",
      properties: { name: "Vaquita", population: "≈ 10" },
      geometry: { type: "Point", coordinates: [-114.5, 31.0] },
    },
    {
      type: "Feature",
      properties: { name: "Javan Rhino", population: "≈ 75" },
      geometry: { type: "Point", coordinates: [105.4, -6.7] },
    },
  ],
};

export const BIOMES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Amazon Rainforest", type: "Tropical Rainforest", color: "#22c55e" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-70, -10],
            [-50, -5],
            [-45, -10],
            [-60, -20],
            [-70, -10],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Sahara Desert", type: "Desert", color: "#fcd34d" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-10, 20],
            [10, 30],
            [30, 25],
            [10, 15],
            [-10, 20],
          ],
        ],
      },
    },
  ],
};

export const MEGA_ENGINEERING = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Three Gorges Dam", type: "Dam" },
      geometry: { type: "Point", coordinates: [111.0, 30.8] },
    },
    {
      type: "Feature",
      properties: { name: "Palm Jumeirah", type: "Artificial Archipelago" },
      geometry: { type: "Point", coordinates: [55.13, 25.11] },
    },
    {
      type: "Feature",
      properties: { name: "Panama Canal", type: "Canal" },
      geometry: { type: "Point", coordinates: [-79.91, 9.1] },
    },
  ],
};

export const NUCLEAR_SITES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Trinity Site", year: 1945 },
      geometry: { type: "Point", coordinates: [-106.47, 33.67] },
    },
    {
      type: "Feature",
      properties: { name: "Bikini Atoll", year: 1946 },
      geometry: { type: "Point", coordinates: [165.5, 11.6] },
    },
    {
      type: "Feature",
      properties: { name: "Novaya Zemlya (Tsar Bomba)", year: 1961 },
      geometry: { type: "Point", coordinates: [54.0, 73.5] },
    },
  ],
};

export const RESOURCE_EXTRACTION = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Bingham Canyon Mine", type: "Copper" },
      geometry: { type: "Point", coordinates: [-112.15, 40.52] },
    },
    {
      type: "Feature",
      properties: { name: "Chuquicamata", type: "Copper" },
      geometry: { type: "Point", coordinates: [-68.9, -22.3] },
    },
    {
      type: "Feature",
      properties: { name: "Ghawar Field", type: "Oil" },
      geometry: { type: "Point", coordinates: [49.5, 25.5] },
    },
  ],
};

export const ANCIENT_WONDERS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Great Pyramid of Giza" },
      geometry: { type: "Point", coordinates: [31.13, 29.98] },
    },
    {
      type: "Feature",
      properties: { name: "Hanging Gardens of Babylon" },
      geometry: { type: "Point", coordinates: [44.42, 32.53] },
    },
    {
      type: "Feature",
      properties: { name: "Colossus of Rhodes" },
      geometry: { type: "Point", coordinates: [28.22, 36.45] },
    },
  ],
};

export const MODERN_MARVELS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Burj Khalifa" },
      geometry: { type: "Point", coordinates: [55.27, 25.2] },
    },
    {
      type: "Feature",
      properties: { name: "Millau Viaduct" },
      geometry: { type: "Point", coordinates: [3.02, 44.08] },
    },
    {
      type: "Feature",
      properties: { name: "Large Hadron Collider" },
      geometry: { type: "Point", coordinates: [6.05, 46.23] },
    },
  ],
};

export const ABANDONED_PLACES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Hashima Island" },
      geometry: { type: "Point", coordinates: [129.74, 32.62] },
    },
    {
      type: "Feature",
      properties: { name: "Ryugyong Hotel" },
      geometry: { type: "Point", coordinates: [125.74, 39.03] },
    },
    {
      type: "Feature",
      properties: { name: "Pripyat" },
      geometry: { type: "Point", coordinates: [30.05, 51.4] },
    },
  ],
};

export const UNDERSEA_CABLES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "TAT-14 (Transatlantic)" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-74, 40],
          [-40, 45],
          [-10, 50],
          [4, 52],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "SEA-ME-WE 3" },
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 50],
          [-10, 35],
          [30, 31],
          [60, 20],
          [80, 5],
          [115, -30],
          [150, -35],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "FASTER (Transpacific)" },
      geometry: {
        type: "LineString",
        coordinates: [
          [-124, 45],
          [-160, 30],
          [160, 35],
          [140, 35],
        ],
      },
    },
  ],
};

export const CAVE_SYSTEMS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Mammoth Cave" },
      geometry: { type: "Point", coordinates: [-86.1, 37.18] },
    },
    {
      type: "Feature",
      properties: { name: "Son Doong" },
      geometry: { type: "Point", coordinates: [106.28, 17.45] },
    },
    {
      type: "Feature",
      properties: { name: "Sistema Sac Actun" },
      geometry: { type: "Point", coordinates: [-87.46, 20.24] },
    },
  ],
};

export const SUBTERRANEAN_TRANSIT = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Tokyo Metro" },
      geometry: { type: "Point", coordinates: [139.76, 35.68] },
    },
    {
      type: "Feature",
      properties: { name: "London Underground" },
      geometry: { type: "Point", coordinates: [-0.12, 51.5] },
    },
    {
      type: "Feature",
      properties: { name: "New York City Subway" },
      geometry: { type: "Point", coordinates: [-74.0, 40.71] },
    },
  ],
};

export const WEALTH_CENTERS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "New York City (Financial District)" },
      geometry: { type: "Point", coordinates: [-74.01, 40.71] },
    },
    {
      type: "Feature",
      properties: { name: "London (The City)" },
      geometry: { type: "Point", coordinates: [-0.09, 51.51] },
    },
    {
      type: "Feature",
      properties: { name: "Tokyo (Marunouchi)" },
      geometry: { type: "Point", coordinates: [139.76, 35.68] },
    },
  ],
};

export const ENERGY_GRIDS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Bhadla Solar Park", type: "Solar" },
      geometry: { type: "Point", coordinates: [71.91, 27.53] },
    },
    {
      type: "Feature",
      properties: { name: "Gansu Wind Farm", type: "Wind" },
      geometry: { type: "Point", coordinates: [96.0, 40.0] },
    },
    {
      type: "Feature",
      properties: { name: "Itaipu Dam", type: "Hydroelectric" },
      geometry: { type: "Point", coordinates: [-54.58, -25.4] },
    },
  ],
};

export const GLOBAL_LITERACY = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Library of Alexandria (Historical)" },
      geometry: { type: "Point", coordinates: [29.91, 31.2] },
    },
    {
      type: "Feature",
      properties: { name: "Oxford University" },
      geometry: { type: "Point", coordinates: [-1.25, 51.75] },
    },
    {
      type: "Feature",
      properties: { name: "MIT" },
      geometry: { type: "Point", coordinates: [-71.09, 42.36] },
    },
  ],
};

export const EXTREME_CLIMATES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Death Valley (Hottest)", temp: "56.7°C" },
      geometry: { type: "Point", coordinates: [-116.82, 36.24] },
    },
    {
      type: "Feature",
      properties: { name: "Oymyakon (Coldest)", temp: "-67.7°C" },
      geometry: { type: "Point", coordinates: [143.15, 63.46] },
    },
    {
      type: "Feature",
      properties: { name: "Mawsynram (Wettest)", rain: "11,872mm/yr" },
      geometry: { type: "Point", coordinates: [91.58, 25.3] },
    },
    {
      type: "Feature",
      properties: { name: "Atacama Desert (Driest)", rain: "<1mm/yr" },
      geometry: { type: "Point", coordinates: [-69.25, -23.86] },
    },
  ],
};

export const ANOMALIES = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Bermuda Triangle" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-80.19, 25.76],
            [-64.75, 32.3],
            [-66.1, 18.42],
            [-80.19, 25.76],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Magnetic North Pole (Approx)" },
      geometry: { type: "Point", coordinates: [-100.0, 86.0] },
    },
  ],
};

export const DEEP_SPACE = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "FAST Telescope" },
      geometry: { type: "Point", coordinates: [106.85, 25.65] },
    },
    {
      type: "Feature",
      properties: { name: "Very Large Array (VLA)" },
      geometry: { type: "Point", coordinates: [-107.61, 34.07] },
    },
    {
      type: "Feature",
      properties: { name: "Arecibo Observatory (Destroyed)" },
      geometry: { type: "Point", coordinates: [-66.75, 18.34] },
    },
  ],
};

export const JOURNEYS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "The Silk Road", color: "#f59e0b" }, // amber
      geometry: {
        type: "LineString",
        coordinates: [
          [108.9, 34.2], // Xi'an
          [94.6, 40.1], // Dunhuang
          [75.9, 39.4], // Kashgar
          [69.2, 41.2], // Tashkent
          [51.4, 35.6], // Tehran
          [44.3, 33.3], // Baghdad
          [36.2, 33.5], // Damascus
          [28.9, 41.0], // Istanbul
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "Magellan's Circumnavigation", color: "#3b82f6" }, // blue
      geometry: {
        type: "LineString",
        coordinates: [
          [-6.2, 36.5], // Cadiz
          [-43.1, -22.9], // Rio
          [-68.3, -54.8], // Strait of Magellan
          [121.0, 14.5], // Philippines
          [103.8, 1.3], // Malacca
          [18.4, -33.9], // Cape of Good Hope
          [-6.2, 36.5], // Cadiz
        ],
      },
    },
  ],
};
