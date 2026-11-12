import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { moodById } from "../src/moods.js";
import { rank } from "../src/scoring.js";
import { discover, tmdb } from "./tmdb.js";
const app = express();
app.use(express.json({ limit: "10kb" }));
app.post("/api/recommend", async (req, res) => {
  const b = req.body ?? {};
  const cur = (Array.isArray(b.current) ? b.current : []).map(moodById).filter(Boolean);
  const des = (Array.isArray(b.desired) ? b.desired : []).map(moodById).filter(Boolean);
  if (!cur.length || !des.length || cur.length > 4 || des.length > 4) return res.status(400).json({ error: "Pick 1-4 current and 1-4 desired moods." });
  const type = ["all", "movie", "tv"].includes(b.type) ? b.type : "all";
  const maturity = ["family", "teen", "any"].includes(b.maturity) ? b.maturity : "any";
  const language = typeof b.language === "string" && /^([a-z]{2}|any)$/.test(b.language) ? b.language : "any";
  try {
    const genres = [...new Set(des.flatMap((m) => Object.keys(m.desire)))];
    res.json({ results: rank(await discover({ genres, type, language, maturity }), cur, des, 20) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/title/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  if (!["movie", "tv"].includes(type) || !/^\d+$/.test(id)) return res.status(400).json({ error: "Invalid title" });
  try {
    const d = await tmdb(`/${type}/${id}`, { append_to_response: "credits,videos,watch/providers" });
    const region = process.env.WATCH_REGION || "IN";
    const trailer = d.videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer");
    res.json({ title: d.title ?? d.name, year: (d.release_date ?? d.first_air_date ?? "").slice(0, 4), runtime: d.runtime ?? d.episode_run_time?.[0] ?? null,
      language: d.original_language, rating: d.vote_average, overview: d.overview, backdrop: d.backdrop_path, poster: d.poster_path,
      director: d.credits?.crew?.find((c) => c.job === "Director")?.name ?? d.created_by?.map((c) => c.name).join(", ") ?? null,
      cast: (d.credits?.cast ?? []).slice(0, 6).map((c) => c.name), trailerKey: trailer?.key ?? null,
      providers: (d["watch/providers"]?.results?.[region]?.flatrate ?? []).map((p) => p.provider_name), region });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../dist");
app.use(express.static(dist));
app.use((req, res) => res.sendFile(path.join(dist, "index.html"), (err) => err && res.status(404).send("Run `npm run build` first.")));
app.listen(process.env.PORT || 3001, () => console.log("WatchBed API on port " + (process.env.PORT || 3001)));
