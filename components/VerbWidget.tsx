import { Fragment } from "react";
import { VerbConjugation } from "@/app/api/conjugate/route";

const TENSES = ["Présent", "Imparfait", "Passé composé", "Futur simple"];

const TENSE_ZONE: Record<string, string> = {
  "Présent":         "present",
  "Imparfait":       "past",
  "Passé composé":   "near past",
  "Futur simple":    "future",
};

type RowKey = "je" | "tu" | "il_elle" | "nous" | "vous" | "ils_elles";

const SINGULAR: { key: RowKey; label: string }[] = [
  { key: "je",      label: "je" },
  { key: "tu",      label: "tu" },
  { key: "il_elle", label: "il/elle" },
];

const PLURAL: { key: RowKey; label: string }[] = [
  { key: "nous",      label: "nous" },
  { key: "vous",      label: "vous" },
  { key: "ils_elles", label: "ils/elles" },
];

function findRow(conjugations: VerbConjugation["conjugations"], tense: string) {
  return conjugations.find(
    (c) => c.tense.toLowerCase().replace(/\s+/g, " ").trim() ===
           tense.toLowerCase().replace(/\s+/g, " ").trim()
  );
}

function chunkPairs<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) result.push(arr.slice(i, i + 2));
  return result;
}

function VerbCard({ pair }: { pair: VerbConjugation[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--separator)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Verb header(s) — grid columns match the table below */}
      <div
        className="py-3"
        style={{
          display: "grid",
          gridTemplateColumns: pair.length === 2 ? "110px 1fr 1fr" : "110px 1fr",
          borderBottom: "1px solid var(--separator)",
        }}
      >
        <div />
        {pair.map((v, i) => (
          <div
            key={v.verb}
            className="flex items-baseline gap-2 px-4"
            style={{
              borderLeft: i === 1 ? "1px solid var(--separator)" : "none",
            }}
          >
            <span className="text-[15px] font-semibold italic" style={{ color: "var(--foreground)" }}>
              {v.verb}
            </span>
            <span className="text-[11px]" style={{ color: "var(--tertiary-label)" }}>
              infinitif
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--separator)" }}>
              <th style={{ width: 110 }} />
              {pair.map((v, vi) =>
                ["singulier", "pluriel"].map((label, li) => (
                  <th
                    key={`${vi}-${label}`}
                    className="px-4 py-2 text-left"
                    style={{
                      borderLeft: vi === 1 && li === 0 ? "1px solid var(--separator)" : "none",
                    }}
                  >
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--tertiary-label)" }}
                    >
                      {label}
                    </span>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {TENSES.map((tense, ti) => {
              return (
                <tr
                  key={tense}
                  style={{
                    borderBottom: ti < TENSES.length - 1 ? "1px solid var(--separator)" : "none",
                    background: ti % 2 === 1 ? "var(--surface)" : "transparent",
                  }}
                >
                  <td className="px-5 py-3 align-top">
                    <span className="text-[13px] font-medium block" style={{ color: "var(--foreground)" }}>
                      {tense}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--tertiary-label)" }}>
                      {TENSE_ZONE[tense]}
                    </span>
                  </td>

                  {pair.map((v, vi) => {
                    const row = findRow(v.conjugations, tense);
                    return [SINGULAR, PLURAL].map((group, gi) => (
                      <td
                        key={`${vi}-${gi}`}
                        className="px-4 py-3 align-top"
                        style={{
                          borderLeft: vi === 1 && gi === 0 ? "1px solid var(--separator)" : "none",
                        }}
                      >
                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[13px] leading-tight">
                          {group.map(({ key, label }) => (
                            <Fragment key={key}>
                              <span style={{ color: "var(--tertiary-label)" }}>{label}</span>
                              <span style={{ color: "var(--foreground)" }}>{row?.[key] ?? "—"}</span>
                            </Fragment>
                          ))}
                        </div>
                      </td>
                    ));
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface Props {
  verbs: VerbConjugation[];
}

export default function VerbWidget({ verbs }: Props) {
  if (!verbs || verbs.length === 0) {
    return (
      <p className="text-[13px] py-4" style={{ color: "var(--tertiary-label)" }}>
        No verb data — try conjugating again.
      </p>
    );
  }

  const pairs = chunkPairs(verbs);

  return (
    <div className="flex flex-col gap-4">
      {pairs.map((pair, i) => (
        <VerbCard key={i} pair={pair} />
      ))}
    </div>
  );
}
