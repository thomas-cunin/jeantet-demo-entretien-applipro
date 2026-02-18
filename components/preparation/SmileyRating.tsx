"use client";

const SMILEYS: { value: number; label: string; emoji: string }[] = [
  { value: 1, label: "Très insatisfait", emoji: "😞" },
  { value: 2, label: "Insatisfait", emoji: "😕" },
  { value: 3, label: "Neutre", emoji: "😐" },
  { value: 4, label: "Satisfait", emoji: "🙂" },
  { value: 5, label: "Très satisfait", emoji: "😊" },
];

interface SmileyRatingProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function SmileyRating({ value, onChange, label }: SmileyRatingProps) {
  return (
    <div className="flex flex-col gap-3">
      {label && (
        <span className="text-[14px] font-medium text-noir">{label}</span>
      )}
      <div
        className="flex justify-between gap-1"
        role="group"
        aria-label={label || "Sentiment"}
      >
        {SMILEYS.map(({ value: v, label: l, emoji }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`
              flex-1 min-w-0 flex flex-col items-center gap-1.5
              py-3 px-2 rounded-xl border-2 transition-all
              focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-2
              active:scale-95
              ${
                value === v
                  ? "border-applipro bg-applipro-05 shadow-sm"
                  : "border-gris-10 bg-white hover:border-gris-20 hover:bg-gris-05"
              }
            `}
            aria-label={l}
            aria-pressed={value === v}
            title={l}
          >
            <span className="text-2xl sm:text-3xl leading-none" aria-hidden>
              {emoji}
            </span>
            <span
              className={`text-[11px] sm:text-[12px] text-center leading-tight max-w-[4ch] ${
                value === v ? "text-applipro-dark font-medium" : "text-gris-60"
              }`}
            >
              {v}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
