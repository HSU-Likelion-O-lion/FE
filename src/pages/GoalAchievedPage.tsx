import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import WebGnb from "../components/WebGnb";
import { loadFocusComplete } from "../components/mate/FocusTimerPopup";
import { formatLocalDate } from "../components/mate/streak";
import { getStreaks, type Day } from "../api";
import { loadLastSession } from "../api/sessionDraft";
import goalImage from "../assets/mate/goal-image.png";
import goalDayDone from "../assets/mate/goal-day-done.svg";
import goalDayMiss from "../assets/mate/goal-day-miss.svg";
import goalDayDashed from "../assets/mate/goal-day-dashed.png";
import goalCheck from "../assets/mate/goal-check.svg";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type DayStatus = "done" | "miss" | "today" | "future";

type WeekItem = {
  day: (typeof WEEK_DAYS)[number];
  status: DayStatus;
  date: string;
};

/**
 * 점선(miss) = 지나간 + 안 읽은 날
 * 회색(future) = 다가올 날
 * 채움(done) = 지나간 + 읽은 날
 * 채움+체크(today) = 오늘이면서 읽음
 */
function mapWeekToUi(week: Day[]): WeekItem[] {
  const today = formatLocalDate(new Date());

  return week.map((item) => {
    const d = new Date(`${item.date}T00:00:00`);
    const day = WEEK_DAYS[Number.isNaN(d.getTime()) ? 0 : d.getDay()];
    let status: DayStatus;
    if (item.date > today) {
      status = "future";
    } else if (item.date === today) {
      // 목표 달성 화면이므로 오늘은 읽음+체크로 표시
      status = "today";
    } else {
      status = item.achieved ? "done" : "miss";
    }
    return { day, status, date: item.date };
  });
}

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
        ? goalDayDashed
        : goalDayMiss;

  return <img src={src} alt="" className="size-[31px] object-contain" />;
}

export default function GoalAchievedPage() {
  const navigate = useNavigate();
  const complete = loadFocusComplete();
  const lastSession = loadLastSession();
  const [week, setWeek] = useState<WeekItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    getStreaks()
      .then((data) => {
        if (!cancelled) setWeek(mapWeekToUi(data.week));
      })
      .catch(() => {
        /* 주간 UI는 선택적 — 실패해도 페이지는 유지 */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!complete && !lastSession) {
    return <Navigate to="/mate" replace />;
  }

  const minutes = complete?.minutes ?? 15;

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-white">
      <div className="shrink-0">
        <WebGnb active="center" />
      </div>

      {/* 스크롤은 헤더 아래에서만 — 스크롤바가 헤더를 침범하지 않음 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col">
          <div className="flex flex-1 flex-col items-center justify-center px-0 py-8">
            <div className="flex w-full flex-col items-center gap-14">
              <div className="relative flex w-full flex-col items-center">
                <h1 className="text-center text-h1 text-gray-900">
                  오늘의 목표 달성!
                </h1>
                <p className="mt-1 text-center text-body1 text-gray-400">
                  훌륭해요! {minutes}분간 깊게 몰입했습니다.
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

              <section
                className="flex w-full flex-col px-5"
                aria-label="주간 달성"
              >
                <div className="flex items-center justify-center rounded-t-[11px] bg-white px-2 pt-2">
                  {week.map((item) => (
                    <div
                      key={item.date}
                      className="flex h-9 flex-1 items-center justify-center"
                    >
                      <span
                        className={`text-body2 ${
                          item.status === "today"
                            ? "font-bold text-primary-500"
                            : item.status === "future"
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
                  {week.map((item) => (
                    <div
                      key={`${item.date}-dot`}
                      className="flex h-9 flex-1 items-center justify-center"
                    >
                      <DayDot status={item.status} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="shrink-0 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-2.5">
            <Button
              text="계속하기"
              variant="primary"
              size="h-[54px] w-full px-5 py-3"
              onClick={() => navigate("/mate/reflect", { replace: true })}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
