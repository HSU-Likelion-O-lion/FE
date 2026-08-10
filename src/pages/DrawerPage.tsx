import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import {
  loadDiagnosisHistory,
  type DiagnosisRecord,
} from "../data/drawerDiagnosisMock";
import bgRoom from "../assets/drawer/bg-room.png";
import owlHero from "../assets/drawer/owl-hero.png";
import owlPeek from "../assets/drawer/home/owl-peek.png";
import ellipseGlow from "../assets/drawer/home/ellipse-glow.svg";

/** 서랍 홈 — 시작전(404:11734) / 최근 진단결과(420:13210) */
export default function DrawerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>("drawer");
  const history = loadDiagnosisHistory();
  const showRecent = history.length > 0;

  if (showRecent) {
    return (
      <DrawerRecentHome
        records={history.slice(0, 3)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDiagnose={() => navigate("/drawer/diagnosis")}
      />
    );
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#2a3366]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 mx-auto max-w-[430px]"
      >
        <img
          src={bgRoom}
          alt=""
          className="absolute inset-0 size-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-[rgba(74,86,157,0.63)]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-[40px] pb-[calc(112px+env(safe-area-inset-bottom))] pt-[calc(60px+env(safe-area-inset-top))]">
        <section className="flex w-full max-w-[313px] shrink-0 flex-col items-center gap-1.5 text-center">
          <h1 className="w-full text-h2 text-primary-10">
            지금 당신의 마음을 들여다볼까요?
          </h1>
          <p className="w-full text-body2 text-primary-300">
            5장의 카드를 넘기면 딱 맞는 문장을 찾아드려요.
          </p>
        </section>

        {/* Figma: 타이틀 top 176 → 올빼미 top 281 (간격 ~39px), 올빼미 254 → 버튼 top 585 (간격 ~50px) */}
        <div
          aria-hidden
          className="mt-10 flex h-[254px] w-full max-w-[283px] shrink-0 items-center justify-center"
        >
          <img src={owlHero} alt="" className="h-full w-full object-contain" />
        </div>

        <div className="relative mt-[50px] w-full max-w-[313px] shrink-0">
          <button
            type="button"
            onClick={() => navigate("/drawer/diagnosis")}
            className="relative flex h-[54px] w-full items-center justify-center rounded-2xl text-center text-button1 font-semibold text-white"
            style={{
              backgroundImage:
                "linear-gradient(0.19deg, rgba(211,211,243,0.23) 0.93%, rgba(54,64,137,0.184) 84.5%)",
              boxShadow:
                "0 -3px 16.1px rgba(72,82,167,0.53), inset 0 0 4px rgba(241,241,241,0.53)",
            }}
          >
            마음 읽기 시작하기
          </button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-transparent pb-[env(safe-area-inset-bottom)]">
        <NavigationBar active={activeTab} tone="dark" onChange={setActiveTab} />
      </div>
    </main>
  );
}

function DrawerRecentHome({
  records,
  activeTab,
  onTabChange,
  onDiagnose,
}: {
  records: DiagnosisRecord[];
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onDiagnose: () => void;
}) {
  return (
    <main className="relative mx-auto flex h-dvh min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      {/* Figma Ellipse 2465: 969×1102 — 화면(~393)보다 훨씬 큰 글로우 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[calc(50%-336px)] z-0 h-[1102px] w-[969px] -translate-x-1/2 -translate-y-1/2"
      >
        <img
          src={ellipseGlow}
          alt=""
          className="absolute inset-0 size-full max-w-none"
        />
      </div>

      {/* 낮은 화면: 스크롤 / 높은 화면: 흰 패널이 nav 아래까지 채움 */}
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="flex min-h-full flex-col pt-[calc(40px+env(safe-area-inset-top))]">
          <section className="shrink-0 px-5">
            <h1 className="text-h2 text-gray-900">새로운 위로가 필요하신가요?</h1>
            <p className="mt-1 text-body2 text-gray-500">
              마음 상태에 따라 새로운 책을 추천해드려요.
            </p>
            <button
              type="button"
              onClick={onDiagnose}
              className="mt-5 inline-flex items-center justify-center rounded-[25px] bg-primary-500 px-[18px] py-2.5 text-body2 font-semibold text-white"
            >
              다시 진단하기 &nbsp;➔
            </button>
          </section>

          {/* Figma: 패널 top 317 → bottom 792 (nav 755 아래로 겹침), 리스트 3 + 빈 1칸 */}
          <div className="relative mt-2 flex flex-1 flex-col">
            <img
              src={owlPeek}
              alt=""
              aria-hidden
              className="pointer-events-none absolute right-4 top-[-8px] z-5 h-[184px] w-[186px] object-contain object-bottom"
            />

            <section className="relative z-10 mx-auto mt-[120px] flex w-full max-w-[353px] flex-1 flex-col rounded-t-[24px] bg-white shadow-[0_-2px_20px_rgba(102,106,128,0.08)]">
              <button
                type="button"
                className="flex w-full shrink-0 items-start justify-between border-b border-gray-100 px-5 pt-6 pb-[22px] text-left"
              >
                <span>
                  <span className="block text-h3 text-gray-800">
                    최근 진단 결과
                  </span>
                  <span className="mt-1 block text-[13px] leading-[23px] tracking-[-0.025em] text-gray-400">
                    최근 3건 기록입니다. 전체 기록을 확인해보세요.
                  </span>
                </span>
                <span aria-hidden className="mt-1 text-gray-400">
                  ›
                </span>
              </button>

              <ul className="flex flex-1 flex-col">
                {records.map((record, i) => (
                  <li
                    key={record.id}
                    className={`flex shrink-0 items-center gap-5 px-5 ${
                      i === 0 ? "pb-3 pt-[22px]" : "py-3"
                    }`}
                  >
                    <img
                      src={record.thumbUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium tracking-[-0.025em] text-black">
                        {record.bookTitle}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-[23px] tracking-[-0.025em] text-gray-500">
                        {record.quote}
                      </p>
                    </div>
                  </li>
                ))}
                {/* 4번째 빈칸 — nav에 덮임. 여유 있으면 늘어나고, 부족하면 스크롤 */}
                <li
                  aria-hidden
                  className="min-h-[calc(64px+env(safe-area-inset-bottom))] flex-1"
                />
              </ul>
            </section>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
        <NavigationBar active={activeTab} onChange={onTabChange} />
      </div>
    </main>
  );
}
