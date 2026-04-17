interface TenseCardProps {
  tense: string;
  french: string;
  english: string;
  highlight?: boolean;
}

type BadgeStyle = { background: string; color: string };

const TENSE_BADGES: Record<string, BadgeStyle> = {
  "présent":               { background: "#E8F5E9", color: "#2E7D32" },
  "imparfait":             { background: "#FFF3E0", color: "#BF360C" },
  "passé composé":         { background: "#FCE4EC", color: "#880E4F" },
  "futur simple":          { background: "#E3F2FD", color: "#0D47A1" },
  "conditionnel":          { background: "#F3E5F5", color: "#4A148C" },
  "passé simple":          { background: "#FBE9E7", color: "#BF360C" },
  "plus-que-parfait":      { background: "#F9FBE7", color: "#558B2F" },
};

function badgeStyle(tense: string): BadgeStyle {
  const lower = tense.toLowerCase();
  for (const key of Object.keys(TENSE_BADGES)) {
    if (lower.includes(key)) return TENSE_BADGES[key];
  }
  return { background: "#F5F5F7", color: "#3A3A3C" };
}

export default function TenseCard({ tense, french, english, highlight }: TenseCardProps) {
  const badge = badgeStyle(tense);

  return (
    <div
      className="rounded-2xl px-5 py-4 flex flex-col gap-2"
      style={{
        background: highlight ? "#FAFAFA" : "var(--card)",
        border: highlight ? "1.5px solid #D2D2D7" : "1px solid var(--separator)",
        boxShadow: highlight
          ? "0 2px 8px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full tracking-wide uppercase"
          style={badge}
        >
          {tense}
        </span>
        {highlight && (
          <span className="text-[11px] font-medium" style={{ color: "var(--tertiary-label)" }}>
            your sentence
          </span>
        )}
      </div>

      <p
        className="text-[18px] font-medium leading-snug"
        style={{ color: "var(--foreground)" }}
      >
        {french}
      </p>

      <p
        className="text-[14px] leading-relaxed"
        style={{ color: "var(--secondary-label)" }}
      >
        {english}
      </p>
    </div>
  );
}
