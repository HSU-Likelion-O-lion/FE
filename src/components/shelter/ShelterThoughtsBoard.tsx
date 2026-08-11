import { useRef } from "react";
import PostIt from "./PostIt";
import {
  BOARD,
  type PlacedThoughtNote,
} from "../../data/shelterThoughtsMock";
import { useBoardPanZoom } from "../../hooks/useBoardPanZoom";
import bgGrid from "../../assets/shelter/thoughts/bg-grid.png";
import bgGlow from "../../assets/shelter/thoughts/bg-glow.svg";
import iconBack from "../../assets/shelter/thoughts/icon-back.svg";
import owlMascot from "../../assets/shelter/thoughts/owl-mascot.png";

const WORLD_W = BOARD.world.maxX - BOARD.world.minX;
const WORLD_H = BOARD.world.maxY - BOARD.world.minY;

type ShelterThoughtsBoardProps = {
  title: string;
  notes: PlacedThoughtNote[];
  onBack: () => void;
  onNoteClick: (thoughtId: string) => void;
};

/** 사유가 있을 때 — 팬/줌 맵 보드 */
export default function ShelterThoughtsBoard({
  title,
  notes,
  onBack,
  onNoteClick,
}: ShelterThoughtsBoardProps) {
  const viewportRef = useRef<HTMLElement>(null);
  const {
    transform,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    shouldSuppressClick,
  } = useBoardPanZoom(viewportRef);

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto bg-[#f7f8fc]">
      <div className="relative mx-auto min-h-[max(852px,100dvh)] w-full">
        <section
          ref={viewportRef}
          className="absolute inset-0 z-10 cursor-grab touch-none overflow-hidden overscroll-none active:cursor-grabbing"
          style={{ contain: "paint" }}
          aria-label="사유 포스트잇 보드"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute left-0 top-0 will-change-transform"
              style={{
                width: WORLD_W,
                height: WORLD_H,
                transform: `translate3d(${transform.x + BOARD.world.minX * transform.scale}px, ${transform.y + BOARD.world.minY * transform.scale}px, 0) scale(${transform.scale})`,
                transformOrigin: "0 0",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url(${bgGrid})`,
                  backgroundSize: "393px 792px",
                  backgroundRepeat: "repeat",
                }}
              />
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="absolute"
                  style={{
                    left: note.x - BOARD.world.minX,
                    top: note.y - BOARD.world.minY,
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
                      note.variant === "featured"
                        ? "text-gray-900"
                        : "text-gray-800"
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
        </section>

        {/* Ellipse 2467 — Figma: 433×644, top -230 */}
        <img
          src={bgGlow}
          alt=""
          className="pointer-events-none absolute left-1/2 top-[-230px] z-30 h-[644px] w-[433px] max-w-none -translate-x-1/2"
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
  );
}
