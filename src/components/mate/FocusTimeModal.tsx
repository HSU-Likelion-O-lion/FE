import { useEffect, useRef, useState, type TouchEvent } from "react";
import Button from "../Button";

const TIME_OPTIONS = [
  { minutes: 15, label: "15분 (가볍게 읽기)" },
  { minutes: 30, label: "30분 (몰입해서 읽기)" },
  { minutes: 60, label: "60분 (깊이 빠져들기)" },
] as const;

const DISMISS_THRESHOLD = 80;

type FocusTimeModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect?: (minutes: number) => void;
};

/** 집중 시간 선택 — 모바일 바텀시트 / 웹 센터 모달 (Figma 660:6862) */
export default function FocusTimeModal({
  open,
  onClose,
  onSelect,
}: FocusTimeModalProps) {
  const [selected, setSelected] = useState(15);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      setDragging(false);
      return;
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleTouchStart = (e: TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging) return;
    const delta = e.touches[0].clientY - startYRef.current;
    setDragY(Math.max(0, delta));
  };

  const handleTouchEnd = () => {
    setDragging(false);
    if (dragY >= DISMISS_THRESHOLD) {
      onClose();
      return;
    }
    setDragY(0);
  };

  const pick = (minutes: number) => {
    setSelected(minutes);
    onSelect?.(minutes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center min-[431px]:items-center min-[431px]:px-5">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-[rgba(58,61,77,0.78)]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="focus-time-modal-title"
        className="relative z-10 w-full max-w-[430px] rounded-t-[24px] bg-[#fdfdff] pb-[env(safe-area-inset-bottom)] will-change-transform min-[431px]:w-[565px] min-[431px]:max-w-[565px] min-[431px]:rounded-[24px] min-[431px]:p-8"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
      >
        {/* 모바일: 드래그 핸들 */}
        <div
          className="touch-none min-[431px]:hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex cursor-grab justify-center pt-[14px] pb-[11px] active:cursor-grabbing">
            <span className="h-2 w-[50px] rounded-full bg-gray-200" />
          </div>
        </div>

        <div className="flex flex-col items-start px-5 pt-[18px] min-[431px]:px-0 min-[431px]:pt-0">
          <h2
            id="focus-time-modal-title"
            className="text-h2 text-left text-gray-900 min-[431px]:text-[24px] min-[431px]:leading-[1.5]"
          >
            오늘 얼마나 읽을까요?
          </h2>
          <p className="mt-1 text-left text-body1 text-gray-400 min-[431px]:hidden">
            마음을 가라앉히기 좋은 시간이에요.
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 px-5 py-5 min-[431px]:mt-7 min-[431px]:gap-5 min-[431px]:p-0">
          {TIME_OPTIONS.map((option) => (
            <Button
              key={option.minutes}
              text={option.label}
              size="h-[54px] w-full px-5 py-3"
              active={selected === option.minutes}
              onClick={() => pick(option.minutes)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
