"use client";

import {
  type SelectHTMLAttributes,
  useId,
  useState,
  useRef,
  useEffect,
} from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function Select({
  label,
  options,
  placeholder = "Sélectionner…",
  error,
  hint,
  value = "",
  onChange,
  className = "",
  id: idProp,
  ...props
}: SelectProps) {
  const id = useId();
  const inputId = idProp ?? id;
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = value !== undefined && value !== "" ? value : internalValue;
  const selectedOption = options.find((o) => o.value === currentValue);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt: SelectOption) => {
    setInternalValue(opt.value);
    onChange?.(opt.value);
    setIsOpen(false);
  };

  const borderColor = error
    ? "border-statut-rouge"
    : currentValue
      ? "border-applipro-20"
      : "border-gris-20";
  const chevronRotation = isOpen ? "rotate-180" : "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-[14px] font-medium text-noir mb-1.5"
      >
        {label}
      </label>
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${inputId}-listbox`}
        id={inputId}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((o) => !o);
          }
        }}
        onClick={() => setIsOpen((o) => !o)}
        className={`
          w-full min-h-[40px] px-3 py-2 rounded-applipro border bg-white
          text-[14px] text-noir placeholder-gris-40 cursor-pointer
          flex items-center justify-between gap-2
          ${borderColor}
          focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1
        `}
      >
        <span className={selectedOption ? "text-noir" : "text-gris-40"}>
          {displayLabel}
        </span>
        <svg
          className={`w-4 h-4 text-gris-60 shrink-0 transition-transform ${chevronRotation}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      <input
        type="hidden"
        name={props.name}
        value={currentValue}
        readOnly
      />
      {isOpen && (
        <ul
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 w-full mt-1 py-1 bg-white border border-gris-20 rounded-applipro shadow-lg max-h-60 overflow-auto"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === currentValue}
              onClick={() => handleSelect(opt)}
              onMouseDown={(e) => e.preventDefault()}
              className={`
                px-3 py-2 text-[14px] cursor-pointer
                ${opt.value === currentValue ? "bg-gris-05 text-noir" : "hover:bg-gris-05"}
              `}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      {hint && !error && (
        <p className="mt-1 text-[14px] text-gris-60 leading-tight">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[14px] text-statut-rouge">{error}</p>
      )}
    </div>
  );
}
