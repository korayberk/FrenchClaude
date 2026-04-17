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
