import bgGlow from "../../assets/shelter/thoughts/bg-glow.svg";
import bgGrid from "../../assets/shelter/thoughts/bg-grid.png";
import iconBack from "../../assets/shelter/thoughts/icon-back.svg";
import emptyOwlPeek from "../../assets/shelter/thoughts/empty-owl-peek.png";
import emptyPencil1 from "../../assets/shelter/thoughts/empty-pencil-1.svg";
import emptyPencil2 from "../../assets/shelter/thoughts/empty-pencil-2.svg";
import PostIt from "./PostIt";

type ShelterThoughtsEmptyProps = {
  title: string;
  onBack: () => void;
};

/** 사유가 없을 때 — 줌/팬 없는 고정 레이아웃 */
export default function ShelterThoughtsEmpty({
  title,
  onBack,
}: ShelterThoughtsEmptyProps) {
  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto bg-[#f7f8fc]">
      <div className="relative mx-auto min-h-[max(852px,100dvh)] w-full">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${bgGrid})`,
            backgroundSize: "393px 792px",
            backgroundRepeat: "repeat",
          }}
        />

        {/* 연필 데코 */}
        <img
          src={emptyPencil2}
          alt=""
          className="pointer-events-none absolute left-[-103px] top-[236px] h-[89px] w-[230px] object-contain opacity-80"
        />
        <img
          src={emptyPencil1}
          alt=""
          className="pointer-events-none absolute left-[138px] top-[246px] h-[86px] w-[177px] object-contain opacity-80"
        />

        {/* Ellipse 2467 — Figma: 433×644, top -230 */}
        <img
          src={bgGlow}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[-230px] z-20 h-[644px] w-[433px] max-w-none -translate-x-1/2"
        />

        <header className="pointer-events-none absolute inset-x-0 top-0 z-40 px-5 pt-5">
          <div className="relative flex h-11 w-full items-center justify-center">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={onBack}
              className="pointer-events-auto absolute left-0 flex size-6 items-center justify-center"
            >
              <img
                src={iconBack}
                alt=""
                className="h-[13.5px] w-[7.5px] rotate-180 object-contain"
              />
            </button>
            <h1 className="w-full text-center text-h3 text-white">{title}</h1>
          </div>
        </header>

        <div className="pointer-events-none absolute left-[calc(50%-65px)] top-[86px] z-40 -translate-x-1/2 rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-primary-10 px-4 py-[9.6px]">
          <p className="whitespace-nowrap text-center text-[16px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800">
            아직 남겨진 사유가 없어요!
          </p>
        </div>

        <img
          src={emptyOwlPeek}
          alt=""
          className="pointer-events-none absolute left-[calc(50%+18px)] top-[132px] z-40 h-[82px] w-[154px] object-contain object-bottom"
        />

        {/* 중앙 empty 포스트잇 — Figma Group 2117904906 (349.55×336.6) */}
        <div className="absolute left-1/2 top-[346px] z-30 w-[350px] -translate-x-1/2">
          <PostIt
            variant="empty"
            width={350}
            lines={["이 고요한 공간에", "가장 먼저 당신의 마음을 남겨주세요!"]}
            className="relative block w-full"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[86px] bg-[linear-gradient(3deg,#fff_9%,transparent_91%)]"
        />
      </div>
    </main>
  );
}
