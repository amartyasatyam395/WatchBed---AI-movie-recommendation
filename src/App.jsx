import { useEffect, useState } from "react";
import { MOODS } from "./moods.js";
import AuthBar from "./Auth.jsx";
import Library from "./Library.jsx";
import TitleActions from "./TitleActions.jsx";
const IMG = "https://image.tmdb.org/t/p/";
const LANGS = [["any", "Any language"], ["en", "English"], ["hi", "Hindi"], ["pa", "Punjabi"], ["ta", "Tamil"], ["te", "Telugu"], ["ml", "Malayalam"], ["kn", "Kannada"], ["ko", "Korean"], ["ja", "Japanese"], ["es", "Spanish"]];

function ThemeToggle() {
  const [mode, setMode] = useState(() => { try { return localStorage.getItem("theme") || "system"; } catch { return "system"; } });
  const apply = (m) => {
    setMode(m);
    try { m === "system" ? localStorage.removeItem("theme") : localStorage.setItem("theme", m); } catch {}
    const dark = m === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : m === "dark";
    document.documentElement.classList.toggle("dark", dark);
  };
  return <div className="seg" role="group" aria-label="Theme">{["system", "light", "dark"].map((m) => <button key={m} aria-pressed={mode === m} onClick={() => apply(m)}>{m}</button>)}</div>;
}

function MoodPicker({ title, hint, value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : value.length < 4 ? [...value, id] : value);
  return (
    <section>
      <h2>{title}</h2><p className="muted">{hint}</p>
      <div className="moods">{MOODS.map((m) => (
        <button key={m.id} className="mood" aria-pressed={value.includes(m.id)} onClick={() => toggle(m.id)}><b>{m.label}</b><span>{m.blurb}</span></button>
      ))}</div>
    </section>
  );
}

const Select = ({ label, value, onChange, options }) => (
  <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
);
const Badge = ({ s }) => <span className="badge">{s}% match</span>;
const href = (r) => `#/title/${r.mediaType}/${r.id}`;

function Results({ results, onRestart }) {
  const [grid, setGrid] = useState(false);
  const hero = results[0];
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginTop: 0, marginBottom: "1rem" }}>
        <button className="btn alt" onClick={onRestart}>Start over</button>
        <button className="btn alt" onClick={() => setGrid(!grid)}>{grid ? "Show best match" : "Show all matches"}</button>
      </div>
      {!grid ? (
        <a className="hero" href={href(hero)}>
          {hero.backdropPath && <img src={IMG + "w1280" + hero.backdropPath} alt="" />}
          <div className="cap"><Badge s={hero.score} /><h2 style={{ marginTop: ".5rem" }}>{hero.title}</h2><p style={{ maxWidth: "40rem" }}>{hero.explanation}</p></div>
        </a>
      ) : (
        <ol className="grid">{results.map((r, i) => (
          <li key={r.mediaType + r.id}><a className="card" href={href(r)}>
            {r.posterPath ? <img src={IMG + "w342" + r.posterPath} alt={r.title} loading="lazy" /> : <div className="ph" />}
            <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem", marginTop: ".5rem" }}><b>{r.title}</b><Badge s={r.score} /></div>
            {i < 5 && r.explanation && <p>{r.explanation}</p>}
          </a></li>
        ))}</ol>
      )}
    </>
  );
}

function Home() {
  const [step, setStep] = useState(0);
  const [cur, setCur] = useState([]), [des, setDes] = useState([]);
  const [type, setType] = useState("all"), [language, setLanguage] = useState("any"), [maturity, setMaturity] = useState("any");
  const [results, setResults] = useState([]), [loading, setLoading] = useState(false), [error, setError] = useState("");
  async function go() {
    setLoading(true); setError(""); setStep(3);
    try {
      const r = await fetch("/api/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: cur, desired: des, type, language, maturity }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setResults(d.results);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  return (
    <>
      {step === 0 && <><h1>Find what you&apos;re feeling.</h1><p className="muted">Tell us how you feel now and how you want to feel. We&apos;ll find the movie or show for it.</p><button className="btn" style={{ marginTop: "1.5rem" }} onClick={() => setStep(1)}>Start</button></>}
      {step === 1 && <MoodPicker title="How do you feel right now?" hint="Pick up to four." value={cur} onChange={setCur} />}
      {step === 2 && <>
        <MoodPicker title="How do you want to feel?" hint="Pick up to four." value={des} onChange={setDes} />
        <div className="filters">
          <Select label="Show me" value={type} onChange={setType} options={[["all", "Movies and TV"], ["movie", "Movies"], ["tv", "TV shows"]]} />
          <Select label="Language" value={language} onChange={setLanguage} options={LANGS} />
          <Select label="Content limit" value={maturity} onChange={setMaturity} options={[["any", "Anything"], ["teen", "No horror"], ["family", "Family-friendly (no horror, thriller, crime, war)"]]} />
        </div></>}
      {(step === 1 || step === 2) && (
        <div className="row">
          <button className="btn alt" onClick={() => setStep(step - 1)}>Back</button>
          {step === 1 ? <button className="btn" disabled={!cur.length} onClick={() => setStep(2)}>Next</button> : <button className="btn" disabled={!des.length} onClick={go}>Find my watch</button>}
        </div>)}
      {step === 3 && (loading ? <div className="skeleton" aria-busy="true" /> : error ? <p className="err" role="alert">{error}</p>
        : results.length ? <Results results={results} onRestart={() => setStep(1)} /> : <p>No matches. Try a different language or content limit.</p>)}
    </>
  );
}

function Title({ type, id }) {
  const [d, setD] = useState(null), [error, setError] = useState("");
  useEffect(() => {
    setD(null); setError("");
    fetch(`/api/title/${type}/${id}`).then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error); setD(j); }).catch((e) => setError(e.message));
  }, [type, id]);
  if (error) return <p className="err" role="alert">{error}</p>;
  if (!d) return <div className="skeleton" aria-busy="true" />;
  return (
    <article>
      <a href="#/" onClick={(e) => { e.preventDefault(); history.back(); }}>Back</a>
      <div className="detail" style={{ marginTop: "1rem" }}>
        {d.backdrop && <img className="bd" src={IMG + "w1280" + d.backdrop} alt="" />}
        <div className="in">
          {d.poster && <img className="po" src={IMG + "w342" + d.poster} alt={d.title} />}
          <div style={{ flex: 1, minWidth: "16rem" }}>
            <h1 style={{ margin: 0, fontSize: "2.5rem" }}>{d.title}</h1>
            <p className="muted">{[d.year, d.runtime && `${d.runtime} min`, d.language?.toUpperCase(), `${d.rating?.toFixed(1)}/10 on TMDB`].filter(Boolean).join(", ")}</p>
            <p style={{ maxWidth: "40rem" }}>{d.overview || "No synopsis available."}</p>
            {d.director && <p><b>{type === "tv" ? "Created by" : "Director"}:</b> {d.director}</p>}
            <p><b>Cast:</b> {d.cast.join(", ") || "Not listed"}</p>
            <TitleActions type={type} id={Number(id)} title={d.title} poster={d.poster} />
            {d.trailerKey && <a className="btn" style={{ display: "inline-block", textDecoration: "none" }} href={`https://www.youtube.com/watch?v=${d.trailerKey}`} target="_blank" rel="noreferrer">Watch trailer</a>}
          </div>
        </div>
      </div>
      <h2 style={{ fontSize: "1.3rem", marginTop: "2rem" }}>Where to watch ({d.region})</h2>
      <p>{d.providers.length ? `Streaming on: ${d.providers.join(", ")}` : "No streaming information for this region."}</p>
      <p className="muted" style={{ fontSize: ".75rem" }}>Availability data provided by JustWatch via TMDB. It can be out of date.</p>
    </article>
  );
}

export default function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => { const f = () => setHash(location.hash); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  const m = hash.match(/^#\/title\/(movie|tv)\/(\d+)$/);
  return (
    <div className="wrap">
      <header className="bar"><a className="logo" href="#/">WatchBed</a><div className="row" style={{ margin: 0, alignItems: "center" }}><AuthBar /><ThemeToggle /></div></header>
      <main>{m ? <Title type={m[1]} id={m[2]} /> : hash === "#/library" ? <Library /> : <Home />}</main>
      <footer>This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming data provided by JustWatch via TMDB.</footer>
    </div>
  );
}
