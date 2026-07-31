import { useState } from "react";

type ButtonProps = {
  text: string;
  size?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
};

export default function Button({
  text,
  size = "px-5 py-3",
  onClick,
  className = "",
  active: activeProp,
}: ButtonProps) {
  const [internalActive, setInternalActive] = useState(false);
  const isControlled = activeProp !== undefined;
  const active = isControlled ? activeProp : internalActive;

  return (
    <button
      type="button"
      onClick={(e) => {
        if (!isControlled) setInternalActive((prev) => !prev);
        onClick?.();
        // iOS 등에서 탭 후 sticky hover/focus 잔상 제거
        e.currentTarget.blur();
      }}
      className={`btn btn-default ${active ? "btn-active" : ""} ${size} ${className}`.trim()}
    >
      {text}
    </button>
  );
}
