"use client";

import { useCallback, useState } from "react";
import ApiKeyInput from "@/components/ApiKeyInput";
import SentenceInput from "@/components/SentenceInput";
import TenseCard from "@/components/TenseCard";
import { ConjugateResponse } from "./api/conjugate/route";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<ConjugateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyChange = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  const handleSubmit = async () => {
    if (!sentence.trim() || !apiKey) return;
    setLoading(true);
    setError(null);
    setResult(null);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-5 pt-16 pb-24" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[640px]">

        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: "var(--foreground)" }}>
              French Tenses
            </h1>
            <p className="text-[15px] mt-1" style={{ color: "var(--secondary-label)" }}>
              Type a sentence in French — see it across tenses
            </p>
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

        {/* Error */}
        {error && (
          <div
            className="rounded-xl text-[14px] px-4 py-3 mb-6"
            style={{ background: "#FFF1F2", color: "#9F1239", border: "1px solid #FFE4E6" }}
          >
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="flex flex-col gap-3 mt-8">
            <TenseCard
              tense={result.original.tense}
              french={result.original.french}
              english={result.original.english}
              highlight
            />
            {result.variations.map((v, i) => (
              <TenseCard
                key={i}
                tense={v.tense}
                french={v.french}
                english={v.english}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
