"use client";

import { useCallback, useRef, useState } from "react";
import ApiKeyInput from "@/components/ApiKeyInput";
import SentenceInput from "@/components/SentenceInput";
import HistoryPanel from "@/components/HistoryPanel";
import TimelineResults from "@/components/TimelineResults";
import VerbWidget from "@/components/VerbWidget";
import Carousel from "@/components/Carousel";
import { ConjugateResponse, VerbConjugation } from "./api/conjugate/route";
import { HistoryEntry, loadHistory, saveEntry, deleteEntry } from "@/lib/history";
import { ModelId, DEFAULT_MODEL } from "@/components/ApiKeyInput";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<ConjugateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [correctedFrom, setCorrectedFrom] = useState<string | null>(null);
  const [inputCollapsed, setInputCollapsed] = useState(false);
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);

  // Verbs — fetched lazily when user opens the Verbs tab
  const [verbs, setVerbs] = useState<VerbConjugation[] | null>(null);
  const [verbsLoading, setVerbsLoading] = useState(false);
  const [verbUsage, setVerbUsage] = useState<{ input: number; output: number } | null>(null);
  const verbSentenceRef = useRef<string>("");   // tracks which sentence verbs were fetched for

  const handleKeyChange = useCallback((key: string) => setApiKey(key), []);
  const handleModelChange = useCallback((m: ModelId) => setModel(m), []);

  const fetchVerbs = useCallback(async (sentenceToUse: string, apiKeyToUse: string) => {
    if (!sentenceToUse || !apiKeyToUse) return;
    setVerbsLoading(true);
    try {
      const res = await fetch("/api/verbs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentenceToUse, apiKey: apiKeyToUse, model }),
      });
      const data = await res.json();
      setVerbs(data.verbs ?? []);
      if (data._usage) setVerbUsage(data._usage);
    } catch {
      setVerbs([]);
    } finally {
      setVerbsLoading(false);
    }
  }, []);

  const handleSlideChange = useCallback((index: number) => {
    if (index !== 1) return;                         // only Verbs tab (index 1)
    if (verbs !== null) return;                      // already fetched
    if (verbSentenceRef.current === sentence) return; // same sentence
    verbSentenceRef.current = sentence;
    fetchVerbs(sentence, apiKey);
  }, [verbs, sentence, apiKey, fetchVerbs]);

  const handleSubmit = async () => {
    if (!sentence.trim() || !apiKey) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedId(null);
    setCorrectedFrom(null);
    setInputCollapsed(false);
    setVerbs(null);
    setVerbUsage(null);
    verbSentenceRef.current = "";

    try {
      const res = await fetch("/api/conjugate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: sentence.trim(), apiKey, model }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Something went wrong");
      }

      const data: ConjugateResponse = await res.json();
      setResult(data);

      const raw = sentence.trim();
      const final = data.corrected_input ?? raw;
      if (data.corrected_input && data.corrected_input !== raw) {
        setCorrectedFrom(raw);
        setSentence(data.corrected_input);
      }
      const entry: HistoryEntry = {
        id: Date.now().toString(),
        sentence: final,
        tense: data.original.tense,
        result: data,
        createdAt: Date.now(),
      };
      saveEntry(entry);
      setHistory(loadHistory());
      setSelectedId(entry.id);
      setInputCollapsed(true);
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
    setCorrectedFrom(null);
    setInputCollapsed(true);
    setVerbs(null);
    setVerbUsage(null);
    verbSentenceRef.current = "";
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    setHistory(loadHistory());
    if (selectedId === id) setSelectedId(null);
  };

  const verbsContent = verbsLoading ? (
    <div className="flex items-center gap-2 py-6 px-1" style={{ color: "var(--tertiary-label)" }}>
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span className="text-[13px]">Looking up conjugations…</span>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <VerbWidget verbs={verbs ?? []} />
      {verbUsage && (
        <p className="text-[11px] text-right" style={{ color: "var(--tertiary-label)" }}>
          {verbUsage.input.toLocaleString()} in · {verbUsage.output.toLocaleString()} out · {(verbUsage.input + verbUsage.output).toLocaleString()} total tokens
        </p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <HistoryPanel
        entries={history}
        selectedId={selectedId}
        onSelect={handleSelect}
        onDelete={handleDelete}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      <main className="flex-1 flex flex-col items-center px-5 pt-16 pb-24 min-w-0">
        <div className="w-full max-w-[640px]">

          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-3">
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
            <ApiKeyInput onKeyChange={handleKeyChange} onModelChange={handleModelChange} />
          </div>

          {inputCollapsed && result ? (
            <>
              <button
                onClick={() => setInputCollapsed(false)}
                className="w-full flex items-center gap-3 rounded-2xl px-5 py-3 mb-1 text-left"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--separator)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <span className="flex-1 text-[15px] truncate" style={{ color: "var(--foreground)" }}>
                  {sentence}
                </span>
                {correctedFrom && (
                  <span className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "#DCFCE7", color: "#166534" }}>
                    corrected
                  </span>
                )}
                <span className="shrink-0 text-[12px] font-medium px-3 py-1 rounded-lg"
                  style={{ background: "var(--foreground)", color: "#fff" }}>
                  Edit
                </span>
              </button>
              {result._usage && (
                <p className="text-[11px] text-right mb-5" style={{ color: "var(--tertiary-label)" }}>
                  {result._usage.input.toLocaleString()} in · {result._usage.output.toLocaleString()} out · {(result._usage.input + result._usage.output).toLocaleString()} total tokens
                </p>
              )}
            </>
          ) : (
            <>
              <div className="rounded-2xl mb-3" style={{
                background: "var(--card)",
                border: "1px solid var(--separator)",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <SentenceInput
                  value={sentence}
                  onChange={(v) => { setSentence(v); setCorrectedFrom(null); }}
                  onSubmit={handleSubmit}
                  loading={loading}
                  hasApiKey={!!apiKey}
                />
              </div>

              {result && (
                <div className="flex justify-end mb-1">
                  <button
                    onClick={() => setInputCollapsed(true)}
                    className="text-[13px] px-3 py-1 rounded-lg"
                    style={{ color: "var(--secondary-label)", background: "var(--separator)" }}
                  >
                    Collapse
                  </button>
                </div>
              )}

              {correctedFrom && (
                <div className="flex items-start gap-2 rounded-xl px-4 py-2.5 mb-3 text-[13px]"
                  style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534" }}>
                  <span className="shrink-0 mt-px">✓</span>
                  <span>
                    <span className="font-medium">Corrected: </span>
                    <span style={{ opacity: 0.7 }}>&ldquo;{correctedFrom}&rdquo;</span>
                  </span>
                </div>
              )}

              {!apiKey && (
                <p className="text-[13px] mb-8" style={{ color: "var(--tertiary-label)" }}>
                  Add your Anthropic API key using the gear icon.
                </p>
              )}
            </>
          )}

          {error && (
            <div className="rounded-xl text-[14px] px-4 py-3 mb-6"
              style={{ background: "#FFF1F2", color: "#9F1239", border: "1px solid #FFE4E6" }}>
              {error}
            </div>
          )}

          {result && (
            <Carousel
              onSlideChange={handleSlideChange}
              slides={[
                {
                  label: "Sentences",
                  content: <TimelineResults result={result} />,
                },
                {
                  label: "Verbs",
                  content: verbsContent,
                },
              ]}
            />
          )}
        </div>
      </main>
    </div>
  );
}
