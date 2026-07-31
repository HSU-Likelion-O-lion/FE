import type { ReactNode } from "react";
import iconModalClose from "../assets/mate/icon-modal-close.svg";

type ModalProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  /**
   * default: 좌측 정렬 + X 버튼
   * alert: 아이콘 + 가운데 정렬 안내창
   */
  variant?: "default" | "alert";
  /** alert에서 상단에 노출할 아이콘 경로 */
  iconSrc?: string;
  /** 딤 클릭으로 닫기 (기본 default만 true) */
  closeOnBackdrop?: boolean;
  /** 우상단 X 버튼 (기본 default만 true) */
  showClose?: boolean;
};

/**
 * 공통 모달 셸.
 * title / description / children 만 바꿔 여러 화면에서 재사용.
 */
export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  variant = "default",
  iconSrc,
  closeOnBackdrop,
  showClose,
}: ModalProps) {
  if (!open) return null;

  const isAlert = variant === "alert";
  const canCloseOnBackdrop = closeOnBackdrop ?? !isAlert;
  const withClose = showClose ?? !isAlert;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-5">
      <button
        type="button"
        aria-label="모달 닫기"
        className="absolute inset-0 bg-[rgba(58,61,77,0.78)]"
        onClick={canCloseOnBackdrop ? onClose : undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        className="relative z-10 w-full max-w-[353px] rounded-[20px] bg-white p-5"
      >
        {isAlert && iconSrc && (
          <div className="flex justify-center">
            <img
              src={iconSrc}
              alt=""
              aria-hidden
              className="size-[68px] object-contain"
            />
          </div>
        )}

        <div
          className={[
            "relative",
            isAlert ? "mt-4 text-center" : "",
            withClose ? "pr-8" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <h2
            id="app-modal-title"
            className={
              isAlert
                ? "text-[16px] font-semibold leading-[1.6] tracking-[-0.025em] text-gray-900"
                : "text-h2 text-gray-900"
            }
          >
            {title}
          </h2>
          {description != null && (
            <div className="mt-1 text-[14px] leading-[23px] tracking-[-0.025em] text-gray-400">
              {description}
            </div>
          )}
          {withClose && (
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="absolute top-0.5 right-0 flex size-6 items-center justify-center"
            >
              <img
                src={iconModalClose}
                alt=""
                className="size-[13.5px] object-contain"
              />
            </button>
          )}
        </div>

        {children != null && (
          <div className={isAlert ? "mt-5" : "mt-6"}>{children}</div>
        )}
      </div>
    </div>
  );
}
