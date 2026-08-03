import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { loadFocusComplete } from "../components/mate/FocusTimerPopup";
import goalImage from "../assets/mate/goal-image.png";
import goalDayDone from "../assets/mate/goal-day-done.svg";
import goalDayMiss from "../assets/mate/goal-day-miss.svg";
import goalDayDashed from "../assets/mate/goal-day-dashed.png";
import goalDayFuture from "../assets/mate/goal-day-future.svg";
import goalCheck from "../assets/mate/goal-check.svg";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type DayStatus = "done" | "miss" | "today" | "dashed" | "future";

/** 목데이터 — 화요일이 오늘 달성 */
const WEEK: { day: (typeof WEEK_DAYS)[number]; status: DayStatus }[] = [
  { day: "일", status: "done" },
  { day: "월", status: "miss" },
  { day: "화", status: "today" },
  { day: "수", status: "dashed" },
  { day: "목", status: "future" },
  { day: "금", status: "future" },
  { day: "토", status: "future" },
];

function DayDot({ status }: { status: DayStatus }) {
  if (status === "today") {
    return (
      <span className="relative flex size-[31px] items-center justify-center">
        <img src={goalDayDone} alt="" className="absolute inset-0 size-full" />
        <img src={goalCheck} alt="" className="relative h-2 w-2.5" />
      </span>
    );
  }

  const src =
    status === "done"
      ? goalDayDone
      : status === "miss"
        ? goalDayMiss
        : status === "dashed"
          ? goalDayDashed
          : goalDayFuture;

  return <img src={src} alt="" className="size-[31px] object-contain" />;
}

export default function GoalAchievedPage() {
  const navigate = useNavigate();
  const complete = loadFocusComplete();

  if (!complete) {
    return <Navigate to="/mate" replace />;
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-0 pb-24">
        <div className="flex w-full flex-col items-center gap-14">
          <div className="relative flex w-full flex-col items-center">
            <h1 className="text-center text-h1 text-gray-900">
              오늘의 목표 달성!
            </h1>
            <p className="mt-1 text-center text-body1 text-gray-400">
              훌륭해요! {complete.minutes}분간 깊게 몰입했습니다.
            </p>

            <div className="relative mt-7 flex h-[154px] w-full items-end justify-center">
              <img
                src={goalImage}
                alt=""
                className="relative z-10 h-[151px] w-auto object-contain object-bottom"
              />
              <div
                aria-hidden
                className="absolute bottom-0 left-[90px] right-[90px] h-1.5 rounded-full bg-gray-100"
              />
            </div>
          </div>

          <section className="flex w-full flex-col px-5" aria-label="주간 달성">
            <div className="flex items-center justify-center rounded-t-[11px] bg-white px-2 pt-2">
              {WEEK.map((item) => (
                <div
                  key={item.day}
                  className="flex h-9 flex-1 items-center justify-center"
                >
                  <span
                    className={`text-body2 ${
                      item.status === "today"
                        ? "font-bold text-primary-500"
                        : item.status === "dashed" || item.status === "future"
                          ? "text-gray-300"
                          : "text-gray-500"
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center rounded-b-[11px] bg-white px-2 pb-2">
              {WEEK.map((item) => (
                <div
                  key={`${item.day}-dot`}
                  className="flex h-9 flex-1 items-center justify-center"
                >
                  <DayDot status={item.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-[430px] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2.5">
        <Button
          text="계속하기"
          variant="primary"
          size="h-[54px] w-full px-5 py-3"
          onClick={() => navigate("/mate/reflect", { replace: true })}
        />
      </div>
    </main>
  );
}
