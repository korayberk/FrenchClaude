"use client";

import { useState } from "react";

interface ApiKeyInputProps {
  apiKey: string;
  onSave: (apiKey: string) => void;
}

export default function ApiKeyInput({ apiKey, onSave }: ApiKeyInputProps) {
  const [open, setOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState(apiKey);

  const handleOpen = () => {
    setKeyDraft(apiKey);
    setOpen((o) => !o);
  };

  const handleSave = () => {
    onSave(keyDraft);
    setOpen(false);
  };

  return (
    <div className="relative mt-1">
      <button
        onClick={handleOpen}
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

          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>Anthropic API Key</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--tertiary-label)" }}>Stored in your browser only.</p>
            </div>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="sk-ant-…"
              className="w-full text-[14px] px-3 py-2.5 rounded-xl focus:outline-none"
              style={{ background: "var(--background)", border: "1px solid var(--separator)", color: "var(--foreground)" }}
            />
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
