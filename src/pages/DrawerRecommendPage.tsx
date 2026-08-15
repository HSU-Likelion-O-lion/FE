import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WebGnb from "../components/WebGnb";
import { getEmotionDiagnosis, type RecommendedBook } from "../api";
import { loadLastDiagnosisId } from "../api/sessionDraft";
import { getHeadlineForKeywords } from "../data/drawerDiagnosisHelpers";
import { startRecommendSession, loadRecommendSession } from "../data/bookShelfStore";
import iconInfo from "../assets/drawer/recommend/icon-info.svg";

type LocationState = {
  diagnosisId?: number;
  recommendedBooks?: RecommendedBook[];
  keywords?: string[];
};

type BookItem = {
  id: string;
  bookId: number;
  title: string;
  author: string;
  blurb: string;
  meta: string;
  coverUrl: string;
};

function mapRecommendedBook(book: RecommendedBook): BookItem {
  return {
    id: String(book.bookId),
    bookId: book.bookId,
    title: book.title,
    author: "",
    blurb: book.shortDesc ?? "",
    meta: "",
    coverUrl: book.coverImageUrl ?? "",
  };
}

/** 서랍 — 책 추천 3권 (모바일 472:2396 / 웹 739:5125) */
export default function DrawerRecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const [books, setBooks] = useState<BookItem[]>(() =>
    (state?.recommendedBooks ?? []).map(mapRecommendedBook),
  );
  const [diagnosisId, setDiagnosisId] = useState<number | null>(
    () => state?.diagnosisId ?? loadLastDiagnosisId(),
  );
  const [loading, setLoading] = useState(
    () => (state?.recommendedBooks?.length ?? 0) === 0,
  );
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const headline = useMemo(
    () => getHeadlineForKeywords(state?.keywords ?? []),
    [state?.keywords],
  );

  useEffect(() => {
    if (books.length > 0) {
      setLoading(false);
      return;
    }

    const id = diagnosisId ?? loadLastDiagnosisId();
    if (id == null) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    void getEmotionDiagnosis(id)
      .then((result) => {
        if (cancelled) return;
        setDiagnosisId(result.diagnosisId);
        setBooks(result.recommendedBooks.map(mapRecommendedBook));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [books.length, diagnosisId]);

  useEffect(() => {
    if (books.length === 0) return;
    const ids = books.map((book) => book.id);
    const existing = loadRecommendSession();
    const sameSet =
      existing != null &&
      existing.bookIds.length === ids.length &&
      existing.bookIds.every((id, index) => id === ids[index]);
    if (sameSet) return;
    startRecommendSession([], ids);
  }, [books]);

  const selected = books.find((b) => b.id === selectedId) ?? null;

  const goIntro = (bookId: string) => {
    navigate(`/drawer/recommend/${bookId}`, {
      state: { diagnosisId },
    });
  };

  const handleReadIntro = () => {
    if (!selected) return;
    goIntro(selected.id);
  };

  if (loading) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-[#fdfdff] px-5">
        <p className="text-body1 text-gray-600">추천 책을 불러오는 중...</p>
      </main>
    );
  }

  if (error || books.length === 0) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-[#fdfdff] px-5">
        <p className="text-body1 text-gray-600">추천 결과를 불러오지 못했어요.</p>
        <button
          type="button"
          className="mt-4 text-button1 text-primary-500"
          onClick={() => navigate("/drawer/diagnosis", { replace: true })}
        >
          다시 진단하기
        </button>
      </main>
    );
  }

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#fdfdff] min-[431px]:hidden">
        <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-[calc(120px+env(safe-area-inset-bottom))] pt-[calc(40px+env(safe-area-inset-top))]">
          <div className="flex items-center gap-1 py-1">
            <img src={iconInfo} alt="" className="size-5 object-contain" />
            <p className="text-body2 text-primary-500">마음 분석 결과</p>
          </div>

          <h1 className="mt-2 whitespace-pre-line text-h2 text-[#282723]">
            {headline.replace(", ", ",\n")}
          </h1>
          <p className="mt-1.5 text-body1 text-gray-500">
            가장 마음에 드는 책을 골라주세요.
          </p>

          <ul className="mt-14 flex flex-col gap-10">
            {books.map((book) => (
              <MobileBookCard
                key={book.id}
                book={book}
                selected={book.id === selectedId}
                onSelect={() => setSelectedId(book.id)}
              />
            ))}
          </ul>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[129px] bg-linear-to-t from-[#fdfdff] from-75% to-transparent" />
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-2">
          <button
            type="button"
            onClick={handleReadIntro}
            disabled={!selected}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-500 text-button1 font-semibold text-white disabled:opacity-50"
          >
            책 소개 읽기
          </button>
        </div>
      </main>

      {/* —— Web (Figma 739:5125) —— */}
      <main className="relative hidden min-h-dvh w-full flex-col bg-[#f5f6fa] min-[431px]:flex">
        <WebGnb active="drawer" className="relative z-20" />

        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-10 pb-16 pt-10 min-[1024px]:px-[160px] min-[1024px]:pt-[45px]">
          <header className="flex shrink-0 flex-col gap-2">
            <div className="flex items-center gap-[5px] py-[5px]">
              <img
                src={iconInfo}
                alt=""
                className="size-[26px] object-contain"
              />
              <p className="text-[18.5px] leading-[1.6] tracking-[-0.025em] text-primary-500">
                마음 분석 결과
              </p>
            </div>
            <h1 className="text-[32px] font-semibold leading-[1.5] tracking-[-0.025em] text-[#282723] min-[1024px]:text-[40px]">
              {headline}
            </h1>
            <p className="text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-500 min-[1024px]:text-[22px]">
              가장 마음에 드는 책을 골라주세요.
            </p>
          </header>

          <ul className="mt-16 flex flex-1 flex-wrap items-start justify-center gap-x-[40px] gap-y-24 pt-[85px] min-[1100px]:gap-x-[62px] min-[1100px]:pt-[100px]">
            {books.map((book) => (
              <WebBookCard
                key={book.id}
                book={book}
                onSelect={() => goIntro(book.id)}
              />
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}

function MobileBookCard({
  book,
  selected,
  onSelect,
}: {
  book: BookItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`relative flex w-full flex-col gap-3 rounded-2xl bg-white py-[26px] pr-5 pl-[143px] text-left shadow-[0_0_7px_rgba(102,106,128,0.21)] transition ${
          selected ? "ring-2 ring-primary-500" : "ring-0"
        }`}
      >
        <div className="absolute top-[-17px] left-5 h-[159px] w-[107px] overflow-hidden rounded border-2 border-[#e9ecf8]">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-gray-100" />
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-h3 text-gray-900">{book.title}</span>
            {book.author ? (
              <span className="text-caption text-gray-300">{book.author}</span>
            ) : null}
          </div>
          {book.blurb ? (
            <p className="mt-1 text-body2 text-gray-500">{book.blurb}</p>
          ) : null}
        </div>
        {book.meta ? (
          <p className="text-caption text-gray-300">{book.meta}</p>
        ) : null}
      </button>
    </li>
  );
}

function WebBookCard({
  book,
  onSelect,
}: {
  book: BookItem;
  onSelect: () => void;
}) {
  return (
    <li className="w-[min(100%,332px)] shrink-0">
      <button
        type="button"
        onClick={onSelect}
        className="relative flex h-[437px] w-full flex-col items-center justify-between gap-[18px] rounded-[24px] bg-[#fdfdff] px-8 pt-[155px] pb-8 text-center shadow-[0_0_10px_rgba(102,106,128,0.21)] transition hover:ring-2 hover:ring-primary-300"
      >
        <div className="pointer-events-none absolute top-[-85px] left-1/2 z-10 h-[228px] w-[154px] -translate-x-1/2 overflow-hidden rounded-[6px] border-[3px] border-[#e9ecf8]">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-gray-100" />
          )}
        </div>

        <div className="relative z-0 flex flex-col items-center">
          <div className="flex flex-wrap items-baseline justify-center gap-x-2">
            <span className="text-[26px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
              {book.title}
            </span>
            {book.author ? (
              <span className="text-[17px] leading-[26px] tracking-[-0.025em] text-gray-300">
                {book.author}
              </span>
            ) : null}
          </div>
          {book.blurb ? (
            <p className="mt-[18px] max-w-[268px] text-[20px] leading-[1.6] tracking-[-0.025em] text-gray-500">
              {book.blurb}
            </p>
          ) : null}
        </div>

        {book.meta ? (
          <p className="relative z-0 shrink-0 text-[18px] leading-[26px] tracking-[-0.025em] text-gray-300">
            {book.meta}
          </p>
        ) : (
          <span className="relative z-0 shrink-0" />
        )}
      </button>
    </li>
  );
}
