import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMe, type UserMe } from "../../api";
import WebGnb from "../WebGnb";
import defaultAvatar from "../../assets/profile/avatar.png";
import iconNotification from "../../assets/profile/icon-notification.svg";
import iconAnnouncement from "../../assets/profile/icon-announcement.svg";
import iconInquiry from "../../assets/profile/icon-inquiry.svg";
import iconHelp from "../../assets/profile/icon-help.svg";
import iconPrivacy from "../../assets/profile/icon-privacy.svg";
import iconAppInfo from "../../assets/profile/icon-app-info.svg";
import iconMembership from "../../assets/profile/icon-membership.svg";
import iconArrowRight from "../../assets/mate/icon-arrow-right.svg";

const APP_VERSION = "1.0.0";

type WebMenuItem = {
  id: string;
  label: string;
  icon: string;
  iconSize?: number;
  trailing?: string;
  badge?: boolean;
  path?: string;
};

/** 웹 사이드바 메뉴 — Figma 714:4815 (백업 항목 없음) */
export const PROFILE_WEB_MENU: WebMenuItem[] = [
  {
    id: "membership",
    label: "쓰담 멤버십",
    icon: iconMembership,
    path: "/profile/membership",
  },
  {
    id: "push",
    label: "푸시 알림 설정",
    icon: iconNotification,
    path: "/profile/push",
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

export type ProfileUserView = {
  nickname: string;
  email: string;
  avatarUrl: string;
};

type ProfileWebShellProps = {
  children: ReactNode;
  /** 전달 시 셸 내부 fetch 대신 사용 */
  user?: ProfileUserView | null;
};

function toProfileUserView(me: UserMe): ProfileUserView {
  return {
    nickname: me.nickname,
    email: me.email,
    avatarUrl: me.profileImageUrl ?? defaultAvatar,
  };
}

/** 웹 프로필 공통 셸 — GNB + 좌측 사이드바 + 우측 콘텐츠 (Figma 714:4815) */
export default function ProfileWebShell({
  children,
  user: userProp,
}: ProfileWebShellProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [fetchedUser, setFetchedUser] = useState<ProfileUserView | null>(null);

  useEffect(() => {
    if (userProp !== undefined) return;
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        setFetchedUser(toProfileUserView(me));
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userProp]);

  const user = userProp === undefined ? fetchedUser : userProp;
  const nickname = user?.nickname ?? "";
  const email = user?.email ?? "";
  const avatarUrl = user?.avatarUrl ?? defaultAvatar;

  return (
    <main className="relative mx-auto hidden h-dvh w-full flex-col overflow-hidden bg-[#fdfdff] min-[431px]:flex">
      <div className="shrink-0">
        <WebGnb active="profile" />
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 overflow-hidden px-4 min-[768px]:px-8 min-[1024px]:px-40">
        {/* 좌측 사이드바 */}
        <aside className="flex w-full max-w-[393px] shrink-0 flex-col border-r-2 border-gray-100 py-8">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="relative mb-0 flex w-full items-center gap-3.5 border-b border-gray-100 px-5 pb-5 pt-[19px] text-left"
            aria-label="프로필 수정"
            aria-current={
              pathname === "/profile" || pathname === "/profile/edit"
                ? "page"
                : undefined
            }
          >
            <img
              src={avatarUrl}
              alt=""
              className="size-[60px] shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[18px] font-semibold leading-[1.6] tracking-[-0.025em] text-gray-900">
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

          <nav className="flex flex-col" aria-label="설정 메뉴">
            {PROFILE_WEB_MENU.map((item) => {
              const active = item.path != null && pathname === item.path;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.path) navigate(item.path);
                  }}
                  className={`flex h-[54px] w-full items-center justify-between border-t border-gray-50 px-5 ${
                    active ? "bg-primary-10" : "bg-[#fdfdff]"
                  }`}
                  aria-current={active ? "page" : undefined}
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
                      {item.badge ? (
                        <span
                          aria-hidden
                          className="absolute -right-2.5 top-0 size-1.5 rounded-full bg-primary-400"
                        />
                      ) : null}
                    </span>
                  </span>
                  {item.trailing ? (
                    <span className="text-body2 text-gray-400">
                      {item.trailing}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <p className="mt-auto pt-8 text-center text-caption leading-[18px] text-gray-400">
            앱 버전 {APP_VERSION} (최신버전)
          </p>
        </aside>

        {/* 우측 콘텐츠 — 헤더 아래 스크롤 */}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </main>
  );
}
