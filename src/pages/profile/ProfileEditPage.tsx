import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getMe, resolveProfileImageUrl, updateMe, uploadProfileImage } from "../../api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import defaultAvatarEdit from "../../assets/profile/avatar-edit.png";
import iconCameraEdit from "../../assets/profile/icon-camera-edit.svg";
import iconKakao from "../../assets/profile/icon-kakao.svg";
import iconArrowRight from "../../assets/mate/icon-arrow-right.svg";

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatarEdit);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isDesktop) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setNickname(me.nickname);
        setAvatarUrl(
          resolveProfileImageUrl(me.profileImageUrl, defaultAvatarEdit),
        );
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDesktop]);

  // 웹에서는 프로필 홈 우측 패널이 수정 화면
  if (isDesktop) {
    return <Navigate to="/profile" replace />;
  }

  const handleSave = async () => {
    const trimmed = nickname.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      await updateMe(trimmed);
      if (pendingFile) {
        await uploadProfileImage(pendingFile);
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
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white">
      <header className="relative flex shrink-0 flex-col px-5 pt-5">
        <div className="relative flex h-11 w-full items-center justify-center">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate(-1)}
            className="absolute left-0 flex size-6 items-center justify-center"
          >
            <img
              src={iconArrowRight}
              alt=""
              className="h-[13.5px] w-[7.5px] rotate-180 object-contain"
            />
          </button>
          <h1 className="w-full text-center text-h3 text-gray-900">
            프로필 수정
          </h1>
        </div>
      </header>

      <section className="mt-10 flex flex-col items-center">
        <div className="relative size-[122px]">
          <img
            src={avatarUrl}
            alt=""
            className="size-full rounded-full object-cover"
          />
          <button
            type="button"
            aria-label="프로필 사진 변경"
            className="absolute -bottom-1 -right-1 size-[42px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={iconCameraEdit}
              alt=""
              className="size-full object-contain"
            />
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
          text={saving ? "저장 중…" : "저장하기"}
          variant="primary"
          className="h-[54px] w-full"
          onClick={() => {
            void handleSave();
          }}
        />
      </div>
    </main>
  );
}
