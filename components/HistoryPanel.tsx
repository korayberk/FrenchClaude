"use client";

import { useState } from "react";
import { HistoryEntry, groupByTense, relativeTime } from "@/lib/history";

interface HistoryPanelProps {
  entries: HistoryEntry[];
  selectedId: string | null;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function HistoryPanel({
  entries,
  selectedId,
  onSelect,
  onDelete,
  open,
  onClose,
}: HistoryPanelProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const groups = groupByTense(entries);
  const tenses = Object.keys(groups).sort();

  const panel = (
    <div
      className="flex flex-col h-full"
      style={{
        width: 256,
        background: "#FAFAFA",
        borderRight: "1px solid var(--separator)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--separator)" }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
          History
        </span>
        <span className="text-[12px]" style={{ color: "var(--tertiary-label)" }}>
          {entries.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <p
            className="text-[13px] px-4 pt-6 text-center leading-relaxed"
            style={{ color: "var(--tertiary-label)" }}
          >
            Your sentences will appear here
          </p>
        ) : (
          tenses.map((tense) => (
            <div key={tense}>
              {/* Tense group header */}
              <button
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [tense]: !c[tense] }))
                }
                className="w-full flex items-center justify-between px-4 py-2 sticky top-0"
                style={{
                  background: "#FAFAFA",
                  borderBottom: "1px solid var(--separator)",
                }}
              >
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--secondary-label)" }}
                >
                  {tense}
                </span>
                <span
                  className="text-[11px]"
                  style={{ color: "var(--tertiary-label)" }}
                >
                  {collapsed[tense] ? "▸" : "▾"} {groups[tense].length}
                </span>
              </button>

              {/* Entries */}
              {!collapsed[tense] &&
                groups[tense].map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    selected={entry.id === selectedId}
                    onSelect={() => { onSelect(entry); onClose(); }}
                    onDelete={() => onDelete(entry.id)}
                  />
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex h-screen sticky top-0 shrink-0">{panel}</div>

      {/* Mobile: slide-over overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex h-full">{panel}</div>
          <div
            className="flex-1"
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={onClose}
          />
        </div>
      )}
    </>
  );
}

function EntryRow({
  entry,
  selected,
  onSelect,
  onDelete,
}: {
  entry: HistoryEntry;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group flex items-start gap-1 px-3 py-2.5 cursor-pointer"
      style={{
        background: selected
          ? "var(--separator)"
          : hovered
          ? "#F0F0F2"
          : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] leading-snug truncate"
          style={{ color: "var(--foreground)" }}
        >
          {entry.sentence}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--tertiary-label)" }}>
          {relativeTime(entry.createdAt)}
        </p>
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
