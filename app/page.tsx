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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              🇫🇷 French Tenses
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Paste a sentence — see it across tenses
            </p>
          </div>
          <ApiKeyInput onKeyChange={handleKeyChange} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <SentenceInput
            value={sentence}
            onChange={setSentence}
            onSubmit={handleSubmit}
            loading={loading}
            hasApiKey={!!apiKey}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-4">
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
