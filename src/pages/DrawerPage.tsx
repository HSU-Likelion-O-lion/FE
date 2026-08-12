import { useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import WebGnb from "../components/WebGnb";
import {
  loadDiagnosisHistory,
  type DiagnosisRecord,
} from "../data/drawerDiagnosisMock";
import bgRoom from "../assets/drawer/bg-room.png";
import webBg from "../assets/common/web-bg.png";
import owlHero from "../assets/drawer/owl-hero.png";
import owlPeek from "../assets/drawer/home/owl-peek.png";
import ellipseGlow from "../assets/drawer/home/ellipse-glow.svg";
import iconBackDark from "../assets/drawer/recommend/icon-back-dark.svg";

/** 서랍 홈 — 시작전(모바일 404:11734 / 웹 738:4566) · 최근 진단결과(모바일 420:13210 / 웹 742:7070) */
export default function DrawerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>("drawer");
  const history = loadDiagnosisHistory();
  const showRecent = history.length > 0;

  if (showRecent) {
    return (
      <DrawerRecentHome
        recentRecords={history.slice(0, 3)}
        allRecords={history}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onDiagnose={() => navigate("/drawer/diagnosis")}
      />
    );
  }

  const startDiagnosis = () => navigate("/drawer/diagnosis");

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#2a3366] min-[431px]:hidden">
        <RoomBackground constrained />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto px-[40px] pb-[calc(112px+env(safe-area-inset-bottom))] pt-[calc(60px+env(safe-area-inset-top))]">
          <section className="flex w-full max-w-[313px] shrink-0 flex-col items-center gap-1.5 text-center">
            <h1 className="w-full text-h2 text-primary-10">
              지금 당신의 마음을 들여다볼까요?
            </h1>
            <p className="w-full text-body2 text-primary-300">
              5장의 카드를 넘기면 딱 맞는 문장을 찾아드려요.
            </p>
          </section>

          <div
            aria-hidden
            className="mt-10 flex h-[254px] w-full max-w-[283px] shrink-0 items-center justify-center"
          >
            <img
              src={owlHero}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>

          <div className="relative mt-[50px] w-full max-w-[313px] shrink-0">
            <StartButton onClick={startDiagnosis} size="mobile" />
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 bg-transparent pb-[env(safe-area-inset-bottom)]">
          <NavigationBar
            active={activeTab}
            tone="dark"
            onChange={setActiveTab}
          />
        </div>
      </main>

      {/* —— Web (Figma 738:4566) —— */}
      <main className="relative hidden h-dvh w-full flex-col overflow-hidden bg-[#2a3366] min-[431px]:flex">
        <RoomBackground />
        <WebGnb active="drawer" tone="dark" className="relative z-20" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-10 pb-16">
          <section className="flex w-full max-w-[520px] flex-col items-center gap-2 text-center">
            <h1 className="w-full text-[30px] font-semibold leading-[1.5] tracking-[-0.025em] text-[#fdfdff]">
              지금 당신의 마음을 들여다볼까요?
            </h1>
            <p className="w-full text-[19px] leading-[1.6] tracking-[-0.025em] text-primary-200">
              5장의 카드를 넘기면 딱 맞는 문장을 찾아드려요.
            </p>
          </section>

          <div
            aria-hidden
            className="mt-12 flex h-[335px] w-full max-w-[373px] items-center justify-center"
          >
            <img
              src={owlHero}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>

          <div className="mt-14 w-full max-w-[413px]">
            <StartButton onClick={startDiagnosis} size="web" />
          </div>
        </div>
      </main>
    </>
  );
}

function RoomBackground({ constrained = false }: { constrained?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none z-0 ${
        constrained ? "fixed inset-0 mx-auto max-w-[430px]" : "absolute inset-0"
      }`}
    >
      <img
        src={constrained ? bgRoom : webBg}
        alt=""
        className="absolute inset-0 size-full object-cover object-[center_30%]"
      />
      <div
        className={`absolute inset-0 ${
          constrained
            ? "bg-[rgba(74,86,157,0.63)]"
            : "bg-[rgba(70,83,162,0.43)]"
        }`}
      />
    </div>
  );
}

function StartButton({
  onClick,
  size,
}: {
  onClick: () => void;
  size: "mobile" | "web";
}) {
  const isWeb = size === "web";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center justify-center text-center font-semibold text-white ${
        isWeb
          ? "h-[71px] rounded-[21px] text-[22px] tracking-[-0.025em]"
          : "h-[54px] rounded-2xl text-button1"
      }`}
      style={{
        backgroundImage:
          "linear-gradient(0.19deg, rgba(211,211,243,0.23) 0.93%, rgba(54,64,137,0.184) 84.5%)",
        boxShadow:
          "0 -3.96px 21.25px rgba(72,82,167,0.53), inset 0 0 5.28px rgba(241,241,241,0.53)",
      }}
    >
      마음 읽기 시작하기
    </button>
  );
}

function DrawerRecentHome({
  recentRecords,
  allRecords,
  activeTab,
  onTabChange,
  onDiagnose,
}: {
  recentRecords: DiagnosisRecord[];
  allRecords: DiagnosisRecord[];
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onDiagnose: () => void;
}) {
  const [showAllRecords, setShowAllRecords] = useState(true);
  const recentListRef = useRef<HTMLUListElement>(null);
  const [visibleRecentCount, setVisibleRecentCount] = useState(
    () => recentRecords.length,
  );

  useLayoutEffect(() => {
    const list = recentListRef.current;
    if (!list) return;

    const FIRST_ROW = 140;
    const ROW = 127;

    const update = () => {
      const available = list.clientHeight;
      const max = Math.min(3, recentRecords.length);
      if (available <= 0 || max === 0) {
        setVisibleRecentCount(0);
        return;
      }
      if (available < FIRST_ROW) {
        setVisibleRecentCount(available >= 72 ? 1 : 0);
        return;
      }
      let count = 1;
      let used = FIRST_ROW;
      while (count < max && used + ROW <= available) {
        used += ROW;
        count += 1;
      }
      setVisibleRecentCount(count);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(list);
    return () => ro.disconnect();
  }, [recentRecords.length]);

  const visibleRecent = recentRecords.slice(0, visibleRecentCount);

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex h-dvh min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:hidden">
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

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto flex min-h-full w-full max-w-[430px] flex-col pt-[calc(40px+env(safe-area-inset-top))]">
            <section className="shrink-0 px-5">
              <h1 className="text-h2 text-gray-900">
                새로운 위로가 필요하신가요?
              </h1>
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

            <div className="relative mt-2 flex flex-1 flex-col">
              <img
                src={owlPeek}
                alt=""
                aria-hidden
                className="pointer-events-none absolute right-4 top-[-8px] z-5 h-[184px] w-[186px] object-contain object-bottom"
              />

              <section className="relative z-10 mx-auto mt-[120px] flex w-full max-w-[353px] flex-1 flex-col rounded-t-[24px] bg-white shadow-[0_-2px_20px_rgba(102,106,128,0.08)]">
                <div className="flex w-full shrink-0 items-start justify-between border-b border-gray-100 px-5 pt-6 pb-[22px] text-left">
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
                </div>

                <ul className="flex flex-1 flex-col">
                  {recentRecords.map((record, i) => (
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

      {/* —— Web (Figma 742:7070) —— */}
      <main
        className="relative hidden h-dvh w-full flex-col overflow-hidden min-[431px]:flex"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(133,150,255,0.2) 0%, rgba(133,150,255,0) 65.576%), linear-gradient(90deg, #fdfdff 0%, #fdfdff 100%)",
        }}
      >
        <WebGnb active="drawer" className="relative z-20 shrink-0" />

        <div
          className={`relative z-10 min-h-0 flex-1 overflow-hidden ${
            showAllRecords
              ? "flex flex-col min-[1000px]:grid min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(380px,1fr)]"
              : ""
          }`}
        >
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pt-10 pb-8 min-[1000px]:px-12 min-[1200px]:px-[106px] min-[1200px]:pt-[53px]">
            <div className="relative flex min-h-0 w-full max-w-[495px] flex-1 flex-col">
              <h1 className="relative z-20 shrink-0 text-[28px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900 min-[1100px]:text-[30px]">
                새로운 위로가 필요하신가요?
              </h1>
              <p className="relative z-20 mt-1.5 shrink-0 text-[17px] leading-[1.6] tracking-[-0.025em] text-gray-500 min-[1100px]:text-[19px]">
                마음 상태에 따라 새로운 책을 추천해드려요.
              </p>

              <img
                src={owlPeek}
                alt=""
                aria-hidden
                className="pointer-events-none absolute top-[113px] left-[min(230px,calc(100%-240px))] z-0 h-[235px] w-[261px] max-w-none object-contain object-bottom"
              />

              <button
                type="button"
                onClick={onDiagnose}
                className="relative z-20 mt-[21px] inline-flex h-[54px] w-[181px] shrink-0 items-center justify-center rounded-[33px] bg-primary-500 text-[19px] font-semibold tracking-[-0.025em] text-[#fdfdff]"
              >
                다시 진단하기 &nbsp;➔
              </button>

              <div className="relative z-10 mt-[132px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-4px_24px_rgba(102,106,128,0.08)]">
                <button
                  type="button"
                  onClick={() => setShowAllRecords(true)}
                  className="relative flex w-full shrink-0 flex-col items-start border-b border-gray-100 px-[26px] pt-8 pb-7 text-left"
                >
                  <span className="text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-[#1f2937] min-[1100px]:text-[24px]">
                    최근 진단 결과
                  </span>
                  <span className="mt-1 pr-10 text-[16px] leading-[30px] tracking-[-0.025em] text-gray-400 min-[1100px]:text-[18px]">
                    최근 {visibleRecent.length}건 기록입니다. 전체 기록을
                    확인해보세요.
                  </span>
                  <img
                    src={iconBackDark}
                    alt=""
                    aria-hidden
                    className="absolute top-1/2 right-[26px] size-8 -translate-y-1/2 rotate-180 object-contain opacity-50"
                  />
                </button>

                <ul
                  ref={recentListRef}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden pb-6"
                >
                  {visibleRecent.map((record, i) => (
                    <li
                      key={record.id}
                      className={`flex shrink-0 items-center gap-[26px] px-[26px] ${
                        i === 0 ? "pt-7 pb-4" : "py-4"
                      }`}
                    >
                      <img
                        src={record.thumbUrl}
                        alt=""
                        className="size-[74px] shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-[18px] font-medium leading-[1.6] tracking-[-0.025em] text-black min-[1100px]:text-[20px]">
                          {record.bookTitle}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[16px] leading-[30px] tracking-[-0.025em] text-gray-500 min-[1100px]:text-[18px]">
                          {record.quote}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {showAllRecords ? (
            <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-t border-gray-100 px-8 pt-8 pb-8 min-[1000px]:border-t-0 min-[1000px]:pt-[53px] min-[1200px]:pr-40 min-[1200px]:pl-0">
              <div className="mx-auto flex h-full w-full max-w-[555px] flex-col">
                <header className="relative flex h-[58px] w-full shrink-0 items-center px-[26px]">
                  <button
                    type="button"
                    aria-label="전체 기록 닫기"
                    onClick={() => setShowAllRecords(false)}
                    className="relative z-10 flex size-8 items-center justify-center"
                  >
                    <img
                      src={iconBackDark}
                      alt=""
                      className="size-8 object-contain"
                    />
                  </button>
                  <h2 className="pointer-events-none absolute inset-x-0 text-center text-[24px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                    모든 진단 기록
                  </h2>
                </header>

                <div className="mt-4 flex min-h-0 w-full flex-1 flex-col px-[28px]">
                  <p className="shrink-0 text-[21px] leading-normal tracking-[-0.025em] text-[#42403a]">
                    전체 진단 기록{" "}
                    <span className="font-bold text-primary-500">
                      {allRecords.length}
                    </span>
                  </p>

                  <ul className="mt-4 flex min-h-0 w-full max-w-[499px] flex-1 flex-col gap-4 overflow-y-auto pb-8">
                    {allRecords.map((record) => (
                      <li key={record.id} className="w-full shrink-0">
                        <article className="flex w-full items-center gap-[26px] rounded-[16px] bg-[#fdfdff] py-4 pr-[21px] pl-[26px] shadow-[0_0_3px_rgba(29,29,32,0.11)]">
                          <img
                            src={record.thumbUrl}
                            alt=""
                            className="size-[74px] shrink-0 rounded-full object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <p className="text-[20px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-900">
                                {record.bookTitle}
                              </p>
                              <span
                                aria-hidden
                                className="size-[5px] shrink-0 rounded-full bg-gray-300"
                              />
                              <p className="text-[16px] leading-[24px] tracking-[-0.025em] text-gray-300">
                                {record.dateLabel}
                              </p>
                            </div>
                            <p className="mt-1 text-[17px] leading-[30px] tracking-[-0.025em] text-gray-500">
                              {record.quote}
                            </p>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
