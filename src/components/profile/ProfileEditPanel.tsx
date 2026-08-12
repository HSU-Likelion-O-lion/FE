import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button";
import Input from "../Input";
import avatarEdit from "../../assets/profile/avatar-edit.png";
import { PROFILE_MOCK_USER } from "./ProfileWebShell";

const INITIAL_NICKNAME = PROFILE_MOCK_USER.name;

/** 웹 우측 패널 — 프로필 수정 (Figma 714:4815) */
export default function ProfileEditPanel() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(INITIAL_NICKNAME);

  return (
    <div className="flex min-h-full flex-col items-center px-5 pb-10 pt-[26px]">
      <h1 className="w-full max-w-[471px] text-center text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
        프로필 수정
      </h1>

      <div className="mt-[48px] size-[122px] shrink-0 overflow-hidden rounded-full">
        <img
          src={avatarEdit}
          alt=""
          className="size-full object-cover"
        />
      </div>

      <div className="mt-10 flex w-full max-w-[353px] flex-col gap-[29px]">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="web-nickname"
            className="text-body2 leading-[1.6] text-gray-800"
          >
            닉네임
          </label>
          <Input
            id="web-nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력해주세요."
            className="font-semibold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-body2 leading-[1.6] text-gray-800">연동된 계정</p>
          <div className="flex h-[54px] w-full items-center rounded-2xl border border-solid border-gray-100 px-5">
            <span className="truncate text-body1 text-gray-900">
              {PROFILE_MOCK_USER.email}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10 w-full max-w-[353px]">
        <Button
          text="저장하기"
          variant="primary"
          size="h-[54px] w-full px-5 py-3"
          onClick={() => navigate("/profile")}
        />
      </div>
    </div>
  );
}
