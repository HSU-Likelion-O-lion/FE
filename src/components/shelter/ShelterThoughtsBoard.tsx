import { useRef } from "react";
import PostIt from "./PostIt";
import WebGnb from "../WebGnb";
import {
  BOARD,
  WEB_BOARD,
  type PlacedThoughtNote,
} from "../../data/shelterThoughtsMock";
import { useBoardPanZoom } from "../../hooks/useBoardPanZoom";
import iconBackWeb from "../../assets/shelter/thoughts/icon-back-web.svg";
import owlMascot from "../../assets/shelter/thoughts/owl-mascot.png";
import bgGlow from "../../assets/shelter/thoughts/bg-glow.svg";
import ellipse2467 from "../../assets/shelter/thoughts/ellipse-2467.svg";
import ellipse2468 from "../../assets/shelter/thoughts/ellipse-2468.svg";
import { SHELTER_BOARD_GRID_STYLE } from "./shelterBoardGrid";

type ShelterThoughtsBoardProps = {
  title: string;
  notes: PlacedThoughtNote[];
  /** 웹용 노트 배치 (팬/줌 + Figma 초기 프레임) */
  webNotes?: PlacedThoughtNote[];
  onBack: () => void;
  onNoteClick: (thoughtId: string) => void;
};

function BoardWorld({
  notes,
  world,
  transform,
  onNoteClick,
  shouldSuppressClick,
}: {
  notes: PlacedThoughtNote[];
  world: { minX: number; minY: number; maxX: number; maxY: number };
  transform: { x: number; y: number; scale: number };
  onNoteClick: (thoughtId: string) => void;
  shouldSuppressClick: () => boolean;
}) {
  const worldW = world.maxX - world.minX;
  const worldH = world.maxY - world.minY;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: worldW,
          height: worldH,
          transform: `translate3d(${transform.x + world.minX * transform.scale}px, ${transform.y + world.minY * transform.scale}px, 0) scale(${transform.scale})`,
          transformOrigin: "0 0",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={SHELTER_BOARD_GRID_STYLE}
        />
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute"
            style={{
              left: note.x - world.minX,
              top: note.y - world.minY,
              zIndex: note.zIndex,
            }}
          >
            <PostIt
              variant={note.variant}
              lines={note.content.split("\n")}
              flip={note.flip}
              width={note.width}
              rotate={note.rotate}
              textClassName={
                note.variant === "featured" ? "text-gray-900" : "text-gray-800"
              }
              onClick={() => {
                if (shouldSuppressClick()) return;
                onNoteClick(note.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 사유가 있을 때 — 모바일/웹 팬·줌 보드 (웹 Figma 726:4462) */
export default function ShelterThoughtsBoard({
  title,
  notes,
  webNotes,
  onBack,
  onNoteClick,
}: ShelterThoughtsBoardProps) {
  const mobileViewportRef = useRef<HTMLElement>(null);
  const webViewportRef = useRef<HTMLElement>(null);

  const mobile = useBoardPanZoom(mobileViewportRef, BOARD);
  const web = useBoardPanZoom(webViewportRef, WEB_BOARD);
  const desktopNotes = webNotes ?? notes;

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto bg-[#f7f8fc] min-[431px]:hidden">
        <div className="relative mx-auto min-h-[max(852px,100dvh)] w-full">
          <section
            ref={mobileViewportRef}
            className="absolute inset-0 z-10 cursor-grab touch-none overflow-hidden overscroll-none active:cursor-grabbing"
            style={{ contain: "paint" }}
            aria-label="사유 포스트잇 보드"
            onPointerDown={mobile.onPointerDown}
            onPointerMove={mobile.onPointerMove}
            onPointerUp={mobile.onPointerUp}
            onPointerCancel={mobile.onPointerCancel}
          >
            <BoardWorld
              notes={notes}
              world={BOARD.world}
              transform={mobile.transform}
              onNoteClick={onNoteClick}
              shouldSuppressClick={mobile.shouldSuppressClick}
            />
          </section>

          <img
            src={bgGlow}
            alt=""
            className="pointer-events-none absolute left-1/2 top-[-320px] z-30 h-[860px] w-[620px] max-w-none -translate-x-1/2"
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
                  src={iconBackWeb}
                  alt=""
                  className="size-6 object-contain"
                />
              </button>
              <h1 className="w-full text-center text-h3 text-white">{title}</h1>
            </div>
          </header>

          <div className="pointer-events-none absolute left-[calc(50%-65px)] top-[86px] z-40 -translate-x-1/2 rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-primary-10 px-4 py-[9.6px]">
            <p className="whitespace-nowrap text-center text-[16px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800">
              포스트잇을 클릭해, 다양한
              <br />
              사유를 읽어보세요!
            </p>
          </div>

          <img
            src={owlMascot}
            alt=""
            className="pointer-events-none absolute left-[calc(50%+31px)] top-[66px] z-40 h-[144px] w-[132px] object-contain object-bottom"
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[86px] bg-[linear-gradient(3deg,#fff_9%,transparent_91%)]"
          />
        </div>
      </main>

      {/* —— Web (Figma 726:4462) ——
          스크린 고정: Glow / GNB·타이틀 / 팁
          월드 팬·줌: 격자 + 포스트잇 (홈 = 1440×1024 Figma 좌표)
      */}
      <main className="relative hidden h-dvh w-full overflow-hidden bg-[#f7f8fc] min-[431px]:block">
        <section
          ref={webViewportRef}
          className="absolute inset-0 z-10 cursor-grab touch-none overflow-hidden overscroll-none active:cursor-grabbing"
          style={{ contain: "paint" }}
          aria-label="사유 포스트잇 보드"
          onPointerDown={web.onPointerDown}
          onPointerMove={web.onPointerMove}
          onPointerUp={web.onPointerUp}
          onPointerCancel={web.onPointerCancel}
        >
          <BoardWorld
            notes={desktopNotes}
            world={WEB_BOARD.world}
            transform={web.transform}
            onNoteClick={onNoteClick}
            shouldSuppressClick={web.shouldSuppressClick}
          />
        </section>

        {/* Ellipse 2468 — 상단 보라 헤일로 (GNB 뒤). 뷰포트보다 항상 100px 넓게 */}
        <img
          src={ellipse2468}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-362px] z-20 h-[944px] max-w-none -translate-x-1/2"
          style={{ width: "calc(100vw + 100px)" }}
        />

        {/* Ellipse 2467 — 하단 소프트 글로우 (Figma: top 500 / ~693×499 / rotate -12°) */}
        <img
          src={ellipse2467}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[calc(50%+1.09%)] top-[48.83%] z-20 max-w-none -translate-x-1/2 -rotate-[12deg] object-contain"
          style={{
            width: "48.15%",
            height: "48.74%",
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
                src={iconBackWeb}
                alt=""
                className="size-[42px] object-contain"
              />
            </button>
            <h1 className="truncate text-[32px] font-semibold leading-10 tracking-[-0.025em] text-[#fdfdff] min-[1100px]:text-[40px]">
              {title}
            </h1>
          </header>
        </div>

        {/* Group 2117905007 — Figma 726:4285 (1440×1024) */}
        <div className="pointer-events-none absolute inset-0 z-40">
          <div
            className="absolute flex -translate-x-1/2 items-center rounded-tl-[12.7px] rounded-tr-[12.7px] rounded-bl-[12.7px] bg-primary-10"
            style={{
              left: "calc(50% - 64.5px)",
              top: "69.18%",
              width: 205.8,
              height: 74.7,
              padding: "10.14px 16.9px",
            }}
          >
            <p className="whitespace-nowrap text-[16.9px] font-medium leading-[1.6] tracking-[-0.025em] text-gray-800">
              포스트잇을 클릭해, 다양한
              <br />
              사유를 읽어보세요!
            </p>
          </div>
          <img
            src={owlMascot}
            alt=""
            className="absolute object-contain object-bottom"
            style={{
              left: "calc(50% + 37.4px)",
              top: "67.12%",
              width: 139.4,
              height: 152.1,
            }}
          />
        </div>
      </main>
    </>
  );
}
