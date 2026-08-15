import { useEffect, useState } from "react";
import { getMe } from "../../api";
import ProfileSubLayout from "../../components/profile/ProfileSubLayout";
import Toggle from "../../components/Toggle";
import NotificationTimeModal, {
  formatNotificationTime,
  type NotificationTimeValue,
} from "../../components/profile/NotificationTimeModal";
import { useIsDesktop } from "../../hooks/useIsDesktop";

type PushItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  time: NotificationTimeValue;
};

const INITIAL_ITEMS: PushItem[] = [
  {
    id: "goal",
    title: "독서 목표 시간 알림",
    description: "설정한 시간에 독서를 시작하도록 알려드려요.",
    enabled: true,
    time: { hour24: 21, minute: 0 },
  },
  {
    id: "capsule",
    title: "새로운 영감 캡슐 도착",
    description: "설정한 시간에 독서를 시작하도록 알려드려요.",
    enabled: false,
    time: { hour24: 21, minute: 0 },
  },
  {
    id: "streak",
    title: "연속 달성 리마인드",
    description: "달성 기록이 끊기지 않게 미리 알려드려요.",
    enabled: false,
    time: { hour24: 21, minute: 0 },
  },
];

/** 푸시 알림 설정 + 알림시간 설정 — 모바일 225:4259 / 웹 715:4889 */
export default function PushNotificationPage() {
  const isDesktop = useIsDesktop();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setNickname(me.nickname);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const editingItem = items.find((item) => item.id === editingId) ?? null;

  return (
    <ProfileSubLayout title="푸시 알림 설정">
      <p
        className={
          isDesktop
            ? "px-6 pt-4 text-[16px] leading-[1.6] tracking-[-0.025em] text-gray-300"
            : "px-5 pt-5 text-body2 leading-[23px] text-gray-300"
        }
      >
        {nickname ? `${nickname}님이` : "회원님이"} 선택한 알림을 보내드릴게요.
        {isDesktop ? " " : <br />}
        마케팅 알림을 꺼도 받을 수 있어요.
      </p>

      <section
        className={`mt-4 flex flex-col ${isDesktop ? "mt-6 px-3" : ""}`}
        aria-label="푸시 알림 목록"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="flex flex-col">
              {/* 제목 + 토글 */}
              <div
                className={`flex items-start justify-between gap-4 ${
                  isDesktop
                    ? "border-b border-gray-50 px-6 pb-5 pt-6"
                    : "border-b border-gray-50 px-5 pb-4 pt-5"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={
                      isDesktop
                        ? "text-[20px] font-semibold leading-[1.6] tracking-[-0.025em] text-gray-900"
                        : "text-h3 text-gray-900"
                    }
                  >
                    {item.title}
                  </p>
                  <p
                    className={
                      isDesktop
                        ? "mt-1.5 text-[16.8px] leading-[1.6] tracking-[-0.025em] text-gray-500"
                        : "mt-1 text-body2 leading-[23px] text-gray-500"
                    }
                  >
                    {item.description}
                  </p>
                </div>
                <Toggle
                  size={isDesktop ? "web" : "mobile"}
                  checked={item.enabled}
                  aria-label={item.title}
                  onChange={(checked) => {
                    setItems((prev) =>
                      prev.map((row) =>
                        row.id === item.id ? { ...row, enabled: checked } : row,
                      ),
                    );
                  }}
                />
              </div>

              {/* 알림시간 설정 */}
              <div
                className={`relative flex items-center justify-between ${
                  isDesktop
                    ? "px-6 py-[19px]"
                    : `px-5 py-4 ${
                        isLast
                          ? ""
                          : "border-b-4 border-[rgba(230,232,240,0.74)]"
                      }`
                }`}
              >
                <p
                  className={
                    isDesktop
                      ? "text-[19.2px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-700"
                      : "text-body1 font-medium text-gray-700"
                  }
                >
                  알림시간 설정
                </p>
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  className={
                    isDesktop
                      ? "rounded-[4.8px] bg-gray-50 px-[15.6px] py-[7.2px] text-[16.8px] leading-[1.6] tracking-[-0.025em] text-gray-700"
                      : "rounded bg-gray-50 px-[13px] py-1.5 text-body2 text-gray-700"
                  }
                  aria-label={`${item.title} 알림시간 설정`}
                >
                  {formatNotificationTime(item.time)}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <NotificationTimeModal
        open={editingItem != null}
        value={editingItem?.time ?? { hour24: 21, minute: 0 }}
        onClose={() => setEditingId(null)}
        onConfirm={(time) => {
          if (!editingId) return;
          setItems((prev) =>
            prev.map((row) =>
              row.id === editingId ? { ...row, time } : row,
            ),
          );
          setEditingId(null);
        }}
      />
    </ProfileSubLayout>
  );
}
