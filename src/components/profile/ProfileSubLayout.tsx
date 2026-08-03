import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import iconArrowRight from "../../assets/mate/icon-arrow-right.svg";

type ProfileSubLayoutProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  contentClassName?: string;
};

export default function ProfileSubLayout({
  title,
  children,
  footer,
  contentClassName = "",
}: ProfileSubLayoutProps) {
  const navigate = useNavigate();

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white">
      <header className="relative flex h-11 shrink-0 items-center justify-center px-5 pt-4">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="absolute left-5 flex size-6 items-center justify-center"
        >
          <img
            src={iconArrowRight}
            alt=""
            className="h-[13.5px] w-[7.5px] rotate-180 object-contain"
          />
        </button>
        <h1 className="w-full text-center text-h3 text-gray-900">{title}</h1>
      </header>

      <div
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${contentClassName}`}
      >
        {children}
      </div>

      {footer}
    </main>
  );
}
