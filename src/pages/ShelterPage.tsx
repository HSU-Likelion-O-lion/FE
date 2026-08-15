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
import {
  getBookshelf,
  getCommunityRooms,
  getRoomPostPreviews,
} from "../api";
import Modal from "../components/Modal";
import NavigationBar, { type NavTab } from "../components/NavigationBar";
import WebGnb from "../components/WebGnb";
import ShelterEmptySection from "../components/shelter/ShelterEmptySection";
import { checkCanEnterCommunity } from "../data/dailyReadingStore";
import iconBackWeb from "../assets/shelter/thoughts/icon-back-web.svg";
import iconBackDark from "../assets/drawer/recommend/icon-back-dark.svg";
import iconPin from "../assets/shelter/icon-pin.svg";
import pinBg from "../assets/shelter/pin-bg.svg";
import bgBlobPurple from "../assets/shelter/bg-blob-purple.svg";
import bgBlobYellow from "../assets/shelter/bg-blob-yellow.svg";
import fallbackCover from "../assets/mate/book-cover.png";

type ShelterBook = {
  id: string;
  roomId: number;
  bookId: number;
  title: string;
  thoughtCount: number;
  coverUrl: string;
};

async function loadShelterBooks(): Promise<ShelterBook[]> {
  const [{ rooms }, bookshelf] = await Promise.all([
    getCommunityRooms(),
    getBookshelf().catch(() => ({ books: [] as Awaited<
      ReturnType<typeof getBookshelf>
    >["books"] })),
  ]);

  const coverByBookId = new Map(
    bookshelf.books.map((item) => [
      item.book.bookId,
      item.book.coverImageUrl ?? "",
    ]),
  );

  const books = await Promise.all(
    rooms.map(async (room) => {
      let thoughtCount = 0;
      try {
        const { previews } = await getRoomPostPreviews(room.roomId);
        thoughtCount = previews.length;
      } catch {
        thoughtCount = 0;
      }
      return {
        id: String(room.roomId),
        roomId: room.roomId,
        bookId: room.bookId,
        title: room.bookTitle,
        thoughtCount,
        coverUrl: coverByBookId.get(room.bookId) || fallbackCover,
      } satisfies ShelterBook;
    }),
  );

  return books;
}

const STACK_LAYERS = [
  {
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

function WebShelterCard({
  book,
  pinned,
  onTogglePin,
  onOpen,
}: {
  book: ShelterBook;
  pinned: boolean;
  onTogglePin: () => void;
  onOpen: () => void;
}) {
  return (
    <article
      data-shelter-card
      className="relative flex h-[336px] w-[min(100%,395px)] shrink-0 cursor-pointer items-start justify-between rounded-[13px] px-[22px] py-[18px] shadow-[0_0_5px_rgba(37,43,78,0.18)]"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${book.title} 사유 보러가기`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[13px]"
      >
        <div className="absolute inset-0 rounded-[13px] bg-[#fdfdff]" />
        <div className="absolute inset-0 overflow-hidden rounded-[13px] opacity-70">
          <img
            src={book.coverUrl}
            alt=""
            className="absolute top-[19.63%] left-[0.22%] h-[193.5%] w-full max-w-none object-cover object-top"
          />
        </div>
        <div
          className="absolute inset-0 rounded-[13px]"
          style={{
            backgroundImage:
              "linear-gradient(179.59deg, #fdfdff 22.9%, rgba(253,253,255,0) 99.6%)",
          }}
        />
      </div>

      <div className="relative z-10 min-w-0">
        <h2 className="text-[20px] font-semibold leading-[1.5] tracking-[-0.025em] text-black">
          {book.title}
        </h2>
        <p className="mt-2 text-[16px] leading-[1.6] tracking-[-0.025em] text-gray-500">
          누군가 남긴 {book.thoughtCount}개의 사유 조각
        </p>
      </div>

      <button
        type="button"
        aria-label={pinned ? "핀 해제" : "책 핀 고정"}
        aria-pressed={pinned}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin();
        }}
        className="relative z-10 mt-2 flex size-10 shrink-0 items-center justify-center"
      >
        <img
          src={pinBg}
          alt=""
          className="absolute inset-0 size-full object-contain"
        />
        <img
          src={iconPin}
          alt=""
          className={`relative size-[22px] object-contain ${
            pinned ? "opacity-100" : "opacity-70"
          }`}
        />
      </button>
    </article>
  );
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "이전 책" : "다음 책"}
      onClick={onClick}
      className="flex size-[50px] items-center justify-center rounded-full bg-white/90 shadow-[0_0_8px_rgba(37,43,78,0.12)] backdrop-blur-[2px]"
    >
      <img
        src={iconBackDark}
        alt=""
        className={`size-8 object-contain ${isPrev ? "" : "rotate-180"}`}
      />
    </button>
  );
}

/** 쉼터 — 모바일 235:6613 / 웹 695:8486 · 빈상태 695:10532 */
export default function ShelterPage({ books: booksProp }: ShelterPageProps) {
  const navigate = useNavigate();
  const [books, setBooks] = useState<ShelterBook[]>(booksProp ?? []);
  const [booksReady, setBooksReady] = useState(Boolean(booksProp));
  const [activeTab, setActiveTab] = useState<NavTab>("shelter");
  const [frontIndex, setFrontIndex] = useState(0);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [motion, setMotion] = useState<StackMotion | null>(null);
  const [canUseShelter, setCanUseShelter] = useState<boolean | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipedRef = useRef(false);
  const stackRef = useRef<HTMLElement>(null);
  const webScrollerRef = useRef<HTMLDivElement>(null);

  const goMate = () => navigate("/mate");
  const isLoadingBooks = !booksReady;
  const isEmpty = booksReady && books.length === 0;
  const bookCount = books.length;
  const frontBook = books[frontIndex];
  const isAnimating = motion !== null;

  useEffect(() => {
    let cancelled = false;
    checkCanEnterCommunity().then((ok) => {
      if (!cancelled) setCanUseShelter(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (booksProp) {
      setBooks(booksProp);
      setBooksReady(true);
      return;
    }

    // 입장 가능 여부 확인 전엔 대기
    if (canUseShelter === null) return;

    // 오늘 독서 미완료면 rooms 호출하지 않음 (BE 500 방지)
    if (!canUseShelter) {
      setBooks([]);
      setBooksReady(true);
      return;
    }

    let cancelled = false;
    setBooksReady(false);
    loadShelterBooks()
      .then((next) => {
        if (!cancelled) {
          setBooks(next);
          setBooksReady(true);
        }
      })
      .catch((err) => {
        console.error("[shelter/rooms]", err);
        if (!cancelled) {
          setBooks([]);
          setBooksReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [booksProp, canUseShelter]);

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

  const openThoughts = (book: ShelterBook) => {
    if (!canUseShelter) return;
    navigate(`/shelter/thoughts?roomId=${book.roomId}`, {
      state: {
        title: book.title,
        bookId: book.bookId,
        roomId: book.roomId,
      },
    });
  };

  const scrollWebCarousel = (dir: -1 | 1) => {
    const el = webScrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-shelter-card]");
    const amount = (card?.offsetWidth ?? 395) + 32;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    swipedRef.current = false;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartY.current == null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
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
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden overscroll-none bg-white pb-[97px] min-[431px]:hidden">
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
                src={iconBackWeb}
                alt=""
                className="size-6 object-contain brightness-0"
              />
            </button>
          </div>
        </header>

        {isLoadingBooks ? (
          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
            <p className="text-body1 text-gray-500">쉼터를 불러오는 중…</p>
          </div>
        ) : isEmpty ? (
          <ShelterEmptySection onGoDrawer={() => navigate("/drawer")} />
        ) : (
          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
            <div className="my-auto flex w-full flex-col items-center py-6">
              <section className="flex w-full flex-col items-center gap-2 px-[78px] text-center">
                <h1 className="w-full text-display text-gray-900">나만의 쉼터</h1>
                <p className="w-full text-body1 text-gray-700">
                  내가 담은 책을 매개로, 타인의 사유를 조용히
                  <br />
                  감상하는 공간입니다.
                </p>
              </section>

              <section
                ref={stackRef}
                className="relative mx-auto mt-6 h-[361px] w-full max-w-[353px] shrink-0 touch-none select-none"
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

              <div className="mt-8 flex shrink-0 justify-center">
                <button
                  type="button"
                  aria-label={`${frontBook?.title ?? "책"} 사유 보러가기`}
                  onClick={() => frontBook && openThoughts(frontBook)}
                  className="rounded-[25px] bg-white px-5 py-3 text-button1 text-gray-800 drop-shadow-[0_0_2px_rgba(169,173,190,0.57)]"
                >
                  보러가기
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
          <NavigationBar active={activeTab} onChange={setActiveTab} />
        </div>
      </main>

      {/* —— Web (Figma 695:8486 / 695:10532) —— */}
      <main className="relative hidden h-dvh w-full flex-col overflow-hidden bg-[#fdfdff] min-[431px]:flex">
        {!isEmpty && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <img
              src={bgBlobPurple}
              alt=""
              className="absolute left-[calc(50%-180px)] top-[calc(50%-40px)] h-[1100px] w-[980px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-90"
            />
            <img
              src={bgBlobYellow}
              alt=""
              className="absolute left-[calc(50%+320px)] top-[calc(50%+80px)] h-[1000px] w-[900px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-90"
            />
          </div>
        )}

        <WebGnb active="shelter" className="relative z-20 shrink-0" />

        {isLoadingBooks ? (
          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
            <p className="text-[18px] text-gray-500">쉼터를 불러오는 중…</p>
          </div>
        ) : isEmpty ? (
          <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center bg-[#fdfdff] px-8">
            <ShelterEmptySection
              variant="web"
              onGoDrawer={() => navigate("/drawer")}
            />
          </div>
        ) : (
          <div className="relative z-10 flex min-h-0 flex-1 flex-col">
            <section className="mx-auto mt-[min(8vh,72px)] flex w-full max-w-[565px] shrink-0 flex-col items-center gap-2 px-8 text-center">
              <h1 className="text-[36px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900 min-[1100px]:text-[40px]">
                나만의 쉼터
              </h1>
              <p className="text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-700 min-[1100px]:text-[22px]">
                내가 담은 책을 매개로, 타인의 사유를 조용히 감상하는 공간입니다.
              </p>
            </section>

            <section className="relative mt-10 flex min-h-0 flex-1 items-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[120px] bg-linear-to-r from-[#fdfdff] to-transparent min-[1100px]:w-[180px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[120px] bg-linear-to-l from-[#fdfdff] to-transparent min-[1100px]:w-[180px]"
              />

              <div className="absolute top-1/2 left-6 z-30 -translate-y-1/2 min-[1100px]:left-[100px]">
                <CarouselArrow
                  direction="prev"
                  onClick={() => scrollWebCarousel(-1)}
                />
              </div>
              <div className="absolute top-1/2 right-6 z-30 -translate-y-1/2 min-[1100px]:right-[100px]">
                <CarouselArrow
                  direction="next"
                  onClick={() => scrollWebCarousel(1)}
                />
              </div>

              <div
                ref={webScrollerRef}
                className="flex w-full gap-8 overflow-x-auto scroll-smooth px-[12vw] pb-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="쉼터 책 카드"
              >
                {books.map((book) => (
                  <WebShelterCard
                    key={book.id}
                    book={book}
                    pinned={pinnedIds.has(book.id)}
                    onTogglePin={() => togglePin(book.id)}
                    onOpen={() => openThoughts(book)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <Modal
        open={canUseShelter === false}
        variant="alert"
        status="warning"
        title="잠깐, 메이트는 하고오셨나요?"
        description="하루 독서를 완료한 분만 쉼터를 이용할 수 있습니다."
        onClose={goMate}
        closeOnBackdrop={false}
        actions={[
          {
            label: "메이트로 돌아가기",
            variant: "primary",
            onClick: goMate,
          },
        ]}
      />
    </>
  );
}
