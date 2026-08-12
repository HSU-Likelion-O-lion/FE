import { useNavigate } from "react-router-dom";
import logoDark from "../assets/common/logo-dark.svg";
import logoWhite from "../assets/common/logo-white.svg";
import iconUser from "../assets/web/gnb-user.svg";
import type { NavTab } from "./NavigationBar";

const TAB_PATHS: Partial<Record<NavTab, string>> = {
  drawer: "/drawer",
  library: "/library",
  center: "/mate",
  shelter: "/shelter",
  profile: "/profile",
};

type WebGnbProps = {
  active: NavTab;
  /** light: 흰 배경 / dark: 집중모드 등 어두운 풀블리드 */
  tone?: "light" | "dark";
  className?: string;
  onChange?: (tab: NavTab) => void;
};

const TEXT_TABS: {
  id: Exclude<NavTab, "profile" | "center"> | "center";
  label: string;
}[] = [
  { id: "drawer", label: "서랍" },
  { id: "library", label: "서재" },
  { id: "center", label: "메이트" },
  { id: "shelter", label: "쉼터" },
];

const tabClass =
  "relative flex h-full min-w-0 flex-1 items-center justify-center px-1 text-[15px] tracking-[-0.025em] min-[768px]:flex-none min-[768px]:w-[100px] min-[768px]:px-0 min-[768px]:text-[16px] min-[1024px]:w-[120px] min-[1024px]:text-[17.6px]";

/**
 * 웹(≥431px) 상단 GNB — Figma 739:5354
 * 모바일에서는 CSS로 숨기고, 하단 NavigationBar를 사용한다.
 */
export default function WebGnb({
  active,
  tone = "light",
  className = "",
  onChange,
}: WebGnbProps) {
  const navigate = useNavigate();
  const isDark = tone === "dark";

  const handleTab = (tab: NavTab) => {
    onChange?.(tab);
    const path = TAB_PATHS[tab];
    if (path) navigate(path);
  };

  return (
    <header
      className={`hidden h-[76px] w-full shrink-0 items-center justify-between gap-3 px-4 min-[431px]:flex min-[768px]:gap-6 min-[768px]:px-8 min-[1024px]:px-40 ${
        isDark ? "bg-transparent" : "bg-white"
      } ${className}`}
      aria-label="상단 내비게이션"
    >
      <button
        type="button"
        aria-label="쓰담 홈"
        onClick={() => handleTab("center")}
        className="flex h-[28px] w-[41px] shrink-0 items-center min-[768px]:h-[34px] min-[768px]:w-[50px]"
      >
        <img
          src={isDark ? logoWhite : logoDark}
          alt="쓰담"
          className="h-full w-full object-contain object-left"
        />
      </button>

      <nav
        className="flex h-full min-w-0 flex-1 items-stretch justify-end gap-0 min-[768px]:flex-none min-[768px]:gap-1 min-[1024px]:gap-2"
        aria-label="주요 메뉴"
      >
        {TEXT_TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleTab(tab.id)}
              className={`${tabClass} ${
                isActive
                  ? isDark
                    ? "font-bold text-white"
                    : "font-bold text-[#444]"
                  : isDark
                    ? "font-medium text-primary-200"
                    : "font-medium text-[#444]"
              }`}
            >
              {tab.label}
              {isActive ? (
                <span
                  className={`absolute bottom-0 left-1/2 h-[3px] w-[min(100%,72px)] -translate-x-1/2 rounded-t-[3px] min-[1024px]:w-[100px] ${
                    isDark ? "bg-white" : "bg-primary-500"
                  }`}
                />
              ) : null}
            </button>
          );
        })}

        <button
          type="button"
          aria-label="프로필"
          aria-current={active === "profile" ? "page" : undefined}
          onClick={() => handleTab("profile")}
          className={tabClass}
        >
          <span
            className={`flex items-center justify-center ${
              active === "profile" && !isDark
                ? "size-10 rounded-full bg-primary-50"
                : ""
            }`}
          >
            <img
              src={iconUser}
              alt=""
              className={`size-6 object-contain min-[768px]:size-7 ${
                isDark ? "brightness-0 invert" : ""
              }`}
            />
          </span>
          {active === "profile" && isDark ? (
            <span className="absolute bottom-0 left-1/2 h-[3px] w-[min(100%,72px)] -translate-x-1/2 rounded-t-[3px] bg-white min-[1024px]:w-[100px]" />
          ) : null}
        </button>
      </nav>
    </header>
  );
}
