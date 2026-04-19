"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import VerbWidget, { VerbDisplay } from "@/components/VerbWidget";
import { useVerbCache } from "@/lib/verbCache";

export default function VerbsPage() {
  const cache = useVerbCache();
  const [query, setQuery] = useState("");

  const verbs = useMemo<VerbDisplay[]>(
    () =>
      Object.values(cache)
        .map((v) => ({ ...v, _source: "cache" as const }))
        .sort((a, b) => a.verb.localeCompare(b.verb, "fr")),
    [cache]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return verbs;
    return verbs.filter((v) => {
      const verb = v.verb.toLowerCase();
      const meaning = (v.meaning ?? "").toLowerCase();
      return verb.includes(q) || meaning.includes(q);
    });
  }, [verbs, query]);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <main className="flex flex-col items-center px-5 pt-16 pb-24">
        <div className="w-full max-w-[960px]">
          <div className="mb-6">
            <Link
              href="/"
              className="text-[13px] inline-flex items-center gap-1"
              style={{ color: "var(--secondary-label)" }}
            >
              <span>←</span>
              <span>French Tenses</span>
            </Link>
          </div>

          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
                Verb browser
              </h1>
              <p className="text-[15px] mt-1" style={{ color: "var(--secondary-label)" }}>
                All cached conjugations
              </p>
            </div>
            {verbs.length > 0 && (
              <span className="text-[13px] mt-2 shrink-0" style={{ color: "var(--tertiary-label)" }}>
                {verbs.length} verb{verbs.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {verbs.length > 0 && (
            <div
              className="rounded-xl mb-6 px-4 py-3"
              style={{
                background: "var(--card)",
                border: "1px solid var(--separator)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by infinitive or meaning…"
                className="w-full bg-transparent outline-none text-[15px]"
                style={{ color: "var(--foreground)" }}
              />
            </div>
          )}

          {verbs.length === 0 ? (
            <div
              className="rounded-2xl px-5 py-8 text-center"
              style={{ background: "var(--card)", border: "1px solid var(--separator)" }}
            >
              <p className="text-[14px] mb-3" style={{ color: "var(--secondary-label)" }}>
                No cached verbs yet.
              </p>
              <p className="text-[13px]" style={{ color: "var(--tertiary-label)" }}>
                Conjugate a sentence on the{" "}
                <Link href="/" className="underline" style={{ color: "var(--foreground)" }}>
                  main page
                </Link>{" "}
                to build up the cache.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[13px] py-4" style={{ color: "var(--tertiary-label)" }}>
              No verbs match &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <VerbWidget verbs={filtered} defaultShowAll />
          )}
        </div>
      </main>
    </div>
  );
}
