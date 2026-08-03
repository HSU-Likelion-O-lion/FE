import { useEffect } from "react";
import Button from "../Button";
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

/** 7일 연속 달성 배지 — 라우트 없는 풀스크린 오버레이 (Figma 204:3675) */
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
      aria-labelledby="streak-badge-title"
      className="fixed inset-0 z-[130] mx-auto flex w-full max-w-[430px] flex-col overflow-hidden bg-white"
    >
      <div className="relative z-10 min-h-0 flex-1">
        {/* 레이: 배지 중심 기준 시계방향 회전 (상단에서 시작) */}
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

        {/* 배지: 레이 정중앙 */}
        <div
          className="absolute left-1/2 z-10 size-[171px] -translate-x-1/2"
          style={{ top: BADGE_TOP }}
        >
          <img
            src={streakBadge}
            alt=""
            className="size-[171px] object-contain"
          />
          <p
            className="absolute left-1/2 top-[145px] -translate-x-1/2 whitespace-nowrap text-center text-[34px] font-black leading-[26px] text-[#d6c9ff] [-webkit-text-stroke:8px_#584BBD]"
            style={{ paintOrder: "stroke fill" }}
          >
            +1
          </p>
        </div>

        <div
          className="absolute inset-x-0 z-10 px-[53px] text-center"
          style={{ top: BADGE_TOP + BADGE_SIZE + 48 }}
        >
          <h2 id="streak-badge-title" className="text-h2 text-gray-900">
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

      <div className="relative z-10 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2.5">
        <Button
          text="확인"
          variant="primary"
          size="h-[54px] w-full px-5 py-3"
          onClick={onConfirm}
        />
      </div>
    </div>
  );
}
