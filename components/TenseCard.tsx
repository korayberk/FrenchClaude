interface TenseCardProps {
  tense: string;
  french: string;
  english: string;
  highlight?: boolean;
}

const TENSE_COLORS: Record<string, string> = {
  "Présent": "bg-emerald-100 text-emerald-800",
  "Imparfait": "bg-amber-100 text-amber-800",
  "Passé composé": "bg-orange-100 text-orange-800",
  "Futur simple": "bg-sky-100 text-sky-800",
  "Conditionnel présent": "bg-purple-100 text-purple-800",
  "Passé simple": "bg-rose-100 text-rose-800",
  "Plus-que-parfait": "bg-red-100 text-red-800",
};

function badgeColor(tense: string) {
  for (const key of Object.keys(TENSE_COLORS)) {
    if (tense.toLowerCase().includes(key.toLowerCase())) return TENSE_COLORS[key];
  }
  return "bg-gray-100 text-gray-700";
}

export default function TenseCard({ tense, french, english, highlight }: TenseCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-2 transition-shadow ${
        highlight
          ? "border-blue-300 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor(tense)}`}>
          {tense}
        </span>
        {highlight && (
          <span className="text-xs text-blue-500 font-medium">original</span>
        )}
      </div>
      <p className="text-lg font-semibold text-gray-900 leading-snug">{french}</p>
      <p className="text-sm text-gray-500 italic">{english}</p>
    </div>
  );
}
