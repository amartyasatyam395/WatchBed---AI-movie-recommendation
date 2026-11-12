import { useEffect, useState } from "react";
import { supabase, signIn, useSession } from "./supabase.js";
export default function TitleActions({ type, id, title, poster }) {
  const session = useSession();
  const [lists, setLists] = useState([]), [member, setMember] = useState(new Set());
  const [status, setStatus] = useState({ watched: false, rating: null }), [name, setName] = useState(""), [error, setError] = useState("");
  const fail = (r) => { if (r.error) { setError(r.error.message); return true; } setError(""); return false; };
  useEffect(() => {
    if (!session) return;
    (async () => {
      const [l, m, s] = await Promise.all([
        supabase.from("watchlists").select("id,name").order("created_at"),
        supabase.from("watchlist_items").select("watchlist_id").eq("media_type", type).eq("tmdb_id", id),
        supabase.from("title_status").select("watched,rating").eq("media_type", type).eq("tmdb_id", id).maybeSingle(),
      ]);
      if ([l, m, s].some(fail)) return;
      setLists(l.data); setMember(new Set(m.data.map((x) => x.watchlist_id))); if (s.data) setStatus(s.data);
    })();
  }, [session, type, id]);
  if (!supabase) return null;
  if (!session) return session === null ? <button className="btn alt" style={{ marginTop: "1rem" }} onClick={signIn}>Sign in to save and rate</button> : null;
  const item = (watchlist_id) => ({ watchlist_id, media_type: type, tmdb_id: id, title, poster_path: poster });
  async function toggle(listId) {
    const has = member.has(listId);
    const r = has ? await supabase.from("watchlist_items").delete().eq("watchlist_id", listId).eq("media_type", type).eq("tmdb_id", id)
                  : await supabase.from("watchlist_items").insert(item(listId));
    if (fail(r)) return;
    const n = new Set(member); has ? n.delete(listId) : n.add(listId); setMember(n);
  }
  async function create() {
    const nm = name.trim(); if (!nm) return;
    const r = await supabase.from("watchlists").insert({ name: nm }).select("id,name").single();
    if (fail(r)) return;
    setLists([...lists, r.data]); setName(""); toggle(r.data.id);
  }
  async function save(next) {
    const r = await supabase.from("title_status").upsert({ user_id: session.user.id, media_type: type, tmdb_id: id, title, poster_path: poster, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id,media_type,tmdb_id" });
    if (!fail(r)) setStatus((s) => ({ ...s, ...next }));
  }
  return (
    <div className="actions">
      <div role="group" aria-label="Your rating"><b>Your rating: </b>
        {[1, 2, 3, 4, 5].map((n) => <button key={n} className="star" aria-pressed={status.rating >= n} aria-label={`${n} of 5`} onClick={() => save(status.rating === n ? { rating: null } : { rating: n, watched: true })}>★</button>)}
      </div>
      <label className="check"><input type="checkbox" checked={status.watched} onChange={(e) => save({ watched: e.target.checked })} /> Watched</label>
      <div><b>Save to list:</b>
        <div className="chips">{lists.map((l) => <button key={l.id} className="chip" aria-pressed={member.has(l.id)} onClick={() => toggle(l.id)}>{l.name}</button>)}</div>
        <div className="row" style={{ marginTop: ".5rem" }}><input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} placeholder="New list, e.g. Weekend" aria-label="New list name" /><button className="btn alt" onClick={create}>Create and add</button></div>
      </div>
      {error && <p className="err" role="alert">{error}</p>}
    </div>
  );
}
