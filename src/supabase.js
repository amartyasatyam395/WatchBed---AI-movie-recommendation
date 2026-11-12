import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY;
// The anon key is public by design; the database security rules (migration.sql) protect each user's data.
// PKCE keeps the login redirect out of the URL hash, which this app uses for routing.
export const supabase = url && key ? createClient(url, key, { auth: { flowType: "pkce" } }) : null;
export const signIn = () => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin } });
export function useSession() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}
