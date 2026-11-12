import { EXCLUDED_BY_MATURITY } from "../src/moods.js";
const BASE = "https://api.themoviedb.org/3";
// TMDB genre ids -> our genre names. Verify against TMDB's /genre/{movie,tv}/list if TMDB changes them.
const IDS = { 28: ["action"], 12: ["adventure"], 16: ["animation"], 35: ["comedy"], 80: ["crime"], 99: ["documentary"], 18: ["drama"], 10751: ["family"], 14: ["fantasy"], 36: ["history"], 27: ["horror"], 10402: ["music"], 9648: ["mystery"], 10749: ["romance"], 878: ["scifi"], 53: ["thriller"], 10752: ["war"], 37: ["western"], 10759: ["action", "adventure"], 10765: ["scifi", "fantasy"], 10768: ["war"], 10762: ["family"] };
const idsFor = (g) => Object.entries(IDS).filter(([, v]) => v.length === 1 && v[0] === g).map(([k]) => Number(k));
export async function tmdb(path, params = {}) {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set. Add it to your .env file (see .env.example).");
  const url = new URL(BASE + path);
  Object.entries({ api_key: key, include_adult: "false", ...params }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB request failed (${res.status})`);
  return res.json();
}
const toGenres = (ids) => [...new Set(ids.flatMap((i) => IDS[i] ?? []))];
export async function discover({ genres, type, language, maturity }) {
  const types = type === "all" ? ["movie", "tv"] : [type];
  const withIds = [...new Set(genres.flatMap(idsFor))];
  const without = [...new Set(EXCLUDED_BY_MATURITY[maturity].flatMap(idsFor))];
  const out = await Promise.all(types.flatMap((t) => [1, 2].map(async (page) => {
    const p = { sort_by: "popularity.desc", "vote_count.gte": "200", "vote_average.gte": "6", page: String(page), with_genres: withIds.join("|") };
    if (without.length) p.without_genres = without.join(",");
    if (language !== "any") p.with_original_language = language;
    const data = await tmdb(`/discover/${t}`, p);
    return data.results.map((r) => ({ id: r.id, mediaType: t, title: r.title ?? r.name ?? "Untitled", overview: r.overview, posterPath: r.poster_path, backdropPath: r.backdrop_path, releaseDate: r.release_date ?? r.first_air_date ?? "", voteAverage: r.vote_average, voteCount: r.vote_count, popularity: r.popularity, originalLanguage: r.original_language, genres: toGenres(r.genre_ids) }));
  })));
  return out.flat();
}
