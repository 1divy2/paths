import { performSemanticSearch } from "./src/lib/paths/ai.ts";

(async () => {
  try {
    const res = await performSemanticSearch({ data: { query: "fateh sagar" } });
    console.log("Result:", res);
  } catch(e) {
    console.error("Error:", e);
  }
})();
