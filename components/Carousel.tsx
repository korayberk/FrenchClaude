"use client";

import { useRef, ReactNode } from "react";

interface Slide {
  label: string;
  content: ReactNode;
}

interface Props {
  slides: Slide[];
  active: number;
  onSlideChange: (index: number) => void;
}

export default function Carousel({ slides, active, onSlideChange }: Props) {
  const startX = useRef<number | null>(null);

  const goTo = (i: number) => onSlideChange(i);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && active < slides.length - 1) goTo(active + 1);
      if (dx > 0 && active > 0) goTo(active - 1);
    }
    startX.current = null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex rounded-xl p-1 self-start" style={{ background: "var(--separator)" }}>
        {slides.map((s, i) => (
          <button
            key={s.label}
            onClick={() => goTo(i)}
            className="px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all"
            style={{
              background: active === i ? "var(--card)" : "transparent",
              color: active === i ? "var(--foreground)" : "var(--secondary-label)",
              boxShadow: active === i ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div
          className="flex"
          style={{
            transform: `translateX(${-active * (100 / slides.length)}%)`,
            transition: "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
            width: `${slides.length * 100}%`,
          }}
        >
          {slides.map((s, i) => (
            <div key={s.label} style={{ width: `${100 / slides.length}%` }} aria-hidden={i !== active}>
              {s.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
