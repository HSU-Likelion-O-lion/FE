import { useEffect, useState, type CSSProperties } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ApiError,
  createReflectionShare,
  getMe,
  getReflectionShareStatus,
  getReflectionShareThemes,
  resolveReflectionId,
  type Plan,
} from "../api";
import Button from "../components/Button";
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

/** BASIC·PLUS는 서버가 무시하고 블루(themeId=2)로 고정 */
const DEFAULT_THEME_ID = 2;
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30;

function readPositiveInt(raw: string | null): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

type ThemeVisual = {
  swatch: string;
  cardStyle: CSSProperties;
  glow: string;
  tape: string;
};

/** themeId 1~4 고정 — 핑크 / 블루 / 그린 / 옐로 */
const THEME_VISUALS_BY_ID: Record<number, ThemeVisual> = {
  1: {
    swatch: "#F59ACA",
    cardStyle: { backgroundColor: "rgba(255, 203, 231, 0.58)" },
    glow: glowPink,
    tape: tapePink,
  },
  2: {
    swatch: "#ADB9F2",
    cardStyle: {
      backgroundImage:
        "linear-gradient(-43deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)",
    },
    glow: glowBlue,
    tape: tapeBlue,
  },
  3: {
    swatch: "#93E467",
    cardStyle: { backgroundColor: "rgba(190, 246, 160, 0.58)" },
    glow: glowGreen,
    tape: tapeGreen,
  },
  4: {
    swatch: "#F6E36A",
    cardStyle: { backgroundColor: "rgba(255, 242, 156, 0.58)" },
    glow: glowYellow,
    tape: tapeYellow,
  },
};

const THEME_ORDER = [1, 2, 3, 4] as const;

type ShareThemeOption = {
  themeId: number;
  name: string;
  visual: ThemeVisual;
};

function buildDefaultThemes(): ShareThemeOption[] {
  return THEME_ORDER.map((themeId) => ({
    themeId,
    name:
      themeId === 1
        ? "핑크"
        : themeId === 2
          ? "블루"
          : themeId === 3
            ? "그린"
            : "옐로",
    visual: THEME_VISUALS_BY_ID[themeId]!,
  }));
}

async function pollShareImage(shareId: number) {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
    const status = await getReflectionShareStatus(shareId);
    if (status.status === "COMPLETED" && status.imageUrl) {
      return status.imageUrl;
    }
    if (status.status === "FAILED") {
      throw new Error("SHARE_FAILED");
    }
    await new Promise((resolve) =>
      window.setTimeout(resolve, POLL_INTERVAL_MS),
    );
  }
  throw new Error("SHARE_TIMEOUT");
}

/** 서버 imageUrl → 기기 저장 (모바일 공유 시트 / 데스크톱 다운로드) */
async function saveImageToDevice(imageUrl: string, filename: string) {
  try {
    const res = await fetch(imageUrl, { mode: "cors" });
    if (!res.ok) throw new Error("FETCH_FAILED");
    const blob = await res.blob();
    const file = new File([blob], filename, {
      type: blob.type || "image/png",
    });

    if (
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({ files: [file], title: "나의 사유록" });
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return;
    }
    window.open(imageUrl, "_blank", "noopener,noreferrer");
    window.alert(
      "이미지를 새 탭에서 열었어요. 길게 누르거나 저장 메뉴로 기기에 저장해 주세요.",
    );
  }
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
      fill="none"
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

/** 나의 사유록 저장하기(테마 선택) — 모바일 Figma 814:3756 / 829:4269 / 4347 / 4425 */
export default function ShelterThoughtSharePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state as MyThoughtLocationState | null) ?? null;

  const bookTitle = state?.title ?? "쉼터";
  const bookId = state?.bookId;
  const roomId =
    state?.roomId ?? readPositiveInt(searchParams.get("roomId")) ?? undefined;
  const reflectionIdFromQuery = readPositiveInt(
    searchParams.get("reflectionId"),
  );
  const reflectionIdFromState =
    typeof state?.reflectionId === "number" && state.reflectionId > 0
      ? state.reflectionId
      : null;
  const postId =
    readPositiveInt(searchParams.get("postId")) ??
    (typeof state?.postId === "number" && state.postId > 0
      ? state.postId
      : null);
  const body = state?.body?.trim() ? state.body : "";
  const date = state?.date ?? "";
  const authorName = state?.authorName ?? "나";

  const [themes, setThemes] = useState<ShareThemeOption[]>(buildDefaultThemes);
  /** 기본 선택: 블루 (themeId=2) */
  const [selectedThemeId, setSelectedThemeId] = useState(DEFAULT_THEME_ID);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [reflectionId, setReflectionId] = useState<number | null>(
    () => reflectionIdFromQuery ?? reflectionIdFromState,
  );

  const isPro = plan === "PRO";
  /** PRO만 선택 반영, 그 외·로딩 중에는 항상 블루 */
  const previewThemeId = isPro ? selectedThemeId : DEFAULT_THEME_ID;
  const visual =
    THEME_VISUALS_BY_ID[previewThemeId] ?? THEME_VISUALS_BY_ID[DEFAULT_THEME_ID]!;

  useEffect(() => {
    let cancelled = false;

    void getMe()
      .then((me) => {
        if (cancelled) return;
        setPlan(me.plan);
        if (me.plan !== "PRO") {
          setSelectedThemeId(DEFAULT_THEME_ID);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlan("BASIC");
          setSelectedThemeId(DEFAULT_THEME_ID);
        }
      });

    void getReflectionShareThemes()
      .then((data) => {
        if (cancelled) return;
        setThemes(
          THEME_ORDER.map((themeId) => {
            const fromApi = data.themes.find((t) => t.themeId === themeId);
            const fallback = buildDefaultThemes().find(
              (t) => t.themeId === themeId,
            )!;
            return {
              themeId,
              name: fromApi?.name ?? fallback.name,
              // 카드/글로우/스와치는 FE 고정값 사용 (API previewUrl은 색 불일치 유발)
              visual: THEME_VISUALS_BY_ID[themeId]!,
            };
          }),
        );
      })
      .catch(() => {
        /* 기본 테마 유지 */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // postId만 있는 진입 → 본문으로 reflectionId 복구
  useEffect(() => {
    const known = reflectionIdFromQuery ?? reflectionIdFromState;
    if (known != null) {
      setReflectionId(known);
      return;
    }

    let cancelled = false;
    void resolveReflectionId({
      content: body,
      bookTitle: bookTitle !== "쉼터" ? bookTitle : null,
    }).then((id) => {
      if (!cancelled && id != null) setReflectionId(id);
    });

    return () => {
      cancelled = true;
    };
  }, [reflectionIdFromQuery, reflectionIdFromState, body, bookTitle]);

  const goEdit = () => {
    const query = roomId != null ? `?roomId=${roomId}` : "";
    navigate(`/shelter/thoughts/write${query}`, {
      state: {
        title: bookTitle,
        bookId,
        roomId,
        postId: postId ?? undefined,
        reflectionId: reflectionId ?? undefined,
        body,
        date,
        authorName,
      },
    });
  };

  const handleThemeSelect = (themeId: number) => {
    if (!isPro) {
      window.alert("테마 선택은 쓰담 Premium(PRO)에서 이용할 수 있어요.");
      return;
    }
    setSelectedThemeId(themeId);
  };

  const handleSave = async () => {
    let targetReflectionId = reflectionId;
    if (targetReflectionId == null) {
      targetReflectionId = await resolveReflectionId({
        content: body,
        bookTitle: bookTitle !== "쉼터" ? bookTitle : null,
      });
      if (targetReflectionId != null) {
        setReflectionId(targetReflectionId);
      }
    }

    if (targetReflectionId == null) {
      window.alert(
        "저장할 사유록을 찾을 수 없어요. 서재의 나의 사유록에서 다시 들어와 주세요.",
      );
      return;
    }

    const themeId = isPro ? previewThemeId : DEFAULT_THEME_ID;

    setSaving(true);
    try {
      const job = await createReflectionShare(targetReflectionId, themeId);
      const imageUrl =
        job.status === "COMPLETED"
          ? (await getReflectionShareStatus(job.shareId)).imageUrl
          : await pollShareImage(job.shareId);

      if (!imageUrl) {
        throw new Error("NO_IMAGE_URL");
      }

      const safeDate = date.replace(/[^\d.]/g, "") || "sseudam";
      await saveImageToDevice(imageUrl, `사유록-${safeDate}.png`);
    } catch (error) {
      if (error instanceof ApiError) {
        window.alert(error.message);
      } else if (error instanceof Error && error.message === "SHARE_TIMEOUT") {
        window.alert(
          "이미지 생성이 너무 오래 걸려요. 잠시 후 다시 시도해 주세요.",
        );
      } else if (error instanceof Error && error.message === "SHARE_FAILED") {
        window.alert("이미지 생성에 실패했어요. 잠시 후 다시 시도해 주세요.");
      } else {
        window.alert("이미지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
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
              나의 사유록 저장하기
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
          {isPro ? (
            <div className="mb-6 flex items-center justify-center gap-[25px]">
              {themes.map((item) => {
                const selected = selectedThemeId === item.themeId;
                return (
                  <button
                    key={item.themeId}
                    type="button"
                    aria-label={`${item.name} 테마`}
                    aria-pressed={selected}
                    onClick={() => handleThemeSelect(item.themeId)}
                    className="relative size-14 shrink-0 overflow-hidden rounded-full"
                    style={{ backgroundColor: item.visual.swatch }}
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
          ) : (
            <div className="mb-6 flex w-full flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-[25px]">
                {themes.map((item) => {
                  const isDefault = item.themeId === DEFAULT_THEME_ID;
                  return (
                    <button
                      key={item.themeId}
                      type="button"
                      aria-label={
                        isDefault
                          ? `${item.name} 테마 (기본)`
                          : `${item.name} 테마 (PRO 전용)`
                      }
                      aria-disabled={!isDefault}
                      onClick={() => {
                        if (!isDefault) {
                          navigate("/profile/membership");
                        }
                      }}
                      className={`relative size-14 shrink-0 overflow-hidden rounded-full ${
                        isDefault ? "ring-2 ring-primary-400 ring-offset-2" : ""
                      }`}
                      style={{ backgroundColor: item.visual.swatch }}
                    >
                      {!isDefault ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                          <LockIcon />
                        </span>
                      ) : (
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
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-body2 text-gray-400">
                테마 선택은{" "}
                <button
                  type="button"
                  className="font-semibold text-primary-500 underline-offset-2 hover:underline"
                  onClick={() => navigate("/profile/membership")}
                >
                  Premium
                </button>
                에서 이용할 수 있어요
              </p>
            </div>
          )}

          <Button
            text={saving ? "이미지 저장 중…" : "저장하기"}
            variant="primary"
            size="h-[54px] w-full max-w-[353px] rounded-[16px] px-5 py-3"
            className="shadow-none"
            disabled={saving || !body.trim()}
            onClick={() => void handleSave()}
          />
        </div>
      </div>
    </main>
  );
}
