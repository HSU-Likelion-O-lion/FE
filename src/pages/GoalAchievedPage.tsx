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

function normalizeApiDate(raw: string) {
  return raw.slice(0, 10);
}

/** 메이트 메인과 동일 — 이번 주 일요일 시작 */
function startOfSundayWeek(base = new Date()) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/**
 * 일~토 고정 주간.
 * 점선(miss) = 지나간 + 안 읽음
 * 회색(future) = 다가올 날
 * 채움(done) = 지나간 + 읽음
 * 채움+체크(today) = 오늘(목표 달성 화면이므로 항상 체크)
 */
function buildGoalWeek(apiWeek: Day[] = []): WeekItem[] {
  const today = formatLocalDate(new Date());
  const achievedByDate = new Map(
    apiWeek.map((d) => [normalizeApiDate(d.date), Boolean(d.achieved)]),
  );

  const weekStart = startOfSundayWeek();
  const items: WeekItem[] = [];

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const fullDate = formatLocalDate(d);
    const day = WEEK_DAYS[d.getDay()];

    let status: DayStatus;
    if (fullDate > today) {
      status = "future";
    } else if (fullDate === today) {
      status = "today";
    } else {
      status = achievedByDate.get(fullDate) ? "done" : "miss";
    }

    items.push({ day, status, date: fullDate });
  }

  return items;
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
  // API 실패/지연이어도 일~토 + 오늘 체크는 바로 보이게
  const [week, setWeek] = useState<WeekItem[]>(() => buildGoalWeek());

  useEffect(() => {
    let cancelled = false;
    getStreaks()
      .then((data) => {
        if (!cancelled) setWeek(buildGoalWeek(data.week ?? []));
      })
      .catch(() => {
        if (!cancelled) setWeek(buildGoalWeek());
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
