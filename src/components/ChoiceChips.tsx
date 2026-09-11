'use client';

interface ChoiceChipsProps {
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}

// Big tappable option chips for boolean/enum questions. SPEC.md Section 8.3: tap targets >= 56px.
export function ChoiceChips({ options, onSelect }: ChoiceChipsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          className="flex min-h-[56px] items-center justify-center rounded-2xl border border-ink/15 bg-white px-4 text-center text-lg font-medium text-ink transition hover:border-marigold hover:text-marigold focus-visible:outline-none"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
