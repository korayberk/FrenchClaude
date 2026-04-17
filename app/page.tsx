"use client";

import { useCallback, useState } from "react";
import ApiKeyInput from "@/components/ApiKeyInput";
import SentenceInput from "@/components/SentenceInput";
import HistoryPanel from "@/components/HistoryPanel";
import TimelineResults from "@/components/TimelineResults";
import { ConjugateResponse } from "./api/conjugate/route";
import {
  HistoryEntry,
  loadHistory,
  saveEntry,
  deleteEntry,
} from "@/lib/history";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<ConjugateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleKeyChange = useCallback((key: string) => setApiKey(key), []);

  const handleSubmit = async () => {
    if (!sentence.trim() || !apiKey) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedId(null);

    try {
      const res = await fetch("/api/conjugate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentence.trim(), apiKey }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Something went wrong");
      }

      const data: ConjugateResponse = await res.json();
      setResult(data);

      const entry: HistoryEntry = {
        id: Date.now().toString(),
        sentence: sentence.trim(),
        tense: data.original.tense,
        result: data,
        createdAt: Date.now(),
      };
      saveEntry(entry);
      setHistory(loadHistory());
      setSelectedId(entry.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (entry: HistoryEntry) => {
    setSentence(entry.sentence);
    setResult(entry.result);
    setSelectedId(entry.id);
    setError(null);
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setHistory(loadHistory());
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* History sidebar */}
      <HistoryPanel
        entries={history}
        selectedId={selectedId}
        onSelect={handleSelect}
        onDelete={handleDelete}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center px-5 pt-16 pb-24 min-w-0">
        <div className="w-full max-w-[640px]">

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-3">
              {/* Mobile history toggle */}
              <button
                className="lg:hidden p-2 rounded-full"
                style={{ color: "var(--secondary-label)" }}
                onClick={() => setHistoryOpen(true)}
                title="History"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </button>
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
                  French Tenses
                </h1>
                <p className="text-[15px] mt-1" style={{ color: "var(--secondary-label)" }}>
                  Type a sentence in French — see it across tenses
                </p>
              </div>
            </div>
            <ApiKeyInput onKeyChange={handleKeyChange} />
          </div>

          {/* Input card */}
          <div
            className="rounded-2xl mb-3"
            style={{
              background: "var(--card)",
              border: "1px solid var(--separator)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <SentenceInput
              value={sentence}
              onChange={setSentence}
              onSubmit={handleSubmit}
              loading={loading}
              hasApiKey={!!apiKey}
            />
          </div>

          {!apiKey && (
            <p className="text-[13px] mb-8" style={{ color: "var(--tertiary-label)" }}>
              Add your Anthropic API key using the gear icon.
            </p>
          )}

          {error && (
            <div
              className="rounded-xl text-[14px] px-4 py-3 mb-6"
              style={{ background: "#FFF1F2", color: "#9F1239", border: "1px solid #FFE4E6" }}
            >
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8">
              <TimelineResults result={result} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
