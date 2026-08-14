import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { hasCompletedMateToday } from "../../data/dailyReadingStore";

/** 오늘 메이트를 완료한 경우에만 자식 라우트 접근 허용 */
export default function RequireDailyReading({
  children,
}: {
  children: ReactNode;
}) {
  if (!hasCompletedMateToday()) {
    return <Navigate to="/shelter" replace />;
  }
  return children;
}
