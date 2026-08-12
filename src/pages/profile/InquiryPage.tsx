import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ProfileSubLayout from "../../components/profile/ProfileSubLayout";
import Toggle from "../../components/Toggle";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import iconArrowRight from "../../assets/mate/icon-arrow-right.svg";

const INQUIRY_TYPES = [
  "서비스 이용 문의",
  "계정 및 로그인",
  "독서 기록 오류",
  "기타 문의",
] as const;

const MAX_LENGTH = 300;

/** 1:1 문의/피드백 — 모바일 / 웹 715:5672 */
export default function InquiryPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [notify, setNotify] = useState(false);

  const typeSelect = (
    <div className={`relative z-10 ${isDesktop ? "h-[54px]" : "h-[54px]"}`}>
      <div
        className={`absolute inset-x-0 top-0 overflow-hidden rounded-2xl border border-gray-100 bg-white ${
          open ? "z-20" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-[54px] w-full items-center justify-between px-5"
        >
          <span
            className={`text-body2 leading-[23px] ${
              selectedType ? "text-gray-800" : "text-gray-300"
            }`}
          >
            {selectedType ?? "문의 유형을 선택하세요."}
          </span>
          <img
            src={iconArrowRight}
            alt=""
            className={`h-[13.5px] w-[7.5px] object-contain transition-transform ${
              open ? "-rotate-90" : "rotate-90"
            }`}
          />
        </button>

        {open &&
          INQUIRY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSelectedType(type);
                setOpen(false);
              }}
              className="flex h-[54px] w-full items-center border-t border-gray-100 px-5 text-left text-body2 leading-[23px] text-gray-800"
            >
              {type}
            </button>
          ))}
      </div>
    </div>
  );

  const notifyRow = (
    <div
      className={`flex items-center justify-between ${
        isDesktop ? "h-[60px] py-[14px]" : "py-3"
      }`}
    >
      <span
        className={
          isDesktop
            ? "text-[18px] leading-[1.6] tracking-[-0.025em] text-gray-700"
            : "text-body1 text-gray-900"
        }
      >
        앱으로 답변 알림 받기
      </span>
      <Toggle
        size={isDesktop ? "web" : "mobile"}
        checked={notify}
        onChange={setNotify}
        aria-label="앱으로 답변 알림 받기"
      />
    </div>
  );

  const saveButton = (
    <Button
      text="저장하기"
      variant="primary"
      size={
        isDesktop
          ? "h-[54px] w-full max-w-[393px] px-5 py-3"
          : "h-[54px] w-full px-5 py-3"
      }
      className={isDesktop ? "mx-auto" : undefined}
      onClick={() => navigate(-1)}
    />
  );

  if (isDesktop) {
    return (
      <ProfileSubLayout title="1:1 문의/피드백">
        <div className="mx-auto flex w-full max-w-[727px] flex-col px-8 pb-12 pt-4">
          {typeSelect}

          <p className="mt-5 text-caption leading-[18px] text-gray-400">
            쓰담을 사용하시며 불편했던 점이나
            <br />
            추가되었으면 하는 기능을 편하게 알려주세요.
          </p>

          <div className="relative z-0 mt-5">
            <Input
              multiline
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="내용을 입력해주세요"
              className="min-h-[128px]"
            />
            <p className="mt-1 text-right text-caption leading-[18px] text-[#8e8b7e]">
              ({content.length}/{MAX_LENGTH})
            </p>
          </div>

          {/* 토글: 폼 너비 기준 좌 라벨 / 우 끝 */}
          <div className="mt-6 w-full">{notifyRow}</div>

          {/* 저장하기: 393px 중앙 (Figma 715:5874) */}
          <div className="mt-8 flex w-full justify-center">{saveButton}</div>
        </div>
      </ProfileSubLayout>
    );
  }

  return (
    <ProfileSubLayout
      title="1:1 문의 / 피드백"
      footer={
        <div className="flex flex-col gap-1 px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
          {notifyRow}
          {saveButton}
        </div>
      }
    >
      <section className="flex flex-col gap-3 px-5 pt-5">
        {typeSelect}

        <p className="text-caption leading-[18px] text-gray-400">
          쓰담을 사용하시며 불편했던 점이나
          <br />
          추가되었으면 하는 기능을 편하게 알려주세요.
        </p>

        <div className="relative z-0">
          <Input
            multiline
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="내용을 입력해주세요"
          />
          <span className="pointer-events-none absolute right-5 bottom-3 text-caption leading-[18px] text-gray-300">
            ({content.length}/{MAX_LENGTH})
          </span>
        </div>
      </section>
    </ProfileSubLayout>
  );
}
