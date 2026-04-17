"use client";

import { useState } from "react";
import { ConjugateResponse } from "@/app/api/conjugate/route";
import { getTenseConfig } from "@/lib/tenseOrder";
import TenseCard from "@/components/TenseCard";

const COMMON_TENSES = ["présent", "imparfait", "passé composé", "futur simple"];

function isCommonTense(tense: string) {
  const lower = tense.toLowerCase();
  return COMMON_TENSES.some((t) => lower.includes(t));
}

interface TimelineItem {
  tense: string;
  french: string;
  english: string;
  usage?: string;
  isOriginal: boolean;
  order: number;
  zone: string;
}

interface Props {
  result: ConjugateResponse;
}

export default function TimelineResults({ result }: Props) {
  const [showAll, setShowAll] = useState(false);

  const allItems: TimelineItem[] = [
    {
      ...result.original,
      isOriginal: true,
      ...getTenseConfig(result.original.tense),
    },
    ...result.variations.map((v) => ({
      ...v,
      isOriginal: false,
      ...getTenseConfig(v.tense),
    })),
  ].sort((a, b) => a.order - b.order);

  // In "most used" mode: always include the original + the 4 common tenses
  const items = showAll
    ? allItems
    : allItems.filter((item) => item.isOriginal || isCommonTense(item.tense));

  const hiddenCount = allItems.length - items.length;

  return (
    <div className="flex flex-col gap-3">
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

      {/* Timeline */}
      <div className="flex flex-col">
        {items.map((item, i) => {
          const isFirst = i === 0;
          const isLast = i === items.length - 1;

          return (
            <div key={item.tense + i} className="flex items-stretch gap-0">
              {/* Zone label */}
              <div
                className="shrink-0 flex items-start pt-5"
                style={{ width: 96, paddingRight: 12, textAlign: "right" }}
              >
                {item.zone && (
                  <span
                    className="text-[10px] leading-tight w-full text-right"
                    style={{
                      color: item.isOriginal ? "var(--secondary-label)" : "var(--tertiary-label)",
                      fontWeight: item.isOriginal ? 600 : 400,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.zone}
                  </span>
                )}
              </div>

              {/* Dot + connecting line */}
              <div className="shrink-0 flex flex-col items-center" style={{ width: 24 }}>
                <div style={{ width: 1, flex: "0 0 20px", background: isFirst ? "transparent" : "var(--separator)" }} />

                {item.isOriginal ? (
                  <div
                    className="shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 18, height: 18, border: "2px solid var(--foreground)", background: "var(--foreground)" }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />
                  </div>
                ) : (
                  <div
                    className="shrink-0 rounded-full"
                    style={{ width: 10, height: 10, border: "1.5px solid #C7C7CC", background: "var(--background)" }}
                  />
                )}

                <div style={{ width: 1, flex: 1, minHeight: 16, background: isLast ? "transparent" : "var(--separator)" }} />
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0 py-2 pl-3 pr-0">
                <TenseCard
                  tense={item.tense}
                  french={item.french}
                  english={item.english}
                  usage={item.usage}
                  highlight={item.isOriginal}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
