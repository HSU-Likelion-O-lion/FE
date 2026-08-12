import {
  useId,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

type FieldState = "default" | "focus" | "filled" | "error";
type FieldVariant = "default" | "glass";

const fieldStyles: Record<FieldVariant, Record<FieldState, string>> = {
  default: {
    default: "border border-solid border-gray-100 bg-transparent",
    focus:
      "border border-transparent bg-white shadow-[var(--shadow-input-focus)]",
    filled: "border border-transparent bg-gray-50",
    error: "border border-solid border-error bg-error-bg",
  },
  /** 웹 인증 화면 — Figma rgba(253,253,255,0.47) */
  glass: {
    default: "border border-transparent bg-[rgba(253,253,255,0.47)]",
    focus:
      "border border-transparent bg-[rgba(253,253,255,0.65)] shadow-[var(--shadow-input-focus)]",
    filled: "border border-transparent bg-[rgba(253,253,255,0.47)]",
    error:
      "border border-solid border-error bg-[rgba(241,201,210,0.71)]",
  },
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

type CommonProps = {
  error?: boolean;
  className?: string;
  multiline?: boolean;
  /** 웹 인증 화면용 반투명 입력 */
  variant?: FieldVariant;
};

type SingleLineProps = CommonProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    multiline?: false;
  };

type MultiLineProps = CommonProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> & {
    multiline: true;
  };

type InputProps = SingleLineProps | MultiLineProps;

export default function Input(props: InputProps) {
  const {
    error = false,
    className = "",
    value,
    defaultValue,
    placeholder = "입력해주세요.",
    onFocus,
    onBlur,
    onChange,
    id,
    multiline = false,
    variant = "default",
    ...rest
  } = props;

  const autoId = useId();
  const inputId = id ?? autoId;
  const [focused, setFocused] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(String(defaultValue ?? ""));

  const isControlled = value !== undefined;
  const currentValue = isControlled ? String(value) : uncontrolled;
  const hasValue = currentValue.length > 0;
  const state = resolveState({ error, focused, hasValue });

  const sharedClassName = [
    "w-full rounded-[var(--radius-input)] px-5 py-3 outline-none transition-[background-color,box-shadow,border-color,color] duration-150",
    multiline ? "h-[139px] resize-none" : "h-[54px]",
    fieldStyles[variant][state],
    textStyles[state],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (multiline) {
    const textareaRest =
      rest as Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">;

    return (
      <textarea
        id={inputId}
        value={isControlled ? value : undefined}
        defaultValue={isControlled ? undefined : defaultValue}
        placeholder={placeholder}
        aria-invalid={error || undefined}
        onFocus={(e: FocusEvent<HTMLTextAreaElement>) => {
          setFocused(true);
          (onFocus as TextareaHTMLAttributes<HTMLTextAreaElement>["onFocus"])?.(
            e,
          );
        }}
        onBlur={(e: FocusEvent<HTMLTextAreaElement>) => {
          setFocused(false);
          (onBlur as TextareaHTMLAttributes<HTMLTextAreaElement>["onBlur"])?.(e);
        }}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          if (!isControlled) setUncontrolled(e.target.value);
          (
            onChange as TextareaHTMLAttributes<HTMLTextAreaElement>["onChange"]
          )?.(e);
        }}
        className={sharedClassName}
        {...textareaRest}
      />
    );
  }

  const inputRest = rest as Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

  return (
    <input
      id={inputId}
      value={isControlled ? value : undefined}
      defaultValue={isControlled ? undefined : defaultValue}
      placeholder={placeholder}
      aria-invalid={error || undefined}
      onFocus={(e: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        (onFocus as InputHTMLAttributes<HTMLInputElement>["onFocus"])?.(e);
      }}
      onBlur={(e: FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        (onBlur as InputHTMLAttributes<HTMLInputElement>["onBlur"])?.(e);
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setUncontrolled(e.target.value);
        (onChange as InputHTMLAttributes<HTMLInputElement>["onChange"])?.(e);
      }}
      className={sharedClassName}
      {...inputRest}
    />
  );
}
