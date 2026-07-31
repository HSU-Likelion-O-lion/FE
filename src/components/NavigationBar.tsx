import { useState } from "react";
import { useNavigate } from "react-router-dom";
import libraryActive from "../assets/nav/library-active.svg";
import libraryInactive from "../assets/nav/library-inactive.svg";
import drawerActive from "../assets/nav/drawer-active.svg";
import drawerInactive from "../assets/nav/drawer-inactive.svg";
import shelterActive from "../assets/nav/shelter-active.svg";
import shelterInactive from "../assets/nav/shelter-inactive.svg";
import profileActive from "../assets/nav/profile-active.svg";
import profileInactive from "../assets/nav/profile-inactive.svg";
import centerIcon from "../assets/nav/center-icon.svg";

export type NavTab = "library" | "drawer" | "center" | "shelter" | "profile";

/** 탭별 경로 — 아직 없는 페이지는 생략 */
const TAB_PATHS: Partial<Record<NavTab, string>> = {
  center: "/mate",
};

type NavigationBarProps = {
  active: NavTab;
  className?: string;
  onChange?: (tab: NavTab) => void;
};

const tabs = [
  {
    id: "drawer" as const,
    label: "서랍",
    activeIcon: drawerActive,
    inactiveIcon: drawerInactive,
  },
  {
    id: "library" as const,
    label: "서재",
    activeIcon: libraryActive,
    inactiveIcon: libraryInactive,
  },
  {
    id: "shelter" as const,
    label: "쉼터",
    activeIcon: shelterActive,
    inactiveIcon: shelterInactive,
  },
  {
    id: "profile" as const,
    label: "프로필",
    activeIcon: profileActive,
    inactiveIcon: profileInactive,
  },
];

function NavItem({
  label,
  activeIcon,
  inactiveIcon,
  highlighted,
  onClick,
  onHoverChange,
}: {
  label: string;
  activeIcon: string;
  inactiveIcon: string;
  highlighted: boolean;
  onClick?: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
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
          src={inactiveIcon}
          alt=""
          className={`absolute inset-0 size-full object-contain transition-opacity ${
            highlighted ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={activeIcon}
          alt=""
          className={`absolute inset-0 size-full object-contain transition-opacity ${
            highlighted ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
      <span
        className={`flex h-4.5 items-center justify-center whitespace-nowrap text-caption ${
          highlighted ? "text-primary-500" : "text-gray-900"
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
  onChange,
}: NavigationBarProps) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<NavTab | null>(null);

  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const isOn = (tab: NavTab) => active === tab || hovered === tab;

  const handleTabClick = (tab: NavTab) => {
    onChange?.(tab);
    const path = TAB_PATHS[tab];
    if (path) navigate(path);
  };

  return (
    <nav
      className={`relative mx-auto grid w-full max-w-[430px] grid-cols-5 items-center bg-white ${className}`}
      aria-label="하단 내비게이션"
    >
      {leftTabs.map((tab) => (
        <NavItem
          key={tab.id}
          label={tab.label}
          activeIcon={tab.activeIcon}
          inactiveIcon={tab.inactiveIcon}
          highlighted={isOn(tab.id)}
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
          highlighted={isOn(tab.id)}
          onClick={() => handleTabClick(tab.id)}
          onHoverChange={(isHovered) => setHovered(isHovered ? tab.id : null)}
        />
      ))}
    </nav>
  );
}
