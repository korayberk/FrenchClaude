import { ConjugateResponse } from "@/app/api/conjugate/route";

export interface HistoryEntry {
  id: string;
  sentence: string;
  tense: string;
  result: ConjugateResponse;
  createdAt: number;
}

const KEY = "french_history";
const MAX = 1000;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveEntry(entry: HistoryEntry): void {
  const entries = loadHistory();
  entries.unshift(entry);
  if (entries.length > MAX) entries.length = MAX;
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function deleteEntry(id: string): void {
  const entries = loadHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function groupByTense(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const groups: Record<string, HistoryEntry[]> = {};
  for (const entry of entries) {
    const key = entry.tense || "Unknown";
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

export function groupByDay(entries: HistoryEntry[]): { label: string; entries: HistoryEntry[] }[] {
  const map = new Map<string, HistoryEntry[]>();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  for (const entry of entries) {
    const d = new Date(entry.createdAt);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    let label: string;
    if (dayStart === todayStart) label = "Today";
    else if (dayStart === yesterdayStart) label = "Yesterday";
    else label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(entry);
  }

  return Array.from(map.entries()).map(([label, entries]) => ({ label, entries }));
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
