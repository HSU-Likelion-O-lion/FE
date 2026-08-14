import WebGnb from "../WebGnb";
import PostIt from "./PostIt";
import ShelterTopGlow from "./ShelterTopGlow";
import { SHELTER_BOARD_GRID_STYLE } from "./shelterBoardGrid";
import iconBack from "../../assets/shelter/thoughts/icon-back.svg";
import emptyOwlPeek from "../../assets/shelter/thoughts/empty-owl-peek.png";
import emptyPencil1 from "../../assets/shelter/thoughts/empty-pencil-1.svg";
import emptyPencil2 from "../../assets/shelter/thoughts/empty-pencil-2.svg";
import emptyStar from "../../assets/shelter/thoughts/empty-star.svg";
import emptySparkle from "../../assets/shelter/thoughts/empty-sparkle.svg";
import ellipse2468 from "../../assets/shelter/thoughts/ellipse-2468.svg";

type ShelterThoughtsEmptyProps = {
  title: string;
  onBack: () => void;
  onWrite?: () => void;
};

/** 사유 없을 때 — 모바일 + 웹(Figma 726:4718) */
export default function ShelterThoughtsEmpty({
  title,
  onBack,
  onWrite,
}: ShelterThoughtsEmptyProps) {
  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto bg-[#f7f8fc] min-[431px]:hidden">
        <div className="relative mx-auto min-h-[max(852px,100dvh)] w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={SHELTER_BOARD_GRID_STYLE}
          />

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

          <ShelterTopGlow className="z-20" />

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

      {/* —— Web (Figma 726:4718) —— */}
      <main className="relative hidden h-dvh w-full overflow-hidden bg-[#f7f8fc] min-[431px]:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={SHELTER_BOARD_GRID_STYLE}
        />

        {/* Ellipse 2468 — 상단 보라 헤일로 */}
        <img
          src={ellipse2468}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-362px] z-10 h-[944px] max-w-none -translate-x-1/2"
          style={{ width: "calc(100vw + 100px)" }}
        />

        {/* Ellipse 2467 — 부엉이 뒤 소프트 글로우 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[262px] z-10 h-[420px] w-[640px] -translate-x-1/2 -rotate-[12deg]"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(190,196,231,0.55) 0%, rgba(125,137,208,0.22) 40%, rgba(93,107,196,0.06) 65%, transparent 78%)",
            filter: "blur(8px)",
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
          <WebGnb
            active="shelter"
            tone="dark"
            className="pointer-events-auto relative bg-transparent"
          />
          <header className="flex items-center gap-5 px-8 pt-1 min-[1024px]:px-40">
            <button
              type="button"
              aria-label="뒤로가기"
              onClick={onBack}
              className="pointer-events-auto flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconBack}
                alt=""
                className="h-[18px] w-[10px] rotate-180 object-contain"
              />
            </button>
            <h1 className="truncate text-[32px] font-semibold leading-10 tracking-[-0.025em] text-[#fdfdff] min-[1100px]:text-[40px]">
              {title}
            </h1>
          </header>
        </div>

        {/* 중앙 빈 상태 그룹 */}
        <div className="absolute inset-x-0 top-[262px] bottom-0 z-30 flex flex-col items-center">
          <div className="relative flex w-full max-w-[720px] flex-col items-center">
            <img
              src={emptyStar}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-[4%] top-[40px] h-[120px] w-[110px] rotate-[54deg] object-contain opacity-70 min-[1100px]:left-[8%]"
            />
            <img
              src={emptyStar}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-[12%] top-[180px] h-[90px] w-[82px] -scale-x-100 -rotate-[54deg] object-contain opacity-60 min-[1100px]:left-[16%]"
            />
            <img
              src={emptySparkle}
              alt=""
              aria-hidden
              className="pointer-events-none absolute right-[10%] top-[20px] h-[80px] w-[100px] rotate-[9deg] object-contain opacity-80 min-[1100px]:right-[14%]"
            />

            <div className="relative mt-[100px] flex items-end">
              <div className="relative z-10 rounded-tl-[14.4px] rounded-tr-[14.4px] rounded-bl-[14.4px] bg-primary-10 px-[19px] py-3">
                <p className="text-[17px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800 min-[1100px]:text-[19.2px]">
                  아직 남겨진 사유가 없어요!
                  <br />
                  이 고요한 공간에
                  <br />
                  가장 먼저 당신의 마음을 남겨주세요!
                </p>
              </div>
              <img
                src={emptyOwlPeek}
                alt=""
                className="pointer-events-none relative -mb-1 -ml-6 h-[98px] w-[184px] object-contain object-bottom"
              />
            </div>

            <button
              type="button"
              onClick={onWrite}
              className="mt-[52px] flex h-[60px] items-center justify-center rounded-[30px] bg-[#fdfdff] px-6 text-[19.2px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800 drop-shadow-[0_0_2.4px_rgba(169,173,190,0.57)]"
            >
              사유남기러 가기
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
