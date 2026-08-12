import progressBook from "../../assets/library/progress-book.png";
import progressLooper from "../../assets/library/progress-looper.svg";
import progressNextArrow from "../../assets/library/progress-next-arrow.svg";
import progressNextGlow from "../../assets/library/progress-next-glow.svg";
import ornament from "../../assets/library/ornament.svg";

/** Ornament 세로 간격 (Figma 좌측 0→138, 우측 91→229) */
const ORNAMENT_STEP = 138;
const ORNAMENT_LOOP_COUNT = 4;

type LibraryProgressCardProps = {
  size?: "mobile" | "web";
  remaining: number;
  percent: number;
  onNextStep?: () => void;
  /** 100%일 때 화살표 버튼 표시 (기본 true) */
  showNext?: boolean;
};

/** 서재 출판 진행 카드 — Figma 모바일/웹 공용 */
export default function LibraryProgressCard({
  size = "mobile",
  remaining,
  percent,
  onNextStep,
  showNext = true,
}: LibraryProgressCardProps) {
  const isWeb = size === "web";

  return (
    <div
      className={`relative w-full overflow-hidden ${
        isWeb ? "h-[487px] rounded-[72px]" : "h-[338px] rounded-[50px]"
      }`}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #8899ff 31%, rgba(136,180,255,0.6) 100%)",
        }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0 h-full overflow-hidden ${
          isWeb ? "w-[171px]" : "w-[119px]"
        }`}
      >
        <div
          className={`absolute left-0 animate-library-ornament-down ${
            isWeb ? "top-[-198px]" : "top-[-138px]"
          }`}
        >
          {Array.from({ length: ORNAMENT_LOOP_COUNT }, (_, i) => (
            <img
              key={`L-${i}`}
              src={ornament}
              alt=""
              className={`absolute left-0 max-w-none object-contain ${
                isWeb ? "h-[187px] w-[171px]" : "h-[130px] w-[119px]"
              }`}
              style={{ top: i * (isWeb ? 199 : ORNAMENT_STEP) }}
            />
          ))}
        </div>
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute top-0 h-full overflow-hidden ${
          isWeb ? "left-[351px] w-[171px]" : "left-[244px] w-[119px]"
        }`}
      >
        <div
          className={`absolute left-0 animate-library-ornament-up ${
            isWeb ? "top-[-68px]" : "top-[-47px]"
          }`}
        >
          {Array.from({ length: ORNAMENT_LOOP_COUNT }, (_, i) => (
            <img
              key={`R-${i}`}
              src={ornament}
              alt=""
              className={`absolute left-0 max-w-none object-contain ${
                isWeb ? "h-[187px] w-[171px]" : "h-[130px] w-[119px]"
              }`}
              style={{ top: i * (isWeb ? 199 : ORNAMENT_STEP) }}
            />
          ))}
        </div>
      </div>
      <img
        src={progressLooper}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[7%] top-[4%] h-[91%] w-[85%] animate-library-looper-spin object-contain opacity-90"
      />
      <div className="pointer-events-none absolute left-1/2 top-[12%] h-[68%] w-[62%] -translate-x-1/2 animate-library-book-float">
        <img src={progressBook} alt="" className="size-full object-contain" />
      </div>
      <p
        className={`absolute text-white/80 ${
          isWeb
            ? "left-[43px] top-[43px] text-[23px] tracking-[-0.025em]"
            : "left-[30px] top-[30px] text-body1"
        }`}
      >
        출판까지 {remaining}개
      </p>
      <p
        className={`absolute tracking-[-0.025em] text-white ${
          isWeb
            ? "bottom-[43px] left-[43px] text-[86px] leading-[69px]"
            : "bottom-[30px] left-[30px] text-[60px] leading-[48px]"
        }`}
      >
        {percent}{" "}
        <span
          className={`font-light ${
            isWeb ? "text-[52px] leading-[69px]" : "text-[36px] leading-[48px]"
          }`}
        >
          %
        </span>
      </p>
      {showNext && percent >= 100 && onNextStep ? (
        <button
          type="button"
          aria-label="다음 단계로 이동"
          onClick={onNextStep}
          className={`absolute z-10 flex items-center justify-center ${
            isWeb
              ? "bottom-[43px] right-[43px] size-[70px]"
              : "bottom-[30px] right-[30px] size-[50px]"
          }`}
        >
          <img
            src={progressNextGlow}
            alt=""
            aria-hidden
            className={`pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 ${
              isWeb ? "size-[91px]" : "size-[65px]"
            }`}
          />
          <img
            src={progressNextArrow}
            alt=""
            aria-hidden
            className={`relative object-contain ${
              isWeb ? "h-[20px] w-[12px]" : "h-[16px] w-[9px]"
            }`}
          />
        </button>
      ) : null}
      <div
        className={`pointer-events-none absolute inset-0 shadow-[inset_0_0_6.1px_#fdfdff,inset_0_0_65.4px_#eceeff] ${
          isWeb ? "rounded-[72px]" : "rounded-[50px]"
        }`}
      />
    </div>
  );
}
