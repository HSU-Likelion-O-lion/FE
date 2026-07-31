import { useState, type ChangeEvent } from "react";
import Button from "../Button";
import Input from "../Input";

const MAX_LENGTH = 100;

type PauseDetailFormProps = {
  onSubmit: (text: string) => void;
  placeholder?: string;
};

/** 일시정지 사유 — 자연어 상세 입력 */
export default function PauseDetailForm({
  onSubmit,
  placeholder = "(예시: 내용이 너무 어려워요, 문체가 안 맞아요)",
}: PauseDetailFormProps) {
  const [text, setText] = useState("");
  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0;

  return (
    <div className="flex flex-col">
      <Input
        multiline
        value={text}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setText(e.target.value.slice(0, MAX_LENGTH));
        }}
      />

      <p className="mt-1.5 text-right text-caption text-gray-300">
        ({text.length}/{MAX_LENGTH})
      </p>

      <Button
        text="제출하기"
        variant="primary"
        disabled={!canSubmit}
        size="mt-3 h-[48px] w-full px-5 py-3"
        onClick={() => {
          if (!canSubmit) return;
          onSubmit(trimmed);
        }}
      />
    </div>
  );
}
