import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Modal from "../components/Modal";
import {
  containsBadWord,
  splitBadWordParts,
} from "../utils/badWords";
import bgGrid from "../assets/shelter/thoughts/bg-grid.png";
import bgGlow from "../assets/shelter/thoughts/bg-glow.svg";
import iconBack from "../assets/shelter/thoughts/icon-back.svg";
import iconPencil from "../assets/shelter/thoughts/write-icon-pencil.svg";
import detailAvatar from "../assets/shelter/thoughts/detail-avatar.png";
import detailTape from "../assets/shelter/thoughts/detail-like.svg";
import detailPencil1 from "../assets/shelter/thoughts/detail-pencil-1.svg";
import detailPencil2 from "../assets/shelter/thoughts/detail-pencil-2.svg";

const MAX_LENGTH = 200;
const PLACEHOLDER = "책을 덮고 난 뒤, 여운을 편안하게 적어주세요!";
const KEYBOARD_THRESHOLD = 100;

/** 기본(키보드 없음) / 입력중(키보드) — Figma 320:7996 / 320:6633 */
const LAYOUT = {
  idle: { tapeTop: 195, cardTop: 233 },
  typing: { tapeTop: 76, cardTop: 114 },
} as const;

type WriteLocationState = {
  title?: string;
  bookId?: string;
};

/** 내 사유 작성 — Figma 320:7996 / 320:6633 / 320:7866 */
export default function ShelterThoughtWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as WriteLocationState | null) ?? null;
  const bookTitle = state?.title ?? "불안을 이기는 철학";
  const bookId = state?.bookId ?? "default";

  const [text, setText] = useState("");
  const [highlightBadWords, setHighlightBadWords] = useState(false);
  const [badWordOpen, setBadWordOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [visibleHeight, setVisibleHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const today = "2026.06.25";
  const canSubmit = text.trim().length > 0;
  const highlightParts = highlightBadWords ? splitBadWordParts(text) : null;
  const pos = keyboardOpen ? LAYOUT.typing : LAYOUT.idle;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
      htmlBg: html.style.backgroundColor,
      bodyBg: body.style.backgroundColor,
      bodyPosition: body.style.position,
      bodyWidth: body.style.width,
      bodyHeight: body.style.height,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
    };

    // iOS Safari 키보드 흰 여백/스크롤 점프 방지
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    html.style.backgroundColor = "#f7f8fc";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.backgroundColor = "#f7f8fc";
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.height = "100%";
    body.style.top = "0";
    body.style.left = "0";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      html.style.backgroundColor = prev.htmlBg;
      body.style.overflow = prev.bodyOverflow;
      body.style.overscrollBehavior = prev.bodyOverscroll;
      body.style.backgroundColor = prev.bodyBg;
      body.style.position = prev.bodyPosition;
      body.style.width = prev.bodyWidth;
      body.style.height = prev.bodyHeight;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
    };
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;

    const sync = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const height = vv?.height ?? window.innerHeight;
      setVisibleHeight(height);
      setKeyboardOpen(window.innerHeight - height > KEYBOARD_THRESHOLD);
    };

    sync();
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("resize", sync);
    window.addEventListener("focusin", sync);

    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("focusin", sync);
    };
  }, []);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, [text]);

  const goBackToBoard = () => {
    navigate("/shelter/thoughts", {
      replace: true,
      state: { title: bookTitle, bookId },
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (containsBadWord(text)) {
      setHighlightBadWords(true);
      setBadWordOpen(true);
      return;
    }

    setHighlightBadWords(false);
    setSavedOpen(true);
  };

  const cardMaxHeight = keyboardOpen
    ? Math.max(180, visibleHeight - pos.cardTop - 40)
    : Math.max(220, visibleHeight - pos.cardTop - 120);

  return (
    <main className="fixed inset-x-0 top-0 z-50 mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[#f7f8fc]">
      <div className="relative z-10 mx-auto h-full w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${bgGrid})`,
            backgroundSize: "393px 792px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Ellipse 2467 — 상단 글로우는 ellipse만 */}
        <img
          src={bgGlow}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[-230px] z-0 h-[644px] w-[433px] max-w-none -translate-x-1/2"
        />

        {!keyboardOpen && (
          <>
            <img
              src={detailPencil2}
              alt=""
              className="pointer-events-none absolute left-[-156px] top-[103px] z-[1] h-[89px] w-[230px] object-contain opacity-80"
            />
            <img
              src={detailPencil1}
              alt=""
              className="pointer-events-none absolute left-[82px] top-[87px] z-[1] h-[86px] w-[177px] rotate-[4.83deg] object-contain opacity-80"
            />
          </>
        )}

        <header className="absolute inset-x-0 top-0 z-40 px-5 pt-5">
          <div className="relative flex h-11 w-full items-center justify-center">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="absolute left-0 flex size-6 items-center justify-center"
            >
              <img
                src={iconBack}
                alt=""
                className="h-[13.5px] w-[7.5px] rotate-180 object-contain"
              />
            </button>
            <h1 className="w-full text-center text-h3 text-white">{bookTitle}</h1>
            <span
              aria-hidden
              className="absolute right-0 flex size-6 items-center justify-center"
            >
              <img src={iconPencil} alt="" className="size-5 object-contain" />
            </span>
          </div>
        </header>

        <img
          src={detailTape}
          alt=""
          className="pointer-events-none absolute left-1/2 z-30 h-[45px] w-[81px] -translate-x-1/2 object-contain transition-[top] duration-300 ease-out"
          style={{ top: pos.tapeTop }}
        />

        <div
          className="absolute left-1/2 z-20 w-[353px] -translate-x-1/2 transition-[top] duration-300 ease-out"
          style={{ top: pos.cardTop }}
        >
          <article
            className="flex h-auto w-full flex-col items-center gap-[23px] overflow-y-auto overscroll-contain px-8 py-[41px]"
            style={{
              maxHeight: cardMaxHeight,
              backgroundImage:
                "linear-gradient(-43deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)",
            }}
          >
            <div className="relative flex w-full shrink-0 flex-col items-center">
              <img
                src={detailAvatar}
                alt=""
                className="size-[77px] rounded-full object-cover"
              />
              <p className="mt-3 text-center text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                지훈
              </p>
              <p className="mt-1 text-center text-[16.8px] leading-[27.6px] tracking-[-0.025em] text-gray-400">
                {today}
              </p>
            </div>

            <div className="relative w-full">
              {highlightParts != null && (
                <p
                  aria-hidden
                  className="pointer-events-none w-full whitespace-pre-wrap text-center text-body1 leading-[1.6] text-gray-800"
                >
                  {highlightParts.map((part, index) => (
                    <span
                      key={`${part.text}-${index}`}
                      className={part.bad ? "text-[#da4263]" : undefined}
                    >
                      {part.text}
                    </span>
                  ))}
                </p>
              )}
              <textarea
                ref={textareaRef}
                value={text}
                maxLength={MAX_LENGTH}
                rows={4}
                placeholder={PLACEHOLDER}
                onFocus={() => {
                  window.scrollTo(0, 0);
                  // iOS가 input을 화면 중앙으로 스크롤하는 것을 되돌림
                  requestAnimationFrame(() => window.scrollTo(0, 0));
                  setTimeout(() => window.scrollTo(0, 0), 50);
                  setTimeout(() => window.scrollTo(0, 0), 300);
                }}
                onChange={(e) => {
                  setText(e.target.value);
                  if (highlightBadWords) setHighlightBadWords(false);
                }}
                className={`w-full resize-none overflow-hidden bg-transparent text-center text-body1 leading-[1.6] outline-none placeholder:text-gray-400 ${
                  highlightParts != null
                    ? "absolute inset-0 caret-gray-800 text-transparent"
                    : "relative text-gray-800"
                }`}
                aria-label="사유 입력"
              />
            </div>
          </article>

          <p className="mt-2 text-right text-caption text-gray-600">
            ({text.length}/{MAX_LENGTH})
          </p>
        </div>

        {!keyboardOpen && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[86px] bg-[linear-gradient(3deg,#fff_9%,transparent_91%)]"
            />

            <div className="absolute inset-x-0 bottom-[33px] z-40 flex justify-center px-5">
              <Button
                text="띄우기"
                variant="primary"
                size="h-[54px] w-[353px] rounded-[16px] px-5 py-3"
                className="shadow-none"
                disabled={!canSubmit}
                onClick={handleSubmit}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        open={badWordOpen}
        variant="alert"
        status="warning"
        title="부적절한 단어가 사용되었어요."
        description="타인에게 상처가 될 수 있는 말은 삼가해주세요."
        onClose={() => setBadWordOpen(false)}
        actions={[
          {
            label: "확인",
            onClick: () => setBadWordOpen(false),
          },
        ]}
      />

      <Modal
        open={savedOpen}
        variant="alert"
        status="success"
        title="사유가 쉼터에 조용히 띄워졌어요."
        description="언젠가 이 문장이 누군가를 미소 짓게 할지도 몰라요."
        onClose={goBackToBoard}
        actions={[{ label: "확인", onClick: goBackToBoard }]}
      />
    </main>
  );
}
