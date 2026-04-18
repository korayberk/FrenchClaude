"use client";

interface SentenceInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  hasApiKey: boolean;
}

export default function SentenceInput({
  value,
  onChange,
  onSubmit,
  loading,
  hasApiKey,
}: SentenceInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  const disabled = loading || !value.trim() || !hasApiKey;

  return (
    <div className="flex flex-col">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écris ou colle une phrase en français…"
        rows={3}
        className="w-full px-5 pt-5 pb-3 text-[17px] leading-relaxed resize-none focus:outline-none rounded-t-2xl"
        style={{
          background: "transparent",
          color: "var(--foreground)",
        }}
      />

      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderTop: "1px solid var(--separator)" }}
      >
        <span className="text-[12px] select-none" style={{ color: "var(--tertiary-label)" }}>
          ⌘↵
        </span>
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="flex items-center gap-2 text-[14px] font-medium px-5 py-2 rounded-xl transition-opacity"
          style={{
            background: disabled ? "var(--separator)" : "var(--foreground)",
            color: disabled ? "var(--secondary-label)" : "var(--background)",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          {loading && (
            <svg
              className="animate-spin h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? "Thinking in French…" : "Conjugate"}
        </button>
      </div>
    </div>
  );
}
