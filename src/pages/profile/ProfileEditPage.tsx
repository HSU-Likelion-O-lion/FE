import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import avatarEdit from "../../assets/profile/avatar-edit.png";
import iconCameraEdit from "../../assets/profile/icon-camera-edit.svg";
import iconKakao from "../../assets/profile/icon-kakao.svg";

const INITIAL_NICKNAME = "지훈";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(INITIAL_NICKNAME);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white">
      <header className="flex shrink-0 flex-col px-5 pt-5">
        <div className="flex h-11 items-center justify-center">
          <h1 className="w-full text-center text-h3 text-gray-900">
            프로필 수정
          </h1>
        </div>
      </header>

      <section className="mt-10 flex flex-col items-center">
        <div className="relative size-[122px]">
          <img
            src={avatarEdit}
            alt=""
            className="size-full rounded-full object-cover"
          />
          <button
            type="button"
            aria-label="프로필 사진 변경"
            className="absolute -bottom-1 -right-1 size-[42px]"
          >
            <img
              src={iconCameraEdit}
              alt=""
              className="size-full object-contain"
            />
          </button>
        </div>
      </section>

      <section className="mt-10 flex flex-col gap-[29px] px-5">
        <div className="flex flex-col gap-[6px]">
          <label
            htmlFor="nickname"
            className="text-body2 leading-[23px] text-gray-800"
          >
            닉네임
          </label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력해주세요."
            className="font-semibold"
          />
        </div>

        <div className="flex flex-col gap-[6px]">
          <p className="text-body2 leading-[23px] text-gray-800">연동된 계정</p>
          <div className="flex h-[54px] w-full items-center gap-3 rounded-[var(--radius-input)] border border-solid border-gray-100 px-5">
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden">
              <img
                src={iconKakao}
                alt=""
                className="size-full object-contain"
              />
            </span>
            <span className="truncate text-body1 text-gray-900">
              카카오 계정으로 연동됨
            </span>
          </div>
        </div>
      </section>

      <div className="mt-auto px-5 pb-[calc(32px+env(safe-area-inset-bottom))] pt-10">
        <Button
          text="저장하기"
          variant="primary"
          className="h-[54px] w-full"
          onClick={() => navigate("/profile")}
        />
      </div>
    </main>
  );
}
