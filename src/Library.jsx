import { useCallback, useEffect, useState } from "react";
import { supabase, signIn, useSession } from "./supabase.js";
const IMG = "https://image.tmdb.org/t/p/w185";
const Poster = ({ i }) => <a className="card" href={`#/title/${i.media_type}/${i.tmdb_id}`}>{i.poster_path ? <img src={IMG + i.poster_path} alt={i.title} loading="lazy" /> : <div className="ph" />}<p>{i.title}</p></a>;
export default function Library() {
  const session = useSession();
  const [lists, setLists] = useState([]), [seen, setSeen] = useState([]), [name, setName] = useState(""), [error, setError] = useState("");
  const load = useCallback(async () => {
    const [l, s] = await Promise.all([
      supabase.from("watchlists").select("id,name,watchlist_items(id,media_type,tmdb_id,title,poster_path)").order("created_at"),
      supabase.from("title_status").select("media_type,tmdb_id,title,poster_path,watched,rating").or("watched.eq.true,rating.not.is.null").order("updated_at", { ascending: false }),
    ]);
    const err = l.error || s.error; if (err) return setError(err.message);
    setError(""); setLists(l.data); setSeen(s.data);
  }, []);
  useEffect(() => { if (session) load(); }, [session, load]);
  const run = async (p) => { const r = await p; if (r.error) setError(r.error.message); else load(); };
  if (!supabase) return <p className="err">Accounts are not set up. Add your Supabase keys to .env (see README).</p>;
  if (session === undefined) return <div className="skeleton" />;
  if (!session) return <><h2>My library</h2><p className="muted">Sign in to see your watchlists and ratings.</p><button className="btn" onClick={signIn}>Sign in with Google</button></>;
  return (
    <div>
      <h2>My library</h2>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="row"><input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="New list, e.g. Horror night" aria-label="New list name" />
        <button className="btn" onClick={() => name.trim() && run(supabase.from("watchlists").insert({ name: name.trim() })).then(() => setName(""))}>Create list</button></div>
      {lists.map((l) => (
        <section key={l.id} style={{ marginTop: "2rem" }}>
          <div className="row" style={{ margin: 0, alignItems: "center" }}><h3 style={{ margin: 0 }}>{l.name} ({l.watchlist_items.length})</h3>
            <button className="btn alt" onClick={() => confirm(`Delete "${l.name}" and its saved titles?`) && run(supabase.from("watchlists").delete().eq("id", l.id))}>Delete list</button></div>
          {l.watchlist_items.length ? <ul className="grid" style={{ marginTop: ".75rem" }}>{l.watchlist_items.map((i) => <li key={i.id}><Poster i={i} />
            <button className="btn alt" style={{ width: "100%", marginTop: ".25rem" }} onClick={() => run(supabase.from("watchlist_items").delete().eq("id", i.id))}>Remove</button></li>)}</ul>
            : <p className="muted">Empty. Open a title and save it here.</p>}
        </section>))}
      {!lists.length && <p className="muted" style={{ marginTop: "1.5rem" }}>No lists yet. Create one above.</p>}
      <section style={{ marginTop: "2.5rem" }}><h3>Watched and rated</h3>
        {seen.length ? <ul className="grid">{seen.map((i) => <li key={i.media_type + i.tmdb_id}><Poster i={i} /><p style={{ margin: 0 }}>{i.rating ? "★".repeat(i.rating) : "Watched"}</p></li>)}</ul> : <p className="muted">Nothing yet.</p>}</section>
    </div>
  );
}
