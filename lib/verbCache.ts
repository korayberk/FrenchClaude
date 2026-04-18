import { VerbConjugation } from "@/app/api/conjugate/route";

const KEY = "french_verb_cache";
const MAX = 500;

type Cache = Record<string, VerbConjugation>;

export function loadVerbCache(): Cache {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function splitCached(
  infinitives: string[]
): { hits: VerbConjugation[]; misses: string[] } {
  const cache = loadVerbCache();
  const hits: VerbConjugation[] = [];
  const misses: string[] = [];
  for (const inf of infinitives) {
    const key = inf.toLowerCase();
    const cached = cache[key];
    if (cached) hits.push(cached);
    else misses.push(inf);
  }
  return { hits, misses };
}

export function saveVerbs(verbs: VerbConjugation[]): void {
  if (typeof window === "undefined" || verbs.length === 0) return;
  const cache = loadVerbCache();
  for (const v of verbs) {
    const key = v.verb.toLowerCase();
    // Re-insert to move to end (keeps FIFO-by-recency semantics on overflow).
    delete cache[key];
    cache[key] = v;
  }
  const keys = Object.keys(cache);
  if (keys.length > MAX) {
    const drop = keys.length - MAX;
    for (let i = 0; i < drop; i++) delete cache[keys[i]];
  }
  localStorage.setItem(KEY, JSON.stringify(cache));
}
