import bgGlow from "../../assets/shelter/thoughts/bg-glow.svg";

type ShelterTopGlowProps = {
  /** 스택 순서 (보드/empty는 헤더 아래 글로우가 위에 와야 함) */
  className?: string;
};

/**
 * Ellipse 2467 — Figma 기준 433×644 @ top -230.
 * 화면에서 작아 보이지 않도록 비율 유지한 채 확대 (서재 reasons-ellipse와 동일 스케일).
 */
export default function ShelterTopGlow({
  className = "z-0",
}: ShelterTopGlowProps) {
  return (
    <img
      src={bgGlow}
      alt=""
      className={`pointer-events-none absolute left-1/2 top-[-320px] h-[860px] w-[620px] max-w-none -translate-x-1/2 ${className}`}
    />
  );
}
