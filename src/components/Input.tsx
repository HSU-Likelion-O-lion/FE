import {
  useId,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";

// html input 속성 중 size 제외한 속성
type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: boolean;
  className?: string;
};

type FieldState = "default" | "focus" | "filled" | "error";

const fieldStyles: Record<FieldState, string> = {
  default: "border border-solid border-gray-100 bg-transparent",
  focus:
    "border border-transparent bg-white shadow-[var(--shadow-input-focus)]",
  filled: "border border-transparent bg-gray-50",
  error: "border border-solid border-error bg-error-bg",
};

const textStyles: Record<FieldState, string> = {
  // 입력 글자는 항상 body2, placeholder만 caption 고정 → 포커스 시 크기 점프 방지
  default:
    "text-body2 text-gray-800 placeholder:text-caption placeholder:text-gray-300",
  focus:
    "text-body2 text-gray-800 placeholder:text-caption placeholder:text-gray-300",
  filled: "text-body2 text-gray-800",
  error:
    "text-body2 text-error placeholder:text-caption placeholder:text-error",
};

function resolveState({
  error,
  focused,
  hasValue,
}: {
  error: boolean;
  focused: boolean;
  hasValue: boolean;
}): FieldState {
  if (error) return "error";
  if (focused) return "focus";
  if (hasValue) return "filled";
  return "default";
}

export default function Input({
  error = false,
  className = "",
  value,
  defaultValue,
  placeholder = "입력해주세요.",
  onFocus,
  onBlur,
  onChange,
  id,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(String(defaultValue ?? ""));

  const isControlled = value !== undefined;
  const currentValue = isControlled ? String(value) : uncontrolled;
  const hasValue = currentValue.length > 0;
  const state = resolveState({ error, focused, hasValue });

  return (
    <input
      id={inputId}
      value={isControlled ? value : undefined}
      defaultValue={isControlled ? undefined : defaultValue}
      placeholder={placeholder}
      aria-invalid={error || undefined}
      onFocus={(e: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e: FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setUncontrolled(e.target.value);
        onChange?.(e);
      }}
      className={[
        "h-[54px] w-full rounded-[var(--radius-input)] px-5 py-3 outline-none transition-[background-color,box-shadow,border-color,color] duration-150",
        fieldStyles[state],
        textStyles[state],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
