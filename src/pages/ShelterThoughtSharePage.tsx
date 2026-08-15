import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ApiError,
  createShareImage,
  getShareStatus,
  getShareThemes,
} from "../api";
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

type ThemeVisual = {
  swatch: string;
  cardStyle: CSSProperties;
  glow: string;
  tape: string;
};

const THEME_VISUALS: ThemeVisual[] = [
  {
    swatch: "#F59ACA",
    cardStyle: { backgroundColor: "rgba(255, 203, 231, 0.58)" },
    glow: glowPink,
    tape: tapePink,
  },
  {
    swatch: "#ADB9F2",
    cardStyle: {
      backgroundImage:
        "linear-gradient(-43deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)",
    },
    glow: glowBlue,
    tape: tapeBlue,
  },
  {
    swatch: "#93E467",
    cardStyle: { backgroundColor: "rgba(190, 246, 160, 0.58)" },
    glow: glowGreen,
    tape: tapeGreen,
  },
  {
    swatch: "#F6E36A",
    cardStyle: { backgroundColor: "rgba(255, 242, 156, 0.58)" },
    glow: glowYellow,
    tape: tapeYellow,
  },
];

type ShareThemeOption = {
  themeId: number;
  name: string;
  previewUrl: string;
  visual: ThemeVisual;
};

async function pollShareImage(shareId: number, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const status = await getShareStatus(shareId);
    if (status.status === "COMPLETED" && status.imageUrl) {
      return status.imageUrl;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
  }
  throw new Error("SHARE_TIMEOUT");
}

/** 나의 사유록 공유하기(테마 선택) — 모바일 Figma 814:3756 / 829:4269 / 4347 / 4425 */
export default function ShelterThoughtSharePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as MyThoughtLocationState | null) ?? null;

  const bookTitle = state?.title ?? "쉼터";
  const bookId = state?.bookId;
  const roomId = state?.roomId;
  const postId = state?.postId;
  const body = state?.body?.trim() ? state.body : "";
  const date = state?.date ?? "";
  const authorName = state?.authorName ?? "나";

  const [themes, setThemes] = useState<ShareThemeOption[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | undefined>();
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getShareThemes()
      .then((data) => {
        if (cancelled) return;
        const mapped = data.themes.map((theme, index) => ({
          themeId: theme.themeId,
          name: theme.name,
          previewUrl: theme.previewUrl,
          visual: THEME_VISUALS[index % THEME_VISUALS.length]!,
        }));
        setThemes(
          mapped.length > 0
            ? mapped
            : THEME_VISUALS.map((visual, index) => ({
                themeId: index + 1,
                name: `theme-${index + 1}`,
                previewUrl: "",
                visual,
              })),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setThemes(
          THEME_VISUALS.map((visual, index) => ({
            themeId: index + 1,
            name: `theme-${index + 1}`,
            previewUrl: "",
            visual,
          })),
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeTheme = themes[selectedIndex] ?? themes[0];
  const visual = activeTheme?.visual ?? THEME_VISUALS[0]!;

  const shareText = useMemo(
    () =>
      `[${bookTitle}]\n${authorName}${date ? ` · ${date}` : ""}\n\n${body}`,
    [authorName, body, bookTitle, date],
  );

  const goEdit = () => {
    const query = roomId != null ? `?roomId=${roomId}` : "";
    navigate(`/shelter/thoughts/write${query}`, {
      state: {
        title: bookTitle,
        bookId,
        roomId,
        postId,
        body,
        date,
        authorName,
      },
    });
  };

  const handleShare = async () => {
    if (!activeTheme) {
      setSheetOpen(true);
      return;
    }
    if (postId == null) {
      setShareUrl(undefined);
      setSheetOpen(true);
      return;
    }

    setSharing(true);
    try {
      const job = await createShareImage(postId, activeTheme.themeId);
      const imageUrl =
        job.status === "COMPLETED"
          ? (await getShareStatus(job.shareId)).imageUrl
          : await pollShareImage(job.shareId);
      setShareUrl(imageUrl);
      setSheetOpen(true);
    } catch (error) {
      if (error instanceof ApiError) {
        window.alert(error.message);
      } else {
        window.alert("공유 이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSharing(false);
    }
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
            src={visual.glow}
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
            src={visual.tape}
            alt=""
            className="pointer-events-none absolute left-1/2 top-[153px] z-30 h-[40px] w-[72px] -translate-x-1/2 object-contain"
          />

          <div className="absolute left-1/2 top-[176px] z-20 w-[317px] -translate-x-1/2">
            <article
              className="flex h-[415px] w-full flex-col items-center gap-[21px] overflow-y-auto overscroll-contain px-[29px] py-[37px]"
              style={visual.cardStyle}
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
                {date ? (
                  <p className="mt-0.5 text-center text-[15px] leading-[25px] tracking-[-0.025em] text-gray-400">
                    {date}
                  </p>
                ) : null}
              </div>
              <p className="w-full whitespace-pre-wrap text-left text-[14.4px] leading-[1.6] tracking-[-0.025em] text-gray-800">
                {body}
              </p>
            </article>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center rounded-t-[24px] bg-[#fdfdff] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-7 shadow-[0_-4px_4px_rgba(38,39,43,0.07)]">
            <div className="mb-6 flex items-center justify-center gap-[25px]">
              {themes.map((item, index) => {
                const selected = selectedIndex === index;
                return (
                  <button
                    key={item.themeId}
                    type="button"
                    aria-label={`${item.name} 테마`}
                    aria-pressed={selected}
                    onClick={() => setSelectedIndex(index)}
                    className="relative size-14 shrink-0 overflow-hidden rounded-full"
                    style={{
                      backgroundColor: item.visual.swatch,
                      backgroundImage: item.previewUrl
                        ? `url(${item.previewUrl})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
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
              text={sharing ? "이미지 만드는 중…" : "사유록 공유하기"}
              variant="primary"
              size="h-[54px] w-full max-w-[353px] rounded-[16px] px-5 py-3"
              className="shadow-none"
              disabled={sharing || !body.trim()}
              onClick={() => void handleShare()}
            />
          </div>
        </div>
      </main>

      <ThoughtShareSheet
        open={sheetOpen}
        shareText={shareText}
        shareUrl={shareUrl}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
