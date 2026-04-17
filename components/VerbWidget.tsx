import { VerbConjugation } from "@/app/api/conjugate/route";

const TENSE_ZONE: Record<string, string> = {
  "Présent":         "present",
  "Imparfait":       "past",
  "Passé composé":   "near past",
  "Futur simple":    "future",
};

interface Props {
  verbs: VerbConjugation[];
}

export default function VerbWidget({ verbs }: Props) {
  if (!verbs || verbs.length === 0) return null;

  const tenses = ["Présent", "Imparfait", "Passé composé", "Futur simple"];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--separator)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--separator)" }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          Verbs
        </span>
        <span className="text-[12px]" style={{ color: "var(--tertiary-label)" }}>
          in this sentence
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--separator)" }}>
              {/* Tense label column */}
              <th
                className="text-left px-5 py-2.5"
                style={{ width: 140, minWidth: 120 }}
              />
              {verbs.map((v) => (
                <th
                  key={v.verb}
                  className="text-left px-4 py-2.5"
                >
                  <span
                    className="text-[13px] font-semibold italic"
                    style={{ color: "var(--foreground)" }}
                  >
                    {v.verb}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenses.map((tense, ti) => (
              <tr
                key={tense}
                style={{
                  borderBottom: ti < tenses.length - 1 ? "1px solid var(--separator)" : "none",
                  background: ti % 2 === 1 ? "#FAFAFA" : "transparent",
                }}
              >
                {/* Tense name + zone */}
                <td className="px-5 py-3">
                  <span
                    className="text-[13px] font-medium block"
                    style={{ color: "var(--foreground)" }}
                  >
                    {tense}
                  </span>
                  {TENSE_ZONE[tense] && (
                    <span
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: "var(--tertiary-label)" }}
                    >
                      {TENSE_ZONE[tense]}
                    </span>
                  )}
                </td>

                {/* Conjugated forms */}
                {verbs.map((v) => {
                  const match = v.conjugations.find((c) => c.tense === tense);
                  return (
                    <td key={v.verb} className="px-4 py-3">
                      <span
                        className="text-[14px]"
                        style={{ color: match ? "var(--foreground)" : "var(--tertiary-label)" }}
                      >
                        {match?.form ?? "—"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
