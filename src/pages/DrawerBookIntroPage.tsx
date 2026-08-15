import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import WebGnb from "../components/WebGnb";
import {
  addToBookshelf,
  ApiError,
  clickPurchase,
  getBook,
  getBookCuration,
  type BookDetail,
} from "../api";
import { loadLastDiagnosisId } from "../api/sessionDraft";
import {
  clearRecommendSession,
  markRecommendBookViewed,
  markRecommendMateSet,
  shouldGoDrawerAfterIntros,
} from "../data/bookShelfStore";
import iconBack from "../assets/library/icon-back.svg";
import iconBackDark from "../assets/drawer/recommend/icon-back-dark.svg";

type IntroLocationState = {
  diagnosisId?: number;
};

type IntroBook = {
  bookId: number;
  title: string;
  author: string;
  meta: string;
  coverUrl: string;
  intro: string;
  blurb: string;
};

function formatMeta(book: BookDetail) {
  const parts = [book.publisher, book.provider].filter(Boolean);
  return parts.join(" ㅣ ");
}

function leaveIntro(navigate: ReturnType<typeof useNavigate>) {
  if (shouldGoDrawerAfterIntros()) {
    clearRecommendSession();
    navigate("/drawer", { replace: true });
    return;
  }
  navigate(-1);
}

/** 책 소개 미리보기 — 모바일 479:3243 / 웹 723:8192 */
export default function DrawerBookIntroPage() {
  const navigate = useNavigate();
  const { bookId: bookIdParam = "" } = useParams();
  const location = useLocation();
  const bookId = Number(bookIdParam);
  const diagnosisId =
    (location.state as IntroLocationState | null)?.diagnosisId ??
    loadLastDiagnosisId();

  const [book, setBook] = useState<IntroBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [librarySavedOpen, setLibrarySavedOpen] = useState(false);

  useEffect(() => {
    if (bookIdParam) markRecommendBookViewed(bookIdParam);
  }, [bookIdParam]);

  useEffect(() => {
    if (!Number.isFinite(bookId) || bookId <= 0) {
      setError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    void (async () => {
      try {
        const detail = await getBook(bookId);
        let curationText = detail.description ?? "";
        if (diagnosisId != null) {
          try {
            const curation = await getBookCuration(bookId, diagnosisId);
            if (curation.curationText) curationText = curation.curationText;
          } catch {
            // curation 실패 시 책 설명으로 폴백
          }
        }
        if (cancelled) return;
        setBook({
          bookId: detail.bookId,
          title: detail.title,
          author: detail.author,
          meta: formatMeta(detail),
          coverUrl: detail.coverImageUrl ?? "",
          intro: curationText,
          blurb: detail.description ?? "",
        });
        setLoading(false);
      } catch {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookId, diagnosisId]);

  const handleSaveLibrary = async () => {
    if (!book || busy) return;
    setBusy(true);
    try {
      try {
        await addToBookshelf(book.bookId);
      } catch (err) {
        // 이미 서재에 있으면 성공으로 처리
        if (!(err instanceof ApiError && err.httpStatus === 409)) {
          throw err;
        }
      }
      try {
        const { redirectUrl } = await clickPurchase(book.bookId);
        if (redirectUrl) {
          window.open(redirectUrl, "_blank", "noopener,noreferrer");
        }
      } catch {
        // 구매 링크는 선택적 — 서재 담기는 유지
      }
      setLibrarySavedOpen(true);
    } catch (err) {
      console.error("[save-library]", err);
      setBusy(false);
      return;
    }
    setBusy(false);
  };

  const handleSetMate = () => {
    if (!book || busy) return;
    markRecommendMateSet();
    navigate("/drawer/mate-set", {
      replace: true,
      state: {
        bookId: book.bookId,
        coverUrl: book.coverUrl,
        title: book.title,
      },
    });
  };

  const handleBack = () => leaveIntro(navigate);

  if (loading) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center bg-[#fdfdff] px-5">
        <p className="text-body1 text-gray-600">책 소개를 불러오는 중...</p>
      </main>
    );
  }

  if (error || !book) {
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

  const libraryModal = (
    <Modal
      open={librarySavedOpen}
      variant="alert"
      status="success"
      title="서재에 담아두었어요."
      description="언제든 서재에서 다시 꺼내볼 수 있어요."
      onClose={() => {
        setLibrarySavedOpen(false);
        leaveIntro(navigate);
      }}
      actions={[
        {
          label: "확인",
          onClick: () => {
            setLibrarySavedOpen(false);
            leaveIntro(navigate);
          },
        },
      ]}
    />
  );

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex h-dvh min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[360px] overflow-hidden"
        >
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt=""
              className="absolute inset-0 size-full scale-110 object-cover blur-[7px]"
            />
          ) : null}
          <div className="absolute inset-0 bg-[rgba(43,65,106,0.74)]" />
        </div>

        <header className="relative z-20 shrink-0 px-5 pt-5">
          <div className="relative flex h-11 w-full items-center">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={handleBack}
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
            {book.meta ? (
              <p className="mt-10 text-body2 text-gray-300">{book.meta}</p>
            ) : (
              <div className="mt-10" />
            )}

            <div className="absolute right-5 top-[52px] h-[215px] w-[146px] overflow-hidden rounded-[6px] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-gray-200" />
              )}
            </div>
          </section>

          <section className="relative z-10 -mt-[88px] flex min-h-0 flex-1 flex-col rounded-t-[24px] bg-white px-5 pb-[calc(100px+env(safe-area-inset-bottom))] pt-6">
            <span className="inline-flex w-fit items-center rounded-[15px] bg-primary-10 px-[13px] py-1.5 text-caption text-primary-500">
              다미의 책 소개
            </span>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <p className="whitespace-pre-wrap text-body1 leading-[1.6] text-gray-700">
                {book.intro || "아직 소개글이 준비되지 않았어요."}
              </p>
            </div>
          </section>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-[430px] gap-2.5 bg-[#fdfdff] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSaveLibrary()}
            className="flex h-[54px] flex-1 items-center justify-center rounded-[15px] bg-primary-500 text-button1 font-semibold text-white disabled:opacity-50"
          >
            서재에 담아두기
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleSetMate}
            className="flex h-[54px] flex-1 items-center justify-center rounded-[15px] bg-gray-100 text-button1 font-semibold text-gray-800 disabled:opacity-50"
          >
            메이트로 지정하기
          </button>
        </div>

        {libraryModal}
      </main>

      {/* —— Web (Figma 723:8192) —— */}
      <main className="relative hidden h-dvh w-full flex-col overflow-hidden bg-[#fdfdff] min-[431px]:flex">
        <WebGnb active="drawer" className="relative z-20 shrink-0" />

        <div className="flex min-h-0 flex-1 items-stretch min-[1100px]:gap-[120px]">
          <aside className="relative h-full w-[min(42%,666px)] min-w-[300px] shrink-0 overflow-hidden rounded-tr-[40px] rounded-br-[40px] min-[1100px]:w-[666px] min-[1100px]:rounded-tr-[60px] min-[1100px]:rounded-br-[60px]">
            <div aria-hidden className="absolute inset-0">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt=""
                  className="absolute inset-0 size-full scale-110 object-cover blur-[18px]"
                />
              ) : null}
              <div className="absolute inset-0 bg-[rgba(36,62,93,0.72)]" />
            </div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-10 pb-16 pt-10">
              <div className="h-[min(40vh,387px)] w-[min(100%,263px)] overflow-hidden rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-gray-200" />
                )}
              </div>
              <h1 className="mt-10 text-center text-[28px] font-bold leading-[1.5] tracking-[-0.025em] text-[#fdfdff] min-[1100px]:text-[33px]">
                {book.title}
              </h1>
              <p className="mt-2 text-center text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-300 min-[1100px]:text-[21px]">
                {book.author}
              </p>
              {book.meta ? (
                <p className="mt-1 text-center text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-300 min-[1100px]:text-[21px]">
                  {book.meta}
                </p>
              ) : null}
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-1 flex-col py-10 pr-8 pl-6 min-[1024px]:py-[78px] min-[1024px]:pr-40 min-[1024px]:pl-0">
            <div className="flex h-full w-full max-w-[494px] flex-col">
              <header className="relative flex h-[58px] shrink-0 items-center px-8">
                <button
                  type="button"
                  aria-label="뒤로가기"
                  onClick={handleBack}
                  className="relative z-10 flex size-8 items-center justify-center"
                >
                  <img
                    src={iconBackDark}
                    alt=""
                    className="size-8 object-contain"
                  />
                </button>
                <h2 className="pointer-events-none absolute inset-x-0 text-center text-[24px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                  다미의 책 소개
                </h2>
              </header>

              <div className="mt-[59px] min-h-0 flex-1 overflow-y-auto px-8">
                <p className="whitespace-pre-wrap text-[20px] leading-[1.6] tracking-[-0.025em] text-gray-700">
                  {book.intro || "아직 소개글이 준비되지 않았어요."}
                </p>
              </div>

              <div className="mt-auto flex w-full shrink-0 gap-[31px] pt-10">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleSaveLibrary()}
                  className="flex h-[71px] min-w-0 flex-1 items-center justify-center rounded-[16px] bg-primary-500 px-4 text-[21px] font-semibold leading-[1.6] tracking-[-0.025em] text-[#fdfdff] disabled:opacity-50"
                >
                  서재에 담아두기
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSetMate}
                  className="flex h-[71px] min-w-0 flex-1 items-center justify-center rounded-[16px] bg-gray-100 px-4 text-[21px] font-semibold leading-[1.6] tracking-[-0.025em] text-gray-600 disabled:opacity-50"
                >
                  메이트로 지정하기
                </button>
              </div>
            </div>
          </section>
        </div>

        {libraryModal}
      </main>
    </>
  );
}
