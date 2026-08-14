import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import WebGnb from "../components/WebGnb";
import {
  MOCK_ESSAY_DRAFT,
  MOCK_LIBRARY_REASONS,
  REASON_GOAL,
} from "../data/libraryMock";
import essayCover from "../assets/library/essay-cover.png";
import essayCoverMark from "../assets/library/essay-cover-mark.svg";
import essayHero from "../assets/library/essay-hero.png";
import iconBack from "../assets/library/icon-back.svg";

/** 에세이 초안 미리보기 (모바일 본문보기 749:7320 / 웹 718:7353) */
export default function LibraryEssayDraftPage() {
  const navigate = useNavigate();
  const draft = MOCK_ESSAY_DRAFT;
  const [title, setTitle] = useState(draft.title);
  const bodyRefWeb = useRef<HTMLDivElement>(null);

  if (MOCK_LIBRARY_REASONS.length < REASON_GOAL) {
    return <Navigate to="/library" replace />;
  }

  const titleLines = title.trim() || draft.title;
  const [line1, line2] = splitTitle(titleLines);

  const scrollToBody = () => {
    bodyRefWeb.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* —— Mobile (Figma 749:7320) —— */}
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:hidden">
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-[calc(110px+env(safe-area-inset-bottom))]">
          <section className="relative h-[340px] overflow-hidden">
            <img
              src={essayHero}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full scale-105 object-cover blur-[7px]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[rgba(36,41,110,0.26)]"
            />

            <header className="relative z-20 px-5 pt-[calc(20px+env(safe-area-inset-top))]">
              <div className="relative flex h-11 w-full items-center justify-center">
                <button
                  type="button"
                  aria-label="뒤로가기"
                  onClick={() => navigate("/library/reasons/select")}
                  className="absolute left-0 flex size-6 items-center justify-center"
                >
                  <img
                    src={iconBack}
                    alt=""
                    className="size-6 object-contain brightness-0 invert"
                  />
                </button>
                <h1 className="text-h3 text-[#fdfdff]">에세이 초안 미리보기</h1>
              </div>
            </header>

            <div className="relative z-10 flex items-start justify-between px-9 pt-6">
              <div className="min-w-0 pt-1">
                <h2 className="text-[28px] font-bold leading-[1.5] tracking-[-0.025em] text-[#fdfdff]">
                  {line1}
                  {line2 ? (
                    <>
                      <br />
                      {line2}
                    </>
                  ) : null}
                </h2>
                <p className="mt-1 text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-300">
                  {draft.author}
                </p>
              </div>

              <EssayCover
                author={draft.author}
                line1={line1}
                line2={line2}
                className="relative -mb-16 mr-[-4px] h-[215px] w-[146px] shrink-0"
              />
            </div>
          </section>

          <section className="relative z-20 -mt-6 rounded-t-[24px] bg-[#fdfdff] px-5 pt-[83px]">
            <ul className="rounded-2xl bg-gray-50 px-[30px] py-[25px]">
              {draft.chapters.map((ch) => (
                <li
                  key={ch.chapter}
                  className="flex items-baseline gap-3 py-[9px] first:pt-0 last:pb-0"
                >
                  <span className="shrink-0 text-h3 text-gray-700">
                    제 {ch.chapter}장
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body2 text-gray-600">
                    {ch.title}
                  </span>
                  <span className="shrink-0 text-body2 text-gray-400">
                    {ch.pages}p
                  </span>
                </li>
              ))}
            </ul>

            {/* 1장만 미리보기 */}
            <div className="mt-6 space-y-0 pb-8">
              <p className="text-[18px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-600">
                {draft.previewHeading}
              </p>
              <div className="mt-4 space-y-4">
                {draft.body.map((para, i) => (
                  <p
                    key={i}
                    className="whitespace-pre-line text-[16px] leading-[1.6] tracking-[-0.025em] text-gray-600"
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[131px] bg-gradient-to-t from-[#fdfdff]/[0.84] from-[75%] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => navigate("/library/essay/complete")}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-500 text-button1 font-semibold text-white"
          >
            PDF 파일에서 전체보기
          </button>
        </div>
      </main>

      {/* —— Web (Figma 718:7353) —— */}
      <main className="relative hidden h-dvh w-full flex-col overflow-hidden bg-[#fdfdff] min-[431px]:flex">
        <WebGnb active="library" />
        <div className="flex min-h-0 flex-1">
          {/* Left hero — 헤더(76px) 제외 뷰포트 높이 고정 */}
          <aside className="relative hidden h-[calc(100dvh-76px)] w-[min(46vw,666px)] shrink-0 overflow-hidden rounded-br-[60px] rounded-tr-[60px] lg:block">
            <img
              src={essayHero}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[rgba(36,41,110,0.26)]"
            />
            <div className="relative z-10 flex h-full flex-col items-center px-8 pt-[min(182px,19vh)]">
              <EssayCover
                author={draft.author}
                line1={line1}
                line2={line2}
                className="h-[387px] w-[263px] shrink-0"
                web
              />
              <h2 className="mt-10 text-center text-[33px] font-bold leading-[1.5] tracking-[-0.025em] text-[#fdfdff]">
                {titleLines}
              </h2>
              <p className="mt-[22px] text-center text-[21px] leading-[1.6] tracking-[-0.025em] text-gray-300">
                {draft.author}
              </p>
            </div>
          </aside>

          {/* Right panel */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-10 pb-[120px] pt-[calc(177px-76px)] lg:px-16">
              <div className="relative mx-auto flex h-[58px] w-full max-w-[465px] items-center justify-center px-[26px]">
                <button
                  type="button"
                  aria-label="뒤로가기"
                  onClick={() => navigate("/library/reasons/select")}
                  className="absolute left-[26px] flex size-8 items-center justify-center"
                >
                  <img
                    src={iconBack}
                    alt=""
                    className="size-8 object-contain brightness-0"
                  />
                </button>
                <h1 className="text-center text-[24px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                  에세이 초안 미리보기
                </h1>
              </div>

              {/* Mobile/tablet: show cover inline when left aside hidden */}
              <div className="mx-auto mt-8 flex w-full max-w-[465px] justify-center lg:hidden">
                <EssayCover
                  author={draft.author}
                  line1={line1}
                  line2={line2}
                  className="h-[280px] w-[190px]"
                  web
                />
              </div>

              <div className="mx-auto mt-[61px] w-full max-w-[465px] lg:mt-[61px]">
                <p className="text-[16px] leading-[24px] tracking-[-0.025em] text-gray-500">
                  제목 수정하기
                </p>
                <label className="mt-[5px] flex h-[71px] items-center rounded-[21px] border border-gray-100 px-[26px]">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={draft.title}
                    className="w-full bg-transparent text-left text-[21px] leading-[1.6] tracking-[-0.025em] text-gray-900 outline-none placeholder:text-gray-300"
                  />
                </label>

                <ul className="mt-[39px] rounded-[21px] bg-gray-50 px-10 py-[33px]">
                  {draft.chapters.map((ch) => (
                    <li
                      key={ch.chapter}
                      className="flex items-baseline gap-[18px] py-[14px] first:pt-0 last:pb-0"
                    >
                      <span className="shrink-0 text-[23px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-700">
                        제 {ch.chapter}장
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-600">
                        {ch.title}
                      </span>
                      <span className="shrink-0 text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-400">
                        {ch.pages}p
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={scrollToBody}
                  className="mt-8 w-full text-center text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-400 underline underline-offset-2"
                >
                  아래로 스크롤하여 본문 확인
                </button>

                <div ref={bodyRefWeb} className="mt-10 space-y-4 pb-8">
                  <p className="text-[18px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-600">
                    {draft.previewHeading}
                  </p>
                  {draft.body.map((para, i) => (
                    <p
                      key={i}
                      className="whitespace-pre-line text-[16px] leading-[1.6] tracking-[-0.025em] text-gray-600"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Figma 718:8165 — 우측 컬럼 하단 465×71 */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#fdfdff] from-[55%] via-[#fdfdff]/90 to-transparent pt-10">
              <div className="pointer-events-auto mx-auto flex w-full max-w-[465px] justify-center px-10 pb-8 lg:px-0">
                <button
                  type="button"
                  onClick={() => navigate("/library/essay/complete")}
                  className="flex h-[71px] w-full items-center justify-center rounded-2xl bg-primary-500 text-[21px] font-semibold leading-[1.6] tracking-[-0.025em] text-white"
                >
                  PDF 파일로 다운로드하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function EssayCover({
  author,
  line1,
  line2,
  className,
  web = false,
}: {
  author: string;
  line1: string;
  line2?: string;
  className?: string;
  web?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[14px] shadow-[0_8px_24px_rgba(22,23,31,0.28)] ${className ?? ""}`}
    >
      <div className="relative size-full">
        <img
          src={essayCover}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className={`absolute leading-[0] tracking-[-0.025em] text-white ${
            web ? "left-[29px] top-[29px]" : "left-4 top-4"
          }`}
        >
          {author.split("").map((ch, i) => (
            <p
              key={`a-${i}`}
              className={`mb-0 font-light ${
                web
                  ? "text-[14.4px] leading-[1.32]"
                  : "text-[8px] leading-[1.32]"
              }`}
            >
              {ch}
            </p>
          ))}
        </div>
        <div
          className={`absolute font-score-dream leading-[0] tracking-[-0.025em] text-white ${
            web ? "left-[calc(50%+36px)] top-[29px]" : "left-[93px] top-4"
          }`}
        >
          {toVerticalChars(line1 || "무너져도").map((ch, i) => (
            <p
              key={`t1-${i}`}
              className={`mb-0 font-light ${
                web
                  ? "text-[21.6px] leading-[1.47]"
                  : "text-[12px] leading-[1.47]"
              }`}
            >
              {ch}
            </p>
          ))}
        </div>
        <div
          className={`absolute font-score-dream leading-[0] tracking-[-0.025em] text-white ${
            web ? "left-[calc(50%+76px)] top-[97px]" : "left-[115px] top-[54px]"
          }`}
        >
          {toVerticalChars(line2 || "괜찮은 밤").map((ch, i) => (
            <p
              key={`t2-${i}`}
              className={`mb-0 whitespace-pre font-light ${
                web
                  ? "text-[21.6px] leading-[1.47]"
                  : "text-[12px] leading-[1.47]"
              }`}
            >
              {ch}
            </p>
          ))}
        </div>
        <img
          src={essayCoverMark}
          alt=""
          aria-hidden
          className={`absolute object-contain ${
            web
              ? "bottom-[29px] left-[29px] h-[14px] w-[22px]"
              : "bottom-4 left-4 h-2 w-3"
          }`}
        />
      </div>
    </div>
  );
}

function splitTitle(title: string): [string, string?] {
  const trimmed = title.trim();
  if (trimmed.length <= 5) return [trimmed];
  if (trimmed === "무너져도 괜찮은 밤") return ["무너져도", "괜찮은 밤"];
  const mid = Math.ceil(trimmed.length / 2);
  const space = trimmed.lastIndexOf(" ", mid);
  if (space > 0) {
    return [trimmed.slice(0, space), trimmed.slice(space + 1)];
  }
  return [trimmed.slice(0, mid), trimmed.slice(mid)];
}

function toVerticalChars(text: string): string[] {
  return text.split("").map((ch) => (ch === " " ? "\u00A0" : ch));
}
