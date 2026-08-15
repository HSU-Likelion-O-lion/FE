import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateMe, uploadProfileImage } from "../../api";
import Button from "../Button";
import Input from "../Input";
import defaultAvatarEdit from "../../assets/profile/avatar-edit.png";

/** 웹 우측 패널 — 프로필 수정 (Figma 714:4815) */
export default function ProfileEditPanel() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarEdit);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setNickname(me.nickname);
        setEmail(me.email);
        setAvatarUrl(me.profileImageUrl ?? defaultAvatarEdit);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await updateMe(trimmed);
      if (pendingFile) {
        const result = await uploadProfileImage(pendingFile);
        setAvatarUrl(result.profileImageUrl);
        setPendingFile(null);
      }
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "프로필을 저장하지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col items-center px-5 pb-10 pt-[26px]">
      <h1 className="w-full max-w-[471px] text-center text-[22px] font-semibold leading-[1.5] tracking-[-0.025em] text-gray-900">
        프로필 수정
      </h1>

      <button
        type="button"
        className="mt-[48px] size-[122px] shrink-0 overflow-hidden rounded-full"
        aria-label="프로필 사진 변경"
        onClick={() => fileInputRef.current?.click()}
      >
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setPendingFile(file);
          setAvatarUrl(URL.createObjectURL(file));
        }}
      />

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
            <span className="truncate text-body1 text-gray-900">{email}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 w-full max-w-[353px]">
        <Button
          text={saving ? "저장 중…" : "저장하기"}
          variant="primary"
          size="h-[54px] w-full px-5 py-3"
          onClick={() => {
            void handleSave();
          }}
        />
      </div>
    </div>
  );
}
