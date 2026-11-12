import { describe, it, expect } from "vitest";
import { rank, scoreTitle } from "./scoring.js";
import { moodById } from "./moods.js";
const base= { id: 1, mediaType: "movie", title: "T", overview: "", posterPath: null, backdropPath: null, releaseDate: "2020-01-01", voteAverage: 7, voteCount: 1000, popularity: 50, originalLanguage: "en", genres: [] };
const m = (id) => moodById(id);
describe("scoring", () => {
  it("prefers a comedy when wanting to feel happy", () => {
    const r = rank([{ ...base, id: 1, genres: ["drama"] }, { ...base, id: 2, genres: ["comedy"] }], [m("bored")], [m("happy")]);
    expect(r[0].id).toBe(2);
  });
  it("penalises clashing genres for the current mood", () => {
    const calm = scoreTitle({ ...base, genres: ["comedy"] }, [m("stressed")], [m("happy")]);
    const clash = scoreTitle({ ...base, genres: ["comedy", "thriller"] }, [m("stressed")], [m("happy")]);
    expect(calm).toBeGreaterThan(clash);
  });
  it("explains only the top five and removes duplicates", () => {
    const list = Array.from({ length: 8 }, (_, i) => ({ ...base, id: i, genres: ["comedy"] }));
    const r = rank([...list, list[0]], [m("sad")], [m("happy")]);
    expect(r.length).toBe(8);
    expect(r.filter((x) => x.explanation).length).toBe(5);
  });
  it("keeps scores within 0-100", () => {
    const s = scoreTitle({ ...base, voteAverage: 10, popularity: 1e6, genres: ["comedy"] }, [], [m("happy")]);
    expect(s).toBeLessThanOrEqual(100); expect(s).toBeGreaterThanOrEqual(0);
  });
});
