"use client";

import { useState } from "react";
import Link from "next/link";
import { HistoryEntry, groupByTense, groupByDay, relativeTime } from "@/lib/history";

type SortMode = "tense" | "date-desc" | "date-asc";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  selectedId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  open: boolean;
  onClose: () => void;
}

export default function HistoryPanel({
  entries,
  selectedId,
  onSelect,
  onDelete,
  onClearAll,
  open,
  onClose,
}: HistoryPanelProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<SortMode>("tense");
  const [confirmingClear, setConfirmingClear] = useState(false);

  const toggleSection = (key: string) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  const tenseGroups = groupByTense(entries);
  const tenses = Object.keys(tenseGroups).sort();

  const sorted = [...entries].sort((a, b) =>
    mode === "date-asc" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt
  );
  const dayGroups = groupByDay(sorted);

  const MODES: { key: SortMode; label: string }[] = [
    { key: "tense",     label: "Tense" },
    { key: "date-desc", label: "New" },
    { key: "date-asc",  label: "Old" },
  ];

  const SectionHeader = ({ label, count, sectionKey }: { label: string; count: number; sectionKey: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between px-4 py-2 sticky top-0"
      style={{ background: "var(--surface)", borderBottom: "1px solid var(--separator)" }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--secondary-label)" }}>
        {label}
      </span>
      <span className="text-[11px]" style={{ color: "var(--tertiary-label)" }}>
        {collapsed[sectionKey] ? "▸" : "▾"} {count}
      </span>
    </button>
  );

  const panel = (
    <div
      className="flex flex-col h-full"
      style={{ width: 256, background: "var(--surface)", borderRight: "1px solid var(--separator)" }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-4 pt-4 pb-3 flex flex-col gap-3"
        style={{ borderBottom: "1px solid var(--separator)" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>History</span>
          <span className="text-[12px]" style={{ color: "var(--tertiary-label)" }}>{entries.length}</span>
        </div>
        <div className="flex rounded-lg p-0.5" style={{ background: "var(--separator)" }}>
          {MODES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className="flex-1 py-1 rounded-md text-[11px] font-medium transition-all"
              style={{
                background: mode === key ? "var(--card)" : "transparent",
                color: mode === key ? "var(--foreground)" : "var(--secondary-label)",
                boxShadow: mode === key ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {entries.length === 0 ? (
          <p className="text-[13px] px-4 pt-6 text-center leading-relaxed" style={{ color: "var(--tertiary-label)" }}>
            Your sentences will appear here
          </p>
        ) : mode === "tense" ? (
          tenses.map((tense) => (
            <div key={tense}>
              <SectionHeader label={tense} count={tenseGroups[tense].length} sectionKey={tense} />
              {!collapsed[tense] && tenseGroups[tense].map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  selected={entry.id === selectedId}
                  showTense={false}
                  onSelect={() => { onSelect(entry); onClose(); }}
                  onDelete={() => onDelete(entry.id)}
                />
              ))}
            </div>
          ))
        ) : (
          dayGroups.map(({ label, entries: dayEntries }) => (
            <div key={label}>
              <SectionHeader label={label} count={dayEntries.length} sectionKey={label} />
              {!collapsed[label] && dayEntries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  selected={entry.id === selectedId}
                  showTense
                  onSelect={() => { onSelect(entry); onClose(); }}
                  onDelete={() => onDelete(entry.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer — clear everything */}
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: "1px solid var(--separator)" }}
      >
        {confirmingClear ? (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] leading-tight" style={{ color: "var(--secondary-label)" }}>
              Delete all history and cached verb conjugations?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { onClearAll(); setConfirmingClear(false); }}
                className="flex-1 text-[12px] font-medium py-1.5 rounded-lg"
                style={{
                  background: "rgba(239,68,68,0.16)",
                  color: "#FCA5A5",
                  border: "1px solid rgba(239,68,68,0.32)",
                }}
              >
                Delete everything
              </button>
              <button
                onClick={() => setConfirmingClear(false)}
                className="flex-1 text-[12px] py-1.5 rounded-lg"
                style={{ background: "var(--separator)", color: "var(--secondary-label)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/verbs"
              onClick={onClose}
              className="block w-full text-center text-[12px] py-1.5 rounded-lg transition-colors"
              style={{ background: "transparent", color: "var(--secondary-label)", border: "1px solid var(--separator)" }}
              title="Browse all cached verbs"
            >
              Browse cached verbs
            </Link>
            <button
              onClick={() => setConfirmingClear(true)}
              className="w-full text-[12px] py-1.5 rounded-lg transition-colors"
              style={{ background: "transparent", color: "var(--tertiary-label)", border: "1px solid var(--separator)" }}
              title="Delete all history and cached verb conjugations"
            >
              Clear all history & cache
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex h-screen sticky top-0 shrink-0">{panel}</div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex h-full">{panel}</div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
        </div>
      )}
    </>
  );
}

function EntryRow({
  entry, selected, showTense, onSelect, onDelete,
}: {
  entry: HistoryEntry;
  selected: boolean;
  showTense: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-start gap-1 px-3 py-2.5 cursor-pointer"
      style={{
        background: selected ? "var(--separator)" : hovered ? "var(--card-hover)" : "transparent",
        borderBottom: "1px solid var(--separator)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] leading-snug truncate" style={{ color: "var(--foreground)" }}>
          {entry.sentence}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {showTense && entry.tense && (
            <span
              className="text-[10px] font-medium px-1.5 py-px rounded"
              style={{ background: "var(--separator)", color: "var(--secondary-label)" }}
            >
              {entry.tense}
            </span>
          )}
          <span className="text-[11px]" style={{ color: "var(--tertiary-label)" }}>
            {relativeTime(entry.createdAt)}
          </span>
        </div>
      </div>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 text-[14px] leading-none mt-0.5 px-1"
          style={{ color: "var(--tertiary-label)" }}
          title="Delete"
        >
          ×
        </button>
      )}
    </div>
  );
}
