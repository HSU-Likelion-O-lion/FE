type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label"?: string;
  /** mobile: 58×24 / web: 69×28 (Figma 715:5004) */
  size?: "mobile" | "web";
};

/** Figma Button-hover2 — track/thumb 모두 알약형 radius */
export default function Toggle({
  checked,
  onChange,
  "aria-label": ariaLabel,
  size = "mobile",
}: ToggleProps) {
  const isWeb = size === "web";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 rounded-[14.4px] transition-colors ${
        isWeb ? "h-7 w-[69px]" : "h-6 w-[58px]"
      } ${checked ? "bg-primary-400" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-[12px] bg-white transition-[left] duration-150 ${
          isWeb ? "h-6 w-[45px]" : "h-5 w-[37.5px]"
        } ${
          checked
            ? isWeb
              ? "left-[21px]"
              : "left-[18px]"
            : isWeb
              ? "left-[3px]"
              : "left-[2.5px]"
        }`}
      />
    </button>
  );
}
