"use server";

import { createServerFn } from "@tanstack/react-start";
import Groq from "groq-sdk";
import type { PlaceHit } from "./api";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Using llama-3.1-8b-instant for blazing fast responses
const MODEL = "llama-3.1-8b-instant";

export const performSemanticSearch = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => data)
  .handler(async (ctx) => {
    const { query } = ctx.data;

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing. Semantic search is disabled.");
    }

    // We ask the LLM to output a JSON array of up to 5 places matching the semantic query
    const systemPrompt = `You are a geographical and historical knowledge engine for an application called Atlas.
The user will provide a semantic or historical description of places (e.g. "places where ancient rome met the han dynasty" or "cities built on top of volcanoes").
Your job is to identify up to 5 specific, real-world locations that match the query.
Return your response ONLY as a JSON object containing a single key "places" mapped to an array of objects. Do not include markdown formatting like \`\`\`json.
Each object in the "places" array must match this TypeScript interface:
{
  "name": string, // Short name (e.g. "Naples")
  "displayName": string, // Longer descriptive name including region/country
  "lat": number, // Latitude
  "lng": number, // Longitude
  "kind": string, // A short categorisation (e.g. "historical", "geological", "city")
  "reason": string // A 1-2 sentence explanation of why this place matches the query
}
`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        model: MODEL,
        temperature: 0.2, // Low temperature for factual consistency
        response_format: { type: "json_object" }, // we'll wrap it in { places: [] } to ensure valid JSON object for groq
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return [];

      return JSON.parse(content).places as (PlaceHit & { reason: string })[];
    } catch (e) {
      console.error("Semantic search error:", e);
      return [];
    }
  });

export const generateLocationDeepDive = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; lat: number; lng: number }) => data)
  .handler(async (ctx) => {
    const { name, lat, lng } = ctx.data;

    if (!process.env.GROQ_API_KEY) {
      return null;
    }

    const systemPrompt = `You are an expert geographer, historian, and earth scientist.
The user is looking at a place named "${name}" at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}).
Generate a deep-dive contextual abstract for this place. Do NOT just give a Wikipedia summary.
Provide an engaging 3-paragraph response covering:
1. The geological formation or physical reality of the location.
2. Its historical or cultural significance across deep time.
3. Its modern geopolitical or economic reality.
Keep it under 200 words. Return raw text, no markdown.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }],
        model: "llama-3.3-70b-versatile", // Need intelligence for nuanced vibe check
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || null;
    } catch (e) {
      console.error("Deep dive error:", e);
      return null;
    }
  });

export const generateVibeCheck = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; lat: number; lng: number }) => data)
  .handler(async (ctx) => {
    const { name, lat, lng } = ctx.data;

    if (!process.env.GROQ_API_KEY) return null;

    const systemPrompt = `You are an edgy, highly informed geopolitical analyst and cultural commentator.
The user is looking at "${name}" at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}).
Give a 2-paragraph "vibe check" or synthetic news brief about this location right now.
What is the current atmosphere, economic tension, or cultural pulse of this place today?
Keep it under 150 words. Return raw text, no markdown.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || null;
    } catch (e) {
      console.error("Vibe check error:", e);
      return null;
    }
  });

export const findConnectedPlaces = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; lat: number; lng: number }) => data)
  .handler(async (ctx) => {
    const { name, lat, lng } = ctx.data;

    if (!process.env.GROQ_API_KEY) return [];

    const systemPrompt = `You are a geographic knowledge graph engine.
The user is looking at "${name}" at coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}).
Find 3 other real-world locations that are strongly connected to this place through history, trade, geology, or culture.
Return ONLY a JSON object containing a "places" array. Do not include markdown formatting like \`\`\`json.
Each object must have:
{
  "name": string,
  "displayName": string,
  "lat": number,
  "lng": number,
  "kind": "connection",
  "reason": string // 1 sentence explaining the deep connection
}
`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: "system", content: systemPrompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return [];

      return JSON.parse(content).places as (PlaceHit & { reason: string })[];
    } catch (e) {
      console.error("Connection search error:", e);
      return [];
    }
  });
