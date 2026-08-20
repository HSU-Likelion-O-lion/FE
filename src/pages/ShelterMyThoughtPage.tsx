import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ApiError,
  createCommunityPost,
  getCommunityRooms,
  getRoomPosts,
  resolveReflectionId,
} from "../api";
import Button from "../components/Button";
import WebGnb from "../components/WebGnb";
import { SHELTER_BOARD_GRID_STYLE } from "../components/shelter/shelterBoardGrid";
import iconBackWeb from "../assets/shelter/thoughts/icon-back-web.svg";
import iconPencil from "../assets/shelter/thoughts/write-icon-pencil.svg";
import detailAvatar from "../assets/shelter/thoughts/detail-avatar.png";
import detailTape from "../assets/shelter/thoughts/detail-like.svg";
import detailTapeCenter from "../assets/shelter/thoughts/detail-tape-center.svg";
import detailPencil1 from "../assets/shelter/thoughts/detail-pencil-1.svg";
import detailPencil2 from "../assets/shelter/thoughts/detail-pencil-2.svg";
import ellipse2468 from "../assets/shelter/thoughts/ellipse-2468.svg";
import ShelterTopGlow from "../components/shelter/ShelterTopGlow";

const MAX_LENGTH = 200;

const CARD_GRADIENT =
  "linear-gradient(-23deg, rgba(225,231,255,0.96) 2%, rgba(223,229,255,0.96) 96%)";

function readPositiveInt(raw: string | null): number | null {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export type MyThoughtLocationState = {
  title?: string;
  bookId?: number | string;
  roomId?: number;
  postId?: number;
  /** 서재 사유 ID — postId와 다름 */
  reflectionId?: number;
  body?: string;
  date?: string;
  authorName?: string;
};

/** 내 사유록 보기 · 공유 — 웹 Figma 738:4479 */
export default function ShelterMyThoughtPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = (location.state as MyThoughtLocationState | null) ?? null;

  const bookTitle = state?.title ?? "쉼터";
  const bookId = state?.bookId;
  const reflectionIdFromQuery = readPositiveInt(
    searchParams.get("reflectionId"),
  );
  const reflectionId =
    (typeof state?.reflectionId === "number" && state.reflectionId > 0
      ? state.reflectionId
      : null) ?? reflectionIdFromQuery ?? undefined;
  const roomIdFromQuery = readPositiveInt(searchParams.get("roomId"));
  const postIdFromQuery = readPositiveInt(searchParams.get("postId"));
  const roomId =
    (typeof state?.roomId === "number" && state.roomId > 0
      ? state.roomId
      : null) ?? roomIdFromQuery;
  const initialPostId =
    (typeof state?.postId === "number" && state.postId > 0
      ? state.postId
      : null) ?? postIdFromQuery;

  const [body, setBody] = useState(state?.body?.trim() ? state.body : "");
  const [authorName, setAuthorName] = useState(state?.authorName ?? "");
  const [postId, setPostId] = useState<number | undefined>(
    initialPostId ?? undefined,
  );
  const [resolvedReflectionId, setResolvedReflectionId] = useState<
    number | undefined
  >(reflectionId);
  const [resolvedRoomId, setResolvedRoomId] = useState<number | null>(roomId);
  const [loading, setLoading] = useState(!state?.body?.trim());
  const [resolvingPostId, setResolvingPostId] = useState(initialPostId == null);
  const [postingToShelter, setPostingToShelter] = useState(false);
  const date = state?.date ?? "";

  useEffect(() => {
    setResolvedReflectionId(reflectionId);
  }, [reflectionId]);

  useEffect(() => {
    if (initialPostId != null) {
      setPostId(initialPostId);
      setResolvingPostId(false);
    }

    const hasBody = Boolean(state?.body?.trim());
    // body·postId 모두 있으면 본문 조회 불필요. postId만 없을 때는 쉼터에서 조회.
    if (hasBody && initialPostId != null) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    if (!hasBody) setLoading(true);
    if (initialPostId == null) setResolvingPostId(true);

    const resolve = async () => {
      let nextRoomId = roomId;

      if (nextRoomId == null && bookTitle && bookTitle !== "쉼터") {
        try {
          const { rooms } = await getCommunityRooms();
          const matched = rooms.find((room) => room.bookTitle === bookTitle);
          if (matched) nextRoomId = matched.roomId;
        } catch {
          /* rooms 조회 실패 시 아래 roomId 없음 처리 */
        }
      }

      if (cancelled) return;

      if (nextRoomId != null) {
        setResolvedRoomId(nextRoomId);
        const data = await getRoomPosts(nextRoomId);
        if (cancelled) return;

        const bodyText = state?.body?.trim() ?? "";
        const mine =
          (initialPostId != null
            ? data.posts.find(
                (p) => p.postId === initialPostId && p.isMine,
              )
            : undefined) ??
          // 서재에서 온 경우: 같은 내용의 내 글만 postId로 인정
          (bodyText
            ? data.posts.find(
                (p) => p.isMine && p.content.trim() === bodyText,
              )
            : undefined) ??
          (!hasBody ? data.posts.find((p) => p.isMine) : undefined);

        if (mine) {
          setPostId(mine.postId);
          if (!hasBody) {
            setBody(mine.content);
            setAuthorName(mine.anonymousNickname);
          }
        }
      }
    };

    resolve()
      .catch(() => {
        /* keep empty */
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setResolvingPostId(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookTitle, initialPostId, roomId, state?.body]);

  // postId만 있는 경우 본문으로 reflectionId 복구
  useEffect(() => {
    if (reflectionId != null) return;
    const content = body.trim() || state?.body?.trim();
    if (!content) return;

    let cancelled = false;
    void resolveReflectionId({
      content,
      bookTitle: bookTitle !== "쉼터" ? bookTitle : null,
    }).then((id) => {
      if (!cancelled && id != null) setResolvedReflectionId(id);
    });

    return () => {
      cancelled = true;
    };
  }, [reflectionId, body, bookTitle, state?.body]);

  // 조회된 postId·roomId·reflectionId를 URL에 반영
  useEffect(() => {
    if (postId == null && resolvedReflectionId == null) return;

    const room = resolvedRoomId ?? roomId;
    const samePost =
      postId == null || searchParams.get("postId") === String(postId);
    const sameRoom =
      room == null || searchParams.get("roomId") === String(room);
    const sameReflection =
      resolvedReflectionId == null ||
      searchParams.get("reflectionId") === String(resolvedReflectionId);
    if (samePost && sameRoom && sameReflection) return;

    const next = new URLSearchParams(searchParams);
    if (postId != null) next.set("postId", String(postId));
    if (room != null) next.set("roomId", String(room));
    if (resolvedReflectionId != null) {
      next.set("reflectionId", String(resolvedReflectionId));
    }
    setSearchParams(next, { replace: true });
  }, [
    postId,
    resolvedReflectionId,
    resolvedRoomId,
    roomId,
    searchParams,
    setSearchParams,
  ]);

  const effectiveRoomId = resolvedRoomId ?? roomId;
  const effectiveReflectionId = resolvedReflectionId ?? reflectionId;
  /** 사유록 이미지 저장은 reflectionId 필요 (없으면 본문으로 복구 시도 후) */
  const canSaveShare = effectiveReflectionId != null || Boolean(body.trim());

  const navState = {
    title: bookTitle,
    bookId,
    roomId: effectiveRoomId ?? undefined,
    postId,
    reflectionId: effectiveReflectionId,
    body,
    date,
    authorName,
  };

  const goEdit = () => {
    const query = effectiveRoomId != null ? `?roomId=${effectiveRoomId}` : "";
    navigate(`/shelter/thoughts/write${query}`, {
      state: navState,
    });
  };

  /** 사유록 공유 이미지 저장 화면 (모바일·웹 동일 — 테마 선택 화면) */
  const handleSave = async () => {
    let nextReflectionId = effectiveReflectionId ?? null;
    if (nextReflectionId == null && body.trim()) {
      nextReflectionId = await resolveReflectionId({
        content: body,
        bookTitle: bookTitle !== "쉼터" ? bookTitle : null,
      });
      if (nextReflectionId != null) {
        setResolvedReflectionId(nextReflectionId);
      }
    }
    if (nextReflectionId == null) {
      window.alert(
        "저장할 사유록을 찾을 수 없어요. 서재의 나의 사유록에서 다시 들어와 주세요.",
      );
      return;
    }

    const query = new URLSearchParams({
      reflectionId: String(nextReflectionId),
    });
    if (postId != null) {
      query.set("postId", String(postId));
    }
    if (effectiveRoomId != null) {
      query.set("roomId", String(effectiveRoomId));
    }
    navigate(`/shelter/thoughts/mine/share?${query.toString()}`, {
      state: { ...navState, reflectionId: nextReflectionId },
    });
  };

  /** 서재 사유만 있고 쉼터 미게시 → 쉼터에 올리기 */
  const handlePostToShelter = async () => {
    if (!body.trim() || postingToShelter) return;

    setPostingToShelter(true);
    try {
      let nextRoomId = effectiveRoomId;
      if (nextRoomId == null) {
        const { rooms } = await getCommunityRooms();
        const matched = rooms.find((room) => room.bookTitle === bookTitle);
        nextRoomId = matched?.roomId ?? null;
      }
      if (nextRoomId == null) {
        window.alert(
          "이 책의 쉼터 방을 찾지 못했어요. 서재에 책이 담겨 있는지 확인해 주세요.",
        );
        return;
      }

      const created = await createCommunityPost({
        roomId: nextRoomId,
        content: body.trim(),
        reflectionId: effectiveReflectionId,
      });
      setResolvedRoomId(nextRoomId);
      setPostId(created.postId);
      setAuthorName(created.anonymousNickname);
      window.alert("사유를 쉼터에 남겨뒀어요.");
    } catch (error) {
      if (error instanceof ApiError) {
        window.alert(error.message);
      } else {
        window.alert("쉼터에 남기지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setPostingToShelter(false);
    }
  };

  const ctaBusy =
    postingToShelter || (effectiveReflectionId == null && resolvingPostId);
  const ctaText = postingToShelter
    ? "쉼터에 남기는 중…"
    : effectiveReflectionId == null && resolvingPostId
      ? "확인 중…"
      : canSaveShare
        ? "사유록 저장하기"
        : "쉼터에 공유하기";

  const handleCta = () => {
    if (canSaveShare) void handleSave();
    else void handlePostToShelter();
  };

  if (loading) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] items-center justify-center bg-[#f7f8fc]">
        <p className="text-body1 text-gray-500">내 사유를 불러오는 중…</p>
      </main>
    );
  }

  if (!body.trim()) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-4 bg-[#f7f8fc] px-5">
        <p className="text-body1 text-gray-600">아직 남긴 사유가 없어요.</p>
        <button
          type="button"
          className="text-button1 text-primary-500"
          onClick={goEdit}
        >
          사유 남기기
        </button>
      </main>
    );
  }

  return (
    <>
      {/* —— Mobile —— */}
      <main className="relative mx-auto h-dvh w-full max-w-[430px] overflow-hidden bg-[#f7f8fc] min-[431px]:hidden">
        <div className="relative z-10 mx-auto h-full w-full">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={SHELTER_BOARD_GRID_STYLE}
          />
          <ShelterTopGlow />

          <img
            src={detailPencil2}
            alt=""
            className="pointer-events-none absolute left-[-156px] top-[103px] z-[1] h-[89px] w-[230px] object-contain opacity-80"
          />
          <img
            src={detailPencil1}
            alt=""
            className="pointer-events-none absolute left-[82px] top-[87px] z-[1] h-[86px] w-[177px] rotate-[4.83deg] object-contain opacity-80"
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
                {bookTitle}
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

          {/* 헤더~하단 CTA — 테이프를 카드에 붙여 함께 배치 */}
          <div className="absolute inset-x-0 top-[64px] bottom-[120px] z-20 flex items-center justify-center overflow-hidden px-5">
            <div className="relative flex max-h-full min-h-0 w-[353px] flex-col items-center pt-[38px]">
              <img
                src={detailTape}
                alt=""
                className="pointer-events-none absolute left-1/2 top-0 z-30 h-[45px] w-[81px] -translate-x-1/2 object-contain"
              />

              <article
                className="relative z-20 flex min-h-0 w-full max-h-[calc(100%-38px)] flex-col items-center gap-[23px] overflow-y-auto overscroll-contain px-8 py-[41px]"
                style={{ backgroundImage: CARD_GRADIENT }}
              >
                <div className="relative flex w-full shrink-0 flex-col items-center">
                  <img
                    src={detailAvatar}
                    alt=""
                    className="size-[77px] rounded-full object-cover"
                  />
                  <p className="mt-3 text-center text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                    {authorName || "나"}
                  </p>
                  {date ? (
                    <p className="mt-1 text-center text-[16.8px] leading-[27.6px] tracking-[-0.025em] text-gray-400">
                      {date}
                    </p>
                  ) : null}
                </div>
                <p className="w-full whitespace-pre-wrap text-center text-body1 leading-[1.6] text-gray-800">
                  {body}
                </p>
              </article>
              <p className="mt-2 w-full text-right text-caption text-gray-600">
                ({body.length}/{MAX_LENGTH})
              </p>
            </div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[86px] bg-[linear-gradient(3deg,#fff_9%,transparent_91%)]"
          />
          <div className="absolute inset-x-0 bottom-[33px] z-40 flex justify-center px-5">
            <Button
              text={ctaText}
              variant="primary"
              size="h-[54px] w-[353px] rounded-[16px] px-5 py-3"
              className="shadow-none"
              disabled={ctaBusy}
              onClick={handleCta}
            />
          </div>
        </div>
      </main>

      {/* —— Web (Figma 738:4479) —— */}
      <main className="relative hidden h-dvh w-full overflow-hidden bg-[#f7f8fc] min-[431px]:block">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={SHELTER_BOARD_GRID_STYLE}
        />

        <img
          src={ellipse2468}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[-362px] z-10 h-[944px] max-w-none -translate-x-1/2"
          style={{ width: "calc(100vw + 100px)" }}
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
              onClick={() => navigate(-1)}
              className="pointer-events-auto flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconBackWeb}
                alt=""
                className="size-[42px] object-contain"
              />
            </button>
            <h1 className="min-w-0 flex-1 truncate text-[32px] font-semibold leading-10 tracking-[-0.025em] text-[#fdfdff] min-[1100px]:text-[40px]">
              {bookTitle}
            </h1>
            <button
              type="button"
              aria-label="사유 수정"
              onClick={goEdit}
              className="pointer-events-auto flex size-[42px] shrink-0 items-center justify-center"
            >
              <img
                src={iconPencil}
                alt=""
                className="size-[28px] object-contain"
              />
            </button>
          </header>
        </div>

        <div className="absolute inset-x-0 top-[219px] bottom-[120px] z-30 overflow-y-auto overflow-x-hidden">
          <div className="relative mx-auto w-full max-w-[660px] px-4 pt-[30px] pb-8">
            <img
              src={detailTapeCenter}
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 z-30 h-[58px] w-[98px] -translate-x-1/2 object-contain"
            />

            <article
              className="relative z-20 flex w-full flex-col items-center gap-[28px] px-[38px] py-[39px]"
              style={{ backgroundImage: CARD_GRADIENT }}
            >
              <div className="flex w-full flex-col items-center">
                <img
                  src={detailAvatar}
                  alt=""
                  className="size-[92px] rounded-full object-cover"
                />
                <p className="mt-3 text-center text-[28px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
                  {authorName || "나"}
                </p>
                {date ? (
                  <p className="mt-1 text-center text-[20px] leading-[33px] tracking-[-0.025em] text-gray-400">
                    {date}
                  </p>
                ) : null}
              </div>
              <p className="w-full whitespace-pre-wrap text-center text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-800">
                {body}
              </p>
            </article>

            <p className="mt-3 text-right text-[16px] leading-[1.6] tracking-[-0.025em] text-gray-600">
              ({body.length}/{MAX_LENGTH})
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-8 z-40 flex justify-center px-8">
          <Button
            text={ctaText}
            variant="primary"
            size="h-[65px] w-full max-w-[424px] rounded-[16px] px-5 py-3 text-[19.2px]"
            className="shadow-none"
            disabled={ctaBusy}
            onClick={handleCta}
          />
        </div>
      </main>
    </>
  );
}
