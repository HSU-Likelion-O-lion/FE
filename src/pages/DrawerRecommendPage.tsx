import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  filterBooksByKeywords,
  getHeadlineForKeywords,
} from "../data/drawerDiagnosisMock";
import { startRecommendSession, loadRecommendSession } from "../data/bookShelfStore";
import iconInfo from "../assets/drawer/recommend/icon-info.svg";

type LocationState = {
  keywords?: string[];
};

/** 서랍 — 책 추천 3권 (Figma 472:2396) */
export default function DrawerRecommendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const keywords = (location.state as LocationState | null)?.keywords ?? [];

  const books = useMemo(() => filterBooksByKeywords(keywords, 3), [keywords]);
  const headline = useMemo(() => getHeadlineForKeywords(keywords), [keywords]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (books[0]) setSelectedId(books[0].id);
  }, [books]);

  useEffect(() => {
    const ids = books.map((book) => book.id);
    const existing = loadRecommendSession();
    const sameSet =
      existing != null &&
      existing.bookIds.length === ids.length &&
      existing.bookIds.every((id, index) => id === ids[index]);
    if (sameSet) return;
    startRecommendSession(keywords, ids);
  }, [books, keywords]);

  const selected = books.find((b) => b.id === selectedId) ?? books[0];

  const handleReadIntro = () => {
    if (!selected) return;
    navigate(`/drawer/recommend/${selected.id}`, {
      state: { keywords },
    });
  };

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-[#fdfdff]">
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
            <BookCard
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
  );
}

function BookCard({
  book,
  selected,
  onSelect,
}: {
  book: {
    id: string;
    title: string;
    author: string;
    blurb: string;
    meta: string;
    coverUrl: string;
  };
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
          <img src={book.coverUrl} alt="" className="size-full object-cover" />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-h3 text-gray-900">{book.title}</span>
            <span className="text-caption text-gray-300">{book.author}</span>
          </div>
          <p className="mt-1 text-body2 text-gray-500">{book.blurb}</p>
        </div>
        <p className="text-caption text-gray-300">{book.meta}</p>
      </button>
    </li>
  );
}
