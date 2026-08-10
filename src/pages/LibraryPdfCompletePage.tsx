import { Navigate, useNavigate } from "react-router-dom";
import {
  MOCK_LIBRARY_REASONS,
  MOCK_LIBRARY_STATS,
  REASON_GOAL,
} from "../data/libraryMock";
import pdfCompleteOwl from "../assets/library/pdf-complete-owl.png";

/** PDF 생성 완료 (Figma 552:4437) */
export default function LibraryPdfCompletePage() {
  const navigate = useNavigate();
  const userName = MOCK_LIBRARY_STATS.userName;

  if (MOCK_LIBRARY_REASONS.length < REASON_GOAL) {
    return <Navigate to="/library/reasons" replace />;
  }

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff]">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5">
        <h1 className="text-center text-h2 text-gray-900">PDF 생성 완료</h1>
        <p className="mt-2 text-center text-body1 text-gray-400">
          {userName}님의 소중한 기록이 담긴 에세이가
          <br />
          PDF 파일로 저장되었습니다.
        </p>

        <div className="relative mt-12 flex w-full flex-col items-center">
          <img
            src={pdfCompleteOwl}
            alt=""
            className="relative z-10 h-[175px] w-[154px] -rotate-1 object-contain object-bottom"
          />
          <div
            aria-hidden
            className="absolute bottom-1 h-1.5 w-[calc(100%-180px)] max-w-[213px] rounded-full bg-gray-100"
          />
        </div>
      </div>

      <div className="shrink-0 px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-500 text-button1 font-semibold text-white"
        >
          파일 열기
        </button>
      </div>
    </main>
  );
}
