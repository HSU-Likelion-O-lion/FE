import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import WebGnb from "../components/WebGnb";
import {
  ApiError,
  getTodayCapsule,
  openTodayCapsule,
} from "../api";
import webBg from "../assets/mate/capsule-bg-web.png";
import capsuleBg from "../assets/mate/capsule-bg.png";
import capsuleEllipse from "../assets/mate/capsule-ellipse.svg";
import capsuleOwl from "../assets/mate/capsule-owl.png";
import iconBack from "../assets/mate/icon-back.svg";

type CapsuleContent = {
  quoteText: string;
  bookTitle: string;
};

/** 영감캡슐 — 모바일 + 웹(Figma 695:9643) */
export default function CapsulePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [capsule, setCapsule] = useState<CapsuleContent | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const today = await getTodayCapsule();
        if (cancelled) return;

        if (today.opened && today.quoteText) {
          setCapsule({
            quoteText: today.quoteText,
            bookTitle: today.bookTitle ?? "",
          });
          return;
        }

        const opened = await openTodayCapsule();
        if (cancelled) return;
        setCapsule({
          quoteText: opened.quoteText,
          bookTitle: opened.bookTitle,
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "영감 캡슐을 불러오지 못했어요.";
        alert(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const speech = "천천히 읽기 좋은 하루예요.";
  const quote = capsule?.quoteText
    ? `"${capsule.quoteText.replace(/^["“]|["”]$/g, "")}"`
    : "";
  const source = capsule?.bookTitle
    ? `이 문장은 『${capsule.bookTitle}』에서 발췌되었어요. 오늘의 여운을 이어가고 싶다면, 이 책을 통해 더 많은 이야기를 만나보세요.`
    : "";

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden min-[431px]:max-w-none">
      {/* 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 min-[431px]:fixed"
      >
        {/* 모바일 */}
        <img
          src={capsuleBg}
          alt=""
          className="absolute inset-0 size-full object-cover object-top min-[431px]:hidden"
        />
        <div className="absolute inset-0 bg-[linear-gradient(1deg,rgba(245,246,250,0.55)_32%,rgba(245,246,250,0.55)_61%,rgba(47,74,159,0.55)_129%)] min-[431px]:hidden" />
        <div className="absolute inset-x-0 top-0 h-[212px] bg-linear-to-b from-[rgba(71,84,163,0.75)] from-[12%] to-transparent min-[431px]:hidden" />
        <div className="absolute inset-x-0 bottom-0 h-[550px] bg-[linear-gradient(0deg,#EFF0F9_80%,transparent_100%)] min-[431px]:hidden" />

        {/* 웹 */}
        <img
          src={webBg}
          alt=""
          className="absolute inset-0 hidden size-full object-cover min-[431px]:block"
        />
      </div>

      {/* —— 웹 GNB (고정) —— */}
      <div className="relative z-20 shrink-0">
        <WebGnb active="center" tone="dark" />
      </div>

      {/* —— 모바일 헤더 —— */}
      <header className="relative z-10 flex items-center px-5 pt-[24px] min-[431px]:hidden">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate("/mate", { replace: true })}
          className="absolute left-5 flex size-6 items-center justify-center"
        >
          <img
            src={iconBack}
            alt=""
            className="size-[13px] rotate-180 object-contain"
          />
        </button>
        <h1 className="w-full text-center text-h3 text-white">
          오늘 당신을 위한 한 줄
        </h1>
      </header>

      {/* —— 모바일: 올빼미 + 말풍선 —— */}
      <section className="relative z-10 mt-8 flex items-start justify-center min-[431px]:hidden">
        <div className="mt-2 rounded-tl-[20px] rounded-tr-[20px] rounded-br-[2px] rounded-bl-[20px] bg-[#FBFCFF] px-[13px] py-2.5">
          <p className="whitespace-nowrap text-body2 text-gray-800">{speech}</p>
        </div>
        <img
          src={capsuleOwl}
          alt=""
          className="h-[179px] w-[159px] object-cover"
        />
      </section>

      {/* —— 모바일: 콘텐츠 카드 + CTA —— */}
      <section className="relative z-10 -mt-10 flex flex-1 flex-col px-5 pb-[calc(20px+env(safe-area-inset-bottom))] min-[431px]:hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-[24px] bg-[linear-gradient(180deg,#FDFDFF_0%,#EFF0F9_100%)] px-8 pt-7">
          {loading ? (
            <p className="py-10 text-center text-body2 text-gray-400">
              불러오는 중…
            </p>
          ) : (
            <>
              <p className="whitespace-pre-line px-[32.5px] py-[12.5px] text-center text-h3 text-primary-500">
                {quote || "오늘의 문장을 준비하지 못했어요."}
              </p>
              {source ? (
                <p className="mt-5 whitespace-pre-line text-body2 text-gray-500">
                  {source}
                </p>
              ) : null}
            </>
          )}
        </div>

        <Button
          text="이 책 펼쳐보기"
          variant="primary"
          size="mt-4 h-[54px] w-full shrink-0 px-5"
          disabled={!capsule?.bookTitle}
          onClick={() => navigate("/drawer")}
        />
      </section>

      {/* —— 웹: GNB 아래 영역, 흰 카드 내부만 스크롤 (Figma 695:9643) —— */}
      <div className="relative z-10 mx-auto hidden min-h-0 w-full max-w-[1120px] flex-1 flex-col px-5 min-[431px]:flex min-[1024px]:px-10">
        {/* 상단 배경이 살짝 보이도록 */}
        <div aria-hidden className="min-h-29 shrink-0" />
        {/* 바깥: 라운드 클립 / 안쪽: 스크롤바는 라운드 아래부터 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px] bg-[linear-gradient(180deg,#FDFDFF_0%,#EFF0F9_100%)]">
          <div aria-hidden className="h-6 shrink-0" />
          <section className="min-h-0 flex-1 overflow-y-auto px-[52px] pb-5 pt-[52px]">
            <h1 className="text-center text-[32px] leading-10 tracking-[-0.025em]">
              <span className="font-bold text-primary-900">
                오늘 당신을 위한 한줄,{" "}
              </span>
              <span className="font-semibold text-gray-400">{speech}</span>
            </h1>

            {/* Figma 695:9678 — 올빼미 + 가로로 긴 타원 그라데이션 */}
            <div className="relative mx-auto mt-10 h-[308px] w-full max-w-[807px]">
              <img
                src={capsuleEllipse}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-[161px] h-[147px] w-full"
              />
              <img
                src={capsuleOwl}
                alt=""
                className="absolute left-1/2 top-0 z-10 h-[197px] w-[184px] -translate-x-1/2 object-contain object-bottom"
              />
            </div>

            {loading ? (
              <p className="mt-6 text-center text-body2 text-gray-400">
                불러오는 중…
              </p>
            ) : (
              <>
                <p className="mt-6 text-left text-[28px] font-semibold leading-[1.5] tracking-[-0.025em] text-primary-500">
                  {quote || "오늘의 문장을 준비하지 못했어요."}
                </p>
                {source ? (
                  <p className="mt-8 text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-600">
                    {source}
                  </p>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
