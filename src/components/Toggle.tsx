type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  "aria-label"?: string;
};

/** Figma Button-hover2 — track 58×24, thumb ~37.5×20 capsule */
export default function Toggle({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-[58px] shrink-0 rounded-xl transition-colors ${
        checked ? "bg-primary-400" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-1/2 h-5 w-[37.5px] -translate-y-1/2 rounded-[10px] bg-white transition-[left] duration-150 ${
          checked ? "left-[18px]" : "left-[2.5px]"
        }`}
      />
    </button>
  );
}
