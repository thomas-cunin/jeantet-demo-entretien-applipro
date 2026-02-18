"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "regular" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children: ReactNode;
}

const sizeClasses: Record<Size, string> = {
  regular: "px-5 py-2.5 text-[14px] gap-2",
  small: "px-4 py-2 text-[13px] gap-1.5",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-white border-0 hover:bg-primary-hover disabled:bg-disabled-bg disabled:text-disabled-text",
  secondary:
    "bg-secondary-bg text-secondary-text border-0 hover:bg-secondary-hover hover:text-white disabled:bg-disabled-bg disabled:text-disabled-text",
};

export function Button({
  variant = "primary",
  size = "regular",
  iconLeft,
  iconRight,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-normal rounded-applipro
        transition-colors cursor-pointer
        disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={
        {
          "--tw-bg-opacity": 1,
        } as React.CSSProperties
      }
      {...props}
    >
      {iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
}
