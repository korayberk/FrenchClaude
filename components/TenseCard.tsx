interface TenseCardProps {
  tense: string;
  french: string;
  english: string;
  usage?: string;
  highlight?: boolean;
}

type BadgeStyle = { background: string; color: string };

const TENSE_BADGES: Record<string, BadgeStyle> = {
  "présent":               { background: "rgba(52,211,153,0.14)",  color: "#6EE7B7" },
  "imparfait":             { background: "rgba(251,146,60,0.14)",  color: "#FDBA74" },
  "passé composé":         { background: "rgba(244,114,182,0.14)", color: "#F9A8D4" },
  "futur simple":          { background: "rgba(96,165,250,0.14)",  color: "#93C5FD" },
  "conditionnel":          { background: "rgba(167,139,250,0.14)", color: "#C4B5FD" },
  "passé simple":          { background: "rgba(248,113,113,0.14)", color: "#FCA5A5" },
  "plus-que-parfait":      { background: "rgba(190,242,100,0.14)", color: "#D9F99D" },
};

function badgeStyle(tense: string): BadgeStyle {
  const lower = tense.toLowerCase();
  for (const key of Object.keys(TENSE_BADGES)) {
    if (lower.includes(key)) return TENSE_BADGES[key];
  }
  return { background: "rgba(255,255,255,0.06)", color: "#A8A8AE" };
}

// "Passé composé (main clause) + Plus-que-parfait (subordinate clause)"
// → ["Passé composé", "Plus-que-parfait"]
// Same-tense repeats (e.g. "Imparfait + Imparfait") collapse to one chip.
function splitTenses(tense: string): string[] {
  const parts = tense.split(/\s*\+\s*/);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of parts) {
    const cleaned = raw.replace(/\s*\([^)]*\)/g, "").trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }
  return result.length > 0 ? result : [tense];
}

export default function TenseCard({ tense, french, english, usage, highlight }: TenseCardProps) {
  const tenses = splitTenses(tense);

  return (
    <div
      className="rounded-2xl px-5 py-3 flex items-start gap-4"
      title={usage}
      style={{
        background: highlight ? "var(--foreground)" : "var(--card)",
        border: highlight ? "1.5px solid var(--foreground)" : "1px solid var(--separator)",
        boxShadow: highlight
          ? "0 4px 20px rgba(0,0,0,0.45)"
          : "0 1px 2px rgba(0,0,0,0.3)",
      }}
    >
      <div className="shrink-0 flex flex-col gap-1 items-start mt-1" style={{ width: 170 }}>
        {tenses.map((t, i) => {
          const badge = badgeStyle(t);
          return (
            <span
              key={`${t}-${i}`}
              className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full tracking-wide uppercase"
              style={
                highlight
                  ? { background: "rgba(13,13,15,0.12)", color: "rgba(13,13,15,0.8)" }
                  : badge
              }
            >
              {t}
            </span>
          );
        })}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p
          className="text-[17px] font-medium leading-snug"
          style={{ color: highlight ? "var(--background)" : "var(--foreground)" }}
        >
          {french}
        </p>
        <p
          className="text-[13px] leading-snug"
          style={{ color: highlight ? "rgba(13,13,15,0.68)" : "var(--secondary-label)" }}
        >
          {english}
        </p>
      </div>
    </div>
  );
}
