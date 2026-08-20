import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, resolveProfileImageUrl } from "../../api";
import NavigationBar from "../../components/NavigationBar";
import ProfileWebShell from "../../components/profile/ProfileWebShell";
import ProfileEditPanel from "../../components/profile/ProfileEditPanel";
import defaultAvatar from "../../assets/profile/avatar.png";
import iconNotification from "../../assets/profile/icon-notification.svg";
import iconCloudSync from "../../assets/profile/icon-cloud-sync.svg";
import iconAnnouncement from "../../assets/profile/icon-announcement.svg";
import iconInquiry from "../../assets/profile/icon-inquiry.svg";
import iconHelp from "../../assets/profile/icon-help.svg";
import iconPrivacy from "../../assets/profile/icon-privacy.svg";
import iconAppInfo from "../../assets/profile/icon-app-info.svg";
import iconMembership from "../../assets/profile/icon-membership.svg";
import iconArrowRight from "../../assets/mate/icon-arrow-right.svg";

const APP_VERSION = "1.0.0";

type MenuItem = {
  id: string;
  label: string;
  icon: string;
  iconSize?: number;
  trailing?: string;
  badge?: boolean;
  path?: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "membership",
    label: "쓰담 멤버십",
    icon: iconMembership,
    path: "/profile/membership",
  },
  {
    id: "notice",
    label: "공지사항",
    icon: iconAnnouncement,
    badge: true,
    path: "/profile/notice",
  },
  {
    id: "inquiry",
    label: "1:1 문의 / 피드백",
    icon: iconInquiry,
    path: "/profile/inquiry",
  },
  {
    id: "push",
    label: "푸시 알림 설정",
    icon: iconNotification,
    path: "/profile/push",
  },
  {
    id: "backup",
    label: "데이터 백업 및 동기화",
    icon: iconCloudSync,
    trailing: "연동됨",
    path: "/profile/backup",
  },
  {
    id: "terms",
    label: "이용약관",
    icon: iconHelp,
    path: "/profile/terms",
  },
  {
    id: "privacy",
    label: "개인정보처리방침",
    icon: iconPrivacy,
    path: "/profile/privacy",
  },
  {
    id: "app",
    label: "앱 관리",
    icon: iconAppInfo,
    iconSize: 20,
    trailing: APP_VERSION,
  },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setNickname(me.nickname);
        setEmail(me.email);
        setAvatarUrl(resolveProfileImageUrl(me.profileImageUrl, defaultAvatar));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* —— 모바일 —— */}
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white pb-[97px] min-[431px]:hidden">
        <header className="flex shrink-0 flex-col px-5 pt-5">
          <div className="flex h-11 items-center justify-center">
            <h1 className="w-full text-center text-h3 text-gray-900">
              {nickname ? `${nickname}님의 프로필` : "프로필"}
            </h1>
          </div>
        </header>

        <section className="mt-5 border-b border-gray-100">
          <button
            type="button"
            onClick={() => navigate("/profile/edit")}
            className="relative mb-[34px] flex w-full items-center gap-3.5 px-5 pb-5 pt-[19px] text-left"
            aria-label="프로필 수정"
          >
            <img
              src={avatarUrl}
              alt=""
              className="size-[60px] shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-h3 text-gray-900">
                {nickname ? `${nickname}님` : " "}
              </p>
              <p className="mt-0.5 truncate text-body1 text-gray-500">{email}</p>
            </div>
            <span className="flex size-6 shrink-0 items-center justify-center">
              <img
                src={iconArrowRight}
                alt=""
                className="h-[13.5px] w-[7.5px] object-contain"
              />
            </span>
          </button>
        </section>

        <section
          className="flex flex-col border-b border-gray-50"
          aria-label="설정 메뉴"
        >
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.path) navigate(item.path);
              }}
              className="flex h-14 w-full items-center justify-between border-t border-gray-50 px-5"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex shrink-0 items-center justify-center overflow-hidden ${
                    item.iconSize === 20 ? "size-5" : "size-6"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="size-full object-contain"
                  />
                </span>
                <span className="relative text-body2 text-gray-900">
                  {item.label}
                  {item.badge && (
                    <span
                      aria-hidden
                      className="absolute -right-2.5 top-0 size-1.5 rounded-full bg-primary-400"
                    />
                  )}
                </span>
              </span>
              {item.trailing && (
                <span className="text-body2 text-gray-400">{item.trailing}</span>
              )}
            </button>
          ))}
        </section>

        <p className="mt-auto pt-8 pb-4 text-center text-caption leading-[18px] text-gray-400">
          앱 버전 {APP_VERSION} (최신버전)
        </p>

        <div className="fixed inset-x-0 bottom-0 z-50 bg-white pb-[env(safe-area-inset-bottom)] drop-shadow-[0_-4px_4.05px_rgba(38,39,43,0.04)]">
          <NavigationBar active="profile" />
        </div>
      </main>

      {/* —— 웹: Figma 714:4815 —— */}
      <ProfileWebShell
        user={
          nickname
            ? { nickname, email, avatarUrl }
            : null
        }
      >
        <ProfileEditPanel />
      </ProfileWebShell>
    </>
  );
}
