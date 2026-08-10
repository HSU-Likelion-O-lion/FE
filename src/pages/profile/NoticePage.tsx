import iconArrowRight from "../../assets/mate/icon-arrow-right.svg";
import ProfileSubLayout from "../../components/profile/ProfileSubLayout";

type NoticeItem = {
  id: string;
  tag: string;
  title: string;
  date: string;
  isNew?: boolean;
};

const NOTICES: NoticeItem[] = [
  {
    id: "1",
    tag: "업데이트",
    title: "쓰담 1.2 업데이트 안내",
    date: "2026.07.28",
  },
  {
    id: "2",
    tag: "안내",
    title: "서비스 안정화를 위한 서버 점검 진행",
    date: "2026.07.28",
    isNew: true,
  },
  {
    id: "3",
    tag: "이벤트",
    title: "7일 독서 챌린지에 참여하고 배지를 받아보세요.",
    date: "2026.07.28",
  },
  {
    id: "4",
    tag: "신규",
    title: "독서를 마친 후 생각을 기록하는 기능 추가",
    date: "2026.07.26",
    isNew: true,
  },
  {
    id: "5",
    tag: "이벤트",
    title: "초기 사용자 분들을 위한 특별한 캡슐",
    date: "2026.07.25",
  },
  {
    id: "6",
    tag: "이벤트",
    title: "나만의 에세이 출판 서비스 신청자를 모집합니다.",
    date: "2026.07.24",
  },
  {
    id: "7",
    tag: "업데이트",
    title: "쉼터 커뮤니티 이용 정책이 변경되었습니다.",
    date: "2026.07.23",
  },
  {
    id: "8",
    tag: "업데이트",
    title: "영감 캡슐 보상 방식 개선",
    date: "2026.07.22",
  },
  {
    id: "9",
    tag: "안내",
    title: "AI 추천 정확도가 더욱 향상되었습니다",
    date: "2026.07.22",
  },
  {
    id: "10",
    tag: "공지",
    title: "개인정보 처리방침 개정 안내",
    date: "2026.07.21",
  },
];

export default function NoticePage() {
  return (
    <ProfileSubLayout title="공지사항" contentClassName="pt-5">
      <section className="flex flex-col">
        {NOTICES.map((item) => (
          <button
            key={item.id}
            type="button"
            className="flex min-h-[76px] w-full items-center gap-2 border-b border-gray-50 px-5 py-4 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1 text-body2 leading-[23px] text-gray-900">
                <span className="font-semibold">[{item.tag}]</span>
                <span className="truncate">{item.title}</span>
                {item.isNew && (
                  <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary-300 text-[10px] font-semibold leading-none text-primary-10">
                    N
                  </span>
                )}
              </p>
              <p className="mt-1 text-caption leading-[18px] text-gray-500">
                {item.date}
              </p>
            </div>
            <span className="flex size-6 shrink-0 items-center justify-center">
              <img
                src={iconArrowRight}
                alt=""
                className="h-[13.5px] w-[7.5px] object-contain opacity-40"
              />
            </span>
          </button>
        ))}
      </section>
    </ProfileSubLayout>
  );
}
