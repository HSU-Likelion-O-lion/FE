import type { ReactNode } from "react";
import Button from "./Button";
import iconModalClose from "../assets/mate/icon-modal-close.svg";
import iconAlertInfo from "../assets/common/icon-alert-info.svg";
import iconAlertSuccess from "../assets/common/icon-alert-success.svg";
import iconAlertWarning from "../assets/common/icon-alert-warning.svg";

export type ModalStatus = "info" | "success" | "warning";

export type ModalAction = {
  label: string;
  onClick: () => void;
  /** primary: 채움 CTA / outline: 보조 (기본: 마지막 액션이 primary) */
  variant?: "primary" | "outline";
};

type ModalProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  /**
   * default: 좌측 정렬 + X (옵션 리스트 등)
   * alert: 아이콘 + 가운데 정렬 확인/안내창 (Figma Modal 컴포넌트)
   */
  variant?: "default" | "alert";
  /** alert 상태 아이콘 — info(!) / success(✓) / warning(△) */
  status?: ModalStatus;
  /** status 대신 커스텀 아이콘 경로 */
  iconSrc?: string;
  /** alert 하단 액션 버튼 (1개: full / 2개: 좌 outline·우 primary) */
  actions?: ModalAction[];
  /** 딤 클릭으로 닫기 (기본 default만 true) */
  closeOnBackdrop?: boolean;
  /** 우상단 X 버튼 (기본 default만 true) */
  showClose?: boolean;
};

const STATUS_ICONS: Record<ModalStatus, string> = {
  info: iconAlertInfo,
  success: iconAlertSuccess,
  warning: iconAlertWarning,
};

/**
 * 공통 모달 셸.
 * - default: title / description / children (ModalOptionList 등)
 * - alert: status 아이콘 + actions (Figma 공용 Modal variation)
 */
export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  variant = "default",
  status = "info",
  iconSrc,
  actions,
  closeOnBackdrop,
  showClose,
}: ModalProps) {
  if (!open) return null;

  const isAlert = variant === "alert";
  const canCloseOnBackdrop = closeOnBackdrop ?? !isAlert;
  const withClose = showClose ?? !isAlert;
  const resolvedIcon = iconSrc ?? (isAlert ? STATUS_ICONS[status] : undefined);
  const hasActions = actions != null && actions.length > 0;

  const shellClass = isAlert
    ? "relative z-10 w-full max-w-[353px] rounded-[20px] bg-white p-5 min-[431px]:w-[565px] min-[431px]:max-w-[565px] min-[431px]:px-[38px] min-[431px]:py-8"
    : "relative z-10 w-full max-w-[353px] rounded-[20px] bg-white p-5 min-[431px]:w-[565px] min-[431px]:max-w-[565px] min-[431px]:rounded-[24px] min-[431px]:p-8";

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
        className={shellClass}
      >
        {isAlert && resolvedIcon && (
          <div className="flex justify-center">
            <img
              src={resolvedIcon}
              alt=""
              aria-hidden
              className="size-[68px] object-contain min-[431px]:size-[118px]"
            />
          </div>
        )}

        <div
          className={[
            "relative",
            isAlert ? "mt-4 text-center min-[431px]:mt-1.5" : "",
            withClose ? "pr-8 min-[431px]:pr-10" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <h2
            id="app-modal-title"
            className={
              isAlert
                ? "text-[16px] font-semibold leading-[1.6] tracking-[-0.025em] text-[#282723] min-[431px]:text-[24px]"
                : "text-h2 text-gray-900 min-[431px]:text-[24px] min-[431px]:leading-[1.5]"
            }
          >
            {title}
          </h2>
          {description != null && (
            <div
              className={
                isAlert
                  ? "mt-1 text-[14px] leading-[23px] tracking-[-0.025em] text-[#8e8b7e] min-[431px]:mt-2 min-[431px]:text-[18px] min-[431px]:leading-[1.6]"
                  : "mt-1 text-[14px] leading-[23px] tracking-[-0.025em] text-gray-400 min-[431px]:text-body1"
              }
            >
              {description}
            </div>
          )}
          {withClose && (
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="absolute top-0.5 right-0 flex size-6 items-center justify-center min-[431px]:size-[26px]"
            >
              <img
                src={iconModalClose}
                alt=""
                className="size-[13.5px] object-contain min-[431px]:size-[14px]"
              />
            </button>
          )}
        </div>

        {children != null && (
          <div className={isAlert ? "mt-5" : "mt-6 min-[431px]:mt-7"}>
            {children}
          </div>
        )}

        {hasActions && (
          <div
            className={`flex gap-3 ${
              children != null
                ? "mt-3"
                : isAlert
                  ? "mt-5 min-[431px]:mt-[26px]"
                  : "mt-5"
            } ${actions.length === 1 ? "flex-col" : ""}`}
          >
            {actions.map((action, index) => {
              const isLast = index === actions.length - 1;
              const buttonVariant =
                action.variant ?? (isLast ? "primary" : "outline");

              return (
                <Button
                  key={`${action.label}-${index}`}
                  text={action.label}
                  variant={buttonVariant}
                  size="h-[52px] flex-1 px-5 py-3"
                  onClick={action.onClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
