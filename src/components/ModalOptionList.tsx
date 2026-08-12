import { useState } from "react";
import iconArrowRight from "../assets/mate/icon-arrow-right.svg";

export type ModalOption = {
  id: string;
  label: string;
};

type ModalOptionListProps = {
  options: ModalOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

/** Modal(variant="default") children용 선택 리스트 — 선택 시 화살표 */
export default function ModalOptionList({
  options,
  selectedId,
  onSelect,
}: ModalOptionListProps) {
  return (
    <div className="flex flex-col gap-3 min-[431px]:gap-[22px]">
      {options.map((option) => {
        const selected = selectedId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`btn h-[56px] w-full gap-2 px-5 py-3 text-left min-[431px]:h-[54px] ${
              selected
                ? "btn-active justify-between"
                : "btn-default justify-start"
            }`}
          >
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            {selected && (
              <span className="flex size-6 shrink-0 items-center justify-center">
                <img
                  src={iconArrowRight}
                  alt=""
                  className="h-[13.5px] w-[7.5px] object-contain"
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export const PAUSE_REASON_OPTIONS: ModalOption[] = [
  { id: "wrong-book", label: "저와는 맞지 않는 책이에요." },
  { id: "notification", label: "스마트폰 알림이 울려서요." },
  { id: "ebook", label: "전자책 기기로 바꿔서 읽었어요." },
  { id: "other", label: "기타" },
];

/** 선택 상태를 가지는 일시정지 사유 리스트 */
export function PauseReasonOptions({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <ModalOptionList
      options={PAUSE_REASON_OPTIONS}
      selectedId={selectedId}
      onSelect={(id) => {
        setSelectedId(id);
        window.setTimeout(() => onSelect(id), 180);
      }}
    />
  );
}
