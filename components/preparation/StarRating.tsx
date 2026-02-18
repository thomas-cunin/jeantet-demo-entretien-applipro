"use client";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const SMILEY_BY_STARS: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😊",
};

export function StarRating({
  value,
  onChange,
  max = 5,
  label,
  size = "lg",
}: StarRatingProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-[14px] font-medium text-noir">{label}</span>
      )}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 sm:gap-2" role="group" aria-label={label || "Note"}>
          {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={`
                ${sizes[size]} rounded-lg transition-transform active:scale-95
                focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-2
                flex items-center justify-center p-0 border-0 bg-transparent
              `}
              aria-label={`${star} sur ${max}`}
              aria-pressed={value === star}
            >
              <svg
                className={`${sizes[size]} ${
                  star <= value ? "text-statut-orange" : "text-gris-20"
                } transition-colors`}
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        {value > 0 && SMILEY_BY_STARS[value] && (
          <span
            className="text-2xl sm:text-3xl leading-none"
            role="img"
            aria-label={`Niveau ${value} sur ${max}`}
          >
            {SMILEY_BY_STARS[value]}
          </span>
        )}
      </div>
    </div>
  );
}
