import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import WebGnb from "../components/WebGnb";
import { downloadEssayPdf, getEssay, getMe } from "../api";
import pdfCompleteOwl from "../assets/library/pdf-complete-owl.png";

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** PDF 생성 완료 (모바일 552:4437 + 웹 718:7258) */
export default function LibraryPdfCompletePage() {
  const navigate = useNavigate();
  const { essayId: essayIdParam } = useParams();
  const essayId = Number(essayIdParam);
  const [userName, setUserName] = useState("");
  const [essayTitle, setEssayTitle] = useState("essay");
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!essayId || Number.isNaN(essayId)) {
      setInvalid(true);
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [me, essay] = await Promise.all([getMe(), getEssay(essayId)]);
        if (cancelled) return;
        setUserName(me.nickname);
        setEssayTitle(essay.title?.trim() || "essay");
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        alert(
          err instanceof Error
            ? err.message
            : "에세이 정보를 불러오지 못했습니다.",
        );
        setInvalid(true);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [essayId]);

  const openPdf = async () => {
    if (!essayId || downloading) return;
    setDownloading(true);
    try {
      const blob = await downloadEssayPdf(essayId);
      triggerBlobDownload(blob, `${essayTitle}.pdf`);
      navigate("/library", { replace: true });
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "PDF 다운로드에 실패했습니다.",
      );
      setDownloading(false);
    }
  };

  if (ready && (invalid || !essayIdParam || Number.isNaN(essayId))) {
    return <Navigate to="/library" replace />;
  }

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[430px] items-center justify-center bg-[#fdfdff] min-[431px]:max-w-none">
        <p className="text-body2 text-gray-400">불러오는 중...</p>
      </main>
    );
  }

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdfdff] min-[431px]:hidden">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5">
          <h1 className="text-center text-h2 text-gray-900">PDF 생성 완료</h1>
          <p className="mt-2 text-center text-body1 text-gray-400">
            {userName || "회원"}님의 소중한 기록이 담긴 에세이가
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
            disabled={downloading}
            onClick={() => void openPdf()}
            className="flex h-[54px] w-full items-center justify-center rounded-2xl bg-primary-500 text-button1 font-semibold text-white disabled:opacity-60"
          >
            {downloading ? "여는 중..." : "파일 열기"}
          </button>
        </div>
      </main>

      {/* —— Web (Figma 718:7258) —— */}
      <main className="relative hidden h-dvh w-full flex-col overflow-hidden bg-[#fdfdff] min-[431px]:flex">
        <WebGnb active="library" />
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-28">
          <h1 className="text-center text-[30px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
            PDF 생성 완료
          </h1>
          <p className="mt-3 text-center text-[21px] leading-[1.6] tracking-[-0.025em] text-gray-400">
            {userName || "회원"}님의 소중한 기록이 담긴 에세이가
            <br />
            PDF 파일로 저장되었습니다.
          </p>

          <div className="relative mt-10 flex flex-col items-center">
            <img
              src={pdfCompleteOwl}
              alt=""
              className="relative z-10 h-[232px] w-[203px] -rotate-1 object-contain object-bottom"
            />
            <div
              aria-hidden
              className="absolute bottom-2 h-2 w-[281px] rounded-full bg-gray-100"
            />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-6 pb-10">
          <button
            type="button"
            disabled={downloading}
            onClick={() => {
              void openPdf();
            }}
            className="flex h-[65px] w-full max-w-[424px] items-center justify-center rounded-[19px] bg-primary-500 text-[23px] font-semibold tracking-[-0.025em] text-white disabled:opacity-60"
          >
            {downloading ? "여는 중..." : "계속하기"}
          </button>
        </div>
      </main>
    </>
  );
}
