import { useEffect, useState } from "react";
import Button from "../Button";

export type NotificationTimeValue = {
  hour24: number;
  minute: number;
};

type NotificationTimeModalProps = {
  open: boolean;
  value: NotificationTimeValue;
  onClose: () => void;
  onConfirm: (value: NotificationTimeValue) => void;
};

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function toPeriodHour(hour24: number): { period: "am" | "pm"; hour12: number } {
  const period = hour24 < 12 ? "am" : "pm";
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { period, hour12 };
}

function toHour24(period: "am" | "pm", hour12: number): number {
  if (period === "am") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function formatNotificationTime({
  hour24,
  minute,
}: NotificationTimeValue): string {
  const { period, hour12 } = toPeriodHour(hour24);
  const label = period === "am" ? "오전" : "오후";
  return `${label} ${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** 알림시간 선택 — 모바일 바텀시트 / 웹 센터 모달 */
export default function NotificationTimeModal({
  open,
  value,
  onClose,
  onConfirm,
}: NotificationTimeModalProps) {
  const initial = toPeriodHour(value.hour24);
  const [period, setPeriod] = useState<"am" | "pm">(initial.period);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(value.minute);

  useEffect(() => {
    if (!open) return;
    const next = toPeriodHour(value.hour24);
    setPeriod(next.period);
    setHour12(next.hour12);
    setMinute(value.minute - (value.minute % 5));
  }, [open, value.hour24, value.minute]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const selectClass = (active: boolean) =>
    `flex h-11 flex-1 items-center justify-center rounded-xl text-body1 transition-colors ${
      active
        ? "bg-primary-500 font-semibold text-white"
        : "bg-gray-50 font-medium text-gray-700"
    }`;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center min-[431px]:items-center min-[431px]:px-5">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-[rgba(58,61,77,0.78)]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-time-title"
        className="relative z-10 flex w-full max-w-[430px] flex-col rounded-t-[24px] bg-[#fdfdff] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5 min-[431px]:max-w-[400px] min-[431px]:rounded-[24px] min-[431px]:pb-6"
      >
        <h2
          id="notification-time-title"
          className="text-center text-h3 text-gray-900"
        >
          알림시간 설정
        </h2>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className={selectClass(period === "am")}
            onClick={() => setPeriod("am")}
          >
            오전
          </button>
          <button
            type="button"
            className={selectClass(period === "pm")}
            onClick={() => setPeriod("pm")}
          >
            오후
          </button>
        </div>

        <div className="mt-4 flex gap-3">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-body2 text-gray-500">시</span>
            <select
              value={hour12}
              onChange={(e) => setHour12(Number(e.target.value))}
              className="h-12 appearance-none rounded-2xl border border-gray-100 bg-white px-4 text-center text-h3 text-gray-900 outline-none focus:border-primary-300"
            >
              {HOURS_12.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-body2 text-gray-500">분</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="h-12 appearance-none rounded-2xl border border-gray-100 bg-white px-4 text-center text-h3 text-gray-900 outline-none focus:border-primary-300"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            text="취소"
            variant="outline"
            size="h-[54px] flex-1 px-5 py-3"
            className="border-gray-200 bg-[#fdfdff] text-gray-700"
            onClick={onClose}
          />
          <Button
            text="확인"
            variant="primary"
            size="h-[54px] flex-1 px-5 py-3"
            onClick={() =>
              onConfirm({
                hour24: toHour24(period, hour12),
                minute,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
