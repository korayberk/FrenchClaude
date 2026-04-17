import { ConjugateResponse } from "@/app/api/conjugate/route";
import { getTenseConfig } from "@/lib/tenseOrder";
import TenseCard from "@/components/TenseCard";

interface TimelineItem {
  tense: string;
  french: string;
  english: string;
  isOriginal: boolean;
  order: number;
  zone: string;
}

interface Props {
  result: ConjugateResponse;
}

export default function TimelineResults({ result }: Props) {
  const items: TimelineItem[] = [
    {
      ...result.original,
      isOriginal: true,
      ...getTenseConfig(result.original.tense),
    },
    ...result.variations.map((v) => ({
      ...v,
      isOriginal: false,
      ...getTenseConfig(v.tense),
    })),
  ].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;

        return (
          <div key={i} className="flex items-stretch gap-0">
            {/* Zone label */}
            <div
              className="shrink-0 flex items-start pt-5"
              style={{ width: 96, paddingRight: 12, textAlign: "right" }}
            >
              {item.zone && (
                <span
                  className="text-[10px] leading-tight w-full text-right"
                  style={{
                    color: item.isOriginal ? "var(--secondary-label)" : "var(--tertiary-label)",
                    fontWeight: item.isOriginal ? 600 : 400,
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.zone}
                </span>
              )}
            </div>

            {/* Dot + connecting line */}
            <div className="shrink-0 flex flex-col items-center" style={{ width: 24 }}>
              {/* Top connector */}
              <div
                style={{
                  width: 1,
                  flex: "0 0 20px",
                  background: isFirst ? "transparent" : "var(--separator)",
                }}
              />

              {/* Dot */}
              {item.isOriginal ? (
                <div
                  className="shrink-0 flex items-center justify-center rounded-full"
                  style={{
                    width: 18,
                    height: 18,
                    border: "2px solid var(--foreground)",
                    background: "var(--foreground)",
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "white",
                    }}
                  />
                </div>
              ) : (
                <div
                  className="shrink-0 rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    border: "1.5px solid #C7C7CC",
                    background: "var(--background)",
                  }}
                />
              )}

              {/* Bottom connector */}
              <div
                style={{
                  width: 1,
                  flex: 1,
                  minHeight: 16,
                  background: isLast ? "transparent" : "var(--separator)",
                }}
              />
            </div>

            {/* Card */}
            <div className="flex-1 min-w-0 py-2 pl-3 pr-0">
              <TenseCard
                tense={item.tense}
                french={item.french}
                english={item.english}
                highlight={item.isOriginal}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
