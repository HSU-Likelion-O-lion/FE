import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import ShelterEmptySection from "../components/shelter/ShelterEmptySection";
import iconBack from "../assets/shelter/icon-back.svg";
import iconPin from "../assets/shelter/icon-pin.svg";
import pinBg from "../assets/shelter/pin-bg.svg";
import bgBlobPurple from "../assets/shelter/bg-blob-purple.svg";
import bgBlobYellow from "../assets/shelter/bg-blob-yellow.svg";
import cardCover1 from "../assets/shelter/card-cover-1.png";
import cardCover2 from "../assets/shelter/card-cover-2.jpg";
import cardCover3 from "../assets/shelter/card-cover-3.png";

type ShelterBook = {
  id: string;
  title: string;
  thoughtCount: number;
  coverUrl: string;
};

// 테스트용 빈 화면
// const MOCK_BOOKS: ShelterBook[] = [];

const MOCK_BOOKS: ShelterBook[] = [
  {
    id: "shelter-1",
    title: "조용히 이기는 사람들",
    thoughtCount: 8,
    coverUrl: cardCover1,
  },
  {
    id: "shelter-2",
    title: "불안을 이기는 철학",
    thoughtCount: 12,
    coverUrl: cardCover2,
  },
  {
    id: "shelter-3",
    title: "뵈뵈를 찾아서",
    thoughtCount: 12,
    coverUrl: cardCover3,
  },
];

const STACK_LAYERS = [
  {
    // 맨 뒤
    width: 301,
    top: 0,
    opacity: 0.3,
    radius: 10.26,
    paddingX: 17,
    paddingY: 14,
    titleSize: "text-[15.4px]",
    captionSize: "text-[12px] leading-[19.7px]",
    pinSize: 31,
    pinIcon: 20.5,
    coverTop: "-0.17%",
    coverHeight: "220.65%",
    gradient:
      "linear-gradient(178.5deg, #FDFDFF 35%, rgba(253, 253, 255, 0) 99%)",
    shadow: "shadow-[0_0_7.8px_rgba(37,43,78,0.18)]",
  },
  {
    // 중간
    width: 335,
    top: 27,
    opacity: 0.6,
    radius: 11.4,
    paddingX: 19,
    paddingY: 15,
    titleSize: "text-[17.1px]",
    captionSize: "text-[13.3px] leading-[21.85px]",
    pinSize: 34,
    pinIcon: 22.8,
    coverTop: "-0.17%",
    coverHeight: "220.65%",
    gradient:
      "linear-gradient(178.7deg, #FDFDFF 35%, rgba(253, 253, 255, 0) 99%)",
    shadow: "shadow-[0_0_8.6px_rgba(37,43,78,0.18)]",
  },
  {
    // 맨 앞
    width: 353,
    top: 61,
    opacity: 1,
    radius: 12,
    paddingX: 20,
    paddingY: 16,
    titleSize: "text-h3",
    captionSize: "text-body2 leading-[23px]",
    pinSize: 36,
    pinIcon: 24,
    coverTop: "19.63%",
    coverHeight: "193.5%",
    gradient:
      "linear-gradient(179.6deg, #FDFDFF 23%, rgba(253, 253, 255, 0) 100%)",
    shadow: "drop-shadow-[0_0_4.55px_rgba(37,43,78,0.18)]",
  },
] as const;

type StackLayer = (typeof STACK_LAYERS)[number];

const SWIPE_THRESHOLD = 48;
const STACK_ANIM_MS = 480;

type StackMotion = {
  exitingBook: ShelterBook;
};

type ShelterPageProps = {
  books?: ShelterBook[];
};

type ShelterCardProps = {
  book: ShelterBook;
  layer: StackLayer;
  isFront: boolean;
  pinned?: boolean;
  onTogglePin?: () => void;
  className?: string;
  style?: CSSProperties;
  ariaHidden?: boolean;
  /** false면 opacity를 인라인으로 넣지 않아 CSS 애니메이션이 제어 */
  applyOpacity?: boolean;
};

function ShelterCard({
  book,
  layer,
  isFront,
  pinned = false,
  onTogglePin,
  className = "",
  style,
  ariaHidden,
  applyOpacity = true,
}: ShelterCardProps) {
  return (
    <article
      className={`absolute left-1/2 flex -translate-x-1/2 items-start justify-between ${layer.shadow} ${className}`}
      style={{
        top: layer.top,
        width: layer.width,
        height: 300,
        ...(applyOpacity ? { opacity: layer.opacity } : null),
        borderRadius: layer.radius,
        padding: `${layer.paddingY}px ${layer.paddingX}px`,
        zIndex: isFront ? 3 : layer.opacity === 0.6 ? 2 : 1,
        ...style,
      }}
      aria-hidden={ariaHidden ?? !isFront}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ borderRadius: layer.radius }}
      >
        {isFront && (
          <div className="absolute inset-0 rounded-[inherit] bg-white" />
        )}
        <div className="absolute inset-0 overflow-hidden rounded-[inherit] opacity-70">
          <img
            src={book.coverUrl}
            alt=""
            className="absolute left-[0.2%] w-full max-w-none object-cover object-top"
            style={{
              top: layer.coverTop,
              height: layer.coverHeight,
            }}
          />
        </div>
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{ backgroundImage: layer.gradient }}
        />
      </div>

      <div className="relative z-10 flex min-w-0 flex-col gap-1.5">
        <h2
          className={`font-semibold tracking-[-0.025em] text-gray-900 ${layer.titleSize}`}
        >
          {book.title}
        </h2>
        <p className={`tracking-[-0.025em] text-gray-500 ${layer.captionSize}`}>
          누군가 남긴 {book.thoughtCount}개의 사유 조각
        </p>
      </div>

      {isFront && onTogglePin ? (
        <button
          type="button"
          aria-label={pinned ? "핀 해제" : "책 핀 고정"}
          aria-pressed={pinned}
          onClick={onTogglePin}
          className="relative z-10 mt-[10px] flex size-9 shrink-0 items-center justify-center"
        >
          <img
            src={pinBg}
            alt=""
            className="absolute inset-0 size-full object-contain"
          />
          <span className="relative flex size-6 items-center justify-center overflow-hidden">
            <img
              src={iconPin}
              alt=""
              className={`size-[18.5px] object-contain transition-opacity ${
                pinned ? "opacity-100" : "opacity-70"
              }`}
            />
          </span>
        </button>
      ) : (
        <div
          aria-hidden
          className="relative z-10 mt-[10px] shrink-0"
          style={{
            width: layer.pinSize,
            height: layer.pinSize * 0.94,
          }}
        >
          <img
            src={pinBg}
            alt=""
            className="absolute inset-0 size-full object-contain"
          />
          <span
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden"
            style={{
              width: layer.pinIcon,
              height: layer.pinIcon,
            }}
          >
            <img
              src={iconPin}
              alt=""
              className="size-[70%] object-contain"
            />
          </span>
        </div>
      )}
    </article>
  );
}

export default function ShelterPage({ books = MOCK_BOOKS }: ShelterPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>("shelter");
  const [frontIndex, setFrontIndex] = useState(0);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [motion, setMotion] = useState<StackMotion | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipedRef = useRef(false);
  const stackRef = useRef<HTMLElement>(null);

  const isEmpty = books.length === 0;
  const bookCount = books.length;
  const frontBook = books[frontIndex];
  const isAnimating = motion !== null;

  // Safari 고무줄(overscroll) 방지 — 페이지 스크롤 잠금
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

  // 카드 영역 touchmove는 passive라 React로 preventDefault 불가 → native로 처리
  useEffect(() => {
    if (isEmpty) return;
    const el = stackRef.current;
    if (!el) return;

    const preventScroll = (event: globalThis.TouchEvent) => {
      event.preventDefault();
    };

    el.addEventListener("touchmove", preventScroll, { passive: false });
    return () => el.removeEventListener("touchmove", preventScroll);
  }, [isEmpty]);

  useEffect(() => {
    if (!motion) return;
    const timer = window.setTimeout(() => setMotion(null), STACK_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [motion]);

  const prefersReducedMotion = useCallback(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const goNext = useCallback(() => {
    if (bookCount < 2 || isAnimating) return;
    const nextIndex = (frontIndex + 1) % bookCount;
    if (prefersReducedMotion()) {
      setFrontIndex(nextIndex);
      return;
    }
    setMotion({ exitingBook: books[frontIndex] });
    setFrontIndex(nextIndex);
  }, [bookCount, books, frontIndex, isAnimating, prefersReducedMotion]);

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    swipedRef.current = false;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartY.current == null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    // 위로 스와이프만 허용
    if (delta > -SWIPE_THRESHOLD) return;
    swipedRef.current = true;
    goNext();
  };

  const handleStackClick = (e: MouseEvent) => {
    if (swipedRef.current) {
      swipedRef.current = false;
      return;
    }
    if ((e.target as HTMLElement).closest("button")) return;
    goNext();
  };

  // 뒤에서 앞으로: frontIndex+2 → frontIndex+1 → frontIndex
  // 앞 카드는 위로 페이드아웃만 (뒤로 보내지 않음)
  const stackBooks =
    bookCount === 0
      ? []
      : ([2, 1, 0] as const)
          .map((offset) => {
            const book = books[(frontIndex + offset) % bookCount];
            const layer = STACK_LAYERS[2 - offset];
            return { book, layer, isFront: offset === 0 };
          })
          .filter(({ book }) => {
            if (!motion) return true;
            return book.id !== motion.exitingBook.id;
          });

  const motionOverlay = motion ? (
    <ShelterCard
      key={`exit-${motion.exitingBook.id}`}
      book={motion.exitingBook}
      layer={STACK_LAYERS[2]}
      isFront
      applyOpacity={false}
      className="shelter-card-dissolve-up"
      style={{ zIndex: 5 }}
      ariaHidden
    />
  ) : null;

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden overscroll-none bg-white pb-[97px]">
      {!isEmpty && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src={bgBlobPurple}
            alt=""
            className="absolute left-[calc(50%-107px)] top-[calc(50%-76px)] h-[922px] w-[811px] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
          <img
            src={bgBlobYellow}
            alt=""
            className="absolute left-[calc(50%+246px)] top-[calc(50%+60px)] h-[894px] w-[786px] max-w-none -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      )}

      <header className="relative z-10 flex shrink-0 flex-col px-5 pt-5">
        <div className="relative flex h-11 items-center">
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
        </div>
      </header>

      {isEmpty ? (
        <ShelterEmptySection onGoDrawer={() => navigate("/drawer")} />
      ) : (
        <>
          <section className="relative z-10 mt-6 flex flex-col items-center gap-2 px-[78px] text-center">
            <h1 className="w-full text-h1 text-gray-900">나만의 쉼터</h1>
            <p className="w-full text-[14px] leading-[23px] tracking-[-0.025em] text-gray-700">
              내가 담은 책을 매개로, 타인의 사유를 조용히
              <br />
              감상하는 공간입니다.
            </p>
          </section>

          <section
            ref={stackRef}
            className="relative z-10 mx-auto mt-6 h-[361px] w-full max-w-[353px] touch-none select-none"
            aria-label="쉼터 책 카드"
            aria-roledescription="carousel"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleStackClick}
          >
            {stackBooks.map(({ book, layer, isFront }) => (
              <ShelterCard
                key={book.id}
                book={book}
                layer={layer}
                isFront={isFront}
                pinned={pinnedIds.has(book.id)}
                onTogglePin={
                  isFront ? () => togglePin(book.id) : undefined
                }
                className="shelter-card-layer"
              />
            ))}
            {motionOverlay}
          </section>

          <div className="relative z-10 mt-8 flex justify-center">
            <button
              type="button"
              aria-label={`${frontBook.title} 사유 보러가기`}
              onClick={() =>
                navigate("/shelter/thoughts", {
                  state: {
                    title: frontBook.title,
                    bookId: frontBook.id,
                  },
                })
              }
              className="rounded-[25px] bg-white px-5 py-3 text-button1 text-gray-800 drop-shadow-[0_0_2px_rgba(169,173,190,0.57)]"
            >
              보러가기
            </button>
          </div>
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
        <NavigationBar active={activeTab} onChange={setActiveTab} />
      </div>
    </main>
  );
}
