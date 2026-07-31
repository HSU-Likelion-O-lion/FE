import { useNavigate } from "react-router-dom";
import capsuleBg from "../assets/mate/capsule-bg.png";
import capsuleOwl from "../assets/mate/capsule-owl.png";
import iconBack from "../assets/mate/icon-back.svg";

const MOCK_CAPSULE = {
  speech: "천천히 읽기 좋은 하루예요.",
  quote: `"진정한 휴식은 아무것도 하지
않는 것이 아니라, 나에게 온전히
몰입하는 것이다."`,
  source: `이 문장은 『몰입의 기술』에서 발췌되었어요.
오늘의 여운을 이어가고 싶다면,
이 책을 통해 더 많은 이야기를 만나보세요.`,
  body: `오늘은 천천히 읽을수록 더 깊이 몰입할 수 있는
하루예요. 최근의 독서 리듬을 살펴보면,
빠르게 많은 페이지를 읽기보다 한 문장을 충분히
음미할 때 더 오래 집중하는 경향이 나타났어요.
오늘은 속도를 조금 늦추고 여유롭게 읽어보세요.
평소에는 지나쳤던 문장 속에서 새로운 영감과 의미를
발견할 수 있을 거예요.`,
};

export default function CapsulePage() {
  const navigate = useNavigate();

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[393px] flex-col overflow-hidden">
      {/* 배경 */}
      <div aria-hidden className="absolute inset-0">
        <img
          src={capsuleBg}
          alt=""
          className="absolute inset-0 size-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-[linear-gradient(1deg,rgba(245,246,250,0.55)_32%,rgba(245,246,250,0.55)_61%,rgba(47,74,159,0.55)_129%)]" />
        <div className="absolute inset-x-0 top-0 h-[212px] bg-linear-to-b from-[rgba(71,84,163,0.75)] from-[12%] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[550px] bg-[linear-gradient(0deg,#EFF0F9_80%,transparent_100%)]" />
      </div>

      {/* 상단 헤더 */}
      <header className="relative z-10 flex items-center px-5 pt-[84px]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate("/mate", { replace: true })} // history stack에서 제거
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

      {/* 올빼미 + 말풍선 */}
      <section className="relative z-10 mt-8 flex items-start justify-center">
        <div className="mt-2 rounded-tl-[20px] rounded-tr-[20px] rounded-br-[2px] rounded-bl-[20px] bg-[#FBFCFF] px-[13px] py-2.5">
          <p className="whitespace-nowrap text-body2 text-gray-800">
            {MOCK_CAPSULE.speech}
          </p>
        </div>
        <img
          src={capsuleOwl}
          alt=""
          className="h-[179px] w-[159px] object-cover"
        />
      </section>

      {/* 콘텐츠 카드 + CTA */}
      <section className="relative z-10 -mt-10 flex flex-1 flex-col px-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-[24px] bg-[linear-gradient(180deg,#FDFDFF_0%,#EFF0F9_100%)] px-8 pt-7">
          <p className="whitespace-pre-line text-center text-h3 text-primary-500 py-[12.5px] px-[32.5px]">
            {MOCK_CAPSULE.quote}
          </p>
          <p className="mt-5 whitespace-pre-line text-body2 text-gray-500">
            {MOCK_CAPSULE.source}
          </p>
          <p className="mt-5 whitespace-pre-line text-body2 text-gray-500">
            {MOCK_CAPSULE.body}
          </p>
        </div>

        <button
          type="button"
          className="mt-4 flex h-[54px] w-full shrink-0 items-center justify-center rounded-[16px] bg-primary-500 px-5 text-[16px] font-semibold leading-[1.6] tracking-[-0.025em] text-white"
        >
          이 책 펼쳐보기
        </button>
      </section>
    </main>
  );
}
