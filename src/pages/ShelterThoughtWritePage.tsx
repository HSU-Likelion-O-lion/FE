import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Modal from "../components/Modal";
import WebGnb from "../components/WebGnb";
import {
  containsBadWord,
  splitBadWordParts,
} from "../utils/badWords";
import {
  isThoughtWriteRateLimited,
  recordThoughtWrite,
} from "../data/shelterThoughtWriteStore";
import { SHELTER_BOARD_GRID_STYLE } from "../components/shelter/shelterBoardGrid";
import iconBackWeb from "../assets/shelter/thoughts/icon-back-web.svg";
import iconPencil from "../assets/shelter/thoughts/write-icon-pencil.svg";
import detailAvatar from "../assets/shelter/thoughts/detail-avatar.png";
import detailTape from "../assets/shelter/thoughts/detail-like.svg";
import detailTapeCenter from "../assets/shelter/thoughts/detail-tape-center.svg";
import detailPencil1 from "../assets/shelter/thoughts/detail-pencil-1.svg";
import detailPencil2 from "../assets/shelter/thoughts/detail-pencil-2.svg";
import ellipse2468 from "../assets/shelter/thoughts/ellipse-2468.svg";
import ShelterTopGlow from "../components/shelter/ShelterTopGlow";

const MAX_LENGTH = 200;
const PLACEHOLDER = "책을 덮고 난 뒤, 여운을 편안하게 적어주세요!";
const KEYBOARD_THRESHOLD = 100;

const CARD_GRADIENT =
  "linear-gradient(-19deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)";

/** 기본(키보드 없음) / 입력중(키보드) — Figma 320:7996 / 320:6633 */
const LAYOUT = {
  idle: { tapeTop: 195, cardTop: 233 },
  typing: { tapeTop: 76, cardTop: 114 },
} as const;

type WriteLocationState = {
  title?: string;
  bookId?: string;
  body?: string;
};

/** 내 사유 작성 — 모바일 320:7996 / 웹 726:5412·5536·5608 */
export default function ShelterThoughtWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as WriteLocationState | null) ?? null;
  const bookTitle = state?.title ?? "불안을 이기는 철학";
  const bookId = state?.bookId ?? "default";

  const [text, setText] = useState(state?.body ?? "");
  const [highlightBadWords, setHighlightBadWords] = useState(false);
  const [badWordOpen, setBadWordOpen] = useState(false);
  const [rateLimitOpen, setRateLimitOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [visibleHeight, setVisibleHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );
  const mobileTextareaRef = useRef<HTMLTextAreaElement>(null);
  const webTextareaRef = useRef<HTMLTextAreaElement>(null);

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

    // iOS Safari 키보드 흰 여백/스크롤 점프 방지 (모바일)
    const isMobile = window.matchMedia("(max-width: 430px)").matches;
    if (!isMobile) return;

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
      if (window.matchMedia("(min-width: 431px)").matches) {
        setKeyboardOpen(false);
        setVisibleHeight(window.innerHeight);
        return;
      }

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

  const cardMaxHeight = keyboardOpen
    ? Math.max(180, visibleHeight - pos.cardTop - 56)
    : Math.max(220, visibleHeight - pos.cardTop - 148);

  useLayoutEffect(() => {
    const mobileEl = mobileTextareaRef.current;
    if (mobileEl) {
      mobileEl.style.height = "auto";
      const maxH = Math.max(120, cardMaxHeight - 220);
      const scrollH = mobileEl.scrollHeight;
      mobileEl.style.height = `${Math.min(Math.max(scrollH, 120), maxH)}px`;
      mobileEl.style.overflowY = scrollH > maxH ? "auto" : "hidden";
    }

    // 웹: 포스트잇 내부 스크롤 — 높이 자동 확장하지 않음
    const webEl = webTextareaRef.current;
    if (webEl) {
      webEl.style.height = "100%";
      webEl.style.overflowY = "auto";
    }
  }, [text, cardMaxHeight, visibleHeight]);

  const goToMyThought = () => {
    navigate("/shelter/thoughts/mine", {
      replace: true,
      state: {
        title: bookTitle,
        bookId,
        body: text,
        date: today,
        authorName: "지훈",
      },
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (isThoughtWriteRateLimited()) {
      setRateLimitOpen(true);
      return;
    }

    if (containsBadWord(text)) {
      setHighlightBadWords(true);
      setBadWordOpen(true);
      return;
    }

    setHighlightBadWords(false);
    recordThoughtWrite();
    setSavedOpen(true);
  };

  const handleTextChange = (value: string) => {
    setText(value.slice(0, MAX_LENGTH));
    if (highlightBadWords) setHighlightBadWords(false);
  };

  const textAreaClass = (centered: boolean) =>
    `w-full resize-none bg-transparent leading-[1.6] outline-none placeholder:text-gray-400 ${
      centered ? "text-center" : ""
    } ${
      highlightParts != null
        ? "absolute inset-0 overflow-y-auto caret-gray-800 text-transparent"
        : "relative text-gray-800"
    }`;

  return (
    <>
      {/* —— Mobile (Figma 320:7996 / 320:6633) —— */}
      <main className="fixed inset-x-0 top-0 z-50 mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[#f7f8fc] min-[431px]:hidden">
        <div className="relative z-10 mx-auto h-full w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={SHELTER_BOARD_GRID_STYLE}
          />

          <ShelterTopGlow />

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
                  src={iconBackWeb}
                  alt=""
                  className="size-6 object-contain"
                />
              </button>
              <h1 className="w-full text-center text-h3 text-white">
                {bookTitle}
              </h1>
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
              className="flex h-auto w-full flex-col items-center gap-[23px] overflow-hidden px-8 py-[41px]"
              style={{
                maxHeight: cardMaxHeight,
                backgroundImage: CARD_GRADIENT,
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

              <div className="relative min-h-0 w-full flex-1 overflow-y-auto overscroll-contain">
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
                  ref={mobileTextareaRef}
                  value={text}
                  maxLength={MAX_LENGTH}
                  rows={4}
                  placeholder={PLACEHOLDER}
                  onFocus={() => {
                    window.scrollTo(0, 0);
                    requestAnimationFrame(() => window.scrollTo(0, 0));
                    setTimeout(() => window.scrollTo(0, 0), 50);
                    setTimeout(() => window.scrollTo(0, 0), 300);
                  }}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className={`${textAreaClass(true)} text-body1`}
                  aria-label="사유 입력"
                />
              </div>
            </article>

            <p className="relative z-30 mt-2 bg-[#f7f8fc]/90 text-right text-caption text-gray-600">
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
      </main>

      {/* —— Web (Figma 726:5412 / 5536 / 5608) —— */}
      <main className="relative hidden h-dvh w-full overflow-hidden bg-[#f7f8fc] min-[431px]:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={SHELTER_BOARD_GRID_STYLE}
        />

        <img
          src={ellipse2468}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-362px] z-10 h-[944px] max-w-none -translate-x-1/2"
          style={{ width: "calc(100vw + 100px)" }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
          <WebGnb
            active="shelter"
            tone="dark"
            className="pointer-events-auto relative bg-transparent"
          />
          <header className="flex items-center gap-5 px-8 pt-1 min-[1024px]:px-40">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={() => navigate(-1)}
              className="pointer-events-auto flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconBackWeb}
                alt=""
                className="size-[42px] object-contain"
              />
            </button>
            <h1 className="min-w-0 flex-1 truncate text-[32px] font-semibold leading-10 tracking-[-0.025em] text-[#fdfdff] min-[1100px]:text-[40px]">
              {bookTitle}
            </h1>
            <span
              aria-hidden
              className="flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconPencil}
                alt=""
                className="size-[28px] object-contain"
              />
            </span>
          </header>
        </div>

        {/* 테이프 여유 top 219 — 바깥 스크롤 없음, 포스트잇 내부만 스크롤 */}
        <div className="absolute inset-x-0 top-[219px] bottom-[110px] z-30 flex flex-col overflow-hidden">
          <div className="relative mx-auto flex min-h-0 w-full max-w-[660px] flex-1 flex-col px-4 pt-[30px]">
            <img
              src={detailTapeCenter}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-30 h-[58px] w-[98px] -translate-x-1/2 object-contain"
            />

            <article
              className="relative z-20 flex min-h-0 w-full flex-1 flex-col items-center gap-[28px] overflow-hidden px-[38px] py-[39px]"
              style={{ backgroundImage: CARD_GRADIENT }}
            >
              <div className="flex w-full shrink-0 flex-col items-center">
                <img
                  src={detailAvatar}
                  alt=""
                  className="size-[92px] rounded-full object-cover"
                />
                <p className="mt-3 text-center text-[28px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                  지훈
                </p>
                <p className="mt-1 text-center text-[20px] leading-[33px] tracking-[-0.025em] text-gray-400">
                  {today}
                </p>
              </div>

              <div className="relative min-h-0 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain">
                {highlightParts != null && (
                  <p
                    aria-hidden
                    className="pointer-events-none w-full whitespace-pre-wrap text-center text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-800"
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
                  ref={webTextareaRef}
                  value={text}
                  maxLength={MAX_LENGTH}
                  rows={4}
                  placeholder={PLACEHOLDER}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className={`${textAreaClass(true)} min-h-full text-[18px] tracking-[-0.025em]`}
                  aria-label="사유 입력"
                />
              </div>
            </article>

            <p className="shrink-0 py-3 text-right text-[16px] leading-[1.6] tracking-[-0.025em] text-gray-600">
              ({text.length}/{MAX_LENGTH})
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center px-8">
          <Button
            text="계속하기"
            variant="primary"
            size="h-[65px] w-full max-w-[424px] rounded-[16px] px-5 py-3 text-[19.2px]"
            className="shadow-none"
            disabled={!canSubmit}
            onClick={handleSubmit}
          />
        </div>
      </main>

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
        open={rateLimitOpen}
        variant="alert"
        status="warning"
        title="잠시 쉬어가는 시간이에요."
        description="단기간에 너무 많은 사유를 남겼습니다."
        onClose={() => setRateLimitOpen(false)}
        actions={[
          {
            label: "확인",
            onClick: () => setRateLimitOpen(false),
          },
        ]}
      />

      <Modal
        open={savedOpen}
        variant="alert"
        status="success"
        title="사유가 쉼터에 조용히 띄워졌어요."
        description="언젠가 이 문장이 누군가를 미소 짓게 할지도 몰라요."
        onClose={goToMyThought}
        actions={[{ label: "확인", onClick: goToMyThought }]}
      />
    </>
  );
}
