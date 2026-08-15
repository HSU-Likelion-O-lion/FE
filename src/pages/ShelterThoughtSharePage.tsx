import { useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ThoughtShareSheet from "../components/shelter/ThoughtShareSheet";
import { SHELTER_BOARD_GRID_STYLE } from "../components/shelter/shelterBoardGrid";
import type { MyThoughtLocationState } from "./ShelterMyThoughtPage";
import iconBackWeb from "../assets/shelter/thoughts/icon-back-web.svg";
import iconPencil from "../assets/shelter/thoughts/write-icon-pencil.svg";
import detailAvatar from "../assets/shelter/thoughts/detail-avatar.png";
import glowPink from "../assets/shelter/thoughts/share/glow-pink.svg";
import glowBlue from "../assets/shelter/thoughts/share/glow-blue.svg";
import glowGreen from "../assets/shelter/thoughts/share/glow-green.svg";
import glowYellow from "../assets/shelter/thoughts/share/glow-yellow.svg";
import tapePink from "../assets/shelter/thoughts/share/tape-pink.svg";
import tapeBlue from "../assets/shelter/thoughts/share/tape-blue.svg";
import tapeGreen from "../assets/shelter/thoughts/share/tape-green.svg";
import tapeYellow from "../assets/shelter/thoughts/share/tape-yellow.svg";

type ThemeId = "pink" | "blue" | "green" | "yellow";

const THEMES: {
  id: ThemeId;
  swatch: string;
  cardStyle: CSSProperties;
  glow: string;
  tape: string;
}[] = [
  {
    id: "pink",
    swatch: "#F59ACA",
    cardStyle: { backgroundColor: "rgba(255, 203, 231, 0.58)" },
    glow: glowPink,
    tape: tapePink,
  },
  {
    id: "blue",
    swatch: "#ADB9F2",
    cardStyle: {
      backgroundImage:
        "linear-gradient(-43deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)",
    },
    glow: glowBlue,
    tape: tapeBlue,
  },
  {
    id: "green",
    swatch: "#93E467",
    cardStyle: { backgroundColor: "rgba(190, 246, 160, 0.58)" },
    glow: glowGreen,
    tape: tapeGreen,
  },
  {
    id: "yellow",
    swatch: "#F6E36A",
    cardStyle: { backgroundColor: "rgba(255, 242, 156, 0.58)" },
    glow: glowYellow,
    tape: tapeYellow,
  },
];

const DEFAULT_BODY =
  "원래 저 같은 경우에는 모든 일을 완벽하게 해내야 한다는 생각이 강해서 작은 실수에도 스스로를 많이 몰아붙이곤 했어요. 하지만 이 책을 읽으며 내가 통제할 수 없는 일들은 흘려보내도 괜찮다는 사실을 깨달았어요. 모든 결과를 내 힘으로 바꾸려 하기보다, 지금 내가 할 수 있는 일에 집중하는 것이 더 중요하다는 생각이 들었어요.";

/** 나의 사유록 공유하기(테마 선택) — 모바일 Figma 814:3756 / 829:4269 / 4347 / 4425 */
export default function ShelterThoughtSharePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as MyThoughtLocationState | null) ?? null;

  const bookTitle = state?.title ?? "불안을 이기는 철학";
  const bookId = state?.bookId ?? "default";
  const body = state?.body?.trim() ? state.body : DEFAULT_BODY;
  const date = state?.date ?? "2026.06.25";
  const authorName = state?.authorName ?? "지훈";

  const [theme, setTheme] = useState<ThemeId>("pink");
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  const shareText = useMemo(
    () => `[${bookTitle}]\n${authorName} · ${date}\n\n${body}`,
    [authorName, body, bookTitle, date],
  );

  const goEdit = () => {
    navigate("/shelter/thoughts/write", {
      state: { title: bookTitle, bookId, body },
    });
  };

  return (
    <>
      <main className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[#f7f8fc]">
        <div className="relative z-10 mx-auto h-full w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={SHELTER_BOARD_GRID_STYLE}
          />
          <img
            src={activeTheme.glow}
            alt=""
            className="pointer-events-none absolute left-1/2 top-[-320px] z-0 h-[860px] w-[620px] max-w-none -translate-x-1/2"
          />

          <header className="absolute inset-x-0 top-0 z-40 px-5 pt-5">
            <div className="relative flex h-11 w-full items-center justify-center">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={() => navigate(-1)}
                className="absolute left-0 flex size-6 items-center justify-center"
              >
                <img
                  src={iconBackWeb}
                  alt=""
                  className="size-6 object-contain"
                />
              </button>
              <h1 className="w-full text-center text-h3 text-white">
                나의 사유록 공유하기
              </h1>
              <button
                type="button"
                aria-label="사유 수정"
                onClick={goEdit}
                className="absolute right-0 flex size-6 items-center justify-center"
              >
                <img src={iconPencil} alt="" className="size-5 object-contain" />
              </button>
            </div>
          </header>

          <img
            src={activeTheme.tape}
            alt=""
            className="pointer-events-none absolute left-1/2 top-[153px] z-30 h-[40px] w-[72px] -translate-x-1/2 object-contain"
          />

          <div className="absolute left-1/2 top-[176px] z-20 w-[317px] -translate-x-1/2">
            <article
              className="flex h-[415px] w-full flex-col items-center gap-[21px] overflow-y-auto overscroll-contain px-[29px] py-[37px]"
              style={activeTheme.cardStyle}
            >
              <div className="relative flex w-full shrink-0 flex-col items-center">
                <img
                  src={detailAvatar}
                  alt=""
                  className="size-[69px] rounded-full object-cover"
                />
                <p className="mt-[11px] text-center text-[20px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                  {authorName}
                </p>
                <p className="mt-0.5 text-center text-[15px] leading-[25px] tracking-[-0.025em] text-gray-400">
                  {date}
                </p>
              </div>
              <p className="w-full whitespace-pre-wrap text-left text-[14.4px] leading-[1.6] tracking-[-0.025em] text-gray-800">
                {body}
              </p>
            </article>
          </div>

          {/* 하단 테마 선택 패널 — Figma 패널 225px / 버튼은 스와치 아래 */}
          <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center rounded-t-[24px] bg-[#fdfdff] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-7 shadow-[0_-4px_4px_rgba(38,39,43,0.07)]">
            <div className="mb-6 flex items-center justify-center gap-[25px]">
              {THEMES.map((item) => {
                const selected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`${item.id} 테마`}
                    aria-pressed={selected}
                    onClick={() => setTheme(item.id)}
                    className="relative size-14 shrink-0 rounded-full"
                    style={{ backgroundColor: item.swatch }}
                  >
                    {selected ? (
                      <svg
                        aria-hidden
                        viewBox="0 0 56 56"
                        className="pointer-events-none absolute inset-0 size-full"
                      >
                        <path
                          d="M16 29.5L23.5 37L40 19"
                          fill="none"
                          stroke="#FDFDFF"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <Button
              text="사유록 공유하기"
              variant="primary"
              size="h-[54px] w-full max-w-[353px] rounded-[16px] px-5 py-3"
              className="shadow-none"
              onClick={() => setSheetOpen(true)}
            />
          </div>
        </div>
      </main>

      <ThoughtShareSheet
        open={sheetOpen}
        shareText={shareText}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
