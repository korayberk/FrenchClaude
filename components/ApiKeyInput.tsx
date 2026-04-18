"use client";

import { useState, useEffect } from "react";

export const MODELS = [
  { id: "claude-sonnet-4-6",        label: "Sonnet 4.6",  note: "fast · balanced" },
  { id: "claude-opus-4-7",          label: "Opus 4.7",    note: "best · slower" },
  { id: "claude-haiku-4-5-20251001",label: "Haiku 4.5",   note: "cheapest · quick" },
] as const;

export type ModelId = typeof MODELS[number]["id"];
export const DEFAULT_MODEL: ModelId = "claude-sonnet-4-6";

interface ApiKeyInputProps {
  onKeyChange: (key: string) => void;
  onModelChange: (model: ModelId) => void;
}

export default function ApiKeyInput({ onKeyChange, onModelChange }: ApiKeyInputProps) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);

  useEffect(() => {
    const savedKey = localStorage.getItem("anthropic_api_key") ?? "";
    const savedModel = (localStorage.getItem("anthropic_model") ?? DEFAULT_MODEL) as ModelId;
    setKey(savedKey);
    setModel(savedModel);
    onKeyChange(savedKey);
    onModelChange(savedModel);
  }, [onKeyChange, onModelChange]);

  const handleSave = () => {
    localStorage.setItem("anthropic_api_key", key);
    localStorage.setItem("anthropic_model", model);
    onKeyChange(key);
    onModelChange(model);
    setOpen(false);
  };

  return (
    <div className="relative mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Settings"
        className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
        style={{ background: open ? "var(--separator)" : "transparent", color: "var(--secondary-label)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-10 w-[300px] rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "var(--card)", border: "1px solid var(--separator)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>

          {/* API Key */}
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>Anthropic API Key</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--tertiary-label)" }}>Stored in your browser only.</p>
            </div>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="sk-ant-…"
              className="w-full text-[14px] px-3 py-2.5 rounded-xl focus:outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--separator)", color: "var(--foreground)" }}
            />
          </div>

          {/* Model picker */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>Model</p>
            <div className="flex flex-col gap-1">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-left"
                  style={{
                    background: model === m.id ? "var(--foreground)" : "var(--background)",
                    border: "1px solid var(--separator)",
                  }}
                >
                  <span className="text-[13px] font-medium"
                    style={{ color: model === m.id ? "var(--background)" : "var(--foreground)" }}>
                    {m.label}
                  </span>
                  <span className="text-[11px]"
                    style={{ color: model === m.id ? "rgba(13,13,15,0.6)" : "var(--tertiary-label)" }}>
                    {m.note}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => setOpen(false)} className="text-[13px] px-4 py-2 rounded-xl"
              style={{ color: "var(--secondary-label)", background: "var(--background)" }}>
              Cancel
            </button>
            <button onClick={handleSave} className="text-[13px] font-medium px-4 py-2 rounded-xl text-white"
              style={{ background: "var(--foreground)" }}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
