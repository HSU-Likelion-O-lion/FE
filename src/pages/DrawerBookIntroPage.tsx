import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import {
  getRecommendBookById,
  recommendBookToLibrary,
  saveDiagnosisRecord,
} from "../data/drawerDiagnosisMock";
import {
  addLibraryBook,
  addMateAndLibrary,
  clearRecommendSession,
  loadRecommendSession,
  markRecommendBookViewed,
  markRecommendMateSet,
  shouldGoDrawerAfterIntros,
} from "../data/bookShelfStore";
import iconBack from "../assets/library/icon-back.svg";

type IntroLocationState = {
  keywords?: string[];
};

function formatTodayLabel() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd} 진단`;
}

function leaveIntro(
  navigate: ReturnType<typeof useNavigate>,
  keywords: string[],
) {
  if (shouldGoDrawerAfterIntros()) {
    const session = loadRecommendSession();
    const dateLabel = formatTodayLabel();
    for (const id of session?.viewedIds ?? []) {
      const viewed = getRecommendBookById(id);
      if (!viewed) continue;
      saveDiagnosisRecord({
        id: `rec-view-${viewed.id}`,
        bookTitle: viewed.title,
        quote: viewed.blurb,
        thumbUrl: viewed.coverUrl,
        dateLabel,
        keywords: session?.keywords ?? keywords,
      });
    }
    clearRecommendSession();
    navigate("/drawer", { replace: true });
    return;
  }
  navigate(-1);
}

/** 책 소개 미리보기 — Figma 479:3243 */
export default function DrawerBookIntroPage() {
  const navigate = useNavigate();
  const { bookId = "" } = useParams();
  const location = useLocation();
  const keywords =
    (location.state as IntroLocationState | null)?.keywords ?? [];
  const book = getRecommendBookById(bookId);
  const [librarySavedOpen, setLibrarySavedOpen] = useState(false);

  useEffect(() => {
    if (bookId) markRecommendBookViewed(bookId);
  }, [bookId]);

  if (!book) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-[#fdfdff] px-5">
        <p className="text-body1 text-gray-600">책 정보를 찾을 수 없어요.</p>
        <button
          type="button"
          className="mt-4 text-button1 text-primary-500"
          onClick={() => navigate("/drawer/recommend", { replace: true })}
        >
          돌아가기
        </button>
      </main>
    );
  }

  const saveHistory = () => {
    saveDiagnosisRecord({
      id: `rec-${book.id}-${Date.now()}`,
      bookTitle: book.title,
      quote: book.blurb,
      thumbUrl: book.coverUrl,
      dateLabel: formatTodayLabel(),
      keywords,
    });
  };

  const handleSaveLibrary = () => {
    addLibraryBook(recommendBookToLibrary(book));
    saveHistory();
    setLibrarySavedOpen(true);
  };

  const handleSetMate = () => {
    addMateAndLibrary(recommendBookToLibrary(book));
    saveHistory();
    markRecommendMateSet();
    navigate("/drawer/mate-set", {
      replace: true,
      state: { bookId: book.id, coverUrl: book.coverUrl, title: book.title },
    });
  };

  return (
    <main className="relative mx-auto flex h-dvh min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      {/* 블러 커버 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px] overflow-hidden"
      >
        <img
          src={book.coverUrl}
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover blur-[7px]"
        />
        <div className="absolute inset-0 bg-[rgba(43,65,106,0.74)]" />
      </div>

      <header className="relative z-20 shrink-0 px-5 pt-5">
        <div className="relative flex h-11 w-full items-center">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => leaveIntro(navigate, keywords)}
            className="flex size-6 items-center justify-center"
          >
            <img
              src={iconBack}
              alt=""
              className="size-6 object-contain brightness-0 invert"
            />
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <section className="relative shrink-0 px-9 pb-[120px] pt-2">
          <h1 className="text-[28px] font-bold leading-[1.5] tracking-[-0.025em] text-[#fdfdff]">
            {book.title}
          </h1>
          <p className="mt-1 text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-200">
            {book.author}
          </p>
          <p className="mt-10 text-body2 text-gray-300">{book.meta}</p>

          <div className="absolute right-5 top-[52px] h-[215px] w-[146px] overflow-hidden rounded-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            <img
              src={book.coverUrl}
              alt=""
              className="size-full object-cover"
            />
          </div>
        </section>

        <section className="relative z-10 -mt-[88px] flex min-h-0 flex-1 flex-col rounded-t-[24px] bg-white px-5 pb-[calc(100px+env(safe-area-inset-bottom))] pt-6">
          <span className="inline-flex w-fit items-center rounded-[15px] bg-primary-10 px-[13px] py-1.5 text-caption text-primary-500">
            다미의 책 소개
          </span>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <p className="whitespace-pre-wrap text-body1 leading-[1.6] text-gray-700">
              {book.intro}
            </p>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] gap-2.5 bg-[#fdfdff] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={handleSaveLibrary}
          className="flex h-[54px] flex-1 items-center justify-center rounded-[15px] bg-primary-500 text-button1 font-semibold text-white"
        >
          서재에 담아두기
        </button>
        <button
          type="button"
          onClick={handleSetMate}
          className="flex h-[54px] flex-1 items-center justify-center rounded-[15px] bg-gray-100 text-button1 font-semibold text-gray-800"
        >
          메이트로 지정하기
        </button>
      </div>

      <Modal
        open={librarySavedOpen}
        variant="alert"
        status="success"
        title="서재에 담아두었어요."
        description="언제든 서재에서 다시 꺼내볼 수 있어요."
        onClose={() => {
          setLibrarySavedOpen(false);
          leaveIntro(navigate, keywords);
        }}
        actions={[
          {
            label: "확인",
            onClick: () => {
              setLibrarySavedOpen(false);
              leaveIntro(navigate, keywords);
            },
          },
        ]}
      />
    </main>
  );
}
