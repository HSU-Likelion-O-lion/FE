import { useState } from "react";

type ButtonProps = {
  text: string;
  size?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  disabled?: boolean;
  /** default: 선택형 / primary: 제출 CTA / outline: 보조 액션 */
  variant?: "default" | "primary" | "outline";
};

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
      return disabled
        ? "cursor-not-allowed bg-gray-300 font-semibold text-white"
        : "bg-primary-500 font-semibold text-white";
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
        // iOS 등에서 탭 후 sticky hover/focus 잔상 제거
        e.currentTarget.blur();
      }}
      className={`btn ${variantClass} ${size} ${className}`.trim()}
    >
      {text}
    </button>
  );
}
