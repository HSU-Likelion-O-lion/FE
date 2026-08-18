import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getRoomPosts } from "../api";
import type { CommunityPost } from "../api";
import ShelterThoughtsBoard from "../components/shelter/ShelterThoughtsBoard";
import ShelterThoughtsEmpty from "../components/shelter/ShelterThoughtsEmpty";
import {
  communityPostToThoughtNote,
  layoutThoughtNotes,
} from "../data/shelterThoughtsLayout";

export type ThoughtsLocationState = {
  title?: string;
  bookId?: number | string;
  roomId?: number;
  posts?: CommunityPost[];
};

function parseRoomId(
  searchParams: URLSearchParams,
  state: ThoughtsLocationState | null,
): number | null {
  const fromQuery = Number(searchParams.get("roomId"));
  if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery;
  if (typeof state?.roomId === "number" && state.roomId > 0) return state.roomId;
  return null;
}

export default function ShelterThoughtsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = (location.state as ThoughtsLocationState | null) ?? null;
  const roomId = parseRoomId(searchParams, state);
  const title = state?.title ?? "쉼터";
  const bookId = state?.bookId;

  const [posts, setPosts] = useState<CommunityPost[]>(state?.posts ?? []);
  const [loading, setLoading] = useState(!state?.posts?.length && roomId != null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (roomId == null) {
      setLoading(false);
      setLoadError(true);
      return;
    }
    if (state?.posts?.length) {
      setPosts(state.posts);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getRoomPosts(roomId)
      .then((data) => {
        if (cancelled) return;
        setPosts(data.posts);
      })
      .catch(() => {
        if (cancelled) return;
        setPosts([]);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomId, state?.posts]);

  const rawNotes = useMemo(
    () => posts.map(communityPostToThoughtNote),
    [posts],
  );

  const seedKey = `shelter-thoughts:${roomId ?? bookId ?? "default"}`;

  const notes = useMemo(
    () => layoutThoughtNotes(rawNotes, seedKey, "mobile"),
    [rawNotes, seedKey],
  );

  const webNotes = useMemo(
    () => layoutThoughtNotes(rawNotes, seedKey, "web"),
    [rawNotes, seedKey],
  );

  const navState = {
    title,
    bookId,
    roomId: roomId ?? undefined,
    posts,
  };

  const onBack = () => navigate(-1);

  const onNoteClick = (thoughtId: string) => {
    const post = posts.find((item) => String(item.postId) === thoughtId);
    if (post?.isMine) {
      const query = new URLSearchParams({ postId: String(post.postId) });
      if (roomId != null) query.set("roomId", String(roomId));
      navigate(`/shelter/thoughts/mine?${query.toString()}`, {
        state: {
          ...navState,
          postId: post.postId,
          body: post.content,
          authorName: post.anonymousNickname,
        },
      });
      return;
    }
    const query = roomId != null ? `?roomId=${roomId}` : "";
    navigate(`/shelter/thoughts/${thoughtId}${query}`, { state: navState });
  };

  const onWrite = () => {
    const query = roomId != null ? `?roomId=${roomId}` : "";
    navigate(`/shelter/thoughts/write${query}`, { state: navState });
  };

  if (loading) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] items-center justify-center bg-[#f7f8fc]">
        <p className="text-body1 text-gray-500">사유를 불러오는 중…</p>
      </main>
    );
  }

  if (loadError && roomId == null) {
    return (
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col items-center justify-center gap-4 bg-[#f7f8fc] px-5">
        <p className="text-body1 text-gray-600">방을 찾을 수 없어요.</p>
        <button
          type="button"
          className="text-button1 text-primary-500"
          onClick={() => navigate("/shelter")}
        >
          쉼터로 돌아가기
        </button>
      </main>
    );
  }

  if (rawNotes.length === 0) {
    return (
      <ShelterThoughtsEmpty title={title} onBack={onBack} onWrite={onWrite} />
    );
  }

  return (
    <ShelterThoughtsBoard
      title={title}
      notes={notes}
      webNotes={webNotes}
      onBack={onBack}
      onNoteClick={onNoteClick}
    />
  );
}
