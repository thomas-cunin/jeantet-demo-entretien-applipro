"use client";

import { type InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id: idProp,
  className = "",
  ...props
}: InputProps) {
  const id = useId();
  const inputId = idProp ?? id;

  const borderColor = error ? "border-statut-rouge" : "border-gris-20 focus:border-applipro-20";

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="block text-[14px] font-medium text-noir mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`
          w-full min-h-[40px] px-3 py-2 rounded-applipro border bg-white
          text-[14px] text-noir placeholder-gris-40
          focus:outline-none focus:ring-2 focus:ring-applipro focus:ring-offset-1
          ${borderColor}
        `}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1 text-[14px] text-gris-60 leading-tight">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-[14px] text-statut-rouge">{error}</p>
      )}
    </div>
  );
}
