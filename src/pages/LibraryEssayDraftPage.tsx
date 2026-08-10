import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  MOCK_ESSAY_DRAFT,
  MOCK_LIBRARY_REASONS,
  REASON_GOAL,
} from "../data/libraryMock";
import essayCover from "../assets/library/essay-cover.png";
import essayCoverMark from "../assets/library/essay-cover-mark.svg";
import essayHero from "../assets/library/essay-hero.png";
import iconBack from "../assets/library/icon-back.svg";

/** 에세이 초안 미리보기 · 제목 짓기 (Figma 559:4837) */
export default function LibraryEssayDraftPage() {
  const navigate = useNavigate();
  const draft = MOCK_ESSAY_DRAFT;
  const [title, setTitle] = useState(draft.title);

  if (MOCK_LIBRARY_REASONS.length < REASON_GOAL) {
    return <Navigate to="/library/reasons" replace />;
  }

  const titleLines = title.trim() || draft.title;
  const [line1, line2] = splitTitle(titleLines);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-[calc(110px+env(safe-area-inset-bottom))]">
        {/* Hero */}
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

          <header className="relative z-20 flex h-11 items-center justify-center px-5 pt-[calc(12px+env(safe-area-inset-top))]">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate("/library/reasons/select")}
              className="absolute left-5 top-[calc(12px+env(safe-area-inset-top))] flex size-6 items-center justify-center"
            >
              <img
                src={iconBack}
                alt=""
                className="size-6 object-contain brightness-0 invert"
              />
            </button>
            <h1 className="text-h3 text-[#fdfdff]">에세이 초안 미리보기</h1>
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
              <p className="mt-1 text-[18px] tracking-[-0.025em] text-gray-300">
                {draft.author}
              </p>
            </div>

            <div className="relative -mb-16 mr-[-4px] h-[215px] w-[146px] shrink-0 overflow-hidden rounded-lg shadow-[0_8px_24px_rgba(22,23,31,0.28)]">
              <img
                src={essayCover}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              {/* Figma 588:5180 — 작가명 세로 */}
              <div className="absolute left-4 top-4 leading-[0] tracking-[-0.2px] text-white">
                {draft.author.split("").map((ch, i) => (
                  <p
                    key={`a-${i}`}
                    className="mb-0 text-[8px] font-light leading-[1.32]"
                  >
                    {ch}
                  </p>
                ))}
              </div>
              {/* Figma 588:5175 — 제목 1열 (12px / leading 1.47 ≈ 18px) */}
              <div className="absolute left-[93px] top-4 font-score-dream leading-[0] tracking-[-0.3px] text-white">
                {toVerticalChars(line1 || "무너져도").map((ch, i) => (
                  <p
                    key={`t1-${i}`}
                    className="mb-0 text-[12px] font-light leading-[1.47]"
                  >
                    {ch}
                  </p>
                ))}
              </div>
              {/* Figma 588:5176 — 제목 2열 (공백은 빈 줄로 간격) */}
              <div className="absolute left-[115px] top-[54px] font-score-dream leading-[0] tracking-[-0.3px] text-white">
                {toVerticalChars(line2 || "괜찮은 밤").map((ch, i) => (
                  <p
                    key={`t2-${i}`}
                    className="mb-0 whitespace-pre text-[12px] font-light leading-[1.47]"
                  >
                    {ch}
                  </p>
                ))}
              </div>
              <img
                src={essayCoverMark}
                alt=""
                aria-hidden
                className="absolute bottom-4 left-4 h-2 w-3 object-contain"
              />
            </div>
          </div>
        </section>

        {/* Sheet */}
        <section className="relative z-20 -mt-6 rounded-t-[24px] bg-[#fdfdff] px-5 pt-10">
          <p className="text-caption text-gray-500">제목 수정하기</p>
          <label className="mt-2 flex h-[54px] items-center rounded-2xl border border-gray-100 px-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={draft.title}
              className="w-full bg-transparent text-body1 text-gray-900 outline-none placeholder:text-gray-300"
            />
          </label>

          <ul className="mt-5 rounded-2xl bg-gray-50 px-5 py-5">
            {draft.chapters.map((ch) => (
              <li
                key={ch.chapter}
                className="flex items-baseline gap-3 py-1.5 first:pt-0 last:pb-0"
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

          <p className="mt-6 text-center text-body2 text-gray-400 underline underline-offset-2">
            아래로 스크롤하여 본문 확인
          </p>
        </section>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[131px] bg-gradient-to-t from-[#fdfdff] from-[75%] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-30 px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => navigate("/library/essay/complete")}
          className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-500 text-button1 font-semibold text-white"
        >
          PDF 파일로 다운로드하기
        </button>
      </div>
    </main>
  );
}

function splitTitle(title: string): [string, string?] {
  const trimmed = title.trim();
  if (trimmed.length <= 5) return [trimmed];
  // Prefer natural break for default mock title
  if (trimmed === "무너져도 괜찮은 밤") return ["무너져도", "괜찮은 밤"];
  const mid = Math.ceil(trimmed.length / 2);
  const space = trimmed.lastIndexOf(" ", mid);
  if (space > 0) {
    return [trimmed.slice(0, space), trimmed.slice(space + 1)];
  }
  return [trimmed.slice(0, mid), trimmed.slice(mid)];
}

/** Figma 세로 제목 — 공백은 빈 줄(행간)로 유지 */
function toVerticalChars(text: string): string[] {
  return text.split("").map((ch) => (ch === " " ? "\u00A0" : ch));
}
