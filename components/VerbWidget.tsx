import { VerbConjugation } from "@/app/api/conjugate/route";

const TENSES = ["Présent", "Imparfait", "Passé composé", "Futur simple"];

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

  return (
    <div className="flex flex-col gap-4">
      {verbs.map((v) => (
        <div
          key={v.verb}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--separator)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          {/* Verb header */}
          <div
            className="px-5 py-3 flex items-baseline gap-2"
            style={{ borderBottom: "1px solid var(--separator)" }}
          >
            <span
              className="text-[15px] font-semibold italic"
              style={{ color: "var(--foreground)" }}
            >
              {v.verb}
            </span>
            <span className="text-[11px]" style={{ color: "var(--tertiary-label)" }}>
              infinitif
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--separator)" }}>
                  <th style={{ width: 130 }} />
                  <th className="px-4 py-2 text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--tertiary-label)" }}>
                      in sentence
                    </span>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--tertiary-label)" }}>
                      il / elle
                    </span>
                  </th>
                  <th className="px-4 py-2 text-left">
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--tertiary-label)" }}>
                      ils / elles
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TENSES.map((tense, ti) => {
                  const row = v.conjugations.find((c) => c.tense === tense);
                  return (
                    <tr
                      key={tense}
                      style={{
                        borderBottom: ti < TENSES.length - 1 ? "1px solid var(--separator)" : "none",
                        background: ti % 2 === 1 ? "#FAFAFA" : "transparent",
                      }}
                    >
                      {/* Tense label */}
                      <td className="px-5 py-3">
                        <span className="text-[13px] font-medium block" style={{ color: "var(--foreground)" }}>
                          {tense}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--tertiary-label)" }}>
                          {TENSE_ZONE[tense]}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[14px]" style={{ color: "var(--foreground)" }}>
                          {row?.sentence_form ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[14px]" style={{ color: "var(--secondary-label)" }}>
                          {row?.il_elle ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[14px]" style={{ color: "var(--secondary-label)" }}>
                          {row?.ils_elles ?? "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
