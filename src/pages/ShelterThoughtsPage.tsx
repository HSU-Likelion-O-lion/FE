import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShelterThoughtsBoard from "../components/shelter/ShelterThoughtsBoard";
import ShelterThoughtsEmpty from "../components/shelter/ShelterThoughtsEmpty";
import {
  createMockThoughtNotes,
  layoutThoughtNotes,
} from "../data/shelterThoughtsMock";

type ThoughtsLocationState = {
  title?: string;
  bookId?: string;
};

/** API 연동 전 — 0이면 빈 화면(줌 없음), 20이면 맵 보드 */
const MOCK_THOUGHT_COUNT = 20;

export default function ShelterThoughtsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ThoughtsLocationState | null) ?? null;
  const title = state?.title ?? "불안을 이기는 철학";
  const bookId = state?.bookId ?? "default";

  const rawNotes = useMemo(
    () => createMockThoughtNotes(MOCK_THOUGHT_COUNT),
    [],
  );

  const notes = useMemo(
    () => layoutThoughtNotes(rawNotes, `shelter-thoughts:${bookId}`),
    [rawNotes, bookId],
  );

  const onBack = () => navigate(-1);

  const onNoteClick = (thoughtId: string) => {
    navigate(`/shelter/thoughts/${thoughtId}`, {
      state: { title, bookId },
    });
  };

  if (rawNotes.length === 0) {
    return <ShelterThoughtsEmpty title={title} onBack={onBack} />;
  }

  return (
    <ShelterThoughtsBoard
      title={title}
      notes={notes}
      onBack={onBack}
      onNoteClick={onNoteClick}
    />
  );
}
