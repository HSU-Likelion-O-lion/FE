import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ProfileSubLayout from "../../components/profile/ProfileSubLayout";
import Toggle from "../../components/Toggle";
import iconArrowRight from "../../assets/mate/icon-arrow-right.svg";

const INQUIRY_TYPES = [
  "서비스 이용 문의",
  "계정 및 로그인",
  "독서 기록 오류",
  "기타 문의",
] as const;

export default function InquiryPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [notify, setNotify] = useState(false);

  return (
    <ProfileSubLayout
      title="1:1 문의 / 피드백"
      footer={
        <div className="flex flex-col gap-1 px-5 pb-[calc(32px+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between py-3">
            <span className="text-body1 text-gray-900">
              앱으로 답변 알림 받기
            </span>
            <Toggle
              checked={notify}
              onChange={setNotify}
              aria-label="앱으로 답변 알림 받기"
            />
          </div>
          <Button
            text="저장하기"
            variant="primary"
            className="h-[54px] w-full"
            onClick={() => navigate(-1)}
          />
        </div>
      }
    >
      <section className="flex flex-col gap-3 px-5 pt-5">
        <div className="relative z-10 h-[54px]">
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
              <span className="text-body2 leading-[23px] text-gray-800">
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

        <p className="text-caption leading-[18px] text-gray-400">
          ReadMate를 사용하시며 불편했던 점이나
          <br />
          추가되었으면 하는 기능을 편하게 알려주세요.
        </p>

        <div className="relative z-0">
          <Input
            multiline
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 300))}
            placeholder="내용을 입력해주세요"
          />
          <span className="pointer-events-none absolute right-5 bottom-3 text-caption leading-[18px] text-gray-300">
            ({content.length}/300)
          </span>
        </div>
      </section>
    </ProfileSubLayout>
  );
}
