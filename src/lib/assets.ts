// Base-aware static asset path helper.
// import.meta.env.BASE_URL is inlined by Vite at build time:
//   Vercel root build  -> "/"        -> asset("images/x.jpg") = "/images/x.jpg"
//   Firebase subpath   -> "/clinic4" -> asset("images/x.jpg") = "/clinic4/images/x.jpg"
const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");

export function asset(p: string): string {
  return `${BASE}/${p.replace(/^\//, "")}`;
}
