export const WEIGHTS = { desire: 0.5, comfort: 0.2, quality: 0.2, popularity: 0.1 };
const clamp = (n) => Math.max(0, Math.min(1, n));
const fit = (m, g) => { const w = g.map((x) => m.desire[x] ?? 0).sort((a, b) => b - a); return clamp((w[0] ?? 0) + 0.3 * (w[1] ?? 0)); };
export function scoreTitle(t, current, desired) {
  const desire = desired.length ? desired.reduce((s, m) => s + fit(m, t.genres), 0) / desired.length : 0.5;
  const clash = current.length ? current.filter((m) => m.avoid.some((a) => t.genres.includes(a))).length / current.length : 0;
  const quality = clamp((t.voteAverage - 5) / 4) * (t.voteCount < 100 ? 0.7 : 1);
  const pop = clamp(Math.log10(t.popularity + 1) / 3);
  return Math.round(100 * (WEIGHTS.desire * desire + WEIGHTS.comfort * (1 - clash) + WEIGHTS.quality * quality + WEIGHTS.popularity * pop));
}
export function explain(t, current, desired) {
  const best = desired.map((m) => ({ m, f: fit(m, t.genres) })).sort((a, b) => b.f - a.f)[0];
  const hits = best ? t.genres.filter((g) => (best.m.desire[g] ?? 0) > 0) : [];
  const parts = [];
  if (best && hits.length) parts.push(`Its ${hits.join(" and ")} leanings tend to suit wanting to feel ${best.m.label.toLowerCase()}.`);
  else parts.push("It scores well on overall quality and popularity.");
  if (t.voteCount > 0) parts.push(`TMDB users rate it ${t.voteAverage.toFixed(1)}/10 across ${t.voteCount.toLocaleString()} votes.`);
  const safe = current.length && !current.some((m) => m.avoid.some((a) => t.genres.includes(a)));
  if (safe) parts.push(`It steers clear of genres that often clash with feeling ${current.map((m) => m.label.toLowerCase()).join(" or ")}.`);
  return parts.join(" ");
}
export function rank(cands, current, desired, limit = 20) {
  const seen = new Set();
  return cands.filter((c) => !seen.has(c.mediaType + c.id) && seen.add(c.mediaType + c.id))
    .map((c) => ({ ...c, score: scoreTitle(c, current, desired) }))
    .sort((a, b) => b.score - a.score || b.voteCount - a.voteCount).slice(0, limit)
    .map((s, i) => (i < 5 ? { ...s, explanation: explain(s, current, desired) } : s));
}
