import noteBgClip from "../../assets/shelter/thoughts/note-bg-clip.png";
import noteBgCurl from "../../assets/shelter/thoughts/note-bg-curl.png";
import noteBgTape from "../../assets/shelter/thoughts/note-bg-tape.png";
import noteBgFeatured from "../../assets/shelter/thoughts/note-bg-featured.png";
import noteBgEmpty from "../../assets/shelter/thoughts/empty-card.png";

export type PostItVariant = "clip" | "curl" | "tape" | "featured" | "empty";

type PostItProps = {
  variant: PostItVariant;
  lines: string[];
  className?: string;
  rotate?: number;
  width: number;
  /** 배경만 좌우 반전 (텍스트는 그대로) */
  flip?: boolean;
  textClassName?: string;
  onClick?: () => void;
  "aria-label"?: string;
};

const BG: Record<PostItVariant, string> = {
  clip: noteBgClip,
  curl: noteBgCurl,
  tape: noteBgTape,
  featured: noteBgFeatured,
  empty: noteBgEmpty,
};

/**
 * Figma Group 2117904906 (349.547 × 336.6) 기준 텍스트 박스
 * text node 306:4724 → left 41.9, top 69.16, w 262.47
 */
const EMPTY_TEXT = {
  left: `${(41.899 / 349.547) * 100}%`,
  top: `${(69.162 / 336.6) * 100}%`,
  width: `${(262.47 / 349.547) * 100}%`,
} as const;

/** 포스트잇 모양(투명 PNG) + 강원교육새음체 텍스트 */
export default function PostIt({
  variant,
  lines,
  className = "",
  rotate = 0,
  width,
  flip = false,
  textClassName = "",
  onClick,
  "aria-label": ariaLabel,
}: PostItProps) {
  const isFeatured = variant === "featured";
  const isEmpty = variant === "empty";

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? lines.join(" ")}
      onClick={onClick}
      className={`p-0 transition-transform active:scale-95 ${className}`}
      style={{
        width,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      <span className="relative block w-full">
        <img
          src={BG[variant]}
          alt=""
          className={`pointer-events-none block h-auto w-full max-w-none select-none ${
            flip ? "-scale-x-100" : ""
          }`}
          draggable={false}
        />
        {isEmpty ? (
          <span
            className={`pointer-events-none absolute text-left font-saeeum text-[27px] leading-7 tracking-[-0.025em] text-gray-900 ${textClassName}`}
            style={EMPTY_TEXT}
          >
            <span className="block whitespace-pre-line">{lines.join("\n")}</span>
          </span>
        ) : (
          <span
            className={`pointer-events-none absolute inset-0 flex items-center justify-center text-center font-saeeum tracking-[-0.025em] ${
              isFeatured
                ? "px-8 pb-4 pt-2 leading-7 text-gray-900"
                : "px-3 pt-2 leading-5 text-gray-700"
            } ${textClassName || (isFeatured ? "text-[24px]" : "text-[20px]")}`}
          >
            <span className="block whitespace-pre-line">{lines.join("\n")}</span>
          </span>
        )}
      </span>
    </button>
  );
}
