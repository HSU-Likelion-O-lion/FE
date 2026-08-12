export type LibrarySection = "reasons" | "growth";

type LibrarySectionToggleProps = {
  value: LibrarySection;
  onChange: (value: LibrarySection) => void;
};

/** Figma 716:6205 — 웹 서재 섹션 pill 토글 */
export default function LibrarySectionToggle({
  value,
  onChange,
}: LibrarySectionToggleProps) {
  return (
    <div className="inline-flex h-[38px] items-center rounded-[18.7px]">
      <button
        type="button"
        onClick={() => onChange("reasons")}
        className={`flex h-full items-center justify-center rounded-[18.7px] px-4 text-[15.4px] tracking-[-0.025em] ${
          value === "reasons"
            ? "bg-primary-10 font-semibold text-primary-500"
            : "font-normal text-gray-400"
        }`}
      >
        나의 사유록
      </button>
      <button
        type="button"
        onClick={() => onChange("growth")}
        className={`flex h-full items-center justify-center rounded-[18.7px] px-4 text-[15.4px] tracking-[-0.025em] ${
          value === "growth"
            ? "bg-primary-10 font-semibold text-primary-500"
            : "font-normal text-gray-400"
        }`}
      >
        독서 성장 기록
      </button>
    </div>
  );
}
