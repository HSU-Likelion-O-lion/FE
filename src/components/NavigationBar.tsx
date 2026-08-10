import { useState } from "react";
import { useNavigate } from "react-router-dom";
import libraryActive from "../assets/nav/library-active.svg";
import libraryInactive from "../assets/nav/library-inactive.svg";
import libraryDark from "../assets/nav/library-dark.svg";
import drawerActive from "../assets/nav/drawer-active.svg";
import drawerInactive from "../assets/nav/drawer-inactive.svg";
import drawerDark from "../assets/nav/drawer-dark.svg";
import shelterActive from "../assets/nav/shelter-active.svg";
import shelterInactive from "../assets/nav/shelter-inactive.svg";
import shelterDark from "../assets/nav/shelter-dark.svg";
import profileActive from "../assets/nav/profile-active.svg";
import profileInactive from "../assets/nav/profile-inactive.svg";
import profileDark from "../assets/nav/profile-dark.svg";
import centerIcon from "../assets/nav/center-icon.svg";

export type NavTab = "library" | "drawer" | "center" | "shelter" | "profile";

const TAB_PATHS: Partial<Record<NavTab, string>> = {
  drawer: "/drawer",
  center: "/mate",
  shelter: "/shelter",
  profile: "/profile",
};

type NavigationBarProps = {
  active: NavTab;
  className?: string;
  /** light: 흰 배경 페이지 / dark: 서랍처럼 어두운 풀블리드 페이지 */
  tone?: "light" | "dark";
  onChange?: (tab: NavTab) => void;
};

type TabDef = {
  id: Exclude<NavTab, "center">;
  label: string;
  activeIcon: string;
  inactiveIcon: string;
  darkIcon: string;
  /** dark 아이콘이 이미 활성(흰색) 스타일인지 — 서랍 탭 */
  darkIconIsActive?: boolean;
};

const tabs: TabDef[] = [
  {
    id: "drawer",
    label: "서랍",
    activeIcon: drawerActive,
    inactiveIcon: drawerInactive,
    darkIcon: drawerDark,
    darkIconIsActive: true,
  },
  {
    id: "library",
    label: "서재",
    activeIcon: libraryActive,
    inactiveIcon: libraryInactive,
    darkIcon: libraryDark,
  },
  {
    id: "shelter",
    label: "쉼터",
    activeIcon: shelterActive,
    inactiveIcon: shelterInactive,
    darkIcon: shelterDark,
  },
  {
    id: "profile",
    label: "프로필",
    activeIcon: profileActive,
    inactiveIcon: profileInactive,
    darkIcon: profileDark,
  },
];

function NavItem({
  label,
  activeIcon,
  inactiveIcon,
  darkIcon,
  darkIconIsActive = false,
  highlighted,
  tone,
  onClick,
  onHoverChange,
}: {
  label: string;
  activeIcon: string;
  inactiveIcon: string;
  darkIcon: string;
  darkIconIsActive?: boolean;
  highlighted: boolean;
  tone: "light" | "dark";
  onClick?: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const isDark = tone === "dark";

  const inactiveSrc = isDark
    ? darkIconIsActive
      ? inactiveIcon
      : darkIcon
    : inactiveIcon;
  const activeSrc = isDark ? darkIcon : activeIcon;

  const inactiveClass = highlighted
    ? "opacity-0"
    : isDark && darkIconIsActive
      ? "opacity-70 brightness-0 invert"
      : "opacity-100";

  const activeClass = highlighted
    ? isDark && !darkIconIsActive
      ? "opacity-100 brightness-0 invert"
      : "opacity-100"
    : "opacity-0";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className="flex h-16 w-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden px-1 py-2"
    >
      <span className="relative size-[26px] shrink-0">
        <img
          src={inactiveSrc}
          alt=""
          className={`absolute inset-0 size-full object-contain transition-opacity ${inactiveClass}`}
        />
        <img
          src={activeSrc}
          alt=""
          className={`absolute inset-0 size-full object-contain transition-opacity ${activeClass}`}
        />
      </span>
      <span
        className={`flex h-4.5 items-center justify-center whitespace-nowrap text-caption ${
          isDark
            ? highlighted
              ? "text-white"
              : "text-primary-400"
            : highlighted
              ? "text-primary-500"
              : "text-gray-900"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function NavigationBar({
  active,
  className = "",
  tone = "light",
  onChange,
}: NavigationBarProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<NavTab | null>(null);

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const isOn = (tab: NavTab) => active === tab || hovered === tab;
  const isDark = tone === "dark";

  const handleTabClick = (tab: NavTab) => {
    onChange?.(tab);
    const path = TAB_PATHS[tab];
    if (path) navigate(path);
  };

  return (
    <nav
      className={`relative mx-auto grid w-full max-w-[430px] grid-cols-5 items-center ${
        isDark ? "bg-transparent" : "bg-white"
      } ${className}`}
      aria-label="하단 내비게이션"
    >
      {leftTabs.map((tab) => (
        <NavItem
          key={tab.id}
          label={tab.label}
          activeIcon={tab.activeIcon}
          inactiveIcon={tab.inactiveIcon}
          darkIcon={tab.darkIcon}
          darkIconIsActive={tab.darkIconIsActive}
          highlighted={isOn(tab.id)}
          tone={tone}
          onClick={() => handleTabClick(tab.id)}
          onHoverChange={(isHovered) => setHovered(isHovered ? tab.id : null)}
        />
      ))}

      <div className="relative h-16 w-full min-w-0">
        {isOn("center") && (
          <span className="absolute bottom-[10px] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#172793]" />
        )}
        <button
          type="button"
          aria-label="메이트"
          aria-current={active === "center" ? "page" : undefined}
          onClick={() => handleTabClick("center")}
          onMouseEnter={() => setHovered("center")}
          onMouseLeave={() => setHovered(null)}
          className="absolute left-1/2 top-[-14px] flex size-[54px] -translate-x-1/2 items-center justify-center rounded-full bg-linear-to-b from-primary-500 to-[#0D1E8D]"
        >
          <img src={centerIcon} alt="" className="size-[26px] object-contain" />
        </button>
      </div>

      {rightTabs.map((tab) => (
        <NavItem
          key={tab.id}
          label={tab.label}
          activeIcon={tab.activeIcon}
          inactiveIcon={tab.inactiveIcon}
          darkIcon={tab.darkIcon}
          darkIconIsActive={tab.darkIconIsActive}
          highlighted={isOn(tab.id)}
          tone={tone}
          onClick={() => handleTabClick(tab.id)}
          onHoverChange={(isHovered) => setHovered(isHovered ? tab.id : null)}
        />
      ))}
    </nav>
  );
}
