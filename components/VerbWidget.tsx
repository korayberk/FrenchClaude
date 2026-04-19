"use client";

import { Fragment, useState } from "react";
import { VerbConjugation } from "@/app/api/conjugate/route";
import { getTenseConfig } from "@/lib/tenseOrder";

export type VerbDisplay = VerbConjugation & { _source: "cache" | "cloud" };

const COMMON_TENSES = ["Présent", "Imparfait", "Passé composé", "Futur simple"];

const ALL_TENSES = [
  "Plus-que-parfait",
  "Passé simple",
  "Imparfait",
  "Passé composé",
  "Présent",
  "Futur proche",
  "Futur simple",
  "Conditionnel",
].sort((a, b) => getTenseConfig(a).order - getTenseConfig(b).order);

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

function SourceBadge({ source }: { source: "cache" | "cloud" }) {
  const cached = source === "cache";
  return (
    <span
      className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-px rounded"
      style={
        cached
          ? { background: "rgba(255,255,255,0.06)", color: "var(--secondary-label)" }
          : { background: "rgba(96,165,250,0.14)", color: "#93C5FD" }
      }
      title={cached ? "Loaded from local cache" : "Fetched from the API"}
    >
      {cached ? "cached" : "fresh"}
    </span>
  );
}

function VerbCard({ pair, tenses }: { pair: VerbDisplay[]; tenses: string[] }) {
  // Grid/table share the same column template: 110px gutter + 2 equal sub-cols per verb.
  // This keeps the verb-to-verb header divider aligned with the singulier/pluriel boundary below.
  const headerGrid = `110px ${pair.map(() => "1fr 1fr").join(" ")}`;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--separator)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Verb header(s) — each title spans both sub-cols of its verb */}
      <div
        className="py-3"
        style={{
          display: "grid",
          gridTemplateColumns: headerGrid,
          borderBottom: "1px solid var(--separator)",
        }}
      >
        <div />
        {pair.map((v, i) => (
          <div
            key={v.verb}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-4"
            style={{
              gridColumn: "span 2",
              borderLeft: i === 1 ? "1px solid var(--separator)" : "none",
            }}
          >
            <span className="text-[15px] font-semibold italic" style={{ color: "var(--foreground)" }}>
              {v.verb}
            </span>
            {v.meaning && (
              <span className="text-[12px]" style={{ color: "var(--secondary-label)" }}>
                {v.meaning}
              </span>
            )}
            <span className="text-[11px]" style={{ color: "var(--tertiary-label)" }}>
              infinitif
            </span>
            <SourceBadge source={v._source} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 110 }} />
            {pair.map((v) => (
              <Fragment key={`${v.verb}-cols`}>
                <col />
                <col />
              </Fragment>
            ))}
          </colgroup>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--separator)" }}>
              <th />
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
            {tenses.map((tense, ti) => {
              return (
                <tr
                  key={tense}
                  style={{
                    borderBottom: ti < tenses.length - 1 ? "1px solid var(--separator)" : "none",
                    background: ti % 2 === 1 ? "var(--surface)" : "transparent",
                  }}
                >
                  <td className="px-5 py-3 align-top">
                    <span className="text-[13px] font-medium block" style={{ color: "var(--foreground)" }}>
                      {tense}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--tertiary-label)" }}>
                      {getTenseConfig(tense).zone}
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
  verbs: VerbDisplay[];
  defaultShowAll?: boolean;
}

export default function VerbWidget({ verbs, defaultShowAll }: Props) {
  const [showAll, setShowAll] = useState(!!defaultShowAll);

  if (!verbs || verbs.length === 0) {
    return (
      <p className="text-[13px] py-4" style={{ color: "var(--tertiary-label)" }}>
        No verb data — try conjugating again.
      </p>
    );
  }

  const tensesToShow = showAll ? ALL_TENSES : COMMON_TENSES;
  const hiddenCount = ALL_TENSES.length - tensesToShow.length;
  const pairs = chunkPairs(verbs);

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div
          className="flex rounded-xl p-1"
          style={{ background: "var(--separator)" }}
        >
          {(["Most Used", "All"] as const).map((label) => {
            const active = label === "All" ? showAll : !showAll;
            return (
              <button
                key={label}
                onClick={() => setShowAll(label === "All")}
                className="px-3 py-1 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: active ? "var(--card)" : "transparent",
                  color: active ? "var(--foreground)" : "var(--secondary-label)",
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {!showAll && hiddenCount > 0 && (
          <span className="text-[12px]" style={{ color: "var(--tertiary-label)" }}>
            +{hiddenCount} more tense{hiddenCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {pairs.map((pair, i) => (
        <VerbCard key={i} pair={pair} tenses={tensesToShow} />
      ))}
    </div>
  );
}
