import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkCanEnterCommunity } from "../../data/dailyReadingStore";

/** 오늘 독서(커뮤니티 입장) 가능한 경우에만 자식 라우트 접근 허용 */
export default function RequireDailyReading({
  children,
}: {
  children: ReactNode;
}) {
  const [canEnter, setCanEnter] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkCanEnterCommunity().then((ok) => {
      if (!cancelled) setCanEnter(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (canEnter === null) return null;
  if (!canEnter) return <Navigate to="/shelter" replace />;
  return children;
}
