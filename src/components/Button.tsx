import { useState } from "react";

type ButtonProps = {
  text: string;
  size?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  /**
   * default: 선택형 버튼 1 (gray-50 ↔ primary-10)
   * primary: 채움 CTA 버튼 2 (N=gray-100 / Y=primary-500)
   * outline: 모달 보조 액션
   */
  variant?: "default" | "primary" | "outline";
};

/** Figma 공용 버튼 — Button-hover (선택) / Button-hover #2 (채움 CTA) */
export default function Button({
  text,
  size = "px-5 py-3",
  onClick,
  className = "",
  active: activeProp,
  disabled = false,
  variant = "default",
}: ButtonProps) {
  const [internalActive, setInternalActive] = useState(false);
  const isControlled = activeProp !== undefined;
  const active = isControlled ? activeProp : internalActive;

  const variantClass = (() => {
    if (variant === "primary") {
      // Figma Button-hover(200:2536) — N / Y
      return disabled
        ? "cursor-not-allowed bg-gray-100 text-gray-400"
        : "bg-primary-500 text-white";
    }
    if (variant === "outline") {
      return "border border-solid border-gray-200 bg-transparent text-gray-400";
    }
    return `btn-default ${active ? "btn-active" : ""}`;
  })();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        if (variant === "default" && !isControlled) {
          setInternalActive((prev) => !prev);
        }
        onClick?.();
        e.currentTarget.blur();
      }}
      className={`btn ${variantClass} ${size} ${className}`.trim()}
    >
      {text}
    </button>
  );
}
