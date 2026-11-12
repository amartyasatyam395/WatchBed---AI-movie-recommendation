import { supabase, signIn, useSession } from "./supabase.js";
export default function AuthBar() {
  const session = useSession();
  if (!supabase || session === undefined) return null;
  if (!session) return <button className="btn" onClick={signIn}>Sign in with Google</button>;
  return (
    <>
      <a href="#/library" className="btn alt" style={{ textDecoration: "none" }}>My library</a>
      <button className="btn alt" onClick={() => supabase.auth.signOut()}>Sign out</button>
    </>
  );
}
