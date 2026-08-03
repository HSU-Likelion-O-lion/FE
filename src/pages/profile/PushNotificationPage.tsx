import { useState } from "react";
import ProfileSubLayout from "../../components/profile/ProfileSubLayout";
import Toggle from "../../components/Toggle";

type PushItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

const INITIAL_ITEMS: PushItem[] = [
  {
    id: "goal",
    title: "독서 목표 시간 알림",
    description: "설정한 시간에 독서를 시작하도록 알려드려요.",
    enabled: true,
  },
  {
    id: "capsule",
    title: "새로운 영감 캡슐 도착",
    description: "설정한 시간에 독서를 시작하도록 알려드려요.",
    enabled: false,
  },
  {
    id: "streak",
    title: "연속 달성 리마인드",
    description: "달성 기록이 끊기지 않게 미리 알려드려요.",
    enabled: false,
  },
];

export default function PushNotificationPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);

  return (
    <ProfileSubLayout title="푸시 알림 설정">
      <p className="px-5 pt-5 text-body2 leading-[23px] text-gray-300">
        지훈님이 선택한 알림을 보내드릴게요.
        <br />
        마케팅 알림을 꺼도 받을 수 있어요.
      </p>

      <section className="mt-4 flex flex-col">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0 flex-1">
              <p className="text-h3 text-gray-900">{item.title}</p>
              <p className="mt-1 text-body2 leading-[23px] text-gray-500">
                {item.description}
              </p>
            </div>
            <Toggle
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
        ))}
      </section>
    </ProfileSubLayout>
  );
}
