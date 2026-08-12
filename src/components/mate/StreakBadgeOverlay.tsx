import { useEffect } from "react";
import Button from "../Button";
import WebGnb from "../WebGnb";
import streakBadge from "../../assets/mate/streak-badge.png";
import streakRays from "../../assets/mate/streak-rays.png";

type StreakBadgeOverlayProps = {
  open: boolean;
  onConfirm: () => void;
};

const RAYS_HEIGHT = 627;
const BADGE_SIZE = 171;
/** 레이 top=0 기준, 배지를 레이 세로 중심에 */
const BADGE_TOP = RAYS_HEIGHT / 2 - BADGE_SIZE / 2;

/** 웹 — Figma 712:4687 */
const WEB_BADGE = 271;
const WEB_RAYS_W = 500;
const WEB_RAYS_H = 482;
/** 레이가 배지보다 큰 만큼 위/아래 여백 — 헤더·컨테이너에 잘리지 않게 */
const WEB_RAYS_OVERHANG = (WEB_RAYS_H - WEB_BADGE) / 2;

/**
 * +1 라벨 — fill #7968F8, 외곽 Outside linear #FDF7FE → #E4D4FC
 * (CSS text-stroke는 그라데이션 미지원 → SVG)
 */
function PlusOneLabel({
  className,
  fontSize,
  /** Figma Stroke Outside 두께 */
  outsideStroke,
  gradientId,
}: {
  className?: string;
  fontSize: number;
  outsideStroke: number;
  gradientId: string;
}) {
  // paintOrder: stroke → fill 이라 안쪽 절반이 가려짐 → Outside 두께의 2배
  const strokeWidth = outsideStroke * 2;

  return (
    <svg
      aria-hidden
      className={className}
      width="100%"
      height="100%"
      overflow="visible"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#FDF7FE" />
          <stop offset="100%" stopColor="#E4D4FC" />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#7968F8"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        paintOrder="stroke fill"
        style={{
          fontFamily: "CookieRun, sans-serif",
          fontSize,
          fontWeight: 900,
          letterSpacing: "-0.025em",
        }}
      >
        +1
      </text>
    </svg>
  );
}

/** 7일 연속 달성 배지 — 풀스크린 오버레이 (모바일 204:3675 / 웹 712:4687) */
export default function StreakBadgeOverlay({
  open,
  onConfirm,
}: StreakBadgeOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="나만의 메이트가 성장했어요!"
      className="fixed inset-0 z-[130] mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:max-w-none"
    >
      <div className="shrink-0">
        <WebGnb active="center" />
      </div>

      {/* —— 모바일 —— */}
      <div className="relative z-10 min-h-0 flex-1 min-[431px]:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 z-0 animate-streak-rays-spin"
          style={{ top: BADGE_TOP + BADGE_SIZE / 2 }}
        >
          <img
            src={streakRays}
            alt=""
            className="absolute left-0 top-0 h-[627px] w-[418px] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-[0.19]"
          />
        </div>

        <div
          className="absolute left-1/2 z-10 size-[171px] -translate-x-1/2"
          style={{ top: BADGE_TOP }}
        >
          <img
            src={streakBadge}
            alt=""
            className="size-[171px] object-contain"
          />
          <PlusOneLabel
            className="absolute left-1/2 top-[130px] h-[40px] w-[90px] -translate-x-1/2"
            fontSize={34}
            outsideStroke={8}
            gradientId="streak-plus-stroke-mobile"
          />
        </div>

        <div
          className="absolute inset-x-0 z-10 px-[53px] text-center"
          style={{ top: BADGE_TOP + BADGE_SIZE + 48 }}
        >
          <h2 className="text-h2 text-gray-900">
            나만의 메이트가 성장했어요!
          </h2>
          <p className="mt-2 text-[16px] leading-[26px] text-[#6b7280]">
            일주일 동안 하루도 빠짐없이
            <br />
            나만의 몰입 시간을 지켰습니다.
            <br />
            새로운 배지가 추가되었습니다!
          </p>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2.5 min-[431px]:hidden">
        <Button
          text="확인"
          variant="primary"
          size="h-[54px] w-full px-5 py-3"
          onClick={onConfirm}
        />
      </div>

      {/* —— 웹: Figma 712:4687 —— */}
      <div className="relative hidden min-h-0 flex-1 overflow-y-auto min-[431px]:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[261px] bg-[linear-gradient(96deg,#fdfdff_10.5%,transparent_89.5%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[261px] bg-[linear-gradient(264deg,#fdfdff_10.5%,transparent_89.5%)]"
        />

        {/* 배지·문구·버튼 한 덩어리로 스크롤 (버튼 고정 없음) */}
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[472px] flex-col items-center justify-center px-6 pt-5 pb-8">
          <div
            className="relative flex w-full max-w-[470px] flex-col items-center"
            style={{ paddingTop: WEB_RAYS_OVERHANG }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 animate-streak-rays-spin"
              style={{ top: WEB_RAYS_OVERHANG + WEB_BADGE / 2 }}
            >
              <img
                src={streakRays}
                alt=""
                className="max-w-none object-cover opacity-[0.19]"
                style={{ width: WEB_RAYS_W, height: WEB_RAYS_H }}
              />
            </div>

            <div
              className="relative z-10"
              style={{ width: WEB_BADGE, height: WEB_BADGE }}
            >
              <img
                src={streakBadge}
                alt=""
                className="size-full object-contain"
              />
              <PlusOneLabel
                className="absolute left-1/2 top-[200px] h-[76px] w-[140px] -translate-x-1/2"
                fontSize={50.4}
                outsideStroke={9.6}
                gradientId="streak-plus-stroke-web"
              />
            </div>

            <div className="relative z-10 mt-[38px] flex flex-col items-center text-center">
              <h2 className="text-[26.4px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                나만의 메이트가 성장했어요!
              </h2>
              <p className="mt-3 text-[19.2px] leading-[31.2px] tracking-[-0.025em] text-[#6b7280]">
                일주일 동안 하루도 빠짐없이
                <br />
                나만의 몰입 시간을 지켰습니다.
                <br />
                새로운 배지가 추가되었습니다!
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-10 flex w-full justify-center">
            <Button
              text="계속하기"
              variant="primary"
              size="h-[65px] w-full max-w-[424px] rounded-[19px] px-6 py-3.5 text-[23px]"
              onClick={onConfirm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
