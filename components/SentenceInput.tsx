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

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écris ou colle une phrase en français…"
        rows={3}
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none placeholder:text-gray-300"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">⌘↵ to submit</span>
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim() || !hasApiKey}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          )}
          {loading ? "Thinking in French…" : "Conjugate"}
        </button>
      </div>
      {!hasApiKey && (
        <p className="text-xs text-amber-600">
          Set your Anthropic API key using the gear icon above.
        </p>
      )}
    </div>
  );
}
